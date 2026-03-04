-- ============================================================================
-- Add 'api' to contact_source enum
-- ============================================================================
-- Fix for POST /contacts API endpoint error 500
-- The API uses 'api' as default source, but it wasn't in the enum
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'api' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'api';
  END IF;
END $$;

COMMENT ON TYPE contact_source IS 'Fontes de leads: kosmos_score, landing_page, manual, import, referral, hotmart, ig_hashtag, ig_followers, ig_commenters, youtube, manychat, linkedin, gmaps, ad, outbound, api';
