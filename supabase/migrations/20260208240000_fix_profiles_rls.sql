-- ============================================================================
-- FIX: Simplify profiles RLS to avoid circular dependency
-- ============================================================================

-- Drop existing policy
DROP POLICY IF EXISTS "profiles_select_shared_org" ON public.profiles;

-- Simplified policy: users can see their own profile + KOSMOS master sees all
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR public.is_kosmos_master()
  );
