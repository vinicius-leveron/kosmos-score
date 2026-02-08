-- ============================================================================
-- KOSMOS Platform - Forms Module Schema
-- ============================================================================
-- Creates the dynamic forms system (TypeForm-like) with:
-- - forms: Form definitions
-- - form_blocks: Sections/groups of fields
-- - form_fields: Individual questions/inputs
-- - form_classifications: Score-based result categories
-- - form_submissions: User responses
-- ============================================================================

-- ============================================================================
-- FORMS TABLE
-- ============================================================================

CREATE TABLE public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant: links to organization
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Identification
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

  -- Settings
  settings JSONB NOT NULL DEFAULT '{
    "showProgressBar": true,
    "allowBack": true,
    "saveProgress": true,
    "progressExpireDays": 7,
    "showQuestionNumbers": true,
    "submitButtonText": "Enviar",
    "requiredFieldIndicator": "*"
  }'::jsonb,

  -- Theme/Branding
  theme JSONB NOT NULL DEFAULT '{
    "primaryColor": "#F97316",
    "backgroundColor": "#0D0D0D",
    "textColor": "#FFFFFF",
    "logoUrl": null,
    "fontFamily": "Inter"
  }'::jsonb,

  -- Scoring Configuration
  scoring_enabled BOOLEAN NOT NULL DEFAULT false,
  scoring_config JSONB DEFAULT '{
    "formula": "average",
    "weights": {},
    "showScoreToRespondent": true,
    "showClassificationToRespondent": true
  }'::jsonb,

  -- Welcome Screen
  welcome_screen JSONB DEFAULT '{
    "enabled": true,
    "title": null,
    "description": null,
    "buttonText": "Começar",
    "collectEmail": true,
    "emailRequired": true
  }'::jsonb,

  -- Thank You Screen
  thank_you_screen JSONB DEFAULT '{
    "enabled": true,
    "title": "Obrigado!",
    "description": null,
    "showScore": true,
    "showClassification": true,
    "ctaButton": null
  }'::jsonb,

  -- CRM Integration
  crm_config JSONB DEFAULT '{
    "createContact": true,
    "emailFieldKey": "email",
    "nameFieldKey": null,
    "phoneFieldKey": null,
    "defaultJourneyStage": null
  }'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,

  -- Created by
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Constraints
  UNIQUE(organization_id, slug)
);

-- ============================================================================
-- FORM BLOCKS TABLE (Sections)
-- ============================================================================

CREATE TABLE public.form_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,

  -- Content
  name TEXT NOT NULL,
  description TEXT,

  -- Display
  show_title BOOLEAN NOT NULL DEFAULT true,

  -- Position (order within form)
  position INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- FORM FIELDS TABLE (Questions/Inputs)
-- ============================================================================

CREATE TABLE public.form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  block_id UUID REFERENCES public.form_blocks(id) ON DELETE SET NULL,

  -- Type
  type TEXT NOT NULL CHECK (type IN (
    'text',           -- Short text input
    'long_text',      -- Textarea
    'email',          -- Email with validation
    'phone',          -- Phone with mask
    'number',         -- Numeric input
    'date',           -- Date picker
    'select',         -- Dropdown single select
    'multi_select',   -- Multiple choice (checkboxes)
    'radio',          -- Single choice (radio buttons)
    'scale',          -- Numeric scale (1-5, 1-10, NPS)
    'statement',      -- Informational text (no input)
    'file'            -- File upload (future)
  )),

  -- Unique key within form (for referencing in conditions)
  key TEXT NOT NULL,

  -- Content
  label TEXT NOT NULL,
  placeholder TEXT,
  help_text TEXT,

  -- Validation
  required BOOLEAN NOT NULL DEFAULT false,
  validation JSONB DEFAULT '{}'::jsonb,
  -- Example validation: { "minLength": 3, "maxLength": 100, "pattern": "..." }

  -- Options (for select, radio, multi_select)
  options JSONB DEFAULT '[]'::jsonb,
  -- Example: [{ "label": "Option 1", "value": "opt1", "numericValue": 10 }]

  -- Scale config (for scale type)
  scale_config JSONB DEFAULT '{}'::jsonb,
  -- Example: { "min": 1, "max": 10, "minLabel": "Discordo", "maxLabel": "Concordo", "step": 1 }

  -- File config (for file type)
  file_config JSONB DEFAULT '{}'::jsonb,
  -- Example: { "acceptedTypes": ["image/*", ".pdf"], "maxSizeMB": 5 }

  -- Conditional Logic
  conditions JSONB DEFAULT '[]'::jsonb,
  -- Example: [{ "logic": "AND", "conditions": [{ "fieldKey": "q1", "operator": "equals", "value": "yes" }] }]

  -- Scoring (if this field contributes to score)
  scoring_weight NUMERIC DEFAULT 1.0,
  pillar TEXT, -- Optional grouping for pillar-based scoring (like causa, cultura, economia)

  -- Position (order within form/block)
  position INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(form_id, key)
);

