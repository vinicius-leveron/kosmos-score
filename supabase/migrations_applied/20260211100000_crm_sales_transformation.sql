-- 20260211100000_crm_sales_transformation.sql
-- Transformação do CRM em sistema de vendas real com contexto e produtividade

-- ============================================================================
-- 1. ADICIONAR CAMPOS DE CONTEXTO EM CONTACT_ORGS (SE NÃO EXISTIREM)
-- ============================================================================

-- Adicionar colunas uma por vez se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_orgs' AND column_name = 'last_contact_at') THEN
    ALTER TABLE public.contact_orgs ADD COLUMN last_contact_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_orgs' AND column_name = 'last_contact_type') THEN
    ALTER TABLE public.contact_orgs ADD COLUMN last_contact_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_orgs' AND column_name = 'next_action_at') THEN
    ALTER TABLE public.contact_orgs ADD COLUMN next_action_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_orgs' AND column_name = 'next_action_type') THEN
    ALTER TABLE public.contact_orgs ADD COLUMN next_action_type TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_orgs' AND column_name = 'stage_entered_at') THEN
    ALTER TABLE public.contact_orgs ADD COLUMN stage_entered_at TIMESTAMPTZ DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_orgs' AND column_name = 'engagement_score') THEN
    ALTER TABLE public.contact_orgs ADD COLUMN engagement_score INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_orgs' AND column_name = 'is_hot_lead') THEN
    ALTER TABLE public.contact_orgs ADD COLUMN is_hot_lead BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_orgs' AND column_name = 'lost_reason') THEN
    ALTER TABLE public.contact_orgs ADD COLUMN lost_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contact_orgs' AND column_name = 'last_activity_summary') THEN
    ALTER TABLE public.contact_orgs ADD COLUMN last_activity_summary TEXT;
  END IF;
END $$;

-- ============================================================================
-- 2. CRIAR TABELA DE TASKS (SE NÃO EXISTIR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_org_id UUID REFERENCES public.contact_orgs(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'follow_up',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  due_at TIMESTAMPTZ NOT NULL,
  reminder_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  outcome TEXT,
  is_automated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. CRIAR TABELA DE TEMPLATES (SE NÃO EXISTIR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. CRIAR TABELA DE QUICK ACTIONS LOG (SE NÃO EXISTIR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quick_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_org_id UUID REFERENCES public.contact_orgs(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  content TEXT,
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  duration_seconds INTEGER,
  outcome TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. HABILITAR RLS NAS NOVAS TABELAS
-- ============================================================================

ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_actions_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. CRIAR POLICIES RLS (SE NÃO EXISTIREM)
-- ============================================================================

-- Tasks policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crm_tasks' AND policyname = 'tasks_org_select') THEN
    CREATE POLICY "tasks_org_select" ON public.crm_tasks
      FOR SELECT USING (
        organization_id IN (
          SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crm_tasks' AND policyname = 'tasks_org_insert') THEN
    CREATE POLICY "tasks_org_insert" ON public.crm_tasks
      FOR INSERT WITH CHECK (
        organization_id IN (
          SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crm_tasks' AND policyname = 'tasks_org_update') THEN
    CREATE POLICY "tasks_org_update" ON public.crm_tasks
      FOR UPDATE USING (
        organization_id IN (
          SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'crm_tasks' AND policyname = 'tasks_org_delete') THEN
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
  END IF;
END $$;

-- Message templates policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'message_templates' AND policyname = 'templates_org_access') THEN
    CREATE POLICY "templates_org_access" ON public.message_templates
      FOR ALL USING (
        organization_id IN (
          SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Quick actions policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quick_actions_log' AND policyname = 'quick_actions_org_access') THEN
    CREATE POLICY "quick_actions_org_access" ON public.quick_actions_log
      FOR ALL USING (
        organization_id IN (
          SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- 7. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_contact_orgs_last_contact ON public.contact_orgs(last_contact_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_orgs_next_action ON public.contact_orgs(next_action_at ASC) WHERE next_action_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_orgs_hot_lead ON public.contact_orgs(is_hot_lead) WHERE is_hot_lead = true;
CREATE INDEX IF NOT EXISTS idx_contact_orgs_engagement ON public.contact_orgs(engagement_score DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_due ON public.crm_tasks(due_at ASC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_tasks_contact ON public.crm_tasks(contact_org_id) WHERE contact_org_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.crm_tasks(assigned_to, status) WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quick_actions_contact ON public.quick_actions_log(contact_org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_org_type ON public.message_templates(organization_id, type, is_active);

-- ============================================================================
-- MENSAGEM FINAL
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'CRM Sales Transformation Applied Successfully!';
  RAISE NOTICE '✅ Context fields added to contacts';
  RAISE NOTICE '✅ Tasks system created';
  RAISE NOTICE '✅ Message templates configured';
  RAISE NOTICE '✅ Quick actions log ready';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '✅ Performance indexes created';
END $$;