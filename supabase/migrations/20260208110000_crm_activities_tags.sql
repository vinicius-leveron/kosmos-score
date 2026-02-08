-- ============================================================================
-- KOSMOS Platform - CRM Activities & Tags
-- ============================================================================
-- Creates the CRM activity tracking and tagging system:
-- - activities: Timeline of interactions with contacts
-- - tags: Organization-scoped labels
-- - contact_tags: Junction table for contact tagging
-- ============================================================================

-- ============================================================================
-- ACTIVITIES TABLE (Timeline of interactions)
-- ============================================================================

CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to contact_org (the contact within an organization context)
  contact_org_id UUID NOT NULL REFERENCES public.contact_orgs(id) ON DELETE CASCADE,

  -- Type of activity
  type TEXT NOT NULL CHECK (type IN (
    'note',             -- Manual note added by user
    'email_sent',       -- Email was sent
    'email_opened',     -- Email was opened
    'email_clicked',    -- Link in email was clicked
    'email_bounced',    -- Email bounced
    'call',             -- Phone call
    'meeting',          -- Meeting/appointment
    'form_submitted',   -- Form/survey completed
    'stage_changed',    -- Journey stage changed
    'score_changed',    -- KOSMOS score changed
    'tag_added',        -- Tag was added
    'tag_removed',      -- Tag was removed
    'owner_assigned',   -- Owner was assigned
    'whatsapp_sent',    -- WhatsApp message sent
    'whatsapp_read',    -- WhatsApp message read
    'custom'            -- Custom activity type
  )),

  -- Content
  title TEXT NOT NULL,
  description TEXT,

  -- Additional data (flexible schema for different activity types)
  metadata JSONB NOT NULL DEFAULT '{}',
  -- Examples:
  -- stage_changed: { "from_stage": "lead", "to_stage": "qualified" }
  -- score_changed: { "old_score": 45, "new_score": 72 }
  -- email_sent: { "subject": "Welcome!", "template_id": "..." }

  -- Reference to related entity (optional)
  reference_type TEXT,  -- 'form_submission', 'email', 'deal', etc.
  reference_id UUID,    -- ID of the referenced entity

  -- Who performed the action (null for system actions)
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TAGS TABLE (Organization-scoped labels)
-- ============================================================================

CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant: links to organization
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Tag info
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique tag name per organization
  UNIQUE(organization_id, name)
);

-- ============================================================================
-- CONTACT_TAGS TABLE (Junction table)
-- ============================================================================

