-- ============================================================================
-- KOSMOS Platform - Seed Journey Stages
-- ============================================================================
-- Inserts default journey stages for KOSMOS organization
-- ============================================================================

-- Insert default journey stages for KOSMOS (if not exists)
INSERT INTO public.journey_stages (organization_id, name, display_name, description, position, color, is_default)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'lead_magnet', 'Lead Magnet', 'Leads vindos de ferramentas gratuitas', 0, '#6366f1', true),
  ('c0000000-0000-0000-0000-000000000001', 'sales_room', 'Sala de Vendas', 'Leads em processo de qualificação', 1, '#f59e0b', false),
  ('c0000000-0000-0000-0000-000000000001', 'paying_customer', 'Cliente Pagante', 'Clientes com compra ativa', 2, '#10b981', false),
  ('c0000000-0000-0000-0000-000000000001', 'champion', 'Champion', 'Clientes recorrentes e engajados', 3, '#8b5cf6', false),
  ('c0000000-0000-0000-0000-000000000001', 'dormant', 'Dormindo', 'Contatos inativos há mais de 90 dias', 4, '#6b7280', false)
ON CONFLICT (organization_id, name) DO NOTHING;
