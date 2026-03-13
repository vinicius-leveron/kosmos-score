-- ============================================================================
-- KOSMOS Platform - Create Deals for Outbound Contacts
-- ============================================================================
-- Modifica o fluxo: Lead Outbound → Cria DEAL automaticamente no pipeline
-- ============================================================================

-- ============================================================================
-- 0. PERMITIR company_id NULL em deals (para leads sem empresa associada)
-- ============================================================================

ALTER TABLE public.deals
  ALTER COLUMN company_id DROP NOT NULL;

-- ============================================================================
-- 1. ATUALIZAR TRIGGER para criar DEAL (não só contact_pipeline_position)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_outbound_to_pipeline()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_pipeline_id UUID;
  v_entry_stage_id UUID;
  v_stage_id UUID;
  v_contact_name TEXT;
  v_company_id UUID;
  v_deal_id UUID;
BEGIN
  -- Skip if no cadence_status (not an outbound contact)
  IF NEW.cadence_status IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip if status didn't change (for UPDATEs)
  IF TG_OP = 'UPDATE' AND OLD.cadence_status IS NOT DISTINCT FROM NEW.cadence_status THEN
    RETURN NEW;
  END IF;

  -- Resolve organization_id
  IF NEW.tenant IS NOT NULL THEN
    SELECT organization_id INTO v_org_id
    FROM public.tenant_org_mapping
    WHERE tenant = NEW.tenant;
  END IF;

  IF v_org_id IS NULL THEN
    v_org_id := NEW.organization_id;
  END IF;

  -- Get pipeline for this tenant
  IF NEW.tenant IS NOT NULL THEN
    SELECT tom.default_pipeline_id INTO v_pipeline_id
    FROM public.tenant_org_mapping tom
    WHERE tom.tenant = NEW.tenant
      AND tom.default_pipeline_id IS NOT NULL;
  END IF;

  -- Fallback to default pipeline
  IF v_pipeline_id IS NULL THEN
    SELECT p.id INTO v_pipeline_id
    FROM public.pipelines p
    WHERE p.organization_id = v_org_id
      AND p.is_default = true
      AND p.is_active = true
    LIMIT 1;
  END IF;

  IF v_pipeline_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Determine stage based on cadence_status
  CASE NEW.cadence_status
    WHEN 'in_sequence' THEN
      SELECT id INTO v_stage_id FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id AND name = 'primeiro_contato';
    WHEN 'replied' THEN
      SELECT id INTO v_stage_id FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id AND name = 'respondeu';
    WHEN 'converted' THEN
      SELECT id INTO v_stage_id FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id AND name = 'fechado_ganho';
    ELSE
      -- Default: entry stage (Prospecção)
      SELECT id INTO v_stage_id FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id AND is_entry_stage = true;
  END CASE;

  -- Fallback to entry stage
  IF v_stage_id IS NULL THEN
    SELECT id INTO v_stage_id FROM public.pipeline_stages
    WHERE pipeline_id = v_pipeline_id AND is_entry_stage = true;
  END IF;

  IF v_stage_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get contact name
  SELECT c.full_name INTO v_contact_name
  FROM public.contacts c
  WHERE c.id = NEW.contact_id;

  -- Get company if exists
  SELECT cc.company_id INTO v_company_id
  FROM public.contact_companies cc
  WHERE cc.contact_org_id = NEW.id
  LIMIT 1;

  -- Check if deal already exists for this contact
  SELECT d.id INTO v_deal_id
  FROM public.deals d
  WHERE d.primary_contact_id = NEW.id
    AND d.pipeline_id = v_pipeline_id
    AND d.status = 'open';

  IF v_deal_id IS NOT NULL THEN
    -- Update existing deal's stage
    UPDATE public.deals
    SET stage_id = v_stage_id,
        entered_stage_at = now()
    WHERE id = v_deal_id;
  ELSE
    -- Create new deal for this contact
    INSERT INTO public.deals (
      organization_id,
      name,
      description,
      status,
      company_id,
      primary_contact_id,
      pipeline_id,
      stage_id,
      entered_stage_at,
      entered_pipeline_at,
      source
    ) VALUES (
      v_org_id,
      COALESCE(v_contact_name, 'Lead Outbound'),
      'Deal criado automaticamente via Outbound Motor',
      'open',
      v_company_id,
      NEW.id,
      v_pipeline_id,
      v_stage_id,
      now(),
      now(),
      'outbound'
    );
  END IF;

  -- Also insert/update contact_pipeline_positions for backwards compatibility
  INSERT INTO public.contact_pipeline_positions (
    contact_org_id,
    organization_id,
    pipeline_id,
    stage_id,
    entered_stage_at,
    entered_pipeline_at
  ) VALUES (
    NEW.id,
    v_org_id,
    v_pipeline_id,
    v_stage_id,
    now(),
    now()
  )
  ON CONFLICT (contact_org_id, pipeline_id) DO UPDATE SET
    stage_id = EXCLUDED.stage_id,
    entered_stage_at = EXCLUDED.entered_stage_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. BACKFILL: Criar deals para contacts que já estão no pipeline
-- ============================================================================

