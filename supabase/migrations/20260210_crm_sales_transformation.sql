-- 20260210_crm_sales_transformation.sql
-- Transformação do CRM em sistema de vendas real com contexto e produtividade

-- ============================================================================
-- 1. ADICIONAR CAMPOS DE CONTEXTO EM CONTACT_ORGS
-- ============================================================================

-- Adicionar colunas uma por vez para evitar erros de sintaxe
ALTER TABLE public.contact_orgs ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;
ALTER TABLE public.contact_orgs ADD COLUMN IF NOT EXISTS last_contact_type TEXT;
ALTER TABLE public.contact_orgs ADD COLUMN IF NOT EXISTS next_action_at TIMESTAMPTZ;
ALTER TABLE public.contact_orgs ADD COLUMN IF NOT EXISTS next_action_type TEXT;
ALTER TABLE public.contact_orgs ADD COLUMN IF NOT EXISTS stage_entered_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.contact_orgs ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;
ALTER TABLE public.contact_orgs ADD COLUMN IF NOT EXISTS is_hot_lead BOOLEAN DEFAULT false;
ALTER TABLE public.contact_orgs ADD COLUMN IF NOT EXISTS lost_reason TEXT;
ALTER TABLE public.contact_orgs ADD COLUMN IF NOT EXISTS last_activity_summary TEXT;

-- Adicionar constraints
ALTER TABLE public.contact_orgs ADD CONSTRAINT check_last_contact_type 
  CHECK (last_contact_type IN ('call', 'email', 'whatsapp', 'meeting', 'note', 'task') OR last_contact_type IS NULL);
ALTER TABLE public.contact_orgs ADD CONSTRAINT check_next_action_type
  CHECK (next_action_type IN ('call', 'email', 'whatsapp', 'meeting', 'follow_up', 'proposal', 'demo') OR next_action_type IS NULL);
ALTER TABLE public.contact_orgs ADD CONSTRAINT check_engagement_score
  CHECK (engagement_score >= 0 AND engagement_score <= 100);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_contact_orgs_last_contact ON public.contact_orgs(last_contact_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_orgs_next_action ON public.contact_orgs(next_action_at ASC) WHERE next_action_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_orgs_hot_lead ON public.contact_orgs(is_hot_lead) WHERE is_hot_lead = true;
CREATE INDEX IF NOT EXISTS idx_contact_orgs_engagement ON public.contact_orgs(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_contact_orgs_stage_time ON public.contact_orgs(stage_entered_at);

-- ============================================================================
-- 2. CRIAR TABELA DE TASKS (TAREFAS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_org_id UUID REFERENCES public.contact_orgs(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'whatsapp', 'meeting', 'follow_up', 'proposal', 'demo', 'custom')) DEFAULT 'follow_up',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')) DEFAULT 'pending',
  due_at TIMESTAMPTZ NOT NULL,
  reminder_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  outcome TEXT, -- Resultado da tarefa quando completada
  is_automated BOOLEAN DEFAULT false, -- Se foi criada por automação
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para tasks
CREATE INDEX IF NOT EXISTS idx_tasks_due ON public.crm_tasks(due_at ASC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.crm_tasks(status, due_at ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_contact ON public.crm_tasks(contact_org_id) WHERE contact_org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_deal ON public.crm_tasks(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.crm_tasks(assigned_to, status) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_organization ON public.crm_tasks(organization_id, status);

-- ============================================================================
-- 3. CRIAR TABELA DE TEMPLATES DE MENSAGENS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp', 'sms', 'call_script')),
  category TEXT CHECK (category IN ('intro', 'follow_up', 'proposal', 'closing', 'nurturing', 'reactivation')),
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  subject TEXT, -- Para email
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- ex: ["{{name}}", "{{company}}", "{{product}}"]
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2), -- Taxa de sucesso quando usado
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Índices para templates
CREATE INDEX IF NOT EXISTS idx_templates_org_type ON public.message_templates(organization_id, type, is_active);
CREATE INDEX IF NOT EXISTS idx_templates_stage ON public.message_templates(stage_id) WHERE stage_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.message_templates(category) WHERE category IS NOT NULL;

-- ============================================================================
-- 4. CRIAR TABELA DE FILTROS SALVOS / SMART LISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'filter',
  color TEXT DEFAULT '#gray',
  type TEXT NOT NULL CHECK (type IN ('contacts', 'deals', 'companies', 'tasks')),
  filters JSONB NOT NULL, -- Configuração completa do filtro
  sort JSONB, -- Configuração de ordenação
  columns JSONB, -- Colunas visíveis personalizadas
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  is_smart BOOLEAN DEFAULT false, -- Smart lists com lógica pré-definida
  usage_count INTEGER DEFAULT 0,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id, name, type)
);

-- Índices para filtros salvos
CREATE INDEX IF NOT EXISTS idx_saved_filters_user ON public.saved_filters(user_id, type);
CREATE INDEX IF NOT EXISTS idx_saved_filters_org ON public.saved_filters(organization_id, is_shared) WHERE is_shared = true;

-- ============================================================================
-- 5. CRIAR TABELA DE QUICK ACTIONS LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quick_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_org_id UUID REFERENCES public.contact_orgs(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('whatsapp', 'email', 'call', 'sms', 'note')),
  content TEXT,
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  duration_seconds INTEGER, -- Para ligações
  outcome TEXT, -- Resultado da ação
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para quick actions
CREATE INDEX IF NOT EXISTS idx_quick_actions_contact ON public.quick_actions_log(contact_org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quick_actions_user ON public.quick_actions_log(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quick_actions_type ON public.quick_actions_log(action_type, created_at DESC);

-- ============================================================================
-- 6. CRIAR TABELA DE LEAD SCORING RULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lead_scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('activity', 'profile', 'engagement', 'time_based')),
  condition JSONB NOT NULL, -- {"field": "email_opened", "operator": ">=", "value": 3}
  points INTEGER NOT NULL CHECK (points BETWEEN -100 AND 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 7. HABILITAR RLS NAS NOVAS TABELAS
-- ============================================================================

ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_scoring_rules ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. CRIAR POLICIES RLS
-- ============================================================================

-- Tasks policies
CREATE POLICY "tasks_org_select" ON public.crm_tasks
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "tasks_org_insert" ON public.crm_tasks
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "tasks_org_update" ON public.crm_tasks
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "tasks_org_delete" ON public.crm_tasks
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.org_members 
      WHERE profile_id = auth.uid() 
      AND organization_id = crm_tasks.organization_id
      AND role = 'admin'
    )
  );

-- Message templates policies
CREATE POLICY "templates_org_access" ON public.message_templates
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
  );

-- Saved filters policies
CREATE POLICY "filters_own_access" ON public.saved_filters
  FOR ALL USING (
    user_id = auth.uid() OR 
    (is_shared = true AND organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    ))
  );

