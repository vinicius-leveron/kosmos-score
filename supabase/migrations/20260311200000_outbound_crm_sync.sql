-- ============================================================================
-- KOSMOS Platform - Outbound to CRM Sync
-- ============================================================================
-- This migration creates the sync mechanism between Outbound and CRM:
-- 1. tenant_org_mapping - maps tenant names to organization IDs
-- 2. sync_outbound_to_pipeline() - trigger function for automatic sync
-- 3. Triggers on contact_orgs for cadence_status changes
-- ============================================================================

-- ============================================================================
-- TENANT TO ORGANIZATION MAPPING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_org_mapping (
  tenant TEXT PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tenant_org_mapping_org
  ON public.tenant_org_mapping(organization_id);

-- RLS for tenant_org_mapping
ALTER TABLE public.tenant_org_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for authenticated users" ON public.tenant_org_mapping
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert/update for service role" ON public.tenant_org_mapping
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- SYNC FUNCTION: Outbound cadence_status -> CRM Pipeline/Deals
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

  -- Find the default sales pipeline and its entry stage for this org
  SELECT p.id, s.id INTO v_pipeline_id, v_entry_stage_id
  FROM public.pipelines p
  JOIN public.pipeline_stages s ON s.pipeline_id = p.id AND s.is_entry_stage = true
  WHERE p.organization_id = v_org_id
    AND p.is_default = true
    AND p.is_active = true
  LIMIT 1;

  -- If no default pipeline, try to find any active sales pipeline
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
-- TRIGGER: Sync on cadence_status changes
-- ============================================================================

DROP TRIGGER IF EXISTS trg_sync_outbound_to_crm ON public.contact_orgs;

CREATE TRIGGER trg_sync_outbound_to_crm
  AFTER UPDATE OF cadence_status ON public.contact_orgs
  FOR EACH ROW
  WHEN (
    NEW.cadence_status IN ('replied', 'converted')
    AND (OLD.cadence_status IS DISTINCT FROM NEW.cadence_status)
  )
  EXECUTE FUNCTION public.sync_outbound_to_pipeline();

-- ============================================================================
-- HELPER FUNCTION: Manual send to pipeline
-- ============================================================================

CREATE OR REPLACE FUNCTION public.send_contact_to_pipeline(
  p_contact_org_id UUID,
  p_create_deal BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
  v_contact_org RECORD;
  v_pipeline_id UUID;
  v_stage_id UUID;
  v_company_id UUID;
  v_contact_name TEXT;
  v_result JSONB;
BEGIN
  -- Get contact_org
  SELECT * INTO v_contact_org
  FROM public.contact_orgs
  WHERE id = p_contact_org_id;

  IF v_contact_org IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Contact not found');
  END IF;

  -- Find default pipeline
  SELECT p.id, s.id INTO v_pipeline_id, v_stage_id
  FROM public.pipelines p
  JOIN public.pipeline_stages s ON s.pipeline_id = p.id AND s.is_entry_stage = true
  WHERE p.organization_id = v_contact_org.organization_id
    AND p.is_default = true
    AND p.is_active = true
  LIMIT 1;

  IF v_pipeline_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No default pipeline found');
  END IF;

  -- Add to pipeline
  INSERT INTO public.contact_pipeline_positions (
    contact_org_id, pipeline_id, stage_id
  ) VALUES (
    p_contact_org_id, v_pipeline_id, v_stage_id
  )
  ON CONFLICT (contact_org_id, pipeline_id) DO NOTHING;

  v_result := jsonb_build_object(
    'success', true,
    'pipeline_id', v_pipeline_id,
    'stage_id', v_stage_id
  );

  -- Optionally create deal
  IF p_create_deal THEN
    SELECT cc.company_id INTO v_company_id
    FROM public.contact_companies cc
    WHERE cc.contact_org_id = p_contact_org_id
    LIMIT 1;

    IF v_company_id IS NOT NULL THEN
      SELECT c.full_name INTO v_contact_name
      FROM public.contacts c
      WHERE c.id = v_contact_org.contact_id;

      INSERT INTO public.deals (
        organization_id, name, status, company_id, primary_contact_id,
        pipeline_id, stage_id, source
      ) VALUES (
        v_contact_org.organization_id,
        COALESCE('Deal - ' || v_contact_name, 'Deal - Outbound'),
        'open',
        v_company_id,
        p_contact_org_id,
        v_pipeline_id,
        v_stage_id,
        'outbound'
      );

      v_result := v_result || jsonb_build_object('deal_created', true);
    ELSE
      v_result := v_result || jsonb_build_object(
        'deal_created', false,
        'deal_error', 'No company linked to contact'
      );
    END IF;
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.send_contact_to_pipeline(UUID, BOOLEAN) TO authenticated;

-- ============================================================================
-- SEED: Default tenant mappings (will be updated with real IDs)
-- ============================================================================

-- Note: Run this manually after migration with correct organization UUIDs:
-- INSERT INTO public.tenant_org_mapping (tenant, organization_id) VALUES
--   ('kosmos', 'YOUR-KOSMOS-ORG-UUID'),
--   ('oliveira-dev', 'YOUR-OLIVEIRA-DEV-ORG-UUID')
-- ON CONFLICT (tenant) DO UPDATE SET organization_id = EXCLUDED.organization_id;
