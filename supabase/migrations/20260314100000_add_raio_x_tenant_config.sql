-- ============================================================================
-- ADD RAIO-X TO LEAD MAGNET TENANT CONFIG
-- ============================================================================

INSERT INTO public.lead_magnet_tenant_config (lead_magnet_type, tenant, description)
VALUES ('raio-x-kosmos', 'kosmos', 'Raio-X KOSMOS → Pipeline Vendas')
ON CONFLICT (lead_magnet_type) DO UPDATE SET
  tenant = EXCLUDED.tenant,
  description = EXCLUDED.description;

-- Verificação
DO $$
BEGIN
  RAISE NOTICE 'raio-x-kosmos adicionado ao lead_magnet_tenant_config → kosmos (Vendas)';
END $$;
