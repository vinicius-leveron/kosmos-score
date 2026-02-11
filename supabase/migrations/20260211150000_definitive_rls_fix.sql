-- 20260211150000_definitive_rls_fix.sql
-- CORREÇÃO DEFINITIVA: Eliminar recursão infinita nas policies RLS

-- ============================================================================
-- PROBLEMA: A recursão ocorre quando:
-- 1. Policy de org_members consulta org_members (loop direto)
-- 2. Policy usa função que consulta tabela com RLS que volta para org_members
--
-- SOLUÇÃO:
-- 1. Dropar TODAS as policies de org_members
-- 2. Criar policy ULTRA SIMPLES sem subqueries
-- 3. Usar SECURITY DEFINER em funções helper para bypassar RLS
-- ============================================================================

-- ============================================================================
-- 1. DROPAR TODAS AS POLICIES DE ORG_MEMBERS (limpar completamente)
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'org_members'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.org_members', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- ============================================================================
-- 2. DROPAR TODAS AS POLICIES DE ORGANIZATIONS
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'organizations'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.organizations', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- ============================================================================
-- 3. DROPAR TODAS AS POLICIES DE PROFILES
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- ============================================================================
-- 4. CRIAR/RECRIAR FUNÇÃO HELPER COM SECURITY DEFINER
-- Esta função bypassa RLS completamente
-- ============================================================================

DROP FUNCTION IF EXISTS public.get_user_organization_ids();

CREATE OR REPLACE FUNCTION public.get_user_organization_ids()
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER  -- CRÍTICO: bypassa RLS
STABLE
SET search_path = public
AS $$
DECLARE
  result uuid[];
BEGIN
  -- Consulta direta sem passar pelo RLS
  SELECT COALESCE(ARRAY_AGG(organization_id), ARRAY[]::uuid[])
  INTO result
  FROM org_members
  WHERE profile_id = auth.uid();

  RETURN result;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.get_user_organization_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_organization_ids() TO service_role;

-- ============================================================================
-- 5. CRIAR FUNÇÃO PARA VERIFICAR SE USER É ADMIN DE UMA ORG
-- ============================================================================

DROP FUNCTION IF EXISTS public.is_org_admin(uuid);

CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER  -- CRÍTICO: bypassa RLS
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM org_members
    WHERE profile_id = auth.uid()
    AND organization_id = org_id
    AND role = 'admin'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(uuid) TO service_role;

-- ============================================================================
-- 6. GARANTIR QUE RLS ESTÁ HABILITADO
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 7. POLICIES PARA PROFILES (ultra simples)
-- ============================================================================

CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- ============================================================================
-- 8. POLICIES PARA ORG_MEMBERS (ultra simples, sem subqueries)
-- ============================================================================

-- SELECT: User vê suas próprias memberships
CREATE POLICY "org_members_select_own"
ON public.org_members FOR SELECT
USING (profile_id = auth.uid());

-- INSERT: Apenas admins podem adicionar membros (usa função SECURITY DEFINER)
CREATE POLICY "org_members_insert_admin"
ON public.org_members FOR INSERT
WITH CHECK (public.is_org_admin(organization_id));

-- UPDATE: Apenas admins podem atualizar membros
CREATE POLICY "org_members_update_admin"
ON public.org_members FOR UPDATE
USING (public.is_org_admin(organization_id));

-- DELETE: Apenas admins podem remover membros
CREATE POLICY "org_members_delete_admin"
ON public.org_members FOR DELETE
USING (public.is_org_admin(organization_id));

-- ============================================================================
-- 9. POLICIES PARA ORGANIZATIONS (usa função SECURITY DEFINER)
-- ============================================================================

-- SELECT: User vê orgs onde é membro
CREATE POLICY "organizations_select_member"
ON public.organizations FOR SELECT
USING (id = ANY(public.get_user_organization_ids()));

-- UPDATE: Apenas admins podem atualizar
CREATE POLICY "organizations_update_admin"
ON public.organizations FOR UPDATE
USING (public.is_org_admin(id));

