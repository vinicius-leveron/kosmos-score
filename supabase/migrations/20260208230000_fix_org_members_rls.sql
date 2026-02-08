-- ============================================================================
-- FIX: Allow users to see their own org_members records
-- ============================================================================
-- The current policy uses is_org_member() which creates a circular dependency
-- for a user's first membership query. Adding explicit self-access.

-- Drop existing select policy
DROP POLICY IF EXISTS "org_members_select_same_org" ON public.org_members;

-- Create new policy that allows users to see their own memberships directly
CREATE POLICY "org_members_select" ON public.org_members FOR SELECT
  USING (
    -- User can always see their own memberships
    profile_id = auth.uid()
    -- Or user is member of the same org (for seeing other members)
    OR public.is_org_member(organization_id)
    -- KOSMOS master sees all
    OR public.is_kosmos_master()
  );