-- Quick actions log policies
CREATE POLICY "quick_actions_org_access" ON public.quick_actions_log
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
  );

-- Lead scoring rules policies
CREATE POLICY "scoring_rules_org_access" ON public.lead_scoring_rules
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
  );

-- ============================================================================
-- 9. CRIAR TRIGGERS E FUNCTIONS
-- ============================================================================

-- Function para atualizar engagement score e last contact
CREATE OR REPLACE FUNCTION update_contact_engagement()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar engagement score baseado no tipo de ação
  UPDATE contact_orgs
  SET 
    last_contact_at = COALESCE(NEW.created_at, CURRENT_TIMESTAMP),
    last_contact_type = NEW.action_type,
    engagement_score = LEAST(100, engagement_score + CASE
      WHEN NEW.action_type = 'call' AND NEW.duration_seconds > 60 THEN 15
      WHEN NEW.action_type = 'call' THEN 10
      WHEN NEW.action_type = 'email' THEN 8
      WHEN NEW.action_type = 'whatsapp' THEN 5
      WHEN NEW.action_type = 'sms' THEN 3
      WHEN NEW.action_type = 'note' THEN 2
      ELSE 1
    END),
    is_hot_lead = CASE 
      WHEN engagement_score >= 70 THEN true
      WHEN NEW.action_type = 'call' AND NEW.duration_seconds > 300 THEN true
      ELSE is_hot_lead
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.contact_org_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger será criado quando a tabela crm_activities existir
-- Por enquanto, vamos criar um trigger baseado no quick_actions_log
CREATE TRIGGER trg_update_contact_engagement_quick
AFTER INSERT ON public.quick_actions_log
FOR EACH ROW 
EXECUTE FUNCTION update_contact_engagement();

-- Function para marcar tasks como overdue
CREATE OR REPLACE FUNCTION mark_overdue_tasks()
RETURNS void AS $$
BEGIN
  UPDATE crm_tasks
  SET 
    status = 'overdue',
    updated_at = CURRENT_TIMESTAMP
  WHERE 
    status = 'pending' 
    AND due_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function para atualizar stage_entered_at quando mudar de stage
CREATE OR REPLACE FUNCTION update_stage_entered_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.journey_stage_id IS DISTINCT FROM OLD.journey_stage_id THEN
    NEW.stage_entered_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para stage_entered_at
CREATE TRIGGER trg_update_stage_entered
BEFORE UPDATE ON public.contact_orgs
FOR EACH ROW
EXECUTE FUNCTION update_stage_entered_at();

-- ============================================================================
-- 10. INSERIR DADOS DEFAULT - SMART FILTERS PRÉ-CONFIGURADOS
-- ============================================================================

