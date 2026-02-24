-- ========================================
-- CAMADA 1: INFRA & TRACKING
-- Migration 9: Campos Complementares em contact_orgs
-- ========================================

-- ========================================
-- CAMPOS DE ENTRADA (channel_in)
-- ========================================
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS channel_in TEXT
  CHECK (channel_in IN ('scraper', 'comment', 'story', 'form', 'dm', 'whatsapp', 'ad', 'referral', 'manychat', 'import'));

-- ========================================
-- CAMPOS DE CADENCE (complementares)
-- ========================================
-- Referência à cadência específica rodando
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS cadence_id UUID REFERENCES outbound_cadences(id);

-- Quando entrou na cadência atual
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS cadence_started_at TIMESTAMPTZ;

-- ========================================
-- CAMPOS DE ENRICHMENT
-- ========================================
-- Evitar retry infinito de enriquecimento
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS enrichment_tried BOOLEAN DEFAULT false;

-- ========================================
-- CAMPOS DE CONTROLE (CRÍTICOS)
-- ========================================
-- Lead pediu pra sair - TRAVA TUDO
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS do_not_contact BOOLEAN DEFAULT false;

-- Motivo de perda no pipeline
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS lost_reason TEXT;

-- ========================================
-- EXPANDIR cadence_status ENUM
-- ========================================
-- Dropar e recriar constraint com novos estados
ALTER TABLE contact_orgs DROP CONSTRAINT IF EXISTS contact_orgs_cadence_status_check;

ALTER TABLE contact_orgs ADD CONSTRAINT contact_orgs_cadence_status_check
  CHECK (cadence_status IN (
    'new',           -- Recém chegou
    'scoring',       -- Aguardando score ICP
    'enriching',     -- Aguardando enriquecimento
    'ready',         -- Pronto para entrar em cadência
    'queued',        -- Na fila para próximo batch
    'in_sequence',   -- Em cadência ativa
    'paused',        -- Pausado (manual ou automático)
    'replied',       -- Respondeu
    'converted',     -- Converteu (fechou negócio)
    'nurture',       -- Em nurture de longo prazo
    'archived',      -- Arquivado (inativo)
    'unsubscribed',  -- Pediu para sair
    'bounced'        -- Email bounceou
  ));

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================
CREATE INDEX IF NOT EXISTS idx_contact_orgs_do_not_contact ON contact_orgs(do_not_contact) WHERE do_not_contact = true;
CREATE INDEX IF NOT EXISTS idx_contact_orgs_cadence_id ON contact_orgs(cadence_id) WHERE cadence_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_orgs_channel_in ON contact_orgs(channel_in) WHERE channel_in IS NOT NULL;
