-- ============================================================================
-- Add full_name to audit_results and update sync trigger
-- ============================================================================
-- This allows capturing the user's name in KOSMOS Score lead magnet
-- and syncing it properly to the CRM contacts table
-- ============================================================================

-- Add full_name column to audit_results
ALTER TABLE public.audit_results
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update the sync trigger to include full_name
CREATE OR REPLACE FUNCTION public.sync_audit_result_to_contact()
RETURNS TRIGGER AS $$
DECLARE
  v_kosmos_org_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_contact_id UUID;
  v_contact_org_id UUID;
  v_default_stage_id UUID;
  v_score NUMERIC;
  v_display_name TEXT;
BEGIN
  -- Get default journey stage
  SELECT id INTO v_default_stage_id
  FROM public.journey_stages
  WHERE organization_id = v_kosmos_org_id
  AND is_default = true
  LIMIT 1;

  -- Use V2 score if available, fall back to V1
  v_score := COALESCE(NEW.kosmos_asset_score, 0);

  -- Determine display name (use full_name if provided, otherwise extract from email)
  v_display_name := COALESCE(
    NULLIF(trim(NEW.full_name), ''),
    split_part(NEW.email, '@', 1)
  );

  -- Upsert contact with enriched source_detail and full_name
  INSERT INTO public.contacts (email, full_name, source, source_detail, created_at)
  VALUES (
    lower(trim(NEW.email)),
    v_display_name,
    'kosmos_score',
    jsonb_build_object(
      'latest_submission', NEW.created_at,
      'version', COALESCE(NEW.version, 1),
      'business_category', NEW.business_category,
      'stage', NEW.stage,
      'niche', NEW.niche,
      'instagram_handle', NEW.instagram_handle,
      'result_profile', NEW.result_profile,
      'base_size', NEW.base_size
    ),
    NEW.created_at
  )
  ON CONFLICT (email) DO UPDATE SET
    -- Update full_name only if we have a new non-empty name and existing is null/empty
    full_name = CASE
      WHEN COALESCE(NULLIF(trim(contacts.full_name), ''), '') = ''
      THEN v_display_name
      ELSE contacts.full_name
    END,
    source_detail = contacts.source_detail || jsonb_build_object(
      'latest_submission', NEW.created_at,
      'version', COALESCE(NEW.version, 1),
      'business_category', NEW.business_category,
      'stage', NEW.stage,
      'niche', NEW.niche,
      'instagram_handle', NEW.instagram_handle,
      'result_profile', NEW.result_profile,
      'base_size', NEW.base_size
    ),
    updated_at = now()
  RETURNING id INTO v_contact_id;

  -- Upsert contact_org with V2-enriched score_breakdown
  INSERT INTO public.contact_orgs (
    contact_id,
    organization_id,
    journey_stage_id,
    score,
    score_breakdown,
    created_at
  )
  VALUES (
    v_contact_id,
    v_kosmos_org_id,
    v_default_stage_id,
    v_score,
    jsonb_build_object(
      -- V2 pillar names (primary)
      'movimento', COALESCE(NEW.score_movimento, NEW.score_causa),
      'estrutura', COALESCE(NEW.score_estrutura, NEW.score_cultura),
      'economia', NEW.score_economia,
      -- V1 compat keys (for existing ScoreDisplay until fully migrated)
      'causa', COALESCE(NEW.score_causa, NEW.score_movimento),
      'cultura', COALESCE(NEW.score_cultura, NEW.score_estrutura),
      -- Financial data
      'base_value', NEW.base_value,
      'ticket_value', NEW.ticket_value,
      'lucro_oculto', COALESCE(NEW.lucro_oculto, NEW.lucro_oculto_max),
      'lucro_oculto_min', NEW.lucro_oculto_min,
      'lucro_oculto_max', NEW.lucro_oculto_max,
      'lucro_oculto_display', NEW.lucro_oculto_display,
      -- Profile
      'result_profile', NEW.result_profile,
      'is_beginner', NEW.is_beginner,
      'stage', NEW.stage,
      'version', COALESCE(NEW.version, 1)
    ),
    NEW.created_at
  )
  ON CONFLICT (contact_id, organization_id) DO UPDATE SET
    score = EXCLUDED.score,
    score_breakdown = EXCLUDED.score_breakdown,
    updated_at = now()
  RETURNING id INTO v_contact_org_id;

  -- Create activity for the quiz completion
  INSERT INTO public.activities (
    contact_org_id,
    type,
    title,
    description,
    metadata,
    created_at
  )
  VALUES (
    v_contact_org_id,
    'form_submitted',
    'Completou KOSMOS Score',
    format('Score: %s/100 | Perfil: %s', round(v_score), COALESCE(NEW.result_profile, 'N/A')),
    jsonb_build_object(
      'source', 'kosmos_score',
      'version', COALESCE(NEW.version, 1),
      'score', v_score,
      'result_profile', NEW.result_profile,
      'lucro_oculto_display', NEW.lucro_oculto_display
    ),
    NEW.created_at
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on column
COMMENT ON COLUMN public.audit_results.full_name IS 'User name captured from the lead magnet form';
