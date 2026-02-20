-- ============================================================================
-- LEAD MAGNET RESULTS TABLE
-- Tabela genérica para armazenar resultados de todos os lead magnets
-- ============================================================================

-- ============================================================================
-- TABELA PRINCIPAL
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lead_magnet_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lead data (captura)
  respondent_name TEXT,
  respondent_email TEXT NOT NULL,
  respondent_phone TEXT,

  -- Lead magnet identification
  lead_magnet_type TEXT NOT NULL CHECK (
    lead_magnet_type IN (
      'ecosystem-calculator',
      'ht-readiness',
      'ht-template',
      'transition-calculator'
    )
  ),

  -- Result data (flexível via JSONB)
  inputs JSONB NOT NULL DEFAULT '{}',
  outputs JSONB NOT NULL DEFAULT '{}',

  -- Score (para diagnósticos)
  total_score INTEGER,
  score_level TEXT,
  score_breakdown JSONB,

  -- Metadata
  source TEXT, -- utm_source
  medium TEXT, -- utm_medium
  campaign TEXT, -- utm_campaign
  referrer TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Multi-tenant (opcional - default KOSMOS org)
  organization_id UUID REFERENCES public.organizations(id)
    DEFAULT 'c0000000-0000-0000-0000-000000000001'
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_lead_magnet_results_type
  ON public.lead_magnet_results(lead_magnet_type);

CREATE INDEX IF NOT EXISTS idx_lead_magnet_results_email
  ON public.lead_magnet_results(respondent_email);

CREATE INDEX IF NOT EXISTS idx_lead_magnet_results_created
  ON public.lead_magnet_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_magnet_results_org
  ON public.lead_magnet_results(organization_id);

CREATE INDEX IF NOT EXISTS idx_lead_magnet_results_score
  ON public.lead_magnet_results(total_score)
  WHERE total_score IS NOT NULL;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.lead_magnet_results ENABLE ROW LEVEL SECURITY;

-- Policy: Qualquer um pode inserir (lead capture público)
CREATE POLICY "Allow public insert on lead_magnet_results"
  ON public.lead_magnet_results
  FOR INSERT
  WITH CHECK (true);

-- Policy: Apenas membros da org podem visualizar
CREATE POLICY "Allow org members to select lead_magnet_results"
  ON public.lead_magnet_results
  FOR SELECT
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM public.org_members om
      WHERE om.profile_id = auth.uid()
    )
  );

-- Policy: Apenas admins podem atualizar/deletar
CREATE POLICY "Allow org admins to update lead_magnet_results"
  ON public.lead_magnet_results
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM public.org_members om
      WHERE om.profile_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Allow org admins to delete lead_magnet_results"
  ON public.lead_magnet_results
  FOR DELETE
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM public.org_members om
      WHERE om.profile_id = auth.uid()
        AND om.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- TRIGGER: Sync com Contacts e Pipeline
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_lead_magnet_to_contact()
RETURNS TRIGGER AS $$
DECLARE
  v_contact_id UUID;
  v_contact_org_id UUID;
  v_pipeline_id UUID;
  v_stage_id UUID;
  v_score INTEGER;
