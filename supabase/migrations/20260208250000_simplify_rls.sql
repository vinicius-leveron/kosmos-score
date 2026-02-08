-- ============================================================================
-- FIX: Simplify all RLS policies to avoid any circular dependencies
-- ============================================================================

-- ============================================================================
-- 1. ORG_MEMBERS - Direct checks only, no helper functions
-- ============================================================================
DROP POLICY IF EXISTS "org_members_select" ON public.org_members;
DROP POLICY IF EXISTS "org_members_select_same_org" ON public.org_members;

-- Simple policy: user sees their own memberships only
-- KOSMOS master check done inline without function call
CREATE POLICY "org_members_select_own" ON public.org_members FOR SELECT
  USING (
    profile_id = auth.uid()
  );

-- ============================================================================
-- 2. PROFILES - Direct check only
-- ============================================================================
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_shared_org" ON public.profiles;

-- Simple policy: user sees their own profile only
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
  );

-- ============================================================================
-- 3. ORGANIZATIONS - Anyone can see orgs they're members of
-- ============================================================================
DROP POLICY IF EXISTS "organizations_select" ON public.organizations;
DROP POLICY IF EXISTS "organizations_select_members" ON public.organizations;

-- User can see orgs where they have a membership
CREATE POLICY "organizations_select_member" ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id
      FROM public.org_members
      WHERE profile_id = auth.uid()
    )
  );