-- ============================================================================
-- FORM CLASSIFICATIONS TABLE (Score-based categories)
-- ============================================================================

CREATE TABLE public.form_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,

  -- Identification
  name TEXT NOT NULL,
  slug TEXT NOT NULL,

  -- Score range
  min_score NUMERIC NOT NULL,
  max_score NUMERIC NOT NULL,

  -- Display
  color TEXT DEFAULT '#F97316',
  emoji TEXT,
  description TEXT,
  message TEXT, -- Shown to respondent

  -- Position (for ordering)
  position INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE(form_id, slug),
  CHECK (min_score <= max_score)
);

-- ============================================================================
-- FORM SUBMISSIONS TABLE (Responses)
-- ============================================================================

CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,

  -- Respondent identification
  respondent_email TEXT,
  respondent_id UUID, -- If authenticated
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  contact_org_id UUID REFERENCES public.contact_orgs(id) ON DELETE SET NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  -- Answers
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: { "email": { "value": "test@example.com" }, "q1": { "value": "opt1", "numericValue": 10 } }

  -- Progress tracking
  current_field_key TEXT,
  progress_percentage NUMERIC DEFAULT 0,
  last_answered_at TIMESTAMPTZ,

  -- Scoring results
  score NUMERIC,
  pillar_scores JSONB DEFAULT '{}'::jsonb, -- { "causa": 75, "cultura": 60, "economia": 80 }
  classification_id UUID REFERENCES public.form_classifications(id) ON DELETE SET NULL,

  -- Computed data (for complex calculations like lucro_oculto)
  computed_data JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Example: { "userAgent": "...", "referrer": "...", "utmParams": {...}, "ip": "..." }

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Forms
CREATE INDEX idx_forms_organization ON public.forms(organization_id);
CREATE INDEX idx_forms_slug ON public.forms(organization_id, slug);
CREATE INDEX idx_forms_status ON public.forms(status);
CREATE INDEX idx_forms_created_at ON public.forms(created_at DESC);

-- Form Blocks
CREATE INDEX idx_form_blocks_form ON public.form_blocks(form_id);
CREATE INDEX idx_form_blocks_position ON public.form_blocks(form_id, position);

-- Form Fields
CREATE INDEX idx_form_fields_form ON public.form_fields(form_id);
CREATE INDEX idx_form_fields_block ON public.form_fields(block_id);
CREATE INDEX idx_form_fields_position ON public.form_fields(form_id, position);
CREATE INDEX idx_form_fields_key ON public.form_fields(form_id, key);

-- Form Classifications
CREATE INDEX idx_form_classifications_form ON public.form_classifications(form_id);

-- Form Submissions
CREATE INDEX idx_form_submissions_form ON public.form_submissions(form_id);
CREATE INDEX idx_form_submissions_email ON public.form_submissions(respondent_email);
CREATE INDEX idx_form_submissions_status ON public.form_submissions(form_id, status);
CREATE INDEX idx_form_submissions_contact ON public.form_submissions(contact_id);
CREATE INDEX idx_form_submissions_completed ON public.form_submissions(form_id, completed_at DESC);
CREATE INDEX idx_form_submissions_created ON public.form_submissions(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- FORMS POLICIES
-- Select: org members can see their forms, anyone can see published forms (for public access)
CREATE POLICY "forms_select_own" ON public.forms FOR SELECT
  USING (
    organization_id IN (SELECT get_user_org_ids()::uuid)
    OR (status = 'published')
    OR is_kosmos_master()
  );

CREATE POLICY "forms_insert_own" ON public.forms FOR INSERT
  WITH CHECK (organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master());

CREATE POLICY "forms_update_own" ON public.forms FOR UPDATE
  USING (organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master());

CREATE POLICY "forms_delete_own" ON public.forms FOR DELETE
  USING (organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master());

-- FORM BLOCKS POLICIES (inherit from form)
CREATE POLICY "form_blocks_select" ON public.form_blocks FOR SELECT
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid)
         OR status = 'published'
         OR is_kosmos_master()
    )
  );

