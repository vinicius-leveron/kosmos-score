-- 20260210_emergency_rls_fix.sql
-- CORREÇÃO EMERGENCIAL: Re-habilitar RLS e corrigir vulnerabilidades de segurança

-- ============================================================================
-- 1. RE-HABILITAR RLS NAS TABELAS CRÍTICAS
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. CRIAR FUNÇÃO HELPER PARA ORGANIZAÇÕES DO USUÁRIO
-- ============================================================================

-- Função já existe do migration anterior

-- ============================================================================
-- 3. CORRIGIR POLICIES DE PROFILES
-- ============================================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles;

-- Criar policies seguras
CREATE POLICY "profiles_own_read" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_self_insert" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================================
-- 4. CORRIGIR POLICIES DE ORG_MEMBERS
-- ============================================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "org_members_select" ON public.org_members;
DROP POLICY IF EXISTS "org_members_insert" ON public.org_members;
DROP POLICY IF EXISTS "org_members_update" ON public.org_members;
DROP POLICY IF EXISTS "org_members_delete" ON public.org_members;
DROP POLICY IF EXISTS "org_members_own_read" ON public.org_members;
DROP POLICY IF EXISTS "org_members_admin_insert" ON public.org_members;
DROP POLICY IF EXISTS "org_members_admin_update" ON public.org_members;
DROP POLICY IF EXISTS "org_members_admin_delete" ON public.org_members;

-- Criar policies seguras
CREATE POLICY "org_members_own_read" ON public.org_members
  FOR SELECT USING (
    profile_id = auth.uid() OR 
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "org_members_admin_insert" ON public.org_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members 
      WHERE profile_id = auth.uid() 
      AND organization_id = org_members.organization_id
      AND role = 'admin'
    )
  );

CREATE POLICY "org_members_admin_update" ON public.org_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.org_members 
      WHERE profile_id = auth.uid() 
      AND organization_id = org_members.organization_id
      AND role = 'admin'
    )
  );

CREATE POLICY "org_members_admin_delete" ON public.org_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.org_members 
      WHERE profile_id = auth.uid() 
      AND organization_id = org_members.organization_id
      AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. CORRIGIR POLICIES DE ORGANIZATIONS
-- ============================================================================

-- Remover policy fraca
DROP POLICY IF EXISTS "organizations_select" ON public.organizations;
DROP POLICY IF EXISTS "organizations_member_only" ON public.organizations;
DROP POLICY IF EXISTS "organizations_admin_update" ON public.organizations;

-- Criar policy segura
CREATE POLICY "organizations_member_only" ON public.organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "organizations_admin_update" ON public.organizations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE profile_id = auth.uid()
      AND organization_id = organizations.id
      AND role = 'admin'
    )
  );

-- ============================================================================
-- 6. CORRIGIR JOURNEY_STAGES - ADICIONAR FILTRO DE ORGANIZAÇÃO
-- ============================================================================

DROP POLICY IF EXISTS "journey_stages_select" ON public.journey_stages;
DROP POLICY IF EXISTS "journey_stages_org_scoped" ON public.journey_stages;
DROP POLICY IF EXISTS "journey_stages_admin_manage" ON public.journey_stages;

CREATE POLICY "journey_stages_org_scoped" ON public.journey_stages
  FOR SELECT USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "journey_stages_admin_manage" ON public.journey_stages
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE profile_id = auth.uid()
      AND organization_id = journey_stages.organization_id
      AND role = 'admin'
    )
  );

-- ============================================================================
-- 7. CORRIGIR PIPELINES - REMOVER POLICY FRACA
-- ============================================================================

DROP POLICY IF EXISTS "pipelines_select" ON public.pipelines;
DROP POLICY IF EXISTS "pipelines_org_scoped" ON public.pipelines;

CREATE POLICY "pipelines_org_scoped" ON public.pipelines
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
  );

-- ============================================================================
-- 8. GARANTIR RLS EM TODAS AS TABELAS TENANT-SCOPED
-- ============================================================================

-- Habilitar RLS em tabelas que possam estar sem (verificando existência)
DO $$
BEGIN
  -- Lista de tabelas para habilitar RLS
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contacts') THEN
    ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_orgs') THEN
    ALTER TABLE public.contact_orgs ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_companies') THEN
    ALTER TABLE public.contact_companies ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'companies') THEN
    ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deals') THEN
    ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'journey_projects') THEN
    ALTER TABLE public.journey_projects ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'journey_project_stages') THEN
    ALTER TABLE public.journey_project_stages ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'journey_touchpoints') THEN
    ALTER TABLE public.journey_touchpoints ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stakeholders') THEN
    ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stakeholder_interactions') THEN
    ALTER TABLE public.stakeholder_interactions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_activities') THEN
    ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_tags') THEN
    ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'forms') THEN
    ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_fields') THEN
    ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'form_submissions') THEN
    ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'benchmarks') THEN
    ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================================================
-- 9. VERIFICAÇÃO FINAL DE SEGURANÇA
-- ============================================================================

DO $$
DECLARE
  v_count integer;
  v_tables text;
BEGIN
  -- Verificar se há tabelas críticas sem RLS
  SELECT COUNT(*), string_agg(tablename, ', ')
  INTO v_count, v_tables
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND rowsecurity = false
  AND tablename IN (
    'profiles', 'org_members', 'organizations',
    'contacts', 'contact_orgs', 'companies', 'deals',
    'journey_projects', 'stakeholders', 'forms'
  );
  
  IF v_count > 0 THEN
    RAISE EXCEPTION 'CRITICAL: RLS ainda está desabilitado nas tabelas: %', v_tables;
  END IF;
  
  RAISE NOTICE 'RLS habilitado com sucesso em todas as tabelas críticas!';
END $$;

-- ============================================================================
-- 10. CRIAR ÍNDICES PARA PERFORMANCE DAS POLICIES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_org_members_profile_org 
  ON public.org_members(profile_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_org_members_org_role 
  ON public.org_members(organization_id, role);

-- ============================================================================
-- AUDIT LOG (se a tabela existir)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
    INSERT INTO public.audit_logs (
      action,
      table_name,
      user_id,
      details,
      created_at
    ) VALUES (
      'SECURITY_FIX',
      'MULTIPLE',
      auth.uid(),
      jsonb_build_object(
        'migration', '20260210_emergency_rls_fix',
        'action', 'Re-enabled RLS on critical tables',
        'tables_fixed', ARRAY[
          'profiles', 'org_members', 'organizations',
          'journey_stages', 'pipelines'
        ]
      ),
      NOW()
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;