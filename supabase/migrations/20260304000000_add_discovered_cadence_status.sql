-- ============================================================================
-- US-005: Add 'discovered' to cadence_status enum
-- ============================================================================
-- Required for C1 Discovery module that scrapes leads from Instagram/YouTube
-- 'discovered' is the initial status when a lead is found by scrapers
-- ============================================================================

-- Drop existing constraint
ALTER TABLE contact_orgs DROP CONSTRAINT IF EXISTS contact_orgs_cadence_status_check;

-- Recreate with discovered added as FIRST status in the workflow
ALTER TABLE contact_orgs ADD CONSTRAINT contact_orgs_cadence_status_check
  CHECK (cadence_status IN (
    'discovered',         -- Encontrado pelo scraper (C1 Discovery)
    'new',                -- Recém chegou (via outras fontes)
    'scoring',            -- Aguardando score ICP
    'enriching',          -- Aguardando enriquecimento básico
    'deep_enriching',     -- Aguardando enriquecimento profundo (C3)
    'ready',              -- Pronto para entrar em cadência
    'queued',             -- Na fila para próximo batch
    'in_sequence',        -- Em cadência ativa
    'paused',             -- Pausado (manual ou automático)
    'replied',            -- Respondeu
    'converted',          -- Converteu (fechou negócio)
    'nurture',            -- Em nurture de longo prazo
    'archived',           -- Arquivado (inativo)
    'unsubscribed',       -- Pediu para sair
    'bounced'             -- Email bounceou
  ));

COMMENT ON CONSTRAINT contact_orgs_cadence_status_check ON contact_orgs IS
'Status do lead na cadência. discovered = encontrado pelo C1 Discovery scraper.';
