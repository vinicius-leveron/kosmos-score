-- ============================================================================
-- KOSMOS Platform - Multi-Pipeline CRM Architecture
-- ============================================================================
-- This migration creates support for multiple independent pipelines:
-- 1. pipelines table - defines pipeline types (Sales, CS, Marketing)
-- 2. pipeline_stages table - stages belong to pipelines
-- 3. contact_pipeline_positions - contact position in each pipeline
-- 4. RLS policies
-- 5. Triggers for activity logging
-- ============================================================================

-- ============================================================================
-- NEW ENUMS
-- ============================================================================

-- Pipeline exit types
CREATE TYPE public.pipeline_exit_type AS ENUM ('positive', 'negative', 'neutral');

-- ============================================================================
-- PIPELINES TABLE
-- ============================================================================

CREATE TABLE public.pipelines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  position INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- ============================================================================
-- PIPELINE STAGES TABLE
-- ============================================================================

CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_entry_stage BOOLEAN NOT NULL DEFAULT false,
  is_exit_stage BOOLEAN NOT NULL DEFAULT false,
  exit_type public.pipeline_exit_type,
  automation_rules JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pipeline_id, name)
);

-- ============================================================================
-- CONTACT PIPELINE POSITIONS TABLE
-- ============================================================================

CREATE TABLE public.contact_pipeline_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_org_id UUID NOT NULL REFERENCES public.contact_orgs(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.pipeline_stages(id) ON DELETE RESTRICT,
  entered_stage_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  entered_pipeline_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  custom_fields JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_org_id, pipeline_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Pipelines
CREATE INDEX idx_pipelines_organization_id ON public.pipelines(organization_id);
CREATE INDEX idx_pipelines_position ON public.pipelines(organization_id, position);
CREATE INDEX idx_pipelines_is_default ON public.pipelines(organization_id, is_default) WHERE is_default = true;

-- Pipeline stages
CREATE INDEX idx_pipeline_stages_pipeline_id ON public.pipeline_stages(pipeline_id);
CREATE INDEX idx_pipeline_stages_organization_id ON public.pipeline_stages(organization_id);
CREATE INDEX idx_pipeline_stages_position ON public.pipeline_stages(pipeline_id, position);
CREATE INDEX idx_pipeline_stages_entry ON public.pipeline_stages(pipeline_id) WHERE is_entry_stage = true;
CREATE INDEX idx_pipeline_stages_exit ON public.pipeline_stages(pipeline_id) WHERE is_exit_stage = true;

-- Contact pipeline positions
CREATE INDEX idx_contact_pipeline_positions_contact_org_id ON public.contact_pipeline_positions(contact_org_id);
CREATE INDEX idx_contact_pipeline_positions_pipeline_id ON public.contact_pipeline_positions(pipeline_id);
CREATE INDEX idx_contact_pipeline_positions_stage_id ON public.contact_pipeline_positions(stage_id);
CREATE INDEX idx_contact_pipeline_positions_owner_id ON public.contact_pipeline_positions(owner_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_pipelines_updated_at
  BEFORE UPDATE ON public.pipelines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pipeline_stages_updated_at
  BEFORE UPDATE ON public.pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_pipeline_positions_updated_at
  BEFORE UPDATE ON public.contact_pipeline_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ACTIVITY LOGGING TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_pipeline_stage_change()
RETURNS TRIGGER AS $$
DECLARE
  v_old_stage_name TEXT;
  v_new_stage_name TEXT;
  v_pipeline_name TEXT;
BEGIN
  IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    SELECT display_name INTO v_old_stage_name FROM public.pipeline_stages WHERE id = OLD.stage_id;
    SELECT display_name INTO v_new_stage_name FROM public.pipeline_stages WHERE id = NEW.stage_id;
    SELECT display_name INTO v_pipeline_name FROM public.pipelines WHERE id = NEW.pipeline_id;

    INSERT INTO public.activities (
      contact_org_id, type, title, metadata, actor_id
    ) VALUES (
      NEW.contact_org_id,
      'stage_changed',
      'Movido para ' || COALESCE(v_new_stage_name, 'desconhecido') || ' em ' || COALESCE(v_pipeline_name, 'pipeline'),
      jsonb_build_object(
        'pipeline_id', NEW.pipeline_id,
        'pipeline_name', v_pipeline_name,
        'from_stage_id', OLD.stage_id,
        'from_stage_name', v_old_stage_name,
        'to_stage_id', NEW.stage_id,
        'to_stage_name', v_new_stage_name
      ),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_contact_pipeline_stage_change
  AFTER UPDATE ON public.contact_pipeline_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_pipeline_stage_change();

-- ============================================================================
-- RLS ENABLE
-- ============================================================================

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_pipeline_positions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - PIPELINES
-- ============================================================================

-- Anyone in org can view pipelines
CREATE POLICY "pipelines_select_org"
  ON public.pipelines FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
    OR public.is_kosmos_master()
  );

-- Admins can create pipelines
CREATE POLICY "pipelines_insert_admin"
  ON public.pipelines FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE organization_id = pipelines.organization_id
      AND profile_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
    OR public.is_kosmos_master()
  );

-- Admins can update pipelines
CREATE POLICY "pipelines_update_admin"
  ON public.pipelines FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE organization_id = pipelines.organization_id
      AND profile_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
    OR public.is_kosmos_master()
  );

