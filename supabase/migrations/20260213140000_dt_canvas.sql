-- ============================================================================
-- KOSMOS Platform - Design Thinking Canvas Extension
-- ============================================================================
-- Extends the Journey Analyzer with Design Thinking phases:
-- Empathize, Define, Ideate, Prototype, Test
-- ============================================================================

-- ============================================================================
-- NEW ENUMS
-- ============================================================================

CREATE TYPE public.idea_status AS ENUM ('draft', 'voting', 'selected', 'rejected');
CREATE TYPE public.test_status AS ENUM ('planned', 'in_progress', 'completed');
CREATE TYPE public.test_result AS ENUM ('validated', 'invalidated', 'inconclusive');

-- ============================================================================
-- ALTER EXISTING TABLES
-- ============================================================================

-- Add DT mode and phase tracking to projects
ALTER TABLE public.journey_projects
  ADD COLUMN dt_mode TEXT DEFAULT 'full' CHECK (dt_mode IN ('full', 'simplified')),
  ADD COLUMN current_phase TEXT DEFAULT 'empathize'
    CHECK (current_phase IN ('empathize', 'define', 'ideate', 'prototype', 'test')),
  ADD COLUMN phase_progress JSONB DEFAULT '{"empathize":"not_started","define":"not_started","ideate":"not_started","prototype":"not_started","test":"not_started"}';

-- Link actions to ideas for traceability
ALTER TABLE public.journey_actions
  ADD COLUMN idea_id UUID,
  ADD COLUMN category TEXT;

-- ============================================================================
-- JOURNEY_PERSONAS - Personas criadas na fase Empathize
-- ============================================================================

CREATE TABLE public.journey_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.journey_projects(id) ON DELETE CASCADE,

  -- Persona info
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT,
  age_range TEXT,
  bio TEXT,

  -- Structured data (JSONB arrays of strings)
  goals JSONB NOT NULL DEFAULT '[]',
  pain_points JSONB NOT NULL DEFAULT '[]',
  behaviors JSONB NOT NULL DEFAULT '[]',
  motivations JSONB NOT NULL DEFAULT '[]',

  -- Ordering
  position INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_journey_personas_project ON public.journey_personas(project_id);

-- ============================================================================
-- JOURNEY_EMPATHY_MAPS - Mapa de empatia (Says/Thinks/Does/Feels)
-- ============================================================================

