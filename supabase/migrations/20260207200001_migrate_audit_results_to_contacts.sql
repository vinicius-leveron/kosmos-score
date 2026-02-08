-- ============================================================================
-- KOSMOS Platform - Data Migration: audit_results -> contacts
-- ============================================================================
-- This migration:
-- 1. Creates contacts from audit_results emails
-- 2. Links contacts to KOSMOS org with their scores
-- 3. Keeps audit_results table intact for compatibility
-- ============================================================================

-- Migrate existing audit_results to contacts
DO $$
DECLARE
  v_kosmos_org_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_default_stage_id UUID;
  r RECORD;
  v_contact_id UUID;
BEGIN
  -- Get default journey stage for KOSMOS org
  SELECT id INTO v_default_stage_id
  FROM public.journey_stages
  WHERE organization_id = v_kosmos_org_id
  AND is_default = true
  LIMIT 1;

  -- Loop through distinct emails in audit_results
  FOR r IN
    SELECT DISTINCT ON (lower(trim(email)))
      lower(trim(email)) as email,
      created_at,
      kosmos_asset_score,
      score_causa,
      score_cultura,
      score_economia,
      base_size,
      base_value,
      ticket_medio,
      ticket_value,
      lucro_oculto,
      is_beginner
    FROM public.audit_results
    ORDER BY lower(trim(email)), created_at ASC
  LOOP
    -- Insert contact (or get existing)
    INSERT INTO public.contacts (email, source, source_detail, created_at)
    VALUES (
      r.email,
      'kosmos_score',
      jsonb_build_object(
        'first_submission', r.created_at,
        'initial_base_size', r.base_size
      ),
      r.created_at
    )
    ON CONFLICT (email) DO UPDATE SET
      source_detail = contacts.source_detail || jsonb_build_object(
        'first_submission', r.created_at
      ),
      updated_at = now()
    RETURNING id INTO v_contact_id;

    -- Create contact_org link with score
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
      r.kosmos_asset_score,
      jsonb_build_object(
        'causa', r.score_causa,
        'cultura', r.score_cultura,
        'economia', r.score_economia,
        'base_value', r.base_value,
        'ticket_value', r.ticket_value,
        'lucro_oculto', r.lucro_oculto,
        'is_beginner', r.is_beginner
      ),
      r.created_at
    )
    ON CONFLICT (contact_id, organization_id) DO UPDATE SET
      score = EXCLUDED.score,
      score_breakdown = EXCLUDED.score_breakdown,
      updated_at = now();
  END LOOP;
END $$;

-- ============================================================================
-- COMPATIBILITY VIEW
-- ============================================================================
-- Create a view that allows existing code to continue using audit_results
-- while new code can use the contacts/contact_orgs tables

CREATE OR REPLACE VIEW public.audit_results_enriched AS
SELECT
  ar.*,
  c.id as contact_id,
  co.id as contact_org_id,
  co.journey_stage_id,
  js.name as journey_stage_name,
  js.display_name as journey_stage_display_name
FROM public.audit_results ar
LEFT JOIN public.contacts c ON lower(trim(ar.email)) = c.email
LEFT JOIN public.contact_orgs co ON c.id = co.contact_id
  AND co.organization_id = 'c0000000-0000-0000-0000-000000000001'
LEFT JOIN public.journey_stages js ON co.journey_stage_id = js.id;

-- Grant access to the view
GRANT SELECT ON public.audit_results_enriched TO anon, authenticated;

-- ============================================================================
-- TRIGGER: Sync new audit_results to contacts
-- ============================================================================
-- When a new audit_result is inserted, automatically create/update contact

CREATE OR REPLACE FUNCTION public.sync_audit_result_to_contact()
RETURNS TRIGGER AS $$
DECLARE
  v_kosmos_org_id UUID := 'c0000000-0000-0000-0000-000000000001';
  v_contact_id UUID;
  v_default_stage_id UUID;
BEGIN
  -- Get default journey stage
  SELECT id INTO v_default_stage_id
  FROM public.journey_stages
  WHERE organization_id = v_kosmos_org_id
  AND is_default = true
  LIMIT 1;

  -- Upsert contact
  INSERT INTO public.contacts (email, source, source_detail, created_at)
  VALUES (
    lower(trim(NEW.email)),
    'kosmos_score',
    jsonb_build_object(
      'latest_submission', NEW.created_at,
      'base_size', NEW.base_size
    ),
    NEW.created_at
  )
  ON CONFLICT (email) DO UPDATE SET
    source_detail = contacts.source_detail || jsonb_build_object(
      'latest_submission', NEW.created_at,
      'base_size', NEW.base_size
    ),
    updated_at = now()
  RETURNING id INTO v_contact_id;

  -- Upsert contact_org with latest score
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
    NEW.kosmos_asset_score,
    jsonb_build_object(
      'causa', NEW.score_causa,
      'cultura', NEW.score_cultura,
      'economia', NEW.score_economia,
      'base_value', NEW.base_value,
      'ticket_value', NEW.ticket_value,
      'lucro_oculto', NEW.lucro_oculto,
      'is_beginner', NEW.is_beginner
    ),
    NEW.created_at
  )
  ON CONFLICT (contact_id, organization_id) DO UPDATE SET
    score = EXCLUDED.score,
    score_breakdown = EXCLUDED.score_breakdown,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on audit_results to sync to contacts
DROP TRIGGER IF EXISTS sync_audit_result_to_contact_trigger ON public.audit_results;

CREATE TRIGGER sync_audit_result_to_contact_trigger
  AFTER INSERT ON public.audit_results
  FOR EACH ROW EXECUTE FUNCTION public.sync_audit_result_to_contact();

-- ============================================================================
-- STATISTICS
-- ============================================================================

-- Function to get contact statistics for admin dashboard
CREATE OR REPLACE FUNCTION public.get_contact_stats(p_organization_id UUID DEFAULT 'c0000000-0000-0000-0000-000000000001')
RETURNS TABLE (
  total_contacts BIGINT,
  contacts_this_month BIGINT,
  contacts_this_week BIGINT,
  avg_score NUMERIC,
  by_stage JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT co.contact_id)::BIGINT as total_contacts,
    COUNT(DISTINCT CASE
      WHEN co.created_at >= date_trunc('month', now())
      THEN co.contact_id
    END)::BIGINT as contacts_this_month,
    COUNT(DISTINCT CASE
      WHEN co.created_at >= date_trunc('week', now())
      THEN co.contact_id
    END)::BIGINT as contacts_this_week,
    ROUND(AVG(co.score), 2) as avg_score,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'stage_id', js.id,
          'stage_name', js.display_name,
          'count', COALESCE(stage_counts.cnt, 0)
        )
        ORDER BY js.position
      )
      FROM public.journey_stages js
      LEFT JOIN (
        SELECT journey_stage_id, COUNT(*) as cnt
        FROM public.contact_orgs
        WHERE organization_id = p_organization_id
        GROUP BY journey_stage_id
      ) stage_counts ON js.id = stage_counts.journey_stage_id
      WHERE js.organization_id = p_organization_id
    ) as by_stage
  FROM public.contact_orgs co
  WHERE co.organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