CREATE TABLE public.contact_tags (
  -- Link to contact_org (not contact, because tags are org-scoped)
  contact_org_id UUID NOT NULL REFERENCES public.contact_orgs(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,

  -- Metadata
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Primary key
  PRIMARY KEY (contact_org_id, tag_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Activities
CREATE INDEX idx_activities_contact_org ON public.activities(contact_org_id);
CREATE INDEX idx_activities_type ON public.activities(type);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX idx_activities_actor ON public.activities(actor_id);
CREATE INDEX idx_activities_reference ON public.activities(reference_type, reference_id);

-- Tags
CREATE INDEX idx_tags_organization ON public.tags(organization_id);
CREATE INDEX idx_tags_name ON public.tags(organization_id, name);

-- Contact Tags
CREATE INDEX idx_contact_tags_contact_org ON public.contact_tags(contact_org_id);
CREATE INDEX idx_contact_tags_tag ON public.contact_tags(tag_id);

-- ============================================================================
-- UPDATED_AT TRIGGER FOR TAGS
-- ============================================================================

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - ACTIVITIES
-- ============================================================================

-- Members can view activities of contacts in their orgs
CREATE POLICY "activities_select_org" ON public.activities FOR SELECT
  USING (
    contact_org_id IN (
      SELECT id FROM public.contact_orgs
      WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
    OR public.is_kosmos_master()
  );

-- Members can create activities for contacts in their orgs
CREATE POLICY "activities_insert_org" ON public.activities FOR INSERT
  WITH CHECK (
    contact_org_id IN (
      SELECT id FROM public.contact_orgs
      WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
    OR public.is_kosmos_master()
  );

-- Only the actor or admins can update an activity
CREATE POLICY "activities_update_own" ON public.activities FOR UPDATE
  USING (
    actor_id = auth.uid()
    OR public.is_kosmos_master()
  );

-- Only admins can delete activities
CREATE POLICY "activities_delete_admin" ON public.activities FOR DELETE
  USING (
    contact_org_id IN (
      SELECT co.id FROM public.contact_orgs co
      WHERE public.has_org_role(co.organization_id, 'admin')
    )
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- RLS POLICIES - TAGS
-- ============================================================================

-- Members can view tags in their orgs
CREATE POLICY "tags_select_org" ON public.tags FOR SELECT
  USING (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- Only admins can create tags
CREATE POLICY "tags_insert_admin" ON public.tags FOR INSERT
  WITH CHECK (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- Only admins can update tags
CREATE POLICY "tags_update_admin" ON public.tags FOR UPDATE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- Only admins can delete tags
CREATE POLICY "tags_delete_admin" ON public.tags FOR DELETE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- RLS POLICIES - CONTACT_TAGS
-- ============================================================================

-- Members can view contact tags in their orgs
CREATE POLICY "contact_tags_select_org" ON public.contact_tags FOR SELECT
  USING (
    contact_org_id IN (
      SELECT id FROM public.contact_orgs
      WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
    OR public.is_kosmos_master()
  );

-- Members can add tags to contacts in their orgs
CREATE POLICY "contact_tags_insert_org" ON public.contact_tags FOR INSERT
  WITH CHECK (
    contact_org_id IN (
      SELECT id FROM public.contact_orgs
      WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
    OR public.is_kosmos_master()
  );

-- Members can remove tags from contacts in their orgs
CREATE POLICY "contact_tags_delete_org" ON public.contact_tags FOR DELETE
  USING (
    contact_org_id IN (
      SELECT id FROM public.contact_orgs
      WHERE organization_id IN (SELECT public.get_user_org_ids())
    )
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- TRIGGER: Log stage changes as activities
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_stage_change()
RETURNS TRIGGER AS $$
DECLARE
  v_old_stage_name TEXT;
  v_new_stage_name TEXT;
BEGIN
  -- Only log if journey_stage_id actually changed
  IF OLD.journey_stage_id IS DISTINCT FROM NEW.journey_stage_id THEN
    -- Get stage names
    SELECT display_name INTO v_old_stage_name
    FROM public.journey_stages WHERE id = OLD.journey_stage_id;

    SELECT display_name INTO v_new_stage_name
    FROM public.journey_stages WHERE id = NEW.journey_stage_id;

    -- Insert activity
    INSERT INTO public.activities (
      contact_org_id,
      type,
      title,
      metadata,
      actor_id
    ) VALUES (
      NEW.id,
      'stage_changed',
      'Estágio alterado para ' || COALESCE(v_new_stage_name, 'Sem estágio'),
      jsonb_build_object(
        'from_stage_id', OLD.journey_stage_id,
        'from_stage_name', v_old_stage_name,
        'to_stage_id', NEW.journey_stage_id,
        'to_stage_name', v_new_stage_name
      ),
      auth.uid()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_contact_org_stage_change
  AFTER UPDATE ON public.contact_orgs
  FOR EACH ROW EXECUTE FUNCTION public.log_stage_change();

-- ============================================================================
-- TRIGGER: Log score changes as activities
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_score_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if score actually changed significantly (more than 1 point)
  IF OLD.score IS DISTINCT FROM NEW.score
     AND ABS(COALESCE(NEW.score, 0) - COALESCE(OLD.score, 0)) >= 1 THEN

    INSERT INTO public.activities (
      contact_org_id,
      type,
      title,
      metadata
    ) VALUES (
      NEW.id,
      'score_changed',
      'Score alterado de ' || COALESCE(OLD.score::TEXT, '?') || ' para ' || COALESCE(NEW.score::TEXT, '?'),
      jsonb_build_object(
        'old_score', OLD.score,
        'new_score', NEW.score,
        'change', COALESCE(NEW.score, 0) - COALESCE(OLD.score, 0)
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_contact_org_score_change
  AFTER UPDATE ON public.contact_orgs
  FOR EACH ROW EXECUTE FUNCTION public.log_score_change();

-- ============================================================================
-- TRIGGER: Log tag additions as activities
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_tag_added()
RETURNS TRIGGER AS $$
DECLARE
  v_tag_name TEXT;
BEGIN
  SELECT name INTO v_tag_name FROM public.tags WHERE id = NEW.tag_id;

  INSERT INTO public.activities (
    contact_org_id,
    type,
    title,
    metadata,
    actor_id
  ) VALUES (
    NEW.contact_org_id,
    'tag_added',
    'Tag adicionada: ' || COALESCE(v_tag_name, 'Desconhecida'),
    jsonb_build_object('tag_id', NEW.tag_id, 'tag_name', v_tag_name),
    NEW.added_by
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_contact_tag_added
  AFTER INSERT ON public.contact_tags
  FOR EACH ROW EXECUTE FUNCTION public.log_tag_added();

-- ============================================================================
-- TRIGGER: Log tag removals as activities
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_tag_removed()
RETURNS TRIGGER AS $$
DECLARE
  v_tag_name TEXT;
BEGIN
  SELECT name INTO v_tag_name FROM public.tags WHERE id = OLD.tag_id;

  INSERT INTO public.activities (
    contact_org_id,
    type,
    title,
    metadata,
    actor_id
  ) VALUES (
    OLD.contact_org_id,
    'tag_removed',
    'Tag removida: ' || COALESCE(v_tag_name, 'Desconhecida'),
    jsonb_build_object('tag_id', OLD.tag_id, 'tag_name', v_tag_name),
    auth.uid()
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_contact_tag_removed
  AFTER DELETE ON public.contact_tags
  FOR EACH ROW EXECUTE FUNCTION public.log_tag_removed();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get activities for a contact_org with pagination
CREATE OR REPLACE FUNCTION public.get_contact_activities(
  p_contact_org_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  metadata JSONB,
  reference_type TEXT,
  reference_id UUID,
  actor_id UUID,
  actor_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.type,
    a.title,
    a.description,
    a.metadata,
    a.reference_type,
    a.reference_id,
    a.actor_id,
    p.full_name as actor_name,
    a.created_at
  FROM public.activities a
  LEFT JOIN public.profiles p ON p.id = a.actor_id
  WHERE a.contact_org_id = p_contact_org_id
  ORDER BY a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get tags for a contact_org
CREATE OR REPLACE FUNCTION public.get_contact_tags(p_contact_org_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  color TEXT,
  added_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.color,
    ct.added_at
  FROM public.contact_tags ct
  JOIN public.tags t ON t.id = ct.tag_id
  WHERE ct.contact_org_id = p_contact_org_id
  ORDER BY ct.added_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get contacts by tag
CREATE OR REPLACE FUNCTION public.get_contacts_by_tag(p_tag_id UUID)
RETURNS TABLE (
  contact_org_id UUID,
  contact_id UUID,
  email TEXT,
  full_name TEXT,
  score NUMERIC,
  added_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    co.id as contact_org_id,
    c.id as contact_id,
    c.email,
    c.full_name,
    co.score,
    ct.added_at
  FROM public.contact_tags ct
  JOIN public.contact_orgs co ON co.id = ct.contact_org_id
  JOIN public.contacts c ON c.id = co.contact_id
  WHERE ct.tag_id = p_tag_id
  ORDER BY ct.added_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.contact_tags TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_contact_activities(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_contact_tags(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_contacts_by_tag(UUID) TO authenticated;

-- ============================================================================
-- SEED DATA - Default tags for KOSMOS org
-- ============================================================================

INSERT INTO public.tags (organization_id, name, color, description)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Hot Lead', '#ef4444', 'Lead com alta probabilidade de conversão'),
  ('c0000000-0000-0000-0000-000000000001', 'Iniciante', '#3b82f6', 'Está começando na jornada'),
  ('c0000000-0000-0000-0000-000000000001', 'Avançado', '#8b5cf6', 'Já tem experiência com comunidades'),
  ('c0000000-0000-0000-0000-000000000001', 'VIP', '#f59e0b', 'Cliente/membro especial'),
  ('c0000000-0000-0000-0000-000000000001', 'Reengajar', '#6366f1', 'Precisa de follow-up')
ON CONFLICT (organization_id, name) DO NOTHING;
