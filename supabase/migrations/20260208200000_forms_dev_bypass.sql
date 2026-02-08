-- ============================================================================
-- DEVELOPMENT BYPASS: Allow access to KOSMOS org for anonymous users
-- This should be removed or restricted in production with proper auth
-- ============================================================================

-- KOSMOS Development Organization ID
-- This allows the forms module to work without authentication during development

-- Forms: Allow all operations for KOSMOS org
DROP POLICY IF EXISTS "forms_dev_bypass" ON public.forms;
CREATE POLICY "forms_dev_bypass" ON public.forms FOR ALL
  USING (organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid);

-- Form Blocks: Allow all operations for forms in KOSMOS org
DROP POLICY IF EXISTS "form_blocks_dev_bypass" ON public.form_blocks;
CREATE POLICY "form_blocks_dev_bypass" ON public.form_blocks FOR ALL
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

-- Form Fields: Allow all operations for forms in KOSMOS org
DROP POLICY IF EXISTS "form_fields_dev_bypass" ON public.form_fields;
CREATE POLICY "form_fields_dev_bypass" ON public.form_fields FOR ALL
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

-- Form Classifications: Allow all operations for forms in KOSMOS org
DROP POLICY IF EXISTS "form_classifications_dev_bypass" ON public.form_classifications;
CREATE POLICY "form_classifications_dev_bypass" ON public.form_classifications FOR ALL
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

-- Form Submissions: Already has public insert policy, add dev bypass for management
DROP POLICY IF EXISTS "form_submissions_dev_bypass" ON public.form_submissions;
CREATE POLICY "form_submissions_dev_bypass" ON public.form_submissions FOR ALL
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
