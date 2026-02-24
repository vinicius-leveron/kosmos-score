-- Migration: Criar tabela de templates de outbound
-- Motor de Outbound Modular - Fase 1: Foundation

-- Tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS outbound_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant TEXT NOT NULL CHECK (tenant IN ('kosmos', 'oliveira-dev')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'axiom_dm', 'whatsapp')),

  -- Identificação
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('intro', 'follow_up', 'value', 'social_proof', 'breakup', 'custom')),

  -- Conteúdo
  subject TEXT,  -- Para email (obrigatório para email)
  body TEXT NOT NULL,

  -- Personalização
  -- Campos disponíveis: nome, instagram, empresa, nicho, score_icp, classificacao, cidade
  personalization_fields TEXT[] DEFAULT '{nome,instagram,empresa,nicho,score_icp}',

  -- Metadata
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- RLS
ALTER TABLE outbound_templates ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT para membros da org
CREATE POLICY "outbound_templates_select" ON outbound_templates
  FOR SELECT USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

-- Policy: INSERT para admins
CREATE POLICY "outbound_templates_insert" ON outbound_templates
  FOR INSERT WITH CHECK (public.has_org_role(organization_id, 'admin') OR public.is_kosmos_master());

-- Policy: UPDATE para admins
CREATE POLICY "outbound_templates_update" ON outbound_templates
  FOR UPDATE USING (public.has_org_role(organization_id, 'admin') OR public.is_kosmos_master());

-- Policy: DELETE para admins
CREATE POLICY "outbound_templates_delete" ON outbound_templates
  FOR DELETE USING (public.has_org_role(organization_id, 'admin') OR public.is_kosmos_master());

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_outbound_templates_tenant ON outbound_templates(tenant);
CREATE INDEX IF NOT EXISTS idx_outbound_templates_channel ON outbound_templates(channel);
CREATE INDEX IF NOT EXISTS idx_outbound_templates_category ON outbound_templates(category);
CREATE INDEX IF NOT EXISTS idx_outbound_templates_tenant_channel ON outbound_templates(tenant, channel);
CREATE INDEX IF NOT EXISTS idx_outbound_templates_active ON outbound_templates(is_active)
  WHERE is_active = true;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_outbound_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_outbound_templates_updated_at
  BEFORE UPDATE ON outbound_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_outbound_templates_updated_at();

-- Comentários para documentação
COMMENT ON TABLE outbound_templates IS 'Templates de mensagens para outbound (email, DM, WhatsApp)';
COMMENT ON COLUMN outbound_templates.channel IS 'Canal de comunicação: email, axiom_dm (Instagram), whatsapp';
COMMENT ON COLUMN outbound_templates.category IS 'Categoria do template: intro, follow_up, value, social_proof, breakup';
COMMENT ON COLUMN outbound_templates.subject IS 'Assunto do email (obrigatório para channel=email)';
COMMENT ON COLUMN outbound_templates.body IS 'Corpo da mensagem com placeholders {{nome}}, {{instagram}}, etc';
COMMENT ON COLUMN outbound_templates.personalization_fields IS 'Lista de campos disponíveis para personalização';
COMMENT ON COLUMN outbound_templates.version IS 'Versão do template (incrementa automaticamente em updates)';
