-- Migration: Seed data para cadências default
-- Motor de Outbound Modular - Fase 1: Foundation

-- Nota: Esta migration insere cadências default para a organização KOSMOS
-- Se a organização não existir, os inserts são ignorados silenciosamente

-- Função helper para obter org KOSMOS (se existir)
CREATE OR REPLACE FUNCTION get_kosmos_org_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT id INTO org_id FROM organizations WHERE slug = 'kosmos' LIMIT 1;
  RETURN org_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- CADÊNCIAS KOSMOS
-- ========================================

-- Cadência Classe A - KOSMOS (com aprovação manual)
INSERT INTO outbound_cadences (
  organization_id, tenant, classificacao, name, description, sequence, requires_approval
)
SELECT
  get_kosmos_org_id(),
  'kosmos',
  'A',
  'KOSMOS Classe A (com aprovação)',
  'Cadência premium para leads de alto valor. Cada mensagem requer aprovação manual.',
  '[
    {"step": 1, "channel": "email", "delay_days": 0, "category": "intro"},
    {"step": 2, "channel": "axiom_dm", "delay_days": 3, "category": "value"},
    {"step": 3, "channel": "email", "delay_days": 5, "category": "social_proof"},
    {"step": 4, "channel": "axiom_dm", "delay_days": 8, "category": "follow_up"},
    {"step": 5, "channel": "email", "delay_days": 12, "category": "breakup"}
  ]'::jsonb,
  true
WHERE get_kosmos_org_id() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM outbound_cadences
    WHERE tenant = 'kosmos' AND classificacao = 'A'
  );

-- Cadência Classe B - KOSMOS (automática)
INSERT INTO outbound_cadences (
  organization_id, tenant, classificacao, name, description, sequence, requires_approval
)
SELECT
  get_kosmos_org_id(),
  'kosmos',
  'B',
  'KOSMOS Classe B (automático)',
  'Cadência padrão para leads qualificados. Execução automática.',
  '[
    {"step": 1, "channel": "email", "delay_days": 0, "category": "intro"},
    {"step": 2, "channel": "axiom_dm", "delay_days": 4, "category": "value"},
    {"step": 3, "channel": "email", "delay_days": 7, "category": "follow_up"},
    {"step": 4, "channel": "email", "delay_days": 14, "category": "breakup"}
  ]'::jsonb,
  false
WHERE get_kosmos_org_id() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM outbound_cadences
    WHERE tenant = 'kosmos' AND classificacao = 'B'
  );

-- Cadência Classe C - KOSMOS (nurture leve)
INSERT INTO outbound_cadences (
  organization_id, tenant, classificacao, name, description, sequence, requires_approval
)
SELECT
  get_kosmos_org_id(),
  'kosmos',
  'C',
  'KOSMOS Classe C (nurture)',
  'Cadência de nurture para leads frios. Só email, baixa frequência.',
  '[
    {"step": 1, "channel": "email", "delay_days": 0, "category": "intro"},
    {"step": 2, "channel": "email", "delay_days": 7, "category": "value"},
    {"step": 3, "channel": "email", "delay_days": 21, "category": "breakup"}
  ]'::jsonb,
  false
WHERE get_kosmos_org_id() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM outbound_cadences
    WHERE tenant = 'kosmos' AND classificacao = 'C'
  );

-- ========================================
-- CADÊNCIAS OLIVEIRA-DEV
-- ========================================

-- Cadência Classe A - Oliveira Dev (com aprovação)
INSERT INTO outbound_cadences (
  organization_id, tenant, classificacao, name, description, sequence, requires_approval
)
SELECT
  get_kosmos_org_id(),
  'oliveira-dev',
  'A',
  'Oliveira Dev Classe A (com aprovação)',
  'Cadência para empresas de alto valor. Foco em decisores.',
  '[
    {"step": 1, "channel": "email", "delay_days": 0, "category": "intro"},
    {"step": 2, "channel": "axiom_dm", "delay_days": 2, "category": "value"},
    {"step": 3, "channel": "whatsapp", "delay_days": 4, "category": "follow_up"},
    {"step": 4, "channel": "email", "delay_days": 7, "category": "social_proof"},
    {"step": 5, "channel": "axiom_dm", "delay_days": 10, "category": "breakup"}
  ]'::jsonb,
  true
WHERE get_kosmos_org_id() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM outbound_cadences
    WHERE tenant = 'oliveira-dev' AND classificacao = 'A'
  );

-- Cadência Classe B - Oliveira Dev (automática)
INSERT INTO outbound_cadences (
  organization_id, tenant, classificacao, name, description, sequence, requires_approval
)
SELECT
  get_kosmos_org_id(),
  'oliveira-dev',
  'B',
  'Oliveira Dev Classe B (automático)',
  'Cadência padrão para PMEs qualificadas.',
  '[
    {"step": 1, "channel": "email", "delay_days": 0, "category": "intro"},
    {"step": 2, "channel": "axiom_dm", "delay_days": 3, "category": "value"},
    {"step": 3, "channel": "email", "delay_days": 6, "category": "follow_up"},
    {"step": 4, "channel": "whatsapp", "delay_days": 10, "category": "breakup"}
  ]'::jsonb,
  false
WHERE get_kosmos_org_id() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM outbound_cadences
    WHERE tenant = 'oliveira-dev' AND classificacao = 'B'
  );

-- Cadência Classe C - Oliveira Dev (nurture)
INSERT INTO outbound_cadences (
  organization_id, tenant, classificacao, name, description, sequence, requires_approval
)
SELECT
  get_kosmos_org_id(),
  'oliveira-dev',
  'C',
  'Oliveira Dev Classe C (nurture)',
  'Cadência de nurture para leads frios.',
  '[
    {"step": 1, "channel": "email", "delay_days": 0, "category": "intro"},
    {"step": 2, "channel": "email", "delay_days": 10, "category": "value"},
    {"step": 3, "channel": "email", "delay_days": 30, "category": "breakup"}
  ]'::jsonb,
  false
WHERE get_kosmos_org_id() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM outbound_cadences
    WHERE tenant = 'oliveira-dev' AND classificacao = 'C'
  );

-- Limpar função helper (opcional, pode manter para uso futuro)
-- DROP FUNCTION IF EXISTS get_kosmos_org_id();

-- Comentário
COMMENT ON FUNCTION get_kosmos_org_id IS 'Helper para obter ID da organização KOSMOS para seeds';