-- Inserir filtros inteligentes padrão para cada organização
INSERT INTO public.saved_filters (organization_id, user_id, name, icon, color, type, filters, is_smart, is_shared, position)
SELECT DISTINCT 
  om.organization_id,
  om.profile_id,
  filter.name,
  filter.icon,
  filter.color,
  'contacts',
  filter.config,
  true,
  true,
  filter.position
FROM public.org_members om
CROSS JOIN (
  VALUES 
    (1, 'Hot Leads 🔥', 'flame', '#ef4444', '{"is_hot_lead": true}'::jsonb),
    (2, 'Needs Attention ⚠️', 'alert-triangle', '#f59e0b', '{"last_contact_at": {"operator": "<", "value": "7_days_ago"}}'::jsonb),
    (3, 'Today''s Tasks 📋', 'calendar-check', '#3b82f6', '{"next_action_at": {"operator": "today"}}'::jsonb),
    (4, 'No Activity > 14 days 🕐', 'clock', '#6b7280', '{"last_contact_at": {"operator": "<", "value": "14_days_ago"}}'::jsonb),
    (5, 'High Engagement 💎', 'star', '#8b5cf6', '{"engagement_score": {"operator": ">=", "value": 80}}'::jsonb),
    (6, 'New This Week 🆕', 'user-plus', '#10b981', '{"created_at": {"operator": ">", "value": "this_week"}}'::jsonb)
) AS filter(position, name, icon, color, config)
WHERE om.role = 'admin'
ON CONFLICT (organization_id, user_id, name, type) DO NOTHING;

-- ============================================================================
-- 11. INSERIR TEMPLATES DEFAULT
-- ============================================================================

INSERT INTO public.message_templates (organization_id, name, type, category, content, variables)
SELECT DISTINCT
  om.organization_id,
  template.name,
  template.type,
  template.category,
  template.content,
  template.variables
FROM public.org_members om
CROSS JOIN (
  VALUES
    ('Primeiro Contato', 'whatsapp', 'intro', 
     'Olá {{name}}! 👋\n\nVi que você se interessou por {{product}}. Posso tirar alguma dúvida?',
     '["{{name}}", "{{product}}"]'::jsonb),
    ('Follow-up Email', 'email', 'follow_up',
     'Olá {{name}},\n\nConforme conversamos, envio mais informações sobre {{product}}.\n\n[Detalhes aqui]\n\nQualquer dúvida, estou à disposição!',
     '["{{name}}", "{{product}}"]'::jsonb),
    ('Agendamento de Demo', 'email', 'proposal',
     'Olá {{name}},\n\nQue tal agendarmos uma demonstração rápida de 15 minutos?\n\nPosso mostrar como {{product}} pode ajudar {{company}}.\n\nQual o melhor horário para você?',
     '["{{name}}", "{{product}}", "{{company}}"]'::jsonb)
) AS template(name, type, category, content, variables)
WHERE om.role = 'admin'
ON CONFLICT (organization_id, name) DO NOTHING;

-- ============================================================================
-- 12. CRIAR VIEW PARA DASHBOARD DE VENDAS
-- ============================================================================

CREATE OR REPLACE VIEW public.sales_dashboard_metrics AS
SELECT
  co.organization_id,
  COUNT(DISTINCT co.id) FILTER (WHERE co.created_at >= CURRENT_DATE - INTERVAL '30 days') as new_contacts_30d,
  COUNT(DISTINCT co.id) FILTER (WHERE co.is_hot_lead = true) as hot_leads_count,
  COUNT(DISTINCT co.id) FILTER (WHERE co.last_contact_at < CURRENT_DATE - INTERVAL '7 days') as stale_contacts,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'pending' AND t.due_at < CURRENT_TIMESTAMP) as overdue_tasks,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'pending' AND DATE(t.due_at) = CURRENT_DATE) as tasks_today,
  AVG(co.engagement_score) as avg_engagement_score,
  AVG(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - co.stage_entered_at)) / 86400) as avg_days_in_stage
FROM contact_orgs co
LEFT JOIN crm_tasks t ON t.contact_org_id = co.id
GROUP BY co.organization_id;

-- Grant select on view
GRANT SELECT ON public.sales_dashboard_metrics TO authenticated;

-- ============================================================================
-- FINAL: Mensagem de sucesso
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'CRM Sales Transformation Migration Completed Successfully!';
  RAISE NOTICE '✅ Added context fields to contacts';
  RAISE NOTICE '✅ Created tasks system';
  RAISE NOTICE '✅ Created message templates';
  RAISE NOTICE '✅ Created smart filters';
  RAISE NOTICE '✅ Created quick actions log';
  RAISE NOTICE '✅ Added lead scoring foundation';
  RAISE NOTICE '✅ Configured RLS policies';
  RAISE NOTICE '✅ Added automation triggers';
END $$;