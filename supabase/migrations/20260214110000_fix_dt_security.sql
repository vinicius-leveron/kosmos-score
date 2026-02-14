-- ============================================================================
-- Security Fixes for Design Thinking Canvas + Client Portal
-- ============================================================================
-- FIX-1: Vote manipulation - add vote tracking with UNIQUE constraint
-- FIX-2: Empathy map race condition - atomic DB operations
-- FIX-3: Client test ownership - track who created tests
-- FIX-4: Missing FK indexes for performance
-- ============================================================================

-- ============================================================================
-- FIX-1: Vote tracking table to prevent duplicate votes
-- ============================================================================

CREATE TABLE public.journey_idea_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID NOT NULL REFERENCES public.journey_ideas(id) ON DELETE CASCADE,
  voter_token UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(idea_id, voter_token)
);

CREATE INDEX idx_journey_idea_votes_idea ON public.journey_idea_votes(idea_id);
CREATE INDEX idx_journey_idea_votes_token ON public.journey_idea_votes(voter_token);

-- RLS: no direct access needed - accessed only via SECURITY DEFINER RPCs
ALTER TABLE public.journey_idea_votes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read votes for their projects
CREATE POLICY "journey_idea_votes_select" ON public.journey_idea_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journey_ideas i
      JOIN public.journey_projects p ON p.id = i.project_id
      WHERE i.id = idea_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

GRANT SELECT ON public.journey_idea_votes TO authenticated;

