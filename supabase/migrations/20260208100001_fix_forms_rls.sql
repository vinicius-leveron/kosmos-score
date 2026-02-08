-- ============================================================================
-- KOSMOS Platform - Forms RLS Fixes
-- ============================================================================
-- Fixes identified by rls-validator:
-- 1. Add missing DELETE policy for form_submissions
-- 2. Improve form_submissions_select_own to handle anonymous edge case
-- 3. Add permission checks to SECURITY DEFINER functions
-- ============================================================================

-- ============================================================================
-- FIX 1: Add missing DELETE policy for form_submissions
-- ============================================================================

CREATE POLICY "form_submissions_delete_org" ON public.form_submissions FOR DELETE
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid)
    )
    OR is_kosmos_master()
  );

-- ============================================================================
-- FIX 2: Improve form_submissions_select_own to handle anonymous edge case
-- ============================================================================

DROP POLICY IF EXISTS "form_submissions_select_own" ON public.form_submissions;

CREATE POLICY "form_submissions_select_own" ON public.form_submissions FOR SELECT
  USING (
    -- Own submission by auth id (primary method)
    respondent_id = auth.uid()
    -- Own submission by email (for authenticated users only)
    OR (
      auth.uid() IS NOT NULL
      AND respondent_email IS NOT NULL
      AND respondent_email = (current_setting('request.jwt.claims', true)::jsonb->>'email')
    )
    -- Org member can see all submissions to their forms
    OR form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid)
    )
    -- KOSMOS master
    OR is_kosmos_master()
  );

-- ============================================================================
-- FIX 3: Add permission check to get_form_with_fields function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_form_with_fields(p_form_id UUID)
RETURNS TABLE (
  form JSONB,
  blocks JSONB,
  fields JSONB,
  classifications JSONB
) AS $$
BEGIN
  -- Security check: verify caller has access to this form
  IF NOT EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = p_form_id
    AND (
      f.organization_id IN (SELECT get_user_org_ids()::uuid)
      OR f.status = 'published'
      OR is_kosmos_master()
    )
  ) THEN
    RETURN; -- Return empty result if no access
  END IF;

  RETURN QUERY
  SELECT
    to_jsonb(f.*) as form,
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(b.*) ORDER BY b.position) FROM public.form_blocks b WHERE b.form_id = f.id),
      '[]'::jsonb
    ) as blocks,
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(fi.*) ORDER BY fi.position) FROM public.form_fields fi WHERE fi.form_id = f.id),
      '[]'::jsonb
    ) as fields,
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(c.*) ORDER BY c.position) FROM public.form_classifications c WHERE c.form_id = f.id),
      '[]'::jsonb
    ) as classifications
  FROM public.forms f
  WHERE f.id = p_form_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- FIX 4: Add permission check to get_form_stats function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_form_stats(p_form_id UUID)
RETURNS TABLE (
  total_submissions BIGINT,
  completed_submissions BIGINT,
  in_progress_submissions BIGINT,
  abandoned_submissions BIGINT,
  completion_rate NUMERIC,
  avg_score NUMERIC,
  avg_time_seconds NUMERIC,
  submissions_today BIGINT,
  submissions_this_week BIGINT,
  submissions_this_month BIGINT
) AS $$
BEGIN
  -- Security check: only org members can see stats
  IF NOT EXISTS (
    SELECT 1 FROM public.forms f
    WHERE f.id = p_form_id
    AND (
      f.organization_id IN (SELECT get_user_org_ids()::uuid)
      OR is_kosmos_master()
    )
  ) THEN
    RETURN; -- Return empty result if no access
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_submissions,
    COUNT(*) FILTER (WHERE s.status = 'completed')::BIGINT as completed_submissions,
    COUNT(*) FILTER (WHERE s.status = 'in_progress')::BIGINT as in_progress_submissions,
    COUNT(*) FILTER (WHERE s.status = 'abandoned')::BIGINT as abandoned_submissions,
    ROUND(
      COUNT(*) FILTER (WHERE s.status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0) * 100,
      2
    ) as completion_rate,
    ROUND(AVG(s.score) FILTER (WHERE s.status = 'completed'), 2) as avg_score,
    ROUND(AVG(s.time_spent_seconds) FILTER (WHERE s.status = 'completed'), 0) as avg_time_seconds,
    COUNT(*) FILTER (WHERE s.created_at >= CURRENT_DATE)::BIGINT as submissions_today,
    COUNT(*) FILTER (WHERE s.created_at >= date_trunc('week', CURRENT_DATE))::BIGINT as submissions_this_week,
    COUNT(*) FILTER (WHERE s.created_at >= date_trunc('month', CURRENT_DATE))::BIGINT as submissions_this_month
  FROM public.form_submissions s
  WHERE s.form_id = p_form_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
