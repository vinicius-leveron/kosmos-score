-- ============================================================================
-- LEAD MAGNET TENANT ROUTING
-- Configura qual lead magnet vai para qual pipeline (via tenant)
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE CONFIGURAÇÃO
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lead_magnet_tenant_config (
  lead_magnet_type TEXT PRIMARY KEY,
  tenant TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.lead_magnet_tenant_config IS
'Configura qual pipeline cada lead magnet deve usar, via tenant';

-- ============================================================================
-- 2. CONFIGURAÇÃO INICIAL
-- ============================================================================

INSERT INTO public.lead_magnet_tenant_config (lead_magnet_type, tenant, description) VALUES
  ('maturity-diagnostic', 'kosmos', 'Diagnóstico de Maturidade → Pipeline Vendas'),
  ('transition-calculator', 'kosmos', 'Calculadora de Transição → Pipeline Vendas'),
  ('stop-launching-simulator', 'kosmos', 'Simulador E Se Parar → Pipeline Vendas'),
  ('ecosystem-blueprint', 'kosmos', 'Blueprint de Ecossistema → Pipeline Vendas'),
  ('ht-template', 'kosmos', 'HT Template → Pipeline Vendas'),
  ('ht-readiness', 'kosmos', 'HT Readiness → Pipeline Vendas'),
  ('ecosystem-calculator', 'kosmos', 'Calculadora de Ecossistema → Pipeline Vendas'),
  ('aplicacao-kosmos', 'oliveira-dev', 'Aplicação KOSMOS → Pipeline Tech')
ON CONFLICT (lead_magnet_type) DO UPDATE SET
  tenant = EXCLUDED.tenant,
  description = EXCLUDED.description;

-- ============================================================================
-- 3. ATUALIZAR TRIGGER SYNC_LEAD_MAGNET_TO_CONTACT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_lead_magnet_to_contact()
RETURNS TRIGGER AS $$
DECLARE
  v_contact_id UUID;
  v_contact_org_id UUID;
  v_pipeline_id UUID;
  v_stage_id UUID;
  v_score INTEGER;
  v_tenant TEXT;
BEGIN
  -- ========================================
  -- 1. RESOLVER TENANT VIA CONFIG
  -- ========================================
  SELECT tenant INTO v_tenant
  FROM public.lead_magnet_tenant_config
  WHERE lead_magnet_type = NEW.lead_magnet_type;

  -- Default para 'kosmos' se não configurado
  v_tenant := COALESCE(v_tenant, 'kosmos');

  -- ========================================
  -- 2. BUSCAR PIPELINE VIA TENANT_ORG_MAPPING
  -- ========================================
  SELECT default_pipeline_id INTO v_pipeline_id
  FROM public.tenant_org_mapping
  WHERE tenant = v_tenant;

  -- Fallback para kosmos_score_leads se não encontrar
  IF v_pipeline_id IS NULL THEN
    SELECT id INTO v_pipeline_id
    FROM public.pipelines
    WHERE organization_id = NEW.organization_id
      AND name = 'kosmos_score_leads'
      AND is_active = true;
  END IF;

  -- ========================================
  -- 3. BUSCAR OU CRIAR CONTATO
  -- ========================================
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

  -- ========================================
  -- 4. BUSCAR OU CRIAR CONTACT_ORG
  -- ========================================
  SELECT id INTO v_contact_org_id
  FROM public.contact_orgs
  WHERE contact_id = v_contact_id
    AND organization_id = NEW.organization_id;

  IF v_contact_org_id IS NULL THEN
    INSERT INTO public.contact_orgs (
      contact_id,
      organization_id,
      score,
      status,
      source,
      score_breakdown,
      tenant
    )
    VALUES (
      v_contact_id,
      NEW.organization_id,
      COALESCE(NEW.total_score, 0),
      'active',
      'lead_magnet_' || NEW.lead_magnet_type,
      NEW.score_breakdown,
      v_tenant
    )
    RETURNING id INTO v_contact_org_id;
  ELSE
    -- Atualizar score se maior + definir tenant
    UPDATE public.contact_orgs
    SET
      score = GREATEST(COALESCE(score, 0), COALESCE(NEW.total_score, 0)),
      score_breakdown = COALESCE(NEW.score_breakdown, score_breakdown),
      tenant = COALESCE(tenant, v_tenant),
      updated_at = now()
    WHERE id = v_contact_org_id;
  END IF;

  -- ========================================
  -- 5. ADICIONAR AO PIPELINE
  -- ========================================
  IF v_pipeline_id IS NOT NULL THEN
    -- Determinar stage baseado no score
    v_score := COALESCE(NEW.total_score, 0);

    -- Tentar encontrar stage por score (funciona para kosmos_score_leads)
    SELECT id INTO v_stage_id
    FROM public.pipeline_stages
    WHERE pipeline_id = v_pipeline_id
      AND name = CASE
        WHEN v_score < 40 THEN 'low_score'
        WHEN v_score < 70 THEN 'medium_score'
        ELSE 'high_score'
      END;

    -- Fallback para entry stage (funciona para qualquer pipeline)
    IF v_stage_id IS NULL THEN
      SELECT id INTO v_stage_id
      FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id AND is_entry_stage = true;
    END IF;

    IF v_stage_id IS NOT NULL THEN
      INSERT INTO public.contact_pipeline_positions (
        contact_org_id,
        pipeline_id,
        stage_id,
        organization_id
      ) VALUES (
        v_contact_org_id,
        v_pipeline_id,
        v_stage_id,
        NEW.organization_id
      )
      ON CONFLICT (contact_org_id, pipeline_id) DO UPDATE SET
        stage_id = EXCLUDED.stage_id,
        entered_stage_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. GRANTS
-- ============================================================================

GRANT SELECT ON public.lead_magnet_tenant_config TO authenticated;
GRANT SELECT ON public.lead_magnet_tenant_config TO anon;

-- ============================================================================
-- 5. VERIFICAÇÃO
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== Lead Magnet Tenant Config ===';
  FOR r IN
    SELECT
      lmtc.lead_magnet_type,
      lmtc.tenant,
      p.display_name as pipeline_name
    FROM public.lead_magnet_tenant_config lmtc
    LEFT JOIN public.tenant_org_mapping tom ON tom.tenant = lmtc.tenant
    LEFT JOIN public.pipelines p ON p.id = tom.default_pipeline_id
    ORDER BY lmtc.lead_magnet_type
  LOOP
    RAISE NOTICE '% → % → %', r.lead_magnet_type, r.tenant, COALESCE(r.pipeline_name, 'N/A');
  END LOOP;
END $$;