CREATE TABLE public.journey_empathy_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.journey_projects(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES public.journey_personas(id) ON DELETE SET NULL,

  -- Quadrants (JSONB arrays of strings)
  says JSONB NOT NULL DEFAULT '[]',
  thinks JSONB NOT NULL DEFAULT '[]',
  does JSONB NOT NULL DEFAULT '[]',
  feels JSONB NOT NULL DEFAULT '[]',

  -- Metadata
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_journey_empathy_maps_project ON public.journey_empathy_maps(project_id);

-- ============================================================================
-- JOURNEY_PROBLEM_STATEMENTS - How Might We (fase Define)
-- ============================================================================

CREATE TABLE public.journey_problem_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.journey_projects(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES public.journey_personas(id) ON DELETE SET NULL,

  -- HMW format
  statement TEXT NOT NULL,
  context TEXT,
  is_primary BOOLEAN DEFAULT false,

  -- Ordering
  position INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_journey_problem_statements_project ON public.journey_problem_statements(project_id);

-- ============================================================================
-- JOURNEY_IDEAS - Ideias geradas na fase Ideate
-- ============================================================================

CREATE TABLE public.journey_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.journey_projects(id) ON DELETE CASCADE,

  -- Idea content
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,

  -- Linking
  problem_statement_id UUID REFERENCES public.journey_problem_statements(id) ON DELETE SET NULL,
  touchpoint_id UUID REFERENCES public.journey_touchpoints(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES public.journey_project_stages(id) ON DELETE SET NULL,

  -- Prioritization
  status public.idea_status DEFAULT 'draft',
  votes INTEGER DEFAULT 0,
  impact INTEGER CHECK (impact >= 1 AND impact <= 5),
  effort INTEGER CHECK (effort >= 1 AND effort <= 5),

  -- Ordering
  position INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_journey_ideas_project ON public.journey_ideas(project_id);
CREATE INDEX idx_journey_ideas_status ON public.journey_ideas(project_id, status);

-- ============================================================================
-- JOURNEY_TESTS - Planos de teste (fase Test)
-- ============================================================================

CREATE TABLE public.journey_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.journey_projects(id) ON DELETE CASCADE,

  -- Test definition
  hypothesis TEXT NOT NULL,
  method TEXT,
  success_metric TEXT,
  target_audience TEXT,

  -- Result
  status public.test_status DEFAULT 'planned',
  result public.test_result,
  findings TEXT,
  evidence_url TEXT,

  -- Linking
  idea_id UUID REFERENCES public.journey_ideas(id) ON DELETE SET NULL,
  touchpoint_id UUID REFERENCES public.journey_touchpoints(id) ON DELETE SET NULL,

  -- Ordering
  position INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_journey_tests_project ON public.journey_tests(project_id);

-- Add FK constraint for journey_actions.idea_id (after journey_ideas table exists)
ALTER TABLE public.journey_actions
  ADD CONSTRAINT fk_journey_actions_idea
  FOREIGN KEY (idea_id) REFERENCES public.journey_ideas(id) ON DELETE SET NULL;

-- ============================================================================
-- TRIGGERS - Atualizar updated_at para novas tabelas
-- ============================================================================

CREATE TRIGGER update_journey_personas_updated_at
  BEFORE UPDATE ON public.journey_personas
  FOR EACH ROW EXECUTE FUNCTION public.update_journey_updated_at();

CREATE TRIGGER update_journey_empathy_maps_updated_at
  BEFORE UPDATE ON public.journey_empathy_maps
  FOR EACH ROW EXECUTE FUNCTION public.update_journey_updated_at();

CREATE TRIGGER update_journey_problem_statements_updated_at
  BEFORE UPDATE ON public.journey_problem_statements
  FOR EACH ROW EXECUTE FUNCTION public.update_journey_updated_at();

CREATE TRIGGER update_journey_ideas_updated_at
  BEFORE UPDATE ON public.journey_ideas
  FOR EACH ROW EXECUTE FUNCTION public.update_journey_updated_at();

CREATE TRIGGER update_journey_tests_updated_at
  BEFORE UPDATE ON public.journey_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_journey_updated_at();

-- ============================================================================
-- RLS POLICIES - All new tables inherit access from journey_projects
-- ============================================================================

ALTER TABLE public.journey_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_empathy_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_tests ENABLE ROW LEVEL SECURITY;

-- PERSONAS
CREATE POLICY "journey_personas_select" ON public.journey_personas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_personas_insert" ON public.journey_personas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_personas_update" ON public.journey_personas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_personas_delete" ON public.journey_personas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

-- EMPATHY MAPS
CREATE POLICY "journey_empathy_maps_select" ON public.journey_empathy_maps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_empathy_maps_insert" ON public.journey_empathy_maps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_empathy_maps_update" ON public.journey_empathy_maps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_empathy_maps_delete" ON public.journey_empathy_maps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

-- PROBLEM STATEMENTS
CREATE POLICY "journey_problem_statements_select" ON public.journey_problem_statements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_problem_statements_insert" ON public.journey_problem_statements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_problem_statements_update" ON public.journey_problem_statements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_problem_statements_delete" ON public.journey_problem_statements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

-- IDEAS
CREATE POLICY "journey_ideas_select" ON public.journey_ideas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_ideas_insert" ON public.journey_ideas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_ideas_update" ON public.journey_ideas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_ideas_delete" ON public.journey_ideas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

-- TESTS
CREATE POLICY "journey_tests_select" ON public.journey_tests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_tests_insert" ON public.journey_tests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_tests_update" ON public.journey_tests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_tests_delete" ON public.journey_tests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON public.journey_personas TO authenticated;
GRANT ALL ON public.journey_empathy_maps TO authenticated;
GRANT ALL ON public.journey_problem_statements TO authenticated;
GRANT ALL ON public.journey_ideas TO authenticated;
GRANT ALL ON public.journey_tests TO authenticated;
