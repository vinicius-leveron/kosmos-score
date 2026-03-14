-- ============================================================================
-- FIX: Aplicação KOSMOS deve ir para pipeline Vendas (tenant kosmos)
-- ============================================================================

UPDATE public.lead_magnet_tenant_config
SET
  tenant = 'kosmos',
  description = 'Aplicação KOSMOS → Pipeline Vendas'
WHERE lead_magnet_type = 'aplicacao-kosmos';

-- Verificação
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== Lead Magnet Tenant Config (Corrigido) ===';
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
