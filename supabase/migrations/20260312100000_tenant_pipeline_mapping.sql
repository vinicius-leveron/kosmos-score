-- ============================================================================
-- KOSMOS Platform - Tenant to Pipeline Mapping
-- ============================================================================
-- Esta migration:
-- 1. Adiciona coluna default_pipeline_id em tenant_org_mapping
-- 2. Atualiza a trigger sync_outbound_to_pipeline para usar pipeline específico
-- 3. Popula o mapeamento tenant → pipeline
-- 4. Remove pipelines desnecessários
-- ============================================================================

-- ============================================================================
-- 1. ADICIONAR COLUNA default_pipeline_id
-- ============================================================================

ALTER TABLE public.tenant_org_mapping
ADD COLUMN IF NOT EXISTS default_pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tenant_org_mapping_pipeline
  ON public.tenant_org_mapping(default_pipeline_id);

COMMENT ON COLUMN public.tenant_org_mapping.default_pipeline_id IS
  'Pipeline padrão para leads do Outbound deste tenant. Se NULL, usa pipeline padrão da org.';

-- ============================================================================
-- 2. ATUALIZAR FUNÇÃO sync_outbound_to_pipeline
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_outbound_to_pipeline()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_pipeline_id UUID;
  v_entry_stage_id UUID;
  v_contact_name TEXT;
  v_company_id UUID;