CREATE POLICY "form_blocks_insert" ON public.form_blocks FOR INSERT
  WITH CHECK (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master()
    )
  );

CREATE POLICY "form_blocks_update" ON public.form_blocks FOR UPDATE
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master()
    )
  );

CREATE POLICY "form_blocks_delete" ON public.form_blocks FOR DELETE
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master()
    )
  );

-- FORM FIELDS POLICIES (inherit from form)
CREATE POLICY "form_fields_select" ON public.form_fields FOR SELECT
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid)
         OR status = 'published'
         OR is_kosmos_master()
    )
  );

CREATE POLICY "form_fields_insert" ON public.form_fields FOR INSERT
  WITH CHECK (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master()
    )
  );

CREATE POLICY "form_fields_update" ON public.form_fields FOR UPDATE
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master()
    )
  );

CREATE POLICY "form_fields_delete" ON public.form_fields FOR DELETE
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master()
    )
  );

-- FORM CLASSIFICATIONS POLICIES (inherit from form)
CREATE POLICY "form_classifications_select" ON public.form_classifications FOR SELECT
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid)
         OR status = 'published'
         OR is_kosmos_master()
    )
  );

CREATE POLICY "form_classifications_insert" ON public.form_classifications FOR INSERT
  WITH CHECK (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master()
    )
  );

CREATE POLICY "form_classifications_update" ON public.form_classifications FOR UPDATE
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master()
    )
  );

CREATE POLICY "form_classifications_delete" ON public.form_classifications FOR DELETE
  USING (
    form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid) OR is_kosmos_master()
    )
  );

-- FORM SUBMISSIONS POLICIES
-- Anyone can create a submission (public lead magnet)
CREATE POLICY "form_submissions_insert_public" ON public.form_submissions FOR INSERT
  WITH CHECK (
    form_id IN (SELECT id FROM public.forms WHERE status = 'published')
  );

-- Respondent can view/update their own submission
CREATE POLICY "form_submissions_select_own" ON public.form_submissions FOR SELECT
  USING (
    -- Own submission (by email or auth id)
    respondent_email = current_setting('request.jwt.claims', true)::jsonb->>'email'
    OR respondent_id = auth.uid()
    -- Or org member
    OR form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid)
    )
    -- Or KOSMOS master
    OR is_kosmos_master()
  );

CREATE POLICY "form_submissions_update_own" ON public.form_submissions FOR UPDATE
  USING (
    -- Own in-progress submission
    (status = 'in_progress' AND (
      respondent_email = current_setting('request.jwt.claims', true)::jsonb->>'email'
      OR respondent_id = auth.uid()
    ))
    -- Or org member
    OR form_id IN (
      SELECT id FROM public.forms
      WHERE organization_id IN (SELECT get_user_org_ids()::uuid)
    )
    -- Or KOSMOS master
    OR is_kosmos_master()
  );

-- ============================================================================
-- TRIGGER: Sync submission to contacts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_form_submission_to_contact()
RETURNS TRIGGER AS $$
DECLARE
  v_form RECORD;
  v_contact_id UUID;
  v_contact_org_id UUID;
  v_default_stage_id UUID;
  v_email TEXT;
  v_name TEXT;
  v_phone TEXT;
