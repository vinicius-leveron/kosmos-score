-- ============================================================================
-- Update audit_results sync trigger for V2 data
-- ============================================================================
-- Improvements:
-- 1. Include V2 fields in score_breakdown (movimento, estrutura, result_profile)
-- 2. Store richer source_detail (stage, niche, business_category, instagram)
-- 3. Create an activity record so the CRM timeline shows quiz completions
-- ============================================================================

-- Replace the sync trigger function with V2-aware version
CREATE OR REPLACE FUNCTION public.sync_audit_result_to_contact()
RETURNS TRIGGER AS $$
DECLARE
  v_kosmos_org_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_contact_id UUID;
  v_contact_org_id UUID;
  v_default_stage_id UUID;
  v_score NUMERIC;
BEGIN
  -- Get default journey stage
  SELECT id INTO v_default_stage_id
  FROM public.journey_stages
  WHERE organization_id = v_kosmos_org_id
  AND is_default = true
  LIMIT 1;

  -- Use V2 score if available, fall back to V1
  v_score := COALESCE(NEW.kosmos_asset_score, 0);

  -- Upsert contact with enriched source_detail
  INSERT INTO public.contacts (email, source, source_detail, created_at)
  VALUES (
    lower(trim(NEW.email)),
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