-- Admins can delete pipelines
CREATE POLICY "pipelines_delete_admin"
  ON public.pipelines FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE organization_id = pipelines.organization_id
      AND profile_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- RLS POLICIES - PIPELINE STAGES
-- ============================================================================

-- Anyone in org can view stages
CREATE POLICY "pipeline_stages_select_org"
  ON public.pipeline_stages FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
    )
    OR public.is_kosmos_master()
  );

-- Admins can create stages
CREATE POLICY "pipeline_stages_insert_admin"
  ON public.pipeline_stages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE organization_id = pipeline_stages.organization_id
      AND profile_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
    OR public.is_kosmos_master()
  );

-- Admins can update stages
CREATE POLICY "pipeline_stages_update_admin"
  ON public.pipeline_stages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE organization_id = pipeline_stages.organization_id
      AND profile_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
    OR public.is_kosmos_master()
  );

-- Admins can delete stages
CREATE POLICY "pipeline_stages_delete_admin"
  ON public.pipeline_stages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE organization_id = pipeline_stages.organization_id
      AND profile_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- RLS POLICIES - CONTACT PIPELINE POSITIONS
-- ============================================================================

-- Anyone in org can view positions (via contact_org)
CREATE POLICY "contact_pipeline_positions_select"
  ON public.contact_pipeline_positions FOR SELECT
  USING (
    contact_org_id IN (
      SELECT id FROM public.contact_orgs
      WHERE organization_id IN (
        SELECT organization_id FROM public.org_members WHERE profile_id = auth.uid()
      )
    )
    OR public.is_kosmos_master()
  );

-- Members can create positions
CREATE POLICY "contact_pipeline_positions_insert"
  ON public.contact_pipeline_positions FOR INSERT
  WITH CHECK (
    contact_org_id IN (
      SELECT id FROM public.contact_orgs
      WHERE organization_id IN (
        SELECT organization_id FROM public.org_members
        WHERE profile_id = auth.uid()
        AND role IN ('member', 'admin', 'owner')
      )
    )
    OR public.is_kosmos_master()
  );

-- Members can update positions
CREATE POLICY "contact_pipeline_positions_update"
  ON public.contact_pipeline_positions FOR UPDATE
  USING (
    contact_org_id IN (
      SELECT id FROM public.contact_orgs
      WHERE organization_id IN (
        SELECT organization_id FROM public.org_members
        WHERE profile_id = auth.uid()
        AND role IN ('member', 'admin', 'owner')
      )
    )
    OR public.is_kosmos_master()
  );

-- Admins can delete positions
CREATE POLICY "contact_pipeline_positions_delete"
  ON public.contact_pipeline_positions FOR DELETE
  USING (
    contact_org_id IN (
      SELECT id FROM public.contact_orgs
      WHERE organization_id IN (
        SELECT organization_id FROM public.org_members
        WHERE profile_id = auth.uid()
        AND role IN ('admin', 'owner')
      )
    )
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- DEV MODE: Allow public read for pipeline tables (like journey_stages)
-- ============================================================================

-- Drop restrictive policies temporarily for dev
DROP POLICY IF EXISTS "pipelines_select_org" ON public.pipelines;
DROP POLICY IF EXISTS "pipeline_stages_select_org" ON public.pipeline_stages;

-- Create permissive policies for dev
CREATE POLICY "pipelines_select_public"
  ON public.pipelines FOR SELECT
  USING (true);

CREATE POLICY "pipeline_stages_select_public"
  ON public.pipeline_stages FOR SELECT
  USING (true);
