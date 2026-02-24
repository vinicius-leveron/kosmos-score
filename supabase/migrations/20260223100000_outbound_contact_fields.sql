-- Migration: Adicionar campos de outbound ao contact_orgs
-- Motor de Outbound Modular - Fase 1: Foundation

-- Campos para ICP Scoring (M2)
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS score_icp NUMERIC(5,2);
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS score_engagement NUMERIC(5,2);
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS classificacao TEXT CHECK (classificacao IN ('A', 'B', 'C'));

-- Campos para Cadence (M4)
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS cadence_status TEXT DEFAULT 'new'
  CHECK (cadence_status IN ('new', 'ready', 'in_sequence', 'paused', 'replied', 'nurture', 'unsubscribed', 'bounced'));
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS cadence_step INTEGER DEFAULT 0;
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS next_action_date TIMESTAMPTZ;
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMPTZ;

-- Campos para Axiom (M5b, M8)
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS axiom_status TEXT
  CHECK (axiom_status IN ('idle', 'warm_up', 'nurture', 'dm_sent', 'blocked'));

-- Campo para controle ManyChat vs Axiom (M7)
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS ig_handler TEXT DEFAULT 'manual'
  CHECK (ig_handler IN ('manual', 'manychat', 'axiom'));

-- Campo para tenant (multi-tenant outbound)
ALTER TABLE contact_orgs ADD COLUMN IF NOT EXISTS tenant TEXT DEFAULT 'kosmos'
  CHECK (tenant IN ('kosmos', 'oliveira-dev'));

-- Indices para performance de queries de cadence
CREATE INDEX IF NOT EXISTS idx_contact_orgs_cadence_status ON contact_orgs(cadence_status);
CREATE INDEX IF NOT EXISTS idx_contact_orgs_classificacao ON contact_orgs(classificacao);
CREATE INDEX IF NOT EXISTS idx_contact_orgs_tenant ON contact_orgs(tenant);
CREATE INDEX IF NOT EXISTS idx_contact_orgs_next_action ON contact_orgs(next_action_date)
  WHERE cadence_status = 'in_sequence';
CREATE INDEX IF NOT EXISTS idx_contact_orgs_axiom_status ON contact_orgs(axiom_status)
  WHERE axiom_status IS NOT NULL;

-- Comentarios para documentacao
COMMENT ON COLUMN contact_orgs.score_icp IS 'ICP Score calculado pelo M2 (0-100)';
COMMENT ON COLUMN contact_orgs.score_engagement IS 'Engagement Score acumulado por interacoes';
COMMENT ON COLUMN contact_orgs.classificacao IS 'Classificacao A/B/C baseada em score_icp';
COMMENT ON COLUMN contact_orgs.cadence_status IS 'Status na cadencia de outbound';
COMMENT ON COLUMN contact_orgs.cadence_step IS 'Step atual na sequencia de cadencia';
COMMENT ON COLUMN contact_orgs.next_action_date IS 'Proxima acao agendada na cadencia';
COMMENT ON COLUMN contact_orgs.last_contacted IS 'Data do ultimo contato (qualquer canal)';
COMMENT ON COLUMN contact_orgs.axiom_status IS 'Status no fluxo Axiom (warmup, nurture, etc)';
COMMENT ON COLUMN contact_orgs.ig_handler IS 'Quem gerencia o contato no Instagram';
COMMENT ON COLUMN contact_orgs.tenant IS 'Tenant do contato (kosmos ou oliveira-dev)';