-- Replace client_vote_idea with duplicate-safe version
CREATE OR REPLACE FUNCTION public.client_vote_idea(
  p_token UUID,
  p_idea_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_idea RECORD;
BEGIN
  v_project_id := public.validate_journey_token(p_token);

  -- Verify idea belongs to this project
  IF NOT EXISTS (
    SELECT 1 FROM public.journey_ideas
    WHERE id = p_idea_id AND project_id = v_project_id
  ) THEN
    RAISE EXCEPTION 'Idea not found or does not belong to this project';
  END IF;

  -- Check for existing vote
  IF EXISTS (
    SELECT 1 FROM public.journey_idea_votes
    WHERE idea_id = p_idea_id AND voter_token = p_token
  ) THEN
    RAISE EXCEPTION 'You have already voted on this idea';
  END IF;

  -- Record vote
  INSERT INTO public.journey_idea_votes (idea_id, voter_token)
  VALUES (p_idea_id, p_token);

  -- Increment vote count
  UPDATE public.journey_ideas
  SET votes = votes + 1
  WHERE id = p_idea_id
  RETURNING * INTO v_idea;

  RETURN row_to_json(v_idea)::jsonb;
END;
$$;

-- ============================================================================
-- FIX-2: Atomic empathy map item operations (prevent race conditions)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.empathy_map_add_item(
  p_map_id UUID,
  p_quadrant TEXT,
  p_item TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result RECORD;
BEGIN
  -- Validate quadrant
  IF p_quadrant NOT IN ('says', 'thinks', 'does', 'feels') THEN
    RAISE EXCEPTION 'Invalid quadrant: %', p_quadrant;
  END IF;

  -- Verify access via RLS-like check
  IF NOT EXISTS (
    SELECT 1 FROM public.journey_empathy_maps em
    JOIN public.journey_projects p ON p.id = em.project_id
    WHERE em.id = p_map_id
    AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
  ) THEN
    RAISE EXCEPTION 'Empathy map not found or access denied';
  END IF;

  -- Atomic append using jsonb concatenation
  UPDATE public.journey_empathy_maps
  SET
    says = CASE WHEN p_quadrant = 'says' THEN says || to_jsonb(p_item) ELSE says END,
    thinks = CASE WHEN p_quadrant = 'thinks' THEN thinks || to_jsonb(p_item) ELSE thinks END,
    does = CASE WHEN p_quadrant = 'does' THEN does || to_jsonb(p_item) ELSE does END,
    feels = CASE WHEN p_quadrant = 'feels' THEN feels || to_jsonb(p_item) ELSE feels END
  WHERE id = p_map_id
  RETURNING * INTO v_result;

  RETURN row_to_json(v_result)::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION public.empathy_map_remove_item(
  p_map_id UUID,
  p_quadrant TEXT,
  p_index INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result RECORD;
BEGIN
  -- Validate quadrant
  IF p_quadrant NOT IN ('says', 'thinks', 'does', 'feels') THEN
    RAISE EXCEPTION 'Invalid quadrant: %', p_quadrant;
  END IF;

  -- Verify access via RLS-like check
  IF NOT EXISTS (
    SELECT 1 FROM public.journey_empathy_maps em
    JOIN public.journey_projects p ON p.id = em.project_id
    WHERE em.id = p_map_id
    AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
  ) THEN
    RAISE EXCEPTION 'Empathy map not found or access denied';
  END IF;

  -- Atomic remove by index using jsonb_set with array minus element
  UPDATE public.journey_empathy_maps
  SET
    says = CASE WHEN p_quadrant = 'says' THEN says - p_index ELSE says END,
    thinks = CASE WHEN p_quadrant = 'thinks' THEN thinks - p_index ELSE thinks END,
    does = CASE WHEN p_quadrant = 'does' THEN does - p_index ELSE does END,
    feels = CASE WHEN p_quadrant = 'feels' THEN feels - p_index ELSE feels END
  WHERE id = p_map_id
  RETURNING * INTO v_result;

  RETURN row_to_json(v_result)::jsonb;
END;
$$;

GRANT EXECUTE ON FUNCTION public.empathy_map_add_item(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.empathy_map_remove_item(UUID, TEXT, INTEGER) TO authenticated;

-- ============================================================================
-- FIX-3: Track who created tests in client portal
-- ============================================================================

ALTER TABLE public.journey_tests
  ADD COLUMN created_by_token UUID;

-- Update client_create_test to record the creator token
CREATE OR REPLACE FUNCTION public.client_create_test(
  p_token UUID,
  p_hypothesis TEXT,
  p_method TEXT DEFAULT NULL,
  p_success_metric TEXT DEFAULT NULL,
  p_target_audience TEXT DEFAULT NULL,
  p_idea_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_test RECORD;
  v_position INTEGER;
BEGIN
  v_project_id := public.validate_journey_token(p_token);

  SELECT COALESCE(MAX(position), -1) + 1 INTO v_position
  FROM public.journey_tests
  WHERE project_id = v_project_id;

  INSERT INTO public.journey_tests (
    project_id, hypothesis, method, success_metric,
    target_audience, idea_id, position, created_by_token
  ) VALUES (
    v_project_id, p_hypothesis, p_method, p_success_metric,
    p_target_audience, p_idea_id, v_position, p_token
  )
  RETURNING * INTO v_test;

  RETURN row_to_json(v_test)::jsonb;
END;
$$;

-- Update client_delete_test to only allow deleting own tests
CREATE OR REPLACE FUNCTION public.client_delete_test(
  p_token UUID,
  p_test_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
BEGIN
  v_project_id := public.validate_journey_token(p_token);

  -- Only delete tests created by this token (not consultant's tests)
  DELETE FROM public.journey_tests
  WHERE id = p_test_id
    AND project_id = v_project_id
    AND created_by_token = p_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Test not found, does not belong to this project, or you are not the creator';
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- FIX-4: Missing indexes on foreign keys for query performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_journey_empathy_maps_persona ON public.journey_empathy_maps(persona_id);
CREATE INDEX IF NOT EXISTS idx_journey_problem_statements_persona ON public.journey_problem_statements(persona_id);
CREATE INDEX IF NOT EXISTS idx_journey_ideas_problem_statement ON public.journey_ideas(problem_statement_id);
CREATE INDEX IF NOT EXISTS idx_journey_ideas_touchpoint ON public.journey_ideas(touchpoint_id);
CREATE INDEX IF NOT EXISTS idx_journey_ideas_stage ON public.journey_ideas(stage_id);
CREATE INDEX IF NOT EXISTS idx_journey_tests_idea ON public.journey_tests(idea_id);
CREATE INDEX IF NOT EXISTS idx_journey_tests_touchpoint ON public.journey_tests(touchpoint_id);
CREATE INDEX IF NOT EXISTS idx_journey_actions_idea ON public.journey_actions(idea_id);

-- ============================================================================
-- Update get_journey_by_token to include voted_idea_ids for this token
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_journey_by_token(p_token UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_result JSONB;
BEGIN
  v_project_id := public.validate_journey_token(p_token);

  SELECT jsonb_build_object(
    'project', row_to_json(p),
    'stages', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'project_id', s.project_id,
          'name', s.name,
          'display_name', s.display_name,
          'description', s.description,
          'color', s.color,
          'position', s.position,
          'score', s.score,
          'touchpoints', COALESCE((
            SELECT jsonb_agg(row_to_json(t) ORDER BY t.position)
            FROM public.journey_touchpoints t
            WHERE t.stage_id = s.id
          ), '[]'::jsonb)
        ) ORDER BY s.position
      )
      FROM public.journey_project_stages s
      WHERE s.project_id = v_project_id
    ), '[]'::jsonb),
    'personas', COALESCE((
      SELECT jsonb_agg(row_to_json(pe) ORDER BY pe.position)
      FROM public.journey_personas pe
      WHERE pe.project_id = v_project_id
    ), '[]'::jsonb),
    'empathy_maps', COALESCE((
      SELECT jsonb_agg(row_to_json(em))
      FROM public.journey_empathy_maps em
      WHERE em.project_id = v_project_id
    ), '[]'::jsonb),
    'problem_statements', COALESCE((
      SELECT jsonb_agg(row_to_json(ps) ORDER BY ps.position)
      FROM public.journey_problem_statements ps
      WHERE ps.project_id = v_project_id
    ), '[]'::jsonb),
    'ideas', COALESCE((
      SELECT jsonb_agg(row_to_json(i) ORDER BY i.position)
      FROM public.journey_ideas i
      WHERE i.project_id = v_project_id
    ), '[]'::jsonb),
    'tests', COALESCE((
      SELECT jsonb_agg(row_to_json(te) ORDER BY te.position)
      FROM public.journey_tests te
      WHERE te.project_id = v_project_id
    ), '[]'::jsonb),
    'actions', COALESCE((
      SELECT jsonb_agg(row_to_json(a))
      FROM public.journey_actions a
      WHERE a.project_id = v_project_id
    ), '[]'::jsonb),
    'voted_idea_ids', COALESCE((
      SELECT jsonb_agg(v.idea_id)
      FROM public.journey_idea_votes v
      JOIN public.journey_ideas i ON i.id = v.idea_id
      WHERE i.project_id = v_project_id
        AND v.voter_token = p_token
    ), '[]'::jsonb)
  ) INTO v_result
  FROM public.journey_projects p
  WHERE p.id = v_project_id;

  RETURN v_result;
END;
$$;
