-- ============================================================================
-- Add 'form_submission' to contact_source enum
-- ============================================================================
-- Fix for trigger sync_form_submission_to_contact which uses 'form_submission'
-- as source but the value was missing from the enum

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'form_submission' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'form_submission';
  END IF;
END $$;

COMMENT ON TYPE contact_source IS 'Fontes de leads: kosmos_score, landing_page, manual, import, referral, hotmart, ig_hashtag, ig_followers, ig_commenters, youtube, manychat, linkedin, gmaps, ad, outbound, api, lead_magnet, form_submission';
