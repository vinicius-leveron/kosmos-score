-- ============================================================================
-- TEMPORARILY DISABLE RLS FOR DEBUGGING
-- ============================================================================
-- This will allow all queries to work without policy checks
-- We can re-enable after confirming the app works

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members DISABLE ROW LEVEL SECURITY;
