-- ============================================================================
-- FIX: Simplify organizations RLS - allow public read
-- ============================================================================
-- The subquery in organizations RLS was causing performance issues
-- Organization names/slugs are not sensitive, so we can allow public read

DROP POLICY IF EXISTS "organizations_select_member" ON public.organizations;

-- Simple policy: anyone can read organizations
-- (this is just org names, not sensitive data)
CREATE POLICY "organizations_select_all" ON public.organizations FOR SELECT
  USING (true);
