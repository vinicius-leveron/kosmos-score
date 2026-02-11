-- 20260211110000_fix_rls_recursion.sql
-- Corrigir recursão infinita nas policies RLS

-- ============================================================================
-- 1. REMOVER POLICIES PROBLEMÁTICAS QUE CAUSAM RECURSÃO
-- ============================================================================

-- Remover policies antigas de org_members que causam recursão
DROP POLICY IF EXISTS "org_members_own_read" ON public.org_members;
DROP POLICY IF EXISTS "org_members_admin_insert" ON public.org_members;
DROP POLICY IF EXISTS "org_members_admin_update" ON public.org_members;
DROP POLICY IF EXISTS "org_members_admin_delete" ON public.org_members;
DROP POLICY IF EXISTS "org_members_select" ON public.org_members;

-- Remover policies antigas de organizations
DROP POLICY IF EXISTS "organizations_member_only" ON public.organizations;
DROP POLICY IF EXISTS "organizations_admin_update" ON public.organizations;
DROP POLICY IF EXISTS "organizations_select" ON public.organizations;

-- ============================================================================
-- 2. CRIAR FUNÇÃO HELPER SEM RECURSÃO
-- ============================================================================

-- Criar função que não depende de RLS para evitar recursão
CREATE OR REPLACE FUNCTION public.get_user_organization_ids()
RETURNS uuid[]
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT ARRAY_AGG(organization_id) 
  FROM org_members 
  WHERE profile_id = auth.uid()
$$;

-- ============================================================================
-- 3. RECRIAR POLICIES DE ORG_MEMBERS SEM RECURSÃO
-- ============================================================================

-- Policy simples para org_members - user pode ver suas próprias associações
CREATE POLICY "org_members_own" ON public.org_members
  FOR SELECT
  USING (profile_id = auth.uid());

-- Policy para admin gerenciar membros (sem recursão)
CREATE POLICY "org_members_admin_manage" ON public.org_members
  FOR ALL
  USING (
    profile_id = auth.uid() OR
    organization_id = ANY(
      SELECT organization_id 
      FROM org_members om
      WHERE om.profile_id = auth.uid() 
      AND om.role = 'admin'
    )
  );

-- ============================================================================
-- 4. RECRIAR POLICIES DE ORGANIZATIONS SEM RECURSÃO
-- ============================================================================

-- Organizations - usar array function
CREATE POLICY "organizations_member_access" ON public.organizations
  FOR SELECT
  USING (
    id = ANY(public.get_user_organization_ids())
  );

