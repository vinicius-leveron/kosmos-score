-- ========================================
-- CAMADA 1: INFRA & TRACKING
-- Migration 12: Expandir Activity Types (completo)
-- ========================================

-- Dropar constraint existente
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;

-- Recriar com TODOS os tipos do PRD
ALTER TABLE activities ADD CONSTRAINT activities_type_check CHECK (type IN (
  -- ========================================
  -- SISTEMA (direction: system)
  -- ========================================
  'lead_created',           -- Lead entrou no CRM
  'lead_scored',            -- Score ICP calculado/recalculado
  'lead_enriched',          -- Email/phone encontrado
  'lead_classified',        -- Classificação A/B/C atribuída
  'cadence_started',        -- Lead entrou numa cadência
  'cadence_paused',         -- Cadência pausada
  'cadence_completed',      -- Cadência terminou sem resposta
  'cadence_step_sent',      -- Step da cadência enviado
  'approval_requested',     -- Aguardando aprovação manual
  'approval_granted',       -- Aprovação concedida
  'approval_denied',        -- Aprovação negada
  'approval_timeout',       -- Timeout de aprovação
  'stage_changed',          -- Mudou de stage no pipeline
  'score_changed',          -- Score mudou
  'tag_added',              -- Tag adicionada
  'tag_removed',            -- Tag removida
  'owner_assigned',         -- Owner atribuído
  'enrichment_success',     -- Enriquecimento OK
  'enrichment_failed',      -- Enriquecimento falhou

  -- ========================================
  -- EMAIL (direction: outgoing/incoming)
  -- ========================================
  'email_sent',             -- Email enviado
  'email_delivered',        -- Email entregue (não bouncou)
  'email_opened',           -- Email aberto (pixel)
  'email_clicked',          -- Link clicado
  'email_replied',          -- Resposta detectada
  'email_bounced',          -- Hard ou soft bounce
  'email_unsubscribed',     -- Pediu pra sair
  'email_spam',             -- Marcou como spam

  -- ========================================
  -- INSTAGRAM DM via Axiom (direction: outgoing/incoming)
  -- ========================================
  'dm_sent_axiom',          -- DM enviada via Axiom
  'dm_read',                -- DM lida (se detectável)
  'dm_replied',             -- Resposta à DM

  -- ========================================
  -- WHATSAPP (direction: outgoing/incoming)
  -- ========================================
  'whatsapp_sent',          -- Mensagem enviada
  'whatsapp_delivered',     -- Mensagem entregue
  'whatsapp_read',          -- Mensagem lida
  'whatsapp_replied',       -- Resposta recebida
  'whatsapp_failed',        -- Envio falhou

  -- ========================================
  -- AXIOM WARMUP (direction: outgoing)
  -- ========================================
  'axiom_followed',         -- Follow realizado
  'axiom_unfollowed',       -- Unfollow
  'axiom_liked',            -- Post curtido
  'axiom_story_viewed',     -- Story visualizado
  'axiom_commented',        -- Comentário feito

  -- ========================================
  -- MANYCHAT (direction: incoming/outgoing)
  -- ========================================
  'mc_dm_sent',             -- DM automática do ManyChat
  'mc_link_clicked',        -- Link na DM clicado
  'mc_form_filled',         -- Formulário preenchido

  -- ========================================
  -- LINKEDIN (direction: outgoing/incoming)
  -- ========================================
  'linkedin_sent',          -- Mensagem enviada
  'linkedin_opened',        -- Mensagem aberta
  'linkedin_replied',       -- Resposta recebida

  -- ========================================
  -- MANUAL/CALLS (direction: varies)
  -- ========================================
  'note',                   -- Nota manual
  'call',                   -- Ligação
  'call_scheduled',         -- Call agendada (Calendly/Cal)
  'call_completed',         -- Call realizada
  'meeting',                -- Reunião
  'proposal_sent',          -- Proposta enviada
  'form_submitted',         -- Formulário submetido
  'custom',                 -- Evento customizado

  -- ========================================
  -- DEALS (direction: system)
  -- ========================================
  'deal_won',               -- Negócio fechado
  'deal_lost'               -- Negócio perdido
));
