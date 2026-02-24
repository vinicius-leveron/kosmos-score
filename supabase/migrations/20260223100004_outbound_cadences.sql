-- Migration: Criar tabela de cadências de outbound
-- Motor de Outbound Modular - Fase 1: Foundation

-- Tabela de definição de cadências por tenant/classificação
CREATE TABLE IF NOT EXISTS outbound_cadences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant TEXT NOT NULL CHECK (tenant IN ('kosmos', 'oliveira-dev')),
  classificacao TEXT NOT NULL CHECK (classificacao IN ('A', 'B', 'C')),
  name TEXT NOT NULL,
  description TEXT,

  -- Sequência de steps (JSON)
  -- Formato: [{"step": 1, "channel": "email", "template_id": "xxx", "delay_days": 0}, ...]
  sequence JSONB NOT NULL DEFAULT '[]',

  -- Configurações de execução
  requires_approval BOOLEAN DEFAULT false,  -- Classe A = true
  business_hours_only BOOLEAN DEFAULT true,
  weekend_pause BOOLEAN DEFAULT true,

  -- Horários permitidos (para business_hours_only)
  start_hour INTEGER DEFAULT 9,  -- 9h
  end_hour INTEGER DEFAULT 18,   -- 18h
  timezone TEXT DEFAULT 'America/Sao_Paulo',

  -- Status e metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraint de unicidade por org/tenant/classificação
  UNIQUE(organization_id, tenant, classificacao)
);

-- RLS
ALTER TABLE outbound_cadences ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT para membros da org
CREATE POLICY "outbound_cadences_select" ON outbound_cadences
  FOR SELECT USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

-- Policy: INSERT para admins
CREATE POLICY "outbound_cadences_insert" ON outbound_cadences
  FOR INSERT WITH CHECK (public.has_org_role(organization_id, 'admin') OR public.is_kosmos_master());

-- Policy: UPDATE para admins
CREATE POLICY "outbound_cadences_update" ON outbound_cadences
  FOR UPDATE USING (public.has_org_role(organization_id, 'admin') OR public.is_kosmos_master());

-- Policy: DELETE para admins
CREATE POLICY "outbound_cadences_delete" ON outbound_cadences
  FOR DELETE USING (public.has_org_role(organization_id, 'admin') OR public.is_kosmos_master());

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_outbound_cadences_tenant ON outbound_cadences(tenant);
CREATE INDEX IF NOT EXISTS idx_outbound_cadences_classificacao ON outbound_cadences(classificacao);
CREATE INDEX IF NOT EXISTS idx_outbound_cadences_active ON outbound_cadences(is_active)
  WHERE is_active = true;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_outbound_cadences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_outbound_cadences_updated_at
  BEFORE UPDATE ON outbound_cadences
  FOR EACH ROW
  EXECUTE FUNCTION update_outbound_cadences_updated_at();

-- Comentários para documentação
COMMENT ON TABLE outbound_cadences IS 'Definições de cadências de outbound por tenant e classificação de lead';
COMMENT ON COLUMN outbound_cadences.tenant IS 'Tenant da cadência (kosmos ou oliveira-dev)';
COMMENT ON COLUMN outbound_cadences.classificacao IS 'Classificação de lead que usa esta cadência (A, B ou C)';
COMMENT ON COLUMN outbound_cadences.sequence IS 'Array JSON de steps: [{step, channel, template_id, delay_days}]';
COMMENT ON COLUMN outbound_cadences.requires_approval IS 'Se true, cada mensagem precisa aprovação manual (Classe A)';
COMMENT ON COLUMN outbound_cadences.business_hours_only IS 'Se true, só executa em horário comercial';
