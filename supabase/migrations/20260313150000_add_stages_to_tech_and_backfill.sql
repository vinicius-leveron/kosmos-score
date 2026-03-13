-- ============================================================================
-- KOSMOS Platform - Add Prospecting Stages to Tech Pipeline + Backfill
-- ============================================================================

-- ============================================================================
-- 1. ADD STAGES TO TECH PIPELINE
-- ============================================================================

DO $$
DECLARE
  v_pipeline_id UUID;
  v_org_id UUID;
BEGIN
  -- Get Tech pipeline
  SELECT id, organization_id INTO v_pipeline_id, v_org_id
  FROM public.pipelines
  WHERE display_name = 'Tech' OR name = 'tech'
  LIMIT 1;

  IF v_pipeline_id IS NULL THEN
    RAISE NOTICE 'Tech pipeline not found, skipping...';
    RETURN;
  END IF;

  RAISE NOTICE 'Adding stages to Tech pipeline: %', v_pipeline_id;

  -- Shift existing stages by +3
  UPDATE public.pipeline_stages
  SET position = position + 3
  WHERE pipeline_id = v_pipeline_id;

  -- Unmark old entry stage
  UPDATE public.pipeline_stages
  SET is_entry_stage = false
  WHERE pipeline_id = v_pipeline_id AND is_entry_stage = true;

  -- 0. Prospecção (ENTRY)
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage
  ) VALUES (
    v_pipeline_id, v_org_id, 'prospeccao', 'Prospecção', 0, '#94A3B8', true, false
  ) ON CONFLICT (pipeline_id, name) DO UPDATE SET
    position = EXCLUDED.position,
    is_entry_stage = EXCLUDED.is_entry_stage;

  -- 1. Primeiro Contato
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage
  ) VALUES (
    v_pipeline_id, v_org_id, 'primeiro_contato', '1º Contato', 1, '#60A5FA', false, false
  ) ON CONFLICT (pipeline_id, name) DO UPDATE SET
    position = EXCLUDED.position;

  -- 2. Respondeu
  INSERT INTO public.pipeline_stages (
    pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage
  ) VALUES (
    v_pipeline_id, v_org_id, 'respondeu', 'Respondeu', 2, '#22C55E', false, false
  ) ON CONFLICT (pipeline_id, name) DO UPDATE SET
    position = EXCLUDED.position;

  RAISE NOTICE 'Tech pipeline stages added!';
END $$;

-- ============================================================================
-- 2. BACKFILL CONTACTS TO THEIR CORRECT PIPELINE
-- ============================================================================

DO $$
DECLARE
  v_count INT := 0;
  v_contact RECORD;
  v_pipeline_id UUID;
  v_stage_id UUID;
  v_stage_name TEXT;
BEGIN
  RAISE NOTICE '=== Backfill: Contacts → Pipeline ===';

  FOR v_contact IN
    SELECT
      co.id as contact_org_id,
      co.organization_id,
      co.tenant,
      co.cadence_status,
      c.full_name
    FROM public.contact_orgs co
    JOIN public.contacts c ON c.id = co.contact_id
    LEFT JOIN public.contact_pipeline_positions cpp ON cpp.contact_org_id = co.id
    WHERE co.cadence_status IS NOT NULL
      AND cpp.id IS NULL
  LOOP
    -- Get pipeline for this tenant
    IF v_contact.tenant IS NOT NULL THEN
      SELECT tom.default_pipeline_id INTO v_pipeline_id
      FROM public.tenant_org_mapping tom
      WHERE tom.tenant = v_contact.tenant
        AND tom.default_pipeline_id IS NOT NULL;
    END IF;

    -- Fallback to default pipeline for org
    IF v_pipeline_id IS NULL THEN
      SELECT p.id INTO v_pipeline_id
      FROM public.pipelines p
      WHERE p.organization_id = v_contact.organization_id
        AND p.is_default = true
        AND p.is_active = true
      LIMIT 1;
    END IF;

    IF v_pipeline_id IS NULL THEN
      RAISE NOTICE 'Skipping % - no pipeline found', v_contact.full_name;
      CONTINUE;
    END IF;

    -- Determine stage based on status
    CASE v_contact.cadence_status
      WHEN 'in_sequence' THEN v_stage_name := 'primeiro_contato';
      WHEN 'replied' THEN v_stage_name := 'respondeu';
      WHEN 'converted' THEN v_stage_name := 'fechado_ganho';
      ELSE v_stage_name := 'prospeccao';
    END CASE;

    -- Get stage ID
    SELECT id INTO v_stage_id
    FROM public.pipeline_stages
    WHERE pipeline_id = v_pipeline_id AND name = v_stage_name;

    -- Fallback to entry stage
    IF v_stage_id IS NULL THEN
      SELECT id INTO v_stage_id
      FROM public.pipeline_stages
      WHERE pipeline_id = v_pipeline_id AND is_entry_stage = true;
    END IF;

    IF v_stage_id IS NULL THEN
      RAISE NOTICE 'Skipping % - no stage found in pipeline', v_contact.full_name;
      CONTINUE;
    END IF;

    -- Insert with organization_id
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
    RAISE NOTICE 'Migrated: % → % (stage: %)', v_contact.full_name, v_contact.cadence_status, v_stage_name;
  END LOOP;

  RAISE NOTICE '=== Backfill complete: % contacts migrated ===', v_count;
END $$;

-- ============================================================================
-- 3. VERIFY
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE '=== Final State ===';
  FOR r IN
    SELECT
      c.full_name,
      co.cadence_status,
      p.display_name as pipeline_name,
      ps.display_name as stage_name
    FROM public.contact_orgs co
    JOIN public.contacts c ON c.id = co.contact_id
    JOIN public.contact_pipeline_positions cpp ON cpp.contact_org_id = co.id
    JOIN public.pipeline_stages ps ON ps.id = cpp.stage_id
    JOIN public.pipelines p ON p.id = cpp.pipeline_id
    WHERE co.cadence_status IS NOT NULL
  LOOP
    RAISE NOTICE '% | % | Pipeline: % | Stage: %', r.full_name, r.cadence_status, r.pipeline_name, r.stage_name;
  END LOOP;
END $$;
