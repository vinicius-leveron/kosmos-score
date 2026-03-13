-- ============================================================================
-- KOSMOS Platform - Debug and Fix Tenant Pipeline Mapping
-- ============================================================================

-- Log da tabela tenant_org_mapping
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== tenant_org_mapping ===';
  FOR r IN SELECT tenant, organization_id, default_pipeline_id FROM public.tenant_org_mapping
  LOOP
    RAISE NOTICE 'Tenant: % -> org_id: % -> pipeline_id: %', r.tenant, r.organization_id, r.default_pipeline_id;
  END LOOP;
END $$;

-- Log dos pipelines com organization_id
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== Pipelines com org_id ===';
  FOR r IN SELECT id, name, display_name, is_default, organization_id FROM public.pipelines WHERE is_active = true
  LOOP
    RAISE NOTICE 'Pipeline: % (%) org: % default: %', r.display_name, r.id, r.organization_id, r.is_default;
  END LOOP;
END $$;

-- ============================================================================
-- Fix: Mapear kosmos para pipeline "Vendas" diretamente
-- ============================================================================
UPDATE public.tenant_org_mapping
SET default_pipeline_id = (
  SELECT id FROM public.pipelines
  WHERE display_name = 'Vendas' OR name = 'sales'
  LIMIT 1
)
WHERE tenant = 'kosmos';

-- ============================================================================
-- Fix: Mapear oliveira-dev para pipeline "Tech" diretamente
-- ============================================================================
UPDATE public.tenant_org_mapping
SET default_pipeline_id = (
  SELECT id FROM public.pipelines
  WHERE display_name = 'Tech' OR name = 'Tech'
  LIMIT 1
)
WHERE tenant = 'oliveira-dev';

-- ============================================================================
-- Verificação final
-- ============================================================================
DO $$
DECLARE
  v_kosmos_pipeline TEXT;
  v_oliveira_pipeline TEXT;
BEGIN
  SELECT p.display_name INTO v_kosmos_pipeline
  FROM public.tenant_org_mapping tom
  JOIN public.pipelines p ON p.id = tom.default_pipeline_id
  WHERE tom.tenant = 'kosmos';

  SELECT p.display_name INTO v_oliveira_pipeline
  FROM public.tenant_org_mapping tom
  JOIN public.pipelines p ON p.id = tom.default_pipeline_id
  WHERE tom.tenant = 'oliveira-dev';

  RAISE NOTICE '=== Mapeamento Final ===';
  RAISE NOTICE 'Tenant kosmos -> Pipeline: %', COALESCE(v_kosmos_pipeline, 'NAO CONFIGURADO');
  RAISE NOTICE 'Tenant oliveira-dev -> Pipeline: %', COALESCE(v_oliveira_pipeline, 'NAO CONFIGURADO');
END $$;