BEGIN
  -- Only process if cadence_status changed to 'replied' or 'converted'
  IF NEW.cadence_status IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip if status didn't actually change
  IF OLD.cadence_status IS NOT DISTINCT FROM NEW.cadence_status THEN
    RETURN NEW;
  END IF;

  -- Resolve organization_id from tenant mapping (if tenant is set)
  IF NEW.tenant IS NOT NULL THEN
    SELECT organization_id INTO v_org_id
    FROM public.tenant_org_mapping
    WHERE tenant = NEW.tenant;
  END IF;

  -- Fallback to contact_org's organization_id
  IF v_org_id IS NULL THEN
    v_org_id := NEW.organization_id;
  END IF;

  -- ============================================
  -- NOVA LÓGICA: Primeiro tentar pipeline específico do tenant
  -- ============================================
  IF NEW.tenant IS NOT NULL THEN
    SELECT tom.default_pipeline_id, s.id INTO v_pipeline_id, v_entry_stage_id
    FROM public.tenant_org_mapping tom
    JOIN public.pipeline_stages s ON s.pipeline_id = tom.default_pipeline_id AND s.is_entry_stage = true
    WHERE tom.tenant = NEW.tenant
      AND tom.default_pipeline_id IS NOT NULL;
  END IF;

  -- ============================================
  -- Fallback: Pipeline padrão da organização
  -- ============================================
  IF v_pipeline_id IS NULL THEN
    SELECT p.id, s.id INTO v_pipeline_id, v_entry_stage_id
    FROM public.pipelines p
    JOIN public.pipeline_stages s ON s.pipeline_id = p.id AND s.is_entry_stage = true
    WHERE p.organization_id = v_org_id
      AND p.is_default = true
      AND p.is_active = true
    LIMIT 1;
  END IF;

  -- Se ainda não encontrou, tentar qualquer pipeline ativo
  IF v_pipeline_id IS NULL THEN
    SELECT p.id, s.id INTO v_pipeline_id, v_entry_stage_id
    FROM public.pipelines p
    JOIN public.pipeline_stages s ON s.pipeline_id = p.id AND s.is_entry_stage = true
    WHERE p.organization_id = v_org_id
      AND p.is_active = true
    ORDER BY p.created_at ASC
    LIMIT 1;
  END IF;

  -- No pipeline found - skip sync
  IF v_pipeline_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- ============================================
  -- REPLIED: Add contact to pipeline
  -- ============================================
  IF NEW.cadence_status = 'replied' THEN
    INSERT INTO public.contact_pipeline_positions (
      contact_org_id,
      pipeline_id,
      stage_id,
      entered_stage_at,
      entered_pipeline_at
    ) VALUES (
      NEW.id,
      v_pipeline_id,
      v_entry_stage_id,
      now(),
      now()
    )
    ON CONFLICT (contact_org_id, pipeline_id) DO NOTHING;
  END IF;

  -- ============================================
  -- CONVERTED: Create Deal (if company exists)
  -- ============================================
  IF NEW.cadence_status = 'converted' THEN
    -- First ensure contact is in the pipeline
    INSERT INTO public.contact_pipeline_positions (
      contact_org_id,
      pipeline_id,
      stage_id,
      entered_stage_at,
      entered_pipeline_at
    ) VALUES (
      NEW.id,
      v_pipeline_id,
      v_entry_stage_id,
      now(),
      now()
    )
    ON CONFLICT (contact_org_id, pipeline_id) DO NOTHING;

    -- Get contact name
    SELECT c.full_name INTO v_contact_name
    FROM public.contacts c
    WHERE c.id = NEW.contact_id;

    -- Get company from contact_companies (if linked)
    SELECT cc.company_id INTO v_company_id
    FROM public.contact_companies cc
    WHERE cc.contact_org_id = NEW.id
    LIMIT 1;

    -- Only create deal if we have a company
    IF v_company_id IS NOT NULL THEN
      INSERT INTO public.deals (
        organization_id,
        name,
        description,
        status,
        company_id,
        primary_contact_id,
        pipeline_id,
        stage_id,
        source
      ) VALUES (
        v_org_id,
        COALESCE('Deal - ' || v_contact_name, 'Deal - Outbound Lead'),
        'Deal criado automaticamente via Outbound Motor',
        'open',
        v_company_id,
        NEW.id,
        v_pipeline_id,
        v_entry_stage_id,
        'outbound'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. POPULAR MAPEAMENTO TENANT → PIPELINE
-- ============================================================================

-- Atualizar kosmos para usar pipeline "Venda" ou "Sales"
UPDATE public.tenant_org_mapping
SET default_pipeline_id = (
  SELECT id FROM public.pipelines
  WHERE (name ILIKE '%venda%' OR display_name ILIKE '%venda%' OR name ILIKE '%sales%')
    AND is_active = true
  ORDER BY is_default DESC, created_at ASC
  LIMIT 1
)
WHERE tenant = 'kosmos';

-- Atualizar oliveira-dev para usar pipeline "Tech"
UPDATE public.tenant_org_mapping
SET default_pipeline_id = (
  SELECT id FROM public.pipelines
  WHERE (name ILIKE '%tech%' OR display_name ILIKE '%tech%')
    AND is_active = true
  ORDER BY is_default DESC, created_at ASC
  LIMIT 1
)
WHERE tenant = 'oliveira-dev';

-- ============================================================================
-- 4. DELETAR PIPELINES DESNECESSÁRIOS
-- ============================================================================

-- Primeiro desativar stages órfãos (pipelines que serão deletados)
DELETE FROM public.pipeline_stages
WHERE pipeline_id IN (
  SELECT p.id FROM public.pipelines p
  WHERE (p.name ILIKE '%teste%' OR p.name ILIKE '%test%' OR p.name ILIKE '%kosmos-lead%')
    AND NOT EXISTS (SELECT 1 FROM public.deals d WHERE d.pipeline_id = p.id)
    AND NOT EXISTS (SELECT 1 FROM public.contact_pipeline_positions cpp WHERE cpp.pipeline_id = p.id)
);

-- Deletar pipelines de teste sem deals ou posições
DELETE FROM public.pipelines
WHERE (name ILIKE '%teste%' OR name ILIKE '%test%')
  AND NOT EXISTS (SELECT 1 FROM public.deals WHERE pipeline_id = pipelines.id)
  AND NOT EXISTS (SELECT 1 FROM public.contact_pipeline_positions WHERE pipeline_id = pipelines.id);

-- Deletar pipeline kosmos-lead magnets se não tiver dados
DELETE FROM public.pipelines
WHERE name ILIKE '%kosmos-lead%'
  AND NOT EXISTS (SELECT 1 FROM public.deals WHERE pipeline_id = pipelines.id)
  AND NOT EXISTS (SELECT 1 FROM public.contact_pipeline_positions WHERE pipeline_id = pipelines.id);

-- ============================================================================
-- LOG
-- ============================================================================

DO $$
DECLARE
  v_kosmos_pipeline TEXT;
  v_oliveira_pipeline TEXT;
BEGIN
  SELECT p.name INTO v_kosmos_pipeline
  FROM public.tenant_org_mapping tom
  JOIN public.pipelines p ON p.id = tom.default_pipeline_id
  WHERE tom.tenant = 'kosmos';

  SELECT p.name INTO v_oliveira_pipeline
  FROM public.tenant_org_mapping tom
  JOIN public.pipelines p ON p.id = tom.default_pipeline_id
  WHERE tom.tenant = 'oliveira-dev';

  RAISE NOTICE 'Tenant kosmos -> Pipeline: %', COALESCE(v_kosmos_pipeline, 'NAO CONFIGURADO');
  RAISE NOTICE 'Tenant oliveira-dev -> Pipeline: %', COALESCE(v_oliveira_pipeline, 'NAO CONFIGURADO');
END $$;
