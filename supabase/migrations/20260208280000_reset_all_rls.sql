-- ============================================================================
-- RESET ALL RLS POLICIES - Clean slate approach
-- ============================================================================

-- ============================================================================
-- 1. DROP ALL EXISTING POLICIES
-- ============================================================================

-- Profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Org members
DROP POLICY IF EXISTS "org_members_select_own" ON public.org_members;
DROP POLICY IF EXISTS "org_members_select" ON public.org_members;
DROP POLICY IF EXISTS "org_members_select_same_org" ON public.org_members;
DROP POLICY IF EXISTS "org_members_insert" ON public.org_members;
DROP POLICY IF EXISTS "org_members_update" ON public.org_members;
DROP POLICY IF EXISTS "org_members_delete" ON public.org_members;

-- Organizations
DROP POLICY IF EXISTS "organizations_select_all" ON public.organizations;
DROP POLICY IF EXISTS "organizations_select_member" ON public.organizations;
DROP POLICY IF EXISTS "organizations_select" ON public.organizations;

-- ============================================================================
-- 2. CREATE SIMPLE POLICIES (no subqueries, no function calls)
-- ============================================================================

-- Profiles: user can only see and update their own profile
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Org members: user can see their own memberships
CREATE POLICY "org_members_select" ON public.org_members
  FOR SELECT USING (profile_id = auth.uid());

-- Organizations: public read (just names, not sensitive)
CREATE POLICY "organizations_select" ON public.organizations
  FOR SELECT USING (true);

-- ============================================================================
-- 3. VERIFY RLS IS ENABLED
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