DO $$
DECLARE
  v_count INT := 0;
  v_contact RECORD;
  v_pipeline_id UUID;
  v_stage_id UUID;
  v_contact_name TEXT;
  v_company_id UUID;
  v_existing_deal_id UUID;
BEGIN
  RAISE NOTICE '=== Backfill: Creating Deals for Outbound Contacts ===';

  FOR v_contact IN
    SELECT
      cpp.contact_org_id,
      cpp.organization_id,
      cpp.pipeline_id,
      cpp.stage_id,
      co.cadence_status,
      co.contact_id,
      c.full_name
    FROM public.contact_pipeline_positions cpp
    JOIN public.contact_orgs co ON co.id = cpp.contact_org_id
    JOIN public.contacts c ON c.id = co.contact_id
    WHERE co.cadence_status IS NOT NULL
  LOOP
    -- Check if deal already exists
    SELECT id INTO v_existing_deal_id
    FROM public.deals
    WHERE primary_contact_id = v_contact.contact_org_id
      AND pipeline_id = v_contact.pipeline_id
      AND status = 'open';

    IF v_existing_deal_id IS NOT NULL THEN
      RAISE NOTICE 'Deal already exists for %', v_contact.full_name;
      CONTINUE;
    END IF;

    -- Get company
    SELECT cc.company_id INTO v_company_id
    FROM public.contact_companies cc
    WHERE cc.contact_org_id = v_contact.contact_org_id
    LIMIT 1;

    -- Create deal
    INSERT INTO public.deals (
      organization_id,
      name,
      description,
      status,
      company_id,
      primary_contact_id,
      pipeline_id,
      stage_id,
      entered_stage_at,
      entered_pipeline_at,
      source
    ) VALUES (
      v_contact.organization_id,
      COALESCE(v_contact.full_name, 'Lead Outbound'),
      'Deal criado via backfill - Outbound Motor',
      'open',
      v_company_id,
      v_contact.contact_org_id,
      v_contact.pipeline_id,
      v_contact.stage_id,
      now(),
      now(),
      'outbound'
    );

    v_count := v_count + 1;
    RAISE NOTICE 'Created deal for: %', v_contact.full_name;
  END LOOP;

  RAISE NOTICE '=== Backfill complete: % deals created ===', v_count;
END $$;

-- ============================================================================
-- 3. ATUALIZAR SYNC: Quando mover DEAL no Kanban, atualizar cadence_status
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_deal_to_cadence_status()
RETURNS TRIGGER AS $$
DECLARE
  v_stage_name TEXT;
  v_contact_org_id UUID;
BEGIN
  -- Get stage name
  SELECT name INTO v_stage_name
  FROM public.pipeline_stages
  WHERE id = NEW.stage_id;

  -- Get contact_org_id from deal
  v_contact_org_id := NEW.primary_contact_id;

  IF v_contact_org_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Update cadence_status based on stage
  IF v_stage_name = 'primeiro_contato' THEN
    UPDATE public.contact_orgs
    SET cadence_status = 'in_sequence'
    WHERE id = v_contact_org_id
      AND cadence_status IS NOT NULL;

  ELSIF v_stage_name = 'respondeu' THEN
    UPDATE public.contact_orgs
    SET cadence_status = 'replied'
    WHERE id = v_contact_org_id
      AND cadence_status IS NOT NULL;

  ELSIF v_stage_name = 'fechado_ganho' THEN
    UPDATE public.contact_orgs
    SET cadence_status = 'converted'
    WHERE id = v_contact_org_id
      AND cadence_status IS NOT NULL;

  ELSIF v_stage_name = 'fechado_perdido' THEN
    UPDATE public.contact_orgs
    SET cadence_status = 'archived'
    WHERE id = v_contact_org_id
      AND cadence_status IS NOT NULL;

  END IF;

  -- Also update contact_pipeline_positions
  UPDATE public.contact_pipeline_positions
  SET stage_id = NEW.stage_id,
      entered_stage_at = NEW.entered_stage_at
  WHERE contact_org_id = v_contact_org_id
    AND pipeline_id = NEW.pipeline_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on deals table
DROP TRIGGER IF EXISTS trg_sync_deal_to_cadence ON public.deals;
CREATE TRIGGER trg_sync_deal_to_cadence
  AFTER UPDATE OF stage_id ON public.deals
  FOR EACH ROW
  WHEN (OLD.stage_id IS DISTINCT FROM NEW.stage_id)
  EXECUTE FUNCTION public.sync_deal_to_cadence_status();

-- ============================================================================
-- 4. VERIFY
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== Deals Created for Outbound ===';
  FOR r IN
    SELECT
      d.name,
      d.status,
      p.display_name as pipeline_name,
      ps.display_name as stage_name,
      d.source
    FROM public.deals d
    JOIN public.pipelines p ON p.id = d.pipeline_id
    JOIN public.pipeline_stages ps ON ps.id = d.stage_id
    WHERE d.source = 'outbound'
    ORDER BY d.created_at DESC
    LIMIT 20
  LOOP
    RAISE NOTICE '% | % | % | % | %', r.name, r.status, r.pipeline_name, r.stage_name, r.source;
  END LOOP;
END $$;
