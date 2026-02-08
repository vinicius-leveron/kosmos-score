-- ============================================================================
-- KOSMOS Platform - Allow public read for journey_stages
-- ============================================================================
-- Allows anonymous users to read journey_stages for the CRM pipeline
-- This is necessary for unauthenticated access during development
-- ============================================================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "journey_stages_select_org" ON public.journey_stages;

-- Create more permissive policy - anyone can read journey stages
-- In production, you may want to restrict this back to authenticated users only
CREATE POLICY "journey_stages_select_public"
  ON public.journey_stages FOR SELECT
  USING (true);

-- Keep insert/update/delete restricted to admins (these policies already exist)
