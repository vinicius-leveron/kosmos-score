-- ========================================
-- Add 'deep_enriching' to cadence_status CHECK constraint
-- US-002: M3 avança lead para deep_enriching após encontrar email.
-- T15 processa leads nesse status.
-- ========================================

ALTER TABLE contact_orgs DROP CONSTRAINT IF EXISTS contact_orgs_cadence_status_check;

ALTER TABLE contact_orgs ADD CONSTRAINT contact_orgs_cadence_status_check
  CHECK (cadence_status IN (
    'new',              -- Recém chegou
    'scoring',          -- Aguardando score ICP
    'enriching',        -- Aguardando enriquecimento
    'deep_enriching',   -- Enriquecimento profundo em andamento
    'ready',            -- Pronto para entrar em cadência
    'queued',           -- Na fila para próximo batch
    'in_sequence',      -- Em cadência ativa
    'paused',           -- Pausado (manual ou automático)
    'replied',          -- Respondeu
    'converted',        -- Converteu (fechou negócio)
    'nurture',          -- Em nurture de longo prazo
    'archived',         -- Arquivado (inativo)
    'unsubscribed',     -- Pediu para sair
    'bounced'           -- Email bounceou
  ));
