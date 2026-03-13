-- ============================================================================
-- KOSMOS Platform - Create Tenant Mappings
-- ============================================================================
-- A tabela tenant_org_mapping estava vazia. Esta migration cria os registros.
-- ============================================================================

-- Inserir tenant kosmos com pipeline Vendas
INSERT INTO public.tenant_org_mapping (tenant, organization_id, default_pipeline_id)
VALUES (
  'kosmos',
  'c0000000-0000-0000-0000-000000000001',
  (SELECT id FROM public.pipelines WHERE display_name = 'Vendas' OR name = 'sales' LIMIT 1)
)
ON CONFLICT (tenant) DO UPDATE SET
  default_pipeline_id = EXCLUDED.default_pipeline_id;

-- Inserir tenant oliveira-dev com pipeline Tech
INSERT INTO public.tenant_org_mapping (tenant, organization_id, default_pipeline_id)
VALUES (
  'oliveira-dev',
  'c0000000-0000-0000-0000-000000000001',
  (SELECT id FROM public.pipelines WHERE display_name = 'Tech' OR name = 'Tech' LIMIT 1)
)
ON CONFLICT (tenant) DO UPDATE SET
  default_pipeline_id = EXCLUDED.default_pipeline_id;

-- ============================================================================
-- Verificação final
-- ============================================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== Mapeamentos Criados ===';
  FOR r IN
    SELECT tom.tenant, p.display_name as pipeline_name
    FROM public.tenant_org_mapping tom
    LEFT JOIN public.pipelines p ON p.id = tom.default_pipeline_id
  LOOP
    RAISE NOTICE 'Tenant: % -> Pipeline: %', r.tenant, COALESCE(r.pipeline_name, 'NAO CONFIGURADO');
  END LOOP;
END $$;
