-- Migration: Adicionar novos activity types para outbound
-- Motor de Outbound Modular - Fase 1: Foundation

-- Dropar constraint existente para recriar com novos tipos
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;

-- Recriar com todos os tipos (existentes + novos)
ALTER TABLE activities ADD CONSTRAINT activities_type_check CHECK (type IN (
  -- ========================================
  -- TIPOS EXISTENTES
  -- ========================================
  'note',
  'email_sent',
  'email_opened',
  'email_clicked',
  'email_bounced',
  'call',
  'meeting',
  'form_submitted',
  'stage_changed',
  'score_changed',
  'tag_added',
  'tag_removed',
  'owner_assigned',
  'whatsapp_sent',
  'whatsapp_read',
  'custom',

  -- ========================================
  -- NOVOS TIPOS PARA DM INSTAGRAM (AXIOM)
  -- ========================================
  'dm_sent_axiom',
  'dm_replied',

  -- ========================================
  -- NOVOS TIPOS PARA WHATSAPP
  -- ========================================
  'whatsapp_delivered',
  'whatsapp_replied',
  'whatsapp_failed',

  -- ========================================
  -- NOVOS TIPOS PARA CADENCE
  -- ========================================
  'cadence_started',
  'cadence_paused',
  'cadence_completed',
  'cadence_step_sent',

  -- ========================================
  -- NOVOS TIPOS PARA AXIOM WARMUP
  -- ========================================
  'axiom_followed',
  'axiom_unfollowed',
  'axiom_liked',
  'axiom_story_viewed',
  'axiom_commented',

  -- ========================================
  -- NOVOS TIPOS PARA APROVACAO (CLASSE A)
  -- ========================================
  'approval_requested',
  'approval_granted',
  'approval_denied',
  'approval_timeout',

  -- ========================================
  -- NOVOS TIPOS PARA LINKEDIN (FUTURO)
  -- ========================================
  'linkedin_sent',
  'linkedin_opened',
  'linkedin_replied',
  'linkedin_connection_sent',
  'linkedin_connection_accepted',

  -- ========================================
  -- NOVOS TIPOS PARA ENRICHMENT
  -- ========================================
  'enrichment_success',
  'enrichment_failed',

  -- ========================================
  -- NOVOS TIPOS PARA SCORING
  -- ========================================
  'icp_scored',
  'engagement_scored',
  'classification_changed'
));

-- Comentarios nos novos tipos
COMMENT ON CONSTRAINT activities_type_check ON activities IS
'Tipos de activity suportados. Novos tipos para outbound: dm_sent_axiom, dm_replied, whatsapp_delivered/replied/failed, cadence_*, axiom_*, approval_*, linkedin_*, enrichment_*, scoring_*';
