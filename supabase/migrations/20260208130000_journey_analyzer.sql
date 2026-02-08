-- ============================================================================
-- KOSMOS Platform - Journey Analyzer Module
-- ============================================================================
-- Tabelas para análise de jornadas de comunidades
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE public.journey_project_status AS ENUM ('draft', 'in_progress', 'completed');
CREATE TYPE public.touchpoint_type AS ENUM ('page', 'email', 'event', 'content', 'automation', 'whatsapp', 'call', 'other');
CREATE TYPE public.action_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.action_status AS ENUM ('pending', 'in_progress', 'done');
CREATE TYPE public.intake_form_status AS ENUM ('pending', 'answered');

-- ============================================================================
-- JOURNEY_PROJECTS - Projetos de análise
-- ============================================================================

CREATE TABLE public.journey_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Info do projeto
  name TEXT NOT NULL,
  description TEXT,

  -- Info do cliente sendo analisado
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_access_token UUID DEFAULT gen_random_uuid(), -- Token para acesso do cliente

  -- Status e scores
  status public.journey_project_status DEFAULT 'draft',
  overall_score NUMERIC(4,2), -- Score geral calculado (0-10)

  -- Metadata
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_journey_projects_org ON public.journey_projects(organization_id);
CREATE INDEX idx_journey_projects_status ON public.journey_projects(status);
CREATE INDEX idx_journey_projects_client_token ON public.journey_projects(client_access_token);

-- ============================================================================
-- JOURNEY_PROJECT_STAGES - Etapas da jornada (customizáveis por projeto)
-- ============================================================================

CREATE TABLE public.journey_project_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.journey_projects(id) ON DELETE CASCADE,

  -- Info da etapa
  name TEXT NOT NULL, -- slug interno (ex: 'discovery')
  display_name TEXT NOT NULL, -- nome exibido (ex: 'Descoberta')
  description TEXT,

  -- Ordenação e visual
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#6366f1', -- cor hex para visualização

  -- Score calculado
  score NUMERIC(4,2), -- média dos touchpoints (0-10)

  -- Flags
  is_custom BOOLEAN DEFAULT false, -- se foi criado pelo usuário ou é do template

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraint: nome único por projeto
  UNIQUE(project_id, name)
);

-- Índices
CREATE INDEX idx_journey_project_stages_project ON public.journey_project_stages(project_id);
CREATE INDEX idx_journey_project_stages_position ON public.journey_project_stages(project_id, position);

-- ============================================================================
-- JOURNEY_TOUCHPOINTS - Pontos de contato dentro de cada etapa
-- ============================================================================

CREATE TABLE public.journey_touchpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES public.journey_project_stages(id) ON DELETE CASCADE,

  -- Info do touchpoint
  name TEXT NOT NULL,
  description TEXT,
  type public.touchpoint_type DEFAULT 'other',

  -- Ordenação
  position INTEGER NOT NULL DEFAULT 0,

  -- Avaliação
  score NUMERIC(3,1) CHECK (score >= 0 AND score <= 10), -- 0-10
  is_critical BOOLEAN DEFAULT false, -- se é um gargalo crítico
  notes TEXT, -- observações do consultor

  -- Evidências
  evidence_url TEXT, -- link para página/email/etc
  evidence_screenshot TEXT, -- URL do screenshot (Supabase Storage)

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_journey_touchpoints_stage ON public.journey_touchpoints(stage_id);
CREATE INDEX idx_journey_touchpoints_critical ON public.journey_touchpoints(stage_id) WHERE is_critical = true;

-- ============================================================================
-- JOURNEY_INTAKE_FORMS - Formulários enviados ao cliente
-- ============================================================================

