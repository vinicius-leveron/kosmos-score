-- ============================================================================
-- Reestruturação: Separar channel (plataforma) e method (tipo de interação)
-- ============================================================================
-- Antes: channel_in misturava tudo (dm, whatsapp, scraper, manychat)
-- Depois: channel = plataforma, method = como entrou
-- ============================================================================

-- ========================================
-- 1. RENOMEAR channel_in → channel
-- ========================================
ALTER TABLE contact_orgs RENAME COLUMN channel_in TO channel;

-- Dropar constraint antiga
ALTER TABLE contact_orgs DROP CONSTRAINT IF EXISTS contact_orgs_channel_in_check;

-- ========================================
-- 2. ADICIONAR CAMPO method
-- ========================================
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS method TEXT;

-- ========================================
-- 3. MIGRAR DADOS EXISTENTES (ANTES dos constraints)
-- ========================================

-- dm → instagram + dm
UPDATE contact_orgs SET method = 'dm' WHERE channel = 'dm';
UPDATE contact_orgs SET channel = 'instagram' WHERE channel = 'dm';

-- comment → instagram + comment
UPDATE contact_orgs SET method = 'comment' WHERE channel = 'comment';
UPDATE contact_orgs SET channel = 'instagram' WHERE channel = 'comment';

-- story → instagram + story
UPDATE contact_orgs SET method = 'story' WHERE channel = 'story';
UPDATE contact_orgs SET channel = 'instagram' WHERE channel = 'story';

-- scraper → instagram + scraper (maioria é instagram)
UPDATE contact_orgs SET method = 'scraper' WHERE channel = 'scraper';
UPDATE contact_orgs SET channel = 'instagram' WHERE channel = 'scraper';

-- form → website + form
UPDATE contact_orgs SET method = 'form' WHERE channel = 'form';
UPDATE contact_orgs SET channel = 'website' WHERE channel = 'form';

-- whatsapp → mantém whatsapp + dm
UPDATE contact_orgs SET method = 'dm' WHERE channel = 'whatsapp' AND method IS NULL;

-- ad → ads + form
UPDATE contact_orgs SET method = 'form' WHERE channel = 'ad';
UPDATE contact_orgs SET channel = 'ads' WHERE channel = 'ad';

-- referral → null + referral
UPDATE contact_orgs SET method = 'referral' WHERE channel = 'referral';
UPDATE contact_orgs SET channel = NULL WHERE method = 'referral' AND channel = 'referral';

-- manychat → instagram + automation
UPDATE contact_orgs SET method = 'automation' WHERE channel = 'manychat';
UPDATE contact_orgs SET channel = 'instagram' WHERE channel = 'manychat';

-- import → null + import
UPDATE contact_orgs SET method = 'import' WHERE channel = 'import';
UPDATE contact_orgs SET channel = NULL WHERE method = 'import' AND channel = 'import';

-- ========================================
-- 4. CRIAR CONSTRAINTS (DEPOIS da migração)
-- ========================================

-- Constraint para channel (plataformas)
ALTER TABLE contact_orgs ADD CONSTRAINT contact_orgs_channel_check
  CHECK (channel IS NULL OR channel IN (
    'instagram',
    'whatsapp',
    'linkedin',
    'email',
    'website',
    'ads',
    'youtube'
  ));

-- Constraint para method (tipo de interação)
ALTER TABLE contact_orgs ADD CONSTRAINT contact_orgs_method_check
  CHECK (method IS NULL OR method IN (
    'dm',
    'comment',
    'story',
    'form',
    'scraper',
    'referral',
    'import',
    'automation'
  ));

-- ========================================
-- 5. ÍNDICES
-- ========================================
DROP INDEX IF EXISTS idx_contact_orgs_channel_in;
CREATE INDEX IF NOT EXISTS idx_contact_orgs_channel ON contact_orgs(channel) WHERE channel IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_orgs_method ON contact_orgs(method) WHERE method IS NOT NULL;

-- ========================================
-- 6. COMENTÁRIOS
-- ========================================
COMMENT ON COLUMN contact_orgs.channel IS 'Plataforma de origem: instagram, whatsapp, linkedin, email, website, ads, youtube';
COMMENT ON COLUMN contact_orgs.method IS 'Tipo de interação: dm, comment, story, form, scraper, referral, import, automation';