BEGIN
  -- Buscar ou criar contato
  SELECT id INTO v_contact_id
  FROM public.contacts
  WHERE email = lower(trim(NEW.respondent_email));

  IF v_contact_id IS NULL THEN
    INSERT INTO public.contacts (
      email,
      full_name,
      source,
      source_detail,
      created_at
    )
    VALUES (
      lower(trim(NEW.respondent_email)),
      COALESCE(NEW.respondent_name, split_part(NEW.respondent_email, '@', 1)),
      'lead_magnet',
      NEW.lead_magnet_type,
      NEW.created_at
    )
    RETURNING id INTO v_contact_id;
  ELSE
    -- Atualizar source_detail se já existe
    UPDATE public.contacts
    SET
      full_name = COALESCE(full_name, NEW.respondent_name),
      source_detail = COALESCE(source_detail, '') ||
        CASE WHEN source_detail IS NULL OR source_detail = ''
          THEN NEW.lead_magnet_type
          ELSE ',' || NEW.lead_magnet_type
        END,
      updated_at = now()
    WHERE id = v_contact_id;
  END IF;

  -- Buscar ou criar contact_org
  SELECT id INTO v_contact_org_id
  FROM public.contact_orgs
  WHERE contact_id = v_contact_id
    AND organization_id = NEW.organization_id;

  IF v_contact_org_id IS NULL THEN
    -- Buscar default journey stage
    INSERT INTO public.contact_orgs (
      contact_id,
      organization_id,
      score,
      status,
      source,
      score_breakdown
    )
    VALUES (
      v_contact_id,
      NEW.organization_id,
      COALESCE(NEW.total_score, 0),
      'active',
      'lead_magnet_' || NEW.lead_magnet_type,
      NEW.score_breakdown
    )
    RETURNING id INTO v_contact_org_id;
  ELSE
    -- Atualizar score se maior
    UPDATE public.contact_orgs
    SET
      score = GREATEST(COALESCE(score, 0), COALESCE(NEW.total_score, 0)),
      score_breakdown = COALESCE(NEW.score_breakdown, score_breakdown),
      updated_at = now()
    WHERE id = v_contact_org_id;
  END IF;

  -- Adicionar ao pipeline de lead magnet (se existir)
  SELECT id INTO v_pipeline_id
  FROM public.pipelines
  WHERE organization_id = NEW.organization_id
    AND name = 'kosmos_score_leads'
    AND is_active = true;

  IF v_pipeline_id IS NOT NULL THEN
    -- Determinar stage baseado no score
    v_score := COALESCE(NEW.total_score, 0);

    SELECT id INTO v_stage_id
    FROM public.pipeline_stages
    WHERE pipeline_id = v_pipeline_id
      AND name = CASE
        WHEN v_score < 40 THEN 'low_score'
        WHEN v_score < 70 THEN 'medium_score'
        ELSE 'high_score'
      END;

    -- Fallback para 'captured'
    IF v_stage_id IS NULL THEN
      SELECT id INTO v_stage_id
      FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id AND name = 'captured';
    END IF;

    IF v_stage_id IS NOT NULL THEN
      INSERT INTO public.contact_pipeline_positions (
        contact_org_id,
        pipeline_id,
        stage_id
      ) VALUES (
        v_contact_org_id,
        v_pipeline_id,
        v_stage_id
      )
      ON CONFLICT (contact_org_id, pipeline_id) DO UPDATE SET
        stage_id = EXCLUDED.stage_id,
        entered_stage_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_sync_lead_magnet ON public.lead_magnet_results;
CREATE TRIGGER trigger_sync_lead_magnet
  AFTER INSERT ON public.lead_magnet_results
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_lead_magnet_to_contact();

-- ============================================================================
-- FUNÇÃO DE ESTATÍSTICAS POR LEAD MAGNET
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_lead_magnet_stats(
  p_organization_id UUID DEFAULT 'c0000000-0000-0000-0000-000000000001',
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  lead_magnet_type TEXT,
  total_leads BIGINT,
  leads_period BIGINT,
  avg_score NUMERIC,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    lmr.lead_magnet_type,
    COUNT(*)::BIGINT as total_leads,
    COUNT(*) FILTER (
      WHERE lmr.created_at >= now() - (p_days || ' days')::INTERVAL
    )::BIGINT as leads_period,
    ROUND(AVG(lmr.total_score), 2) as avg_score,
    ROUND(
      COUNT(*) FILTER (WHERE lmr.outputs != '{}')::NUMERIC /
      NULLIF(COUNT(*), 0) * 100,
      2
    ) as completion_rate
  FROM public.lead_magnet_results lmr
  WHERE lmr.organization_id = p_organization_id
  GROUP BY lmr.lead_magnet_type
  ORDER BY total_leads DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT ON public.lead_magnet_results TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_magnet_results TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_lead_magnet_stats TO authenticated;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE public.lead_magnet_results IS
'Armazena resultados de todos os lead magnets (calculadoras, diagnósticos, templates)';

COMMENT ON COLUMN public.lead_magnet_results.lead_magnet_type IS
'Tipo do lead magnet: ecosystem-calculator, ht-readiness, ht-template, transition-calculator';

COMMENT ON COLUMN public.lead_magnet_results.inputs IS
'Dados de entrada fornecidos pelo usuário (JSONB)';

COMMENT ON COLUMN public.lead_magnet_results.outputs IS
'Resultados calculados pelo lead magnet (JSONB)';

COMMENT ON FUNCTION public.sync_lead_magnet_to_contact() IS
'Sincroniza lead magnet results com contacts e pipeline automaticamente';