CREATE TABLE public.journey_intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.journey_projects(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES public.journey_project_stages(id) ON DELETE CASCADE, -- opcional, pode ser geral

  -- Configuração do form
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]', -- array de perguntas

  -- Status e respostas
  status public.intake_form_status DEFAULT 'pending',
  answers JSONB DEFAULT '{}', -- respostas do cliente
  answered_at TIMESTAMP WITH TIME ZONE,

  -- Access
  access_token UUID DEFAULT gen_random_uuid(),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_journey_intake_project ON public.journey_intake_forms(project_id);
CREATE INDEX idx_journey_intake_token ON public.journey_intake_forms(access_token);

-- ============================================================================
-- JOURNEY_ACTIONS - Plano de ação
-- ============================================================================

CREATE TABLE public.journey_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.journey_projects(id) ON DELETE CASCADE,
  touchpoint_id UUID REFERENCES public.journey_touchpoints(id) ON DELETE SET NULL, -- opcional

  -- Info da ação
  title TEXT NOT NULL,
  description TEXT,

  -- Priorização
  priority public.action_priority DEFAULT 'medium',
  impact INTEGER CHECK (impact >= 1 AND impact <= 5), -- 1-5
  effort INTEGER CHECK (effort >= 1 AND effort <= 5), -- 1-5

  -- Status
  status public.action_status DEFAULT 'pending',

  -- Planejamento (opcional)
  due_date DATE,
  owner TEXT, -- nome do responsável

  -- Ordenação
  position INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_journey_actions_project ON public.journey_actions(project_id);
CREATE INDEX idx_journey_actions_priority ON public.journey_actions(project_id, priority);
CREATE INDEX idx_journey_actions_status ON public.journey_actions(project_id, status);

-- ============================================================================
-- TRIGGERS - Atualizar updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_journey_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journey_projects_updated_at
  BEFORE UPDATE ON public.journey_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_journey_updated_at();

CREATE TRIGGER update_journey_stages_updated_at
  BEFORE UPDATE ON public.journey_project_stages
  FOR EACH ROW EXECUTE FUNCTION public.update_journey_updated_at();

CREATE TRIGGER update_journey_touchpoints_updated_at
  BEFORE UPDATE ON public.journey_touchpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_journey_updated_at();

CREATE TRIGGER update_journey_intake_forms_updated_at
  BEFORE UPDATE ON public.journey_intake_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_journey_updated_at();

CREATE TRIGGER update_journey_actions_updated_at
  BEFORE UPDATE ON public.journey_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_journey_updated_at();