BEGIN
  -- Only sync completed submissions
  IF NEW.status != 'completed' THEN
    RETURN NEW;
  END IF;

  -- Get form and its CRM config
  SELECT f.*, f.crm_config, f.organization_id INTO v_form
  FROM public.forms f WHERE f.id = NEW.form_id;

  -- Check if CRM sync is enabled
  IF NOT (v_form.crm_config->>'createContact')::boolean THEN
    RETURN NEW;
  END IF;

  -- Extract email from answers
  v_email := NEW.answers->(v_form.crm_config->>'emailFieldKey')->>'value';
  IF v_email IS NULL THEN
    v_email := NEW.respondent_email;
  END IF;

  IF v_email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Extract name and phone if configured
  IF v_form.crm_config->>'nameFieldKey' IS NOT NULL THEN
    v_name := NEW.answers->(v_form.crm_config->>'nameFieldKey')->>'value';
  END IF;

  IF v_form.crm_config->>'phoneFieldKey' IS NOT NULL THEN
    v_phone := NEW.answers->(v_form.crm_config->>'phoneFieldKey')->>'value';
  END IF;

  -- Get default journey stage
  IF v_form.crm_config->>'defaultJourneyStage' IS NOT NULL THEN
    v_default_stage_id := (v_form.crm_config->>'defaultJourneyStage')::uuid;
  ELSE
    SELECT id INTO v_default_stage_id
    FROM public.journey_stages
    WHERE organization_id = v_form.organization_id
    AND is_default = true
    LIMIT 1;
  END IF;

  -- Upsert contact
  INSERT INTO public.contacts (email, full_name, phone, source, source_detail)
  VALUES (
    lower(trim(v_email)),
    v_name,
    v_phone,
    'form_submission',
    jsonb_build_object(
      'form_id', NEW.form_id,
      'form_name', v_form.name,
      'submission_id', NEW.id
    )
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, contacts.full_name),
    phone = COALESCE(EXCLUDED.phone, contacts.phone),
    source_detail = contacts.source_detail || jsonb_build_object(
      'latest_form_id', NEW.form_id,
      'latest_submission_id', NEW.id
    ),
    updated_at = now()
  RETURNING id INTO v_contact_id;

  -- Upsert contact_org
  INSERT INTO public.contact_orgs (
    contact_id,
    organization_id,
    journey_stage_id,
    score,
    score_breakdown
  )
  VALUES (
    v_contact_id,
    v_form.organization_id,
    v_default_stage_id,
    NEW.score,
    NEW.pillar_scores || jsonb_build_object('computed', NEW.computed_data)
  )
  ON CONFLICT (contact_id, organization_id) DO UPDATE SET
    score = COALESCE(EXCLUDED.score, contact_orgs.score),
    score_breakdown = contact_orgs.score_breakdown || EXCLUDED.score_breakdown,
    updated_at = now()
  RETURNING id INTO v_contact_org_id;

  -- Update submission with contact links
  NEW.contact_id := v_contact_id;
  NEW.contact_org_id := v_contact_org_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS sync_form_submission_to_contact_trigger ON public.form_submissions;

CREATE TRIGGER sync_form_submission_to_contact_trigger
  BEFORE INSERT OR UPDATE ON public.form_submissions
  FOR EACH ROW EXECUTE FUNCTION public.sync_form_submission_to_contact();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get form with all related data
CREATE OR REPLACE FUNCTION public.get_form_with_fields(p_form_id UUID)
RETURNS TABLE (
  form JSONB,
  blocks JSONB,
  fields JSONB,
  classifications JSONB
) AS $$
BEGIN
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

-- Function to get form by slug (for public access)
CREATE OR REPLACE FUNCTION public.get_form_by_slug(p_org_id UUID, p_slug TEXT)
RETURNS TABLE (
  form JSONB,
  blocks JSONB,
  fields JSONB,
  classifications JSONB
) AS $$
DECLARE
  v_form_id UUID;
BEGIN
  SELECT id INTO v_form_id
  FROM public.forms
  WHERE organization_id = p_org_id
    AND slug = p_slug
    AND status = 'published';

  IF v_form_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY SELECT * FROM public.get_form_with_fields(v_form_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get submission statistics
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
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_submissions,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_submissions,
    COUNT(*) FILTER (WHERE status = 'in_progress')::BIGINT as in_progress_submissions,
    COUNT(*) FILTER (WHERE status = 'abandoned')::BIGINT as abandoned_submissions,
    ROUND(
      COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0) * 100,
      2
    ) as completion_rate,
    ROUND(AVG(score) FILTER (WHERE status = 'completed'), 2) as avg_score,
    ROUND(AVG(time_spent_seconds) FILTER (WHERE status = 'completed'), 0) as avg_time_seconds,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::BIGINT as submissions_today,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE))::BIGINT as submissions_this_week,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))::BIGINT as submissions_this_month
  FROM public.form_submissions
  WHERE form_id = p_form_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON public.forms TO anon, authenticated;
GRANT INSERT, UPDATE ON public.forms TO authenticated;
GRANT DELETE ON public.forms TO authenticated;

GRANT SELECT ON public.form_blocks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.form_blocks TO authenticated;

GRANT SELECT ON public.form_fields TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.form_fields TO authenticated;

GRANT SELECT ON public.form_classifications TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.form_classifications TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.form_submissions TO anon, authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_form_with_fields(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_form_by_slug(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_form_stats(UUID) TO authenticated;
