-- ============================================================================
-- Client Portal: Token-Based Interactive Access for Journey Projects
-- ============================================================================
-- Allows clients to access their journey project via client_access_token
-- without authentication. Uses SECURITY DEFINER RPCs to bypass RLS safely.
-- Client can: view all data, manage experiments (tests), and vote on ideas.
-- ============================================================================

-- ============================================================================
-- 1. Helper: Validate token and return project_id
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_journey_token(p_token UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
BEGIN
  SELECT id INTO v_project_id
  FROM public.journey_projects
  WHERE client_access_token = p_token;

  IF v_project_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired access token';
  END IF;

  RETURN v_project_id;
END;
$$;

-- ============================================================================
-- 2. Read: Get full project data by token
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
    ), '[]'::jsonb)
  ) INTO v_result
  FROM public.journey_projects p
  WHERE p.id = v_project_id;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- 3. Interactive: Client Test/Experiment CRUD
-- ============================================================================

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
    target_audience, idea_id, position
  ) VALUES (
    v_project_id, p_hypothesis, p_method, p_success_metric,
    p_target_audience, p_idea_id, v_position
  )
  RETURNING * INTO v_test;

  RETURN row_to_json(v_test)::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION public.client_update_test(
  p_token UUID,
  p_test_id UUID,
  p_hypothesis TEXT DEFAULT NULL,
  p_method TEXT DEFAULT NULL,
  p_success_metric TEXT DEFAULT NULL,
  p_target_audience TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_result TEXT DEFAULT NULL,
  p_findings TEXT DEFAULT NULL,
  p_evidence_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_project_id UUID;
  v_test RECORD;
BEGIN
  v_project_id := public.validate_journey_token(p_token);

  -- Verify test belongs to this project
  IF NOT EXISTS (
    SELECT 1 FROM public.journey_tests
    WHERE id = p_test_id AND project_id = v_project_id
  ) THEN
    RAISE EXCEPTION 'Test not found or does not belong to this project';
  END IF;

  UPDATE public.journey_tests SET
    hypothesis = COALESCE(p_hypothesis, hypothesis),
    method = COALESCE(p_method, method),
    success_metric = COALESCE(p_success_metric, success_metric),
    target_audience = COALESCE(p_target_audience, target_audience),
    status = COALESCE(p_status::public.test_status, status),
    result = COALESCE(p_result::public.test_result, result),
    findings = COALESCE(p_findings, findings),
    evidence_url = COALESCE(p_evidence_url, evidence_url)
  WHERE id = p_test_id
  RETURNING * INTO v_test;

  RETURN row_to_json(v_test)::jsonb;
END;
$$;

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

  DELETE FROM public.journey_tests
  WHERE id = p_test_id AND project_id = v_project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Test not found or does not belong to this project';
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- 4. Interactive: Client Idea Voting
-- ============================================================================

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

  UPDATE public.journey_ideas
  SET votes = votes + 1
  WHERE id = p_idea_id
  RETURNING * INTO v_idea;

  RETURN row_to_json(v_idea)::jsonb;
END;
$$;

-- ============================================================================
-- 5. GRANTS - Allow anon role to call these RPCs
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.validate_journey_token(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_journey_by_token(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.client_create_test(UUID, TEXT, TEXT, TEXT, TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.client_update_test(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.client_delete_test(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.client_vote_idea(UUID, UUID) TO anon;

-- Also grant to authenticated users (consultants may use token-based access too)
GRANT EXECUTE ON FUNCTION public.validate_journey_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_journey_by_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.client_create_test(UUID, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.client_update_test(UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.client_delete_test(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.client_vote_idea(UUID, UUID) TO authenticated;
