-- ========================================
-- CAMADA 1: INFRA & TRACKING
-- Migration 10: Campo website em contacts
-- ========================================

-- Campo website para leads B2B
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS website TEXT;

-- Índice para busca por domínio
CREATE INDEX IF NOT EXISTS idx_contacts_website ON contacts(website) WHERE website IS NOT NULL;
