-- Migration: Expandir contact_source ENUM com novas fontes
-- Motor de Outbound Modular - Fase 1: Foundation

-- Adicionar novas fontes ao ENUM (sem recriar - preserva dados existentes)
-- Nota: ADD VALUE IF NOT EXISTS requer PostgreSQL 9.3+

DO $$
BEGIN
  -- Fontes de scraping KOSMOS
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'hotmart' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'hotmart';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ig_hashtag' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'ig_hashtag';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ig_followers' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'ig_followers';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ig_commenters' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'ig_commenters';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'youtube' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'youtube';
  END IF;

  -- Fonte de inbound ManyChat
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'manychat' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'manychat';
  END IF;

  -- Fontes futuras para Oliveira Dev
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'linkedin' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'linkedin';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'gmaps' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'gmaps';
  END IF;

  -- Fonte de ads
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ad' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'ad';
  END IF;

  -- Fonte de outbound direto
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'outbound' AND enumtypid = 'contact_source'::regtype) THEN
    ALTER TYPE contact_source ADD VALUE 'outbound';
  END IF;
END $$;

-- Comentario no tipo
COMMENT ON TYPE contact_source IS 'Fontes de leads: kosmos_score, landing_page, manual, import, referral, form_submission, hotmart, ig_hashtag, ig_followers, ig_commenters, youtube, manychat, linkedin, gmaps, ad, outbound';