-- INSERT: Qualquer usuário autenticado pode criar org
CREATE POLICY "organizations_insert_authenticated"
ON public.organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- 10. TESTE DE RECURSÃO
-- ============================================================================

DO $$
DECLARE
  test_result uuid[];
BEGIN
  -- Testar se a função helper funciona
  test_result := public.get_user_organization_ids();
  RAISE NOTICE 'Function test passed! Organizations: %', test_result;

  -- Testar se consegue consultar org_members sem recursão
  PERFORM 1 FROM org_members LIMIT 1;
  RAISE NOTICE 'org_members query test passed!';

  -- Testar organizations
  PERFORM 1 FROM organizations LIMIT 1;
  RAISE NOTICE 'organizations query test passed!';

  RAISE NOTICE '✅ ALL RLS RECURSION TESTS PASSED!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'RLS test failed: %', SQLERRM;
END $$;

-- ============================================================================
-- 11. RECRIAR POLICIES DE OUTRAS TABELAS USANDO FUNÇÃO HELPER
-- ============================================================================

-- Contacts
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contacts'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.contacts', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "contacts_select"
ON public.contacts FOR SELECT
USING (
  -- Leads públicos (sem org) ou contacts da org do user
  NOT EXISTS (SELECT 1 FROM contact_orgs WHERE contact_id = contacts.id)
  OR
  id IN (SELECT contact_id FROM contact_orgs WHERE organization_id = ANY(public.get_user_organization_ids()))
);

CREATE POLICY "contacts_insert"
ON public.contacts FOR INSERT
WITH CHECK (true); -- Qualquer um pode criar contato (leads públicos)

CREATE POLICY "contacts_update"
ON public.contacts FOR UPDATE
USING (
  NOT EXISTS (SELECT 1 FROM contact_orgs WHERE contact_id = contacts.id)
  OR
  id IN (SELECT contact_id FROM contact_orgs WHERE organization_id = ANY(public.get_user_organization_ids()))
);

CREATE POLICY "contacts_delete"
ON public.contacts FOR DELETE
USING (
  id IN (SELECT contact_id FROM contact_orgs WHERE organization_id = ANY(public.get_user_organization_ids()))
);

-- Contact Orgs
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_orgs'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.contact_orgs', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "contact_orgs_all"
ON public.contact_orgs FOR ALL
USING (organization_id = ANY(public.get_user_organization_ids()));

-- Companies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'companies'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.companies', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "companies_all"
ON public.companies FOR ALL
USING (organization_id = ANY(public.get_user_organization_ids()));

-- Deals
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'deals'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.deals', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "deals_all"
ON public.deals FOR ALL
USING (organization_id = ANY(public.get_user_organization_ids()));

-- Pipelines
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pipelines'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.pipelines', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "pipelines_all"
ON public.pipelines FOR ALL
USING (organization_id = ANY(public.get_user_organization_ids()));

-- Pipeline Stages
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pipeline_stages'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.pipeline_stages', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "pipeline_stages_all"
ON public.pipeline_stages FOR ALL
USING (organization_id = ANY(public.get_user_organization_ids()));

-- Journey Stages
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'journey_stages'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.journey_stages', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "journey_stages_read"
ON public.journey_stages FOR SELECT
USING (
  organization_id IS NULL  -- Stages globais (sistema)
  OR organization_id = ANY(public.get_user_organization_ids())
);

CREATE POLICY "journey_stages_write"
ON public.journey_stages FOR INSERT
WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "journey_stages_update"
ON public.journey_stages FOR UPDATE
USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "journey_stages_delete"
ON public.journey_stages FOR DELETE
USING (organization_id = ANY(public.get_user_organization_ids()));

-- ============================================================================
-- 12. ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_org_members_profile_id ON public.org_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_org_members_organization_id ON public.org_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_profile_org ON public.org_members(profile_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.org_members(organization_id, role);

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ CORREÇÃO DEFINITIVA DE RLS APLICADA';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '• Todas policies antigas removidas';
  RAISE NOTICE '• Funções SECURITY DEFINER criadas';
  RAISE NOTICE '• Policies simples sem recursão criadas';
  RAISE NOTICE '• Índices de performance criados';
  RAISE NOTICE '';
END $$;
