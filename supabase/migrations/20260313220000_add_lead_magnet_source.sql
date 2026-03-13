-- ============================================================================
-- Add 'lead_magnet' to contact_source enum
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'lead_magnet' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'lead_magnet';
  END IF;
END $$;

COMMENT ON TYPE contact_source IS 'Fontes de leads: kosmos_score, landing_page, manual, import, referral, hotmart, ig_hashtag, ig_followers, ig_commenters, youtube, manychat, linkedin, gmaps, ad, outbound, api, lead_magnet';
