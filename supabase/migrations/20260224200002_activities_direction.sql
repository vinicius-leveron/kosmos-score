-- ========================================
-- CAMADA 1: INFRA & TRACKING
-- Migration 11: Campo direction em activities (Interaction Log)
-- ========================================

-- Direction do evento: quem iniciou a interação
ALTER TABLE activities ADD COLUMN IF NOT EXISTS direction TEXT DEFAULT 'outgoing'
  CHECK (direction IN ('outgoing', 'incoming', 'system'));

-- outgoing = nós enviamos (email, DM, WhatsApp)
-- incoming = lead fez (reply, form, click)
-- system = automático (score changed, stage changed)

-- Atualizar activities existentes baseado no type
UPDATE activities SET direction = 'outgoing'
WHERE type IN ('email_sent', 'dm_sent_axiom', 'whatsapp_sent', 'linkedin_sent', 'call')
  AND direction IS NULL;

UPDATE activities SET direction = 'incoming'
WHERE type IN ('email_opened', 'email_clicked', 'email_replied', 'dm_replied',
               'whatsapp_replied', 'form_submitted', 'linkedin_replied')
  AND direction IS NULL;

UPDATE activities SET direction = 'system'
WHERE type IN ('stage_changed', 'score_changed', 'tag_added', 'tag_removed',
               'cadence_started', 'cadence_completed', 'approval_requested')
  AND direction IS NULL;

-- Índice para filtros de direction
CREATE INDEX IF NOT EXISTS idx_activities_direction ON activities(direction);
