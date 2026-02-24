-- Migration: Criar tabela de fila de aprovação
-- Motor de Outbound Modular - Fase 1: Foundation

-- Tabela de fila de aprovação para leads Classe A
CREATE TABLE IF NOT EXISTS outbound_approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contact_org_id UUID NOT NULL REFERENCES contact_orgs(id) ON DELETE CASCADE,

  -- Contexto da aprovação
  cadence_id UUID REFERENCES outbound_cadences(id),
  cadence_step INTEGER NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'axiom_dm', 'whatsapp')),
  template_id UUID REFERENCES outbound_templates(id),

  -- Preview da mensagem
  message_subject TEXT,  -- Para email
  message_preview TEXT NOT NULL,

  -- Status da aprovação
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'timeout', 'cancelled')),

  -- Metadados do lead para decisão rápida
  lead_context JSONB DEFAULT '{}',
  -- Formato: {nome, instagram, empresa, nicho, score_icp, classificacao, fonte, ultimo_contato}

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ,
  timeout_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),

  -- Quem respondeu
  responded_by UUID REFERENCES profiles(id),
  response_note TEXT,  -- Nota opcional do aprovador

  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE outbound_approval_queue ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT para membros da org
CREATE POLICY "outbound_approval_queue_select" ON outbound_approval_queue
  FOR SELECT USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

-- Policy: INSERT (via sistema/n8n, ou membros)
CREATE POLICY "outbound_approval_queue_insert" ON outbound_approval_queue
  FOR INSERT WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());

-- Policy: UPDATE para membros (aprovar/negar)
CREATE POLICY "outbound_approval_queue_update" ON outbound_approval_queue
  FOR UPDATE USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_approval_queue_pending ON outbound_approval_queue(status, timeout_at)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_approval_queue_org ON outbound_approval_queue(organization_id);
CREATE INDEX IF NOT EXISTS idx_approval_queue_contact ON outbound_approval_queue(contact_org_id);
CREATE INDEX IF NOT EXISTS idx_approval_queue_requested ON outbound_approval_queue(requested_at DESC);

-- View para aprovações pendentes com dados do lead
CREATE OR REPLACE VIEW outbound_pending_approvals AS
SELECT
  aq.id,
  aq.organization_id,
  aq.contact_org_id,
  aq.cadence_step,
  aq.channel,
  aq.message_subject,
  aq.message_preview,
  aq.lead_context,
  aq.requested_at,
  aq.timeout_at,
  -- Dados do contato
  c.full_name AS contact_name,
  c.email AS contact_email,
  c.instagram AS contact_instagram,
  co.score_icp,
  co.classificacao,
  -- Tempo restante
  EXTRACT(EPOCH FROM (aq.timeout_at - now())) / 3600 AS hours_remaining
FROM outbound_approval_queue aq
JOIN contact_orgs co ON co.id = aq.contact_org_id
JOIN contacts c ON c.id = co.contact_id
WHERE aq.status = 'pending'
  AND aq.timeout_at > now();

-- Comentários para documentação
COMMENT ON TABLE outbound_approval_queue IS 'Fila de aprovação manual para mensagens de leads Classe A';
COMMENT ON COLUMN outbound_approval_queue.lead_context IS 'Snapshot dos dados do lead no momento da solicitação';
COMMENT ON COLUMN outbound_approval_queue.timeout_at IS 'Prazo para aprovação (default 24h). Após timeout, status = timeout';
COMMENT ON COLUMN outbound_approval_queue.response_note IS 'Nota opcional do aprovador ao aprovar/negar';
COMMENT ON VIEW outbound_pending_approvals IS 'View de aprovações pendentes com dados do lead para decisão rápida';