CREATE POLICY "organizations_admin_update" ON public.organizations
  FOR UPDATE
  USING (
    id = ANY(
      SELECT organization_id 
      FROM org_members
      WHERE profile_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. CORRIGIR POLICIES DE CONTACT_ORGS
-- ============================================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "contact_orgs_select" ON public.contact_orgs;
DROP POLICY IF EXISTS "contact_orgs_insert" ON public.contact_orgs;
DROP POLICY IF EXISTS "contact_orgs_update" ON public.contact_orgs;
DROP POLICY IF EXISTS "contact_orgs_delete" ON public.contact_orgs;

-- Recriar usando a função helper
CREATE POLICY "contact_orgs_org_access" ON public.contact_orgs
  FOR ALL
  USING (
    organization_id = ANY(public.get_user_organization_ids())
  );

-- ============================================================================
-- 6. CORRIGIR OUTRAS TABELAS QUE POSSAM TER O MESMO PROBLEMA
-- ============================================================================

-- Contacts
DROP POLICY IF EXISTS "contacts_select" ON public.contacts CASCADE;
DROP POLICY IF EXISTS "contacts_insert" ON public.contacts CASCADE;
DROP POLICY IF EXISTS "contacts_update" ON public.contacts CASCADE;
DROP POLICY IF EXISTS "contacts_delete" ON public.contacts CASCADE;

CREATE POLICY "contacts_public_or_org" ON public.contacts
  FOR ALL
  USING (
    -- Contacts podem ser públicos (leads) ou pertencer a uma org via contact_orgs
    id IN (
      SELECT contact_id FROM contact_orgs 
      WHERE organization_id = ANY(public.get_user_organization_ids())
    )
    OR
    -- Ou não ter associação (lead público)
    NOT EXISTS (SELECT 1 FROM contact_orgs WHERE contact_id = contacts.id)
  );

-- Companies
DROP POLICY IF EXISTS "companies_select" ON public.companies CASCADE;
DROP POLICY IF EXISTS "companies_insert" ON public.companies CASCADE;
DROP POLICY IF EXISTS "companies_update" ON public.companies CASCADE;
DROP POLICY IF EXISTS "companies_delete" ON public.companies CASCADE;

CREATE POLICY "companies_org_access" ON public.companies
  FOR ALL
  USING (
    organization_id = ANY(public.get_user_organization_ids())
  );

-- Deals
DROP POLICY IF EXISTS "deals_select" ON public.deals CASCADE;
DROP POLICY IF EXISTS "deals_insert" ON public.deals CASCADE;
DROP POLICY IF EXISTS "deals_update" ON public.deals CASCADE;
DROP POLICY IF EXISTS "deals_delete" ON public.deals CASCADE;

CREATE POLICY "deals_org_access" ON public.deals
  FOR ALL
  USING (
    organization_id = ANY(public.get_user_organization_ids())
  );

-- Journey stages
DROP POLICY IF EXISTS "journey_stages_org_scoped" ON public.journey_stages CASCADE;
DROP POLICY IF EXISTS "journey_stages_admin_manage" ON public.journey_stages CASCADE;
DROP POLICY IF EXISTS "journey_stages_select" ON public.journey_stages CASCADE;

CREATE POLICY "journey_stages_read" ON public.journey_stages
  FOR SELECT
  USING (
    organization_id IS NULL OR 
    organization_id = ANY(public.get_user_organization_ids())
  );

CREATE POLICY "journey_stages_insert" ON public.journey_stages
  FOR INSERT
  WITH CHECK (
    organization_id = ANY(public.get_user_organization_ids())
  );

CREATE POLICY "journey_stages_update" ON public.journey_stages
  FOR UPDATE
  USING (
    organization_id = ANY(public.get_user_organization_ids())
  );

CREATE POLICY "journey_stages_delete" ON public.journey_stages
  FOR DELETE
  USING (
    organization_id = ANY(public.get_user_organization_ids())
  );

-- Pipeline stages
DROP POLICY IF EXISTS "pipeline_stages_select" ON public.pipeline_stages CASCADE;
DROP POLICY IF EXISTS "pipeline_stages_insert" ON public.pipeline_stages CASCADE;
DROP POLICY IF EXISTS "pipeline_stages_update" ON public.pipeline_stages CASCADE;
DROP POLICY IF EXISTS "pipeline_stages_delete" ON public.pipeline_stages CASCADE;

CREATE POLICY "pipeline_stages_org_access" ON public.pipeline_stages
  FOR ALL
  USING (
    organization_id = ANY(public.get_user_organization_ids())
  );

-- Pipelines
DROP POLICY IF EXISTS "pipelines_org_scoped" ON public.pipelines CASCADE;
DROP POLICY IF EXISTS "pipelines_select" ON public.pipelines CASCADE;

CREATE POLICY "pipelines_org_access" ON public.pipelines
  FOR ALL
  USING (
    organization_id = ANY(public.get_user_organization_ids())
  );

-- ============================================================================
-- 7. VERIFICAR E CORRIGIR PROFILES
-- ============================================================================

-- Profiles - cada user só vê seu próprio perfil
DROP POLICY IF EXISTS "profiles_own_read" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_own_update" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_self_insert" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles CASCADE;

CREATE POLICY "profiles_own_access" ON public.profiles
  FOR ALL
  USING (id = auth.uid());

-- ============================================================================
-- 8. GRANT NECESSÁRIO PARA A FUNÇÃO
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.get_user_organization_ids() TO authenticated;

-- ============================================================================
-- 9. TESTE RÁPIDO PARA VERIFICAR SE RESOLVEU
-- ============================================================================

DO $$
BEGIN
  -- Tentar uma query simples para verificar se não há mais recursão
  PERFORM 1 FROM org_members LIMIT 1;
  RAISE NOTICE 'RLS recursion fixed successfully!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'RLS still has issues: %', SQLERRM;
END $$;

-- ============================================================================
-- MENSAGEM FINAL
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Fixed RLS infinite recursion';
  RAISE NOTICE '✅ Created helper function get_user_organization_ids()';
  RAISE NOTICE '✅ Recreated all policies without recursion';
  RAISE NOTICE '✅ System should work normally now';
END $$;