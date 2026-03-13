-- ============================================================================
-- KOSMOS Platform - Fix Tenant Pipeline Mapping
-- ============================================================================
-- Esta migration corrige o mapeamento tenant → pipeline usando pipelines existentes
-- ============================================================================

-- Log dos pipelines existentes para debug
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== Pipelines Existentes ===';
  FOR r IN SELECT id, name, display_name, is_default, organization_id FROM public.pipelines WHERE is_active = true
  LOOP
    RAISE NOTICE 'Pipeline: % (%) - default: %', r.display_name, r.name, r.is_default;
  END LOOP;
END $$;

-- ============================================================================
-- Mapear tenant kosmos para o pipeline default da sua organização
-- ============================================================================
UPDATE public.tenant_org_mapping tom
SET default_pipeline_id = (
  SELECT p.id
  FROM public.pipelines p
  WHERE p.organization_id = tom.organization_id
    AND p.is_active = true
  ORDER BY p.is_default DESC, p.created_at ASC
  LIMIT 1
)
WHERE tom.tenant = 'kosmos'
  AND tom.default_pipeline_id IS NULL;

-- ============================================================================
-- Mapear tenant oliveira-dev para o pipeline default da sua organização
-- ============================================================================
UPDATE public.tenant_org_mapping tom
SET default_pipeline_id = (
  SELECT p.id
  FROM public.pipelines p
  WHERE p.organization_id = tom.organization_id
    AND p.is_active = true
  ORDER BY p.is_default DESC, p.created_at ASC
  LIMIT 1
)
WHERE tom.tenant = 'oliveira-dev'
  AND tom.default_pipeline_id IS NULL;

-- ============================================================================
-- LOG do resultado final
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
