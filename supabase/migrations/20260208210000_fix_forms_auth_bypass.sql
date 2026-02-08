-- ============================================================================
-- FIX: Ensure authenticated users can create forms in KOSMOS org
-- ============================================================================

-- The issue is that the RLS policies check get_user_org_ids() which may not
-- work correctly for all authenticated users. This policy ensures that any
-- authenticated user can create forms in the KOSMOS org.

-- Drop old dev bypass (it was for anon users)
DROP POLICY IF EXISTS "forms_dev_bypass" ON public.forms;

-- Create proper authenticated bypass for KOSMOS org
CREATE POLICY "forms_kosmos_authenticated" ON public.forms FOR ALL
  TO authenticated
  USING (organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid);

-- Also allow anon for public form viewing
CREATE POLICY "forms_kosmos_anon_select" ON public.forms FOR SELECT
  TO anon
  USING (
    organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid
    AND status = 'published'
  );

-- Form Blocks - authenticated bypass
DROP POLICY IF EXISTS "form_blocks_dev_bypass" ON public.form_blocks;
CREATE POLICY "form_blocks_kosmos_authenticated" ON public.form_blocks FOR ALL
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid
    )
  )
  WITH CHECK (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid
    )
  );

-- Form Fields - authenticated bypass
DROP POLICY IF EXISTS "form_fields_dev_bypass" ON public.form_fields;
CREATE POLICY "form_fields_kosmos_authenticated" ON public.form_fields FOR ALL
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid
    )
  )
  WITH CHECK (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid
    )
  );

-- Form Classifications - authenticated bypass
DROP POLICY IF EXISTS "form_classifications_dev_bypass" ON public.form_classifications;
CREATE POLICY "form_classifications_kosmos_authenticated" ON public.form_classifications FOR ALL
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid
    )
  )
  WITH CHECK (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid
    )
  );

-- Form Submissions - authenticated bypass
DROP POLICY IF EXISTS "form_submissions_dev_bypass" ON public.form_submissions;
CREATE POLICY "form_submissions_kosmos_authenticated" ON public.form_submissions FOR ALL
  TO authenticated
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid
    )
  )
  WITH CHECK (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid
    )
  );
