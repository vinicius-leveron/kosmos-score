-- ============================================================================
-- US-001: Add 'deep_enriching' to cadence_status enum
-- ============================================================================
-- Required for C3 Deep Enricher module that does advanced enrichment
-- ============================================================================

-- Drop existing constraint
ALTER TABLE contact_orgs DROP CONSTRAINT IF EXISTS contact_orgs_cadence_status_check;

-- Recreate with deep_enriching added
ALTER TABLE contact_orgs ADD CONSTRAINT contact_orgs_cadence_status_check
  CHECK (cadence_status IN (
    'new',              -- Recém chegou
    'scoring',          -- Aguardando score ICP
    'enriching',        -- Aguardando enriquecimento básico
    'deep_enriching',   -- Aguardando enriquecimento profundo (C3)
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

COMMENT ON CONSTRAINT contact_orgs_cadence_status_check ON contact_orgs IS
'Status do lead na cadência. deep_enriching = aguardando C3 Deep Enricher.';
