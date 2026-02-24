-- Migration: Adicionar campos de outbound ao contacts
-- Motor de Outbound Modular - Fase 1: Foundation

-- Social handles para outreach
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS youtube_channel TEXT;

-- Array de fontes (um lead pode vir de multiplas fontes)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS fontes TEXT[] DEFAULT '{}';

-- Validacao de email/telefone para enrichment (M3)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email_validado BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email_validation_date TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS telefone_validado BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS telefone_validation_date TIMESTAMPTZ;

-- Flag de enrichment
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS enrichment_attempted BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS enrichment_date TIMESTAMPTZ;

-- Indices para busca
CREATE INDEX IF NOT EXISTS idx_contacts_instagram ON contacts(instagram)
  WHERE instagram IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_email_validado ON contacts(email_validado);
CREATE INDEX IF NOT EXISTS idx_contacts_enrichment ON contacts(enrichment_attempted)
  WHERE enrichment_attempted = false;

-- Comentarios para documentacao
COMMENT ON COLUMN contacts.instagram IS 'Handle do Instagram (sem @)';
COMMENT ON COLUMN contacts.linkedin_url IS 'URL do perfil LinkedIn';
COMMENT ON COLUMN contacts.youtube_channel IS 'URL ou ID do canal YouTube';
COMMENT ON COLUMN contacts.fontes IS 'Array de fontes de onde o lead veio';
COMMENT ON COLUMN contacts.email_validado IS 'Email passou por validacao MX/disposable check';
COMMENT ON COLUMN contacts.email_validation_date IS 'Data da ultima validacao do email';
COMMENT ON COLUMN contacts.telefone_validado IS 'Telefone esta validado';
COMMENT ON COLUMN contacts.enrichment_attempted IS 'Ja tentou enriquecer este contato';
COMMENT ON COLUMN contacts.enrichment_date IS 'Data da ultima tentativa de enrichment';