-- ============================================================================
-- FUNCTION - Calcular score da etapa (média dos touchpoints)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_stage_score(p_stage_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_avg_score NUMERIC;
BEGIN
  SELECT AVG(score) INTO v_avg_score
  FROM public.journey_touchpoints
  WHERE stage_id = p_stage_id AND score IS NOT NULL;

  -- Atualiza o score da etapa
  UPDATE public.journey_project_stages
  SET score = ROUND(v_avg_score, 2)
  WHERE id = p_stage_id;

  RETURN v_avg_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION - Calcular score geral do projeto
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_project_score(p_project_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_avg_score NUMERIC;
BEGIN
  SELECT AVG(score) INTO v_avg_score
  FROM public.journey_project_stages
  WHERE project_id = p_project_id AND score IS NOT NULL;

  -- Atualiza o score do projeto
  UPDATE public.journey_projects
  SET overall_score = ROUND(v_avg_score, 2)
  WHERE id = p_project_id;

  RETURN v_avg_score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER - Auto-calcular scores quando touchpoint é atualizado
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_calculate_scores()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id UUID;
BEGIN
  -- Calcula score da etapa
  PERFORM public.calculate_stage_score(NEW.stage_id);

  -- Pega o project_id
  SELECT project_id INTO v_project_id
  FROM public.journey_project_stages
  WHERE id = NEW.stage_id;

  -- Calcula score do projeto
  PERFORM public.calculate_project_score(v_project_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_scores_on_touchpoint
  AFTER INSERT OR UPDATE OF score ON public.journey_touchpoints
  FOR EACH ROW EXECUTE FUNCTION public.auto_calculate_scores();

-- ============================================================================
-- FUNCTION - Criar etapas padrão para novo projeto
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_default_journey_stages(p_project_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.journey_project_stages (project_id, name, display_name, description, position, color)
  VALUES
    (p_project_id, 'discovery', 'Descoberta', 'Como o lead descobre a comunidade', 0, '#8b5cf6'),
    (p_project_id, 'lead', 'Lead', 'Captação e nutrição de leads', 1, '#6366f1'),
    (p_project_id, 'sales', 'Venda', 'Processo de conversão', 2, '#0ea5e9'),
    (p_project_id, 'onboarding', 'Onboarding', 'Primeiros passos do novo membro', 3, '#10b981'),
    (p_project_id, 'engagement', 'Engajamento', 'Participação ativa na comunidade', 4, '#f59e0b'),
    (p_project_id, 'retention', 'Retenção', 'Renovação e advocacy', 5, '#ef4444');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.journey_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_actions ENABLE ROW LEVEL SECURITY;

-- Projects: apenas membros da org podem ver/editar
CREATE POLICY "journey_projects_select" ON public.journey_projects
  FOR SELECT USING (
    organization_id IN (SELECT public.get_user_org_ids())
    OR public.is_kosmos_master()
  );

CREATE POLICY "journey_projects_insert" ON public.journey_projects
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT public.get_user_org_ids())
    OR public.is_kosmos_master()
  );

CREATE POLICY "journey_projects_update" ON public.journey_projects
  FOR UPDATE USING (
    organization_id IN (SELECT public.get_user_org_ids())
    OR public.is_kosmos_master()
  );

CREATE POLICY "journey_projects_delete" ON public.journey_projects
  FOR DELETE USING (
    organization_id IN (SELECT public.get_user_org_ids())
    OR public.is_kosmos_master()
  );

-- Stages: herda permissão do projeto
CREATE POLICY "journey_stages_select" ON public.journey_project_stages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_stages_insert" ON public.journey_project_stages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_stages_update" ON public.journey_project_stages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_stages_delete" ON public.journey_project_stages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

-- Touchpoints: herda permissão da stage
CREATE POLICY "journey_touchpoints_select" ON public.journey_touchpoints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journey_project_stages s
      JOIN public.journey_projects p ON p.id = s.project_id
      WHERE s.id = stage_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_touchpoints_insert" ON public.journey_touchpoints
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journey_project_stages s
      JOIN public.journey_projects p ON p.id = s.project_id
      WHERE s.id = stage_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_touchpoints_update" ON public.journey_touchpoints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journey_project_stages s
      JOIN public.journey_projects p ON p.id = s.project_id
      WHERE s.id = stage_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_touchpoints_delete" ON public.journey_touchpoints
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.journey_project_stages s
      JOIN public.journey_projects p ON p.id = s.project_id
      WHERE s.id = stage_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

-- Intake forms: membros da org + cliente com token
CREATE POLICY "journey_intake_select" ON public.journey_intake_forms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_intake_insert" ON public.journey_intake_forms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_intake_update" ON public.journey_intake_forms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

-- Actions: herda permissão do projeto
CREATE POLICY "journey_actions_select" ON public.journey_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_actions_insert" ON public.journey_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_actions_update" ON public.journey_actions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.journey_projects p
      WHERE p.id = project_id
      AND (p.organization_id IN (SELECT public.get_user_org_ids()) OR public.is_kosmos_master())
    )
  );

CREATE POLICY "journey_actions_delete" ON public.journey_actions
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

GRANT ALL ON public.journey_projects TO authenticated;
GRANT ALL ON public.journey_project_stages TO authenticated;
GRANT ALL ON public.journey_touchpoints TO authenticated;
GRANT ALL ON public.journey_intake_forms TO authenticated;
GRANT ALL ON public.journey_actions TO authenticated;

-- Anon pode ver intake forms por token (para cliente responder)
GRANT SELECT, UPDATE ON public.journey_intake_forms TO anon;
