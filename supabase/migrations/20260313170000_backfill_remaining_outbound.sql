-- ============================================================================
-- KOSMOS Platform - Backfill Remaining Outbound Contacts to Deals
-- ============================================================================

-- Check for contacts with cadence_status that don't have deals
DO $$
DECLARE
  r RECORD;
  v_count INT := 0;
BEGIN
  RAISE NOTICE '=== Contacts with cadence_status WITHOUT deals ===';
  FOR r IN
    SELECT
      c.full_name,
      co.id as contact_org_id,
      co.cadence_status,
      co.tenant,
      co.organization_id
    FROM public.contact_orgs co
    JOIN public.contacts c ON c.id = co.contact_id
    LEFT JOIN public.deals d ON d.primary_contact_id = co.id
    WHERE co.cadence_status IS NOT NULL
      AND d.id IS NULL
  LOOP
    v_count := v_count + 1;
    RAISE NOTICE '% | % | tenant: %', r.full_name, r.cadence_status, r.tenant;
  END LOOP;
  RAISE NOTICE '=== Total contacts without deals: % ===', v_count;
END $$;

-- Backfill: Create deals for all outbound contacts without deals
DO $$
DECLARE
  v_count INT := 0;
  v_contact RECORD;
  v_pipeline_id UUID;
  v_stage_id UUID;
  v_company_id UUID;
BEGIN
  RAISE NOTICE '=== Creating Deals for Missing Outbound Contacts ===';

  FOR v_contact IN
    SELECT
      co.id as contact_org_id,
      co.organization_id,
      co.tenant,
      co.cadence_status,
      co.contact_id,
      c.full_name
    FROM public.contact_orgs co
    JOIN public.contacts c ON c.id = co.contact_id
    LEFT JOIN public.deals d ON d.primary_contact_id = co.id
    WHERE co.cadence_status IS NOT NULL
      AND d.id IS NULL
  LOOP
    -- Get pipeline for tenant
    IF v_contact.tenant IS NOT NULL THEN
      SELECT tom.default_pipeline_id INTO v_pipeline_id
      FROM public.tenant_org_mapping tom
      WHERE tom.tenant = v_contact.tenant
        AND tom.default_pipeline_id IS NOT NULL;
    END IF;

    -- Fallback to default pipeline
    IF v_pipeline_id IS NULL THEN
      SELECT p.id INTO v_pipeline_id
      FROM public.pipelines p
      WHERE p.organization_id = v_contact.organization_id
        AND p.is_default = true
        AND p.is_active = true
      LIMIT 1;
    END IF;

    IF v_pipeline_id IS NULL THEN
      RAISE NOTICE 'Skipping % - no pipeline', v_contact.full_name;
      CONTINUE;
    END IF;

    -- Determine stage
    CASE v_contact.cadence_status
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
        SELECT id INTO v_stage_id FROM public.pipeline_stages
        WHERE pipeline_id = v_pipeline_id AND is_entry_stage = true;
    END CASE;

    -- Fallback to entry stage
    IF v_stage_id IS NULL THEN
      SELECT id INTO v_stage_id FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id AND is_entry_stage = true;
    END IF;

    IF v_stage_id IS NULL THEN
      RAISE NOTICE 'Skipping % - no stage', v_contact.full_name;
      CONTINUE;
    END IF;

    -- Get company if exists
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
      'Deal criado via backfill',
      'open',
      v_company_id,
      v_contact.contact_org_id,
      v_pipeline_id,
      v_stage_id,
      now(),
      now(),
      'outbound'
    );

    -- Also ensure contact_pipeline_positions exists
    INSERT INTO public.contact_pipeline_positions (
      contact_org_id,
      organization_id,
      pipeline_id,
      stage_id,
      entered_stage_at,
      entered_pipeline_at
    ) VALUES (
      v_contact.contact_org_id,
      v_contact.organization_id,
      v_pipeline_id,
      v_stage_id,
      now(),
      now()
    )
    ON CONFLICT (contact_org_id, pipeline_id) DO NOTHING;

    v_count := v_count + 1;
    RAISE NOTICE 'Created deal for: % (status: %)', v_contact.full_name, v_contact.cadence_status;
  END LOOP;

  RAISE NOTICE '=== Backfill complete: % deals created ===', v_count;
END $$;

-- Final verification
DO $$
DECLARE
  v_total_outbound INT;
  v_with_deals INT;
  v_without_deals INT;
BEGIN
  SELECT COUNT(*) INTO v_total_outbound
  FROM public.contact_orgs WHERE cadence_status IS NOT NULL;

  SELECT COUNT(DISTINCT d.primary_contact_id) INTO v_with_deals
  FROM public.deals d
  JOIN public.contact_orgs co ON co.id = d.primary_contact_id
  WHERE co.cadence_status IS NOT NULL;

  v_without_deals := v_total_outbound - v_with_deals;

  RAISE NOTICE '=== Final Status ===';
  RAISE NOTICE 'Total outbound contacts: %', v_total_outbound;
  RAISE NOTICE 'With deals: %', v_with_deals;
  RAISE NOTICE 'Without deals: %', v_without_deals;
END $$;

-- List all outbound deals
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== All Outbound Deals ===';
  FOR r IN
    SELECT
      d.name,
      d.status,
      p.display_name as pipeline_name,
      ps.display_name as stage_name
    FROM public.deals d
    JOIN public.pipelines p ON p.id = d.pipeline_id
    JOIN public.pipeline_stages ps ON ps.id = d.stage_id
    WHERE d.source = 'outbound'
    ORDER BY d.created_at DESC
  LOOP
    RAISE NOTICE '% | % | % | %', r.name, r.status, r.pipeline_name, r.stage_name;
  END LOOP;
END $$;
