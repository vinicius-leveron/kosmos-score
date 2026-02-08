-- ============================================================================
-- KOSMOS Platform - Migrate Existing Data to Multi-Pipeline
-- ============================================================================
-- This migration:
-- 1. Creates a default "Vendas" pipeline for each organization with journey_stages
-- 2. Copies journey_stages to pipeline_stages
-- 3. Creates contact_pipeline_positions from contact_orgs.journey_stage_id
-- ============================================================================

-- ============================================================================
-- STEP 1: Create default pipelines for orgs with existing stages
-- ============================================================================

INSERT INTO public.pipelines (organization_id, name, display_name, description, icon, color, position, is_default, is_active)
SELECT DISTINCT
  js.organization_id,
  'sales',
  'Vendas',
  'Pipeline de vendas principal',
  'target',
  '#3B82F6',
  0,
  true,
  true
FROM public.journey_stages js
ON CONFLICT (organization_id, name) DO NOTHING;

-- ============================================================================
-- STEP 2: Copy journey_stages to pipeline_stages
-- ============================================================================

INSERT INTO public.pipeline_stages (
  pipeline_id,
  organization_id,
  name,
  display_name,
  description,
  position,
  color,
  is_entry_stage,
  is_exit_stage,
  exit_type
)
SELECT
  p.id as pipeline_id,
  js.organization_id,
  js.name,
  js.display_name,
  js.description,
  js.position,
  js.color,
  js.position = 0 as is_entry_stage,  -- First stage is entry
  js.name IN ('churned', 'closed_won', 'closed_lost') as is_exit_stage,
  CASE
    WHEN js.name = 'churned' THEN 'negative'::public.pipeline_exit_type
    WHEN js.name = 'closed_lost' THEN 'negative'::public.pipeline_exit_type
    WHEN js.name = 'closed_won' THEN 'positive'::public.pipeline_exit_type
    ELSE NULL
  END as exit_type
FROM public.journey_stages js
JOIN public.pipelines p ON p.organization_id = js.organization_id AND p.name = 'sales'
ON CONFLICT (pipeline_id, name) DO NOTHING;

-- ============================================================================
-- STEP 3: Create contact_pipeline_positions from contact_orgs
-- ============================================================================

-- Create a mapping from old journey_stage_id to new pipeline_stage_id
INSERT INTO public.contact_pipeline_positions (
  contact_org_id,
  pipeline_id,
  stage_id,
  entered_stage_at,
  entered_pipeline_at
)
SELECT
  co.id as contact_org_id,
  p.id as pipeline_id,
  ps.id as stage_id,
  co.updated_at as entered_stage_at,
  co.created_at as entered_pipeline_at
FROM public.contact_orgs co
JOIN public.journey_stages js ON js.id = co.journey_stage_id
JOIN public.pipelines p ON p.organization_id = co.organization_id AND p.name = 'sales'
JOIN public.pipeline_stages ps ON ps.pipeline_id = p.id AND ps.name = js.name
WHERE co.journey_stage_id IS NOT NULL
ON CONFLICT (contact_org_id, pipeline_id) DO NOTHING;

-- ============================================================================
-- STEP 4: Create additional pipeline templates for KOSMOS org
-- ============================================================================

-- Get KOSMOS org ID
DO $$
DECLARE
  v_kosmos_org_id UUID;
  v_cs_pipeline_id UUID;
  v_marketing_pipeline_id UUID;
BEGIN
  SELECT id INTO v_kosmos_org_id FROM public.organizations WHERE slug = 'kosmos' LIMIT 1;

  IF v_kosmos_org_id IS NOT NULL THEN
    -- Create Customer Success pipeline
    INSERT INTO public.pipelines (organization_id, name, display_name, description, icon, color, position, is_default, is_active)
    VALUES (v_kosmos_org_id, 'customer_success', 'Customer Success', 'Pipeline de sucesso do cliente', 'users', '#10B981', 1, false, true)
    ON CONFLICT (organization_id, name) DO NOTHING
    RETURNING id INTO v_cs_pipeline_id;

    -- If pipeline was created, add stages
    IF v_cs_pipeline_id IS NOT NULL THEN
      INSERT INTO public.pipeline_stages (pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage, exit_type)
      VALUES
        (v_cs_pipeline_id, v_kosmos_org_id, 'onboarding', 'Onboarding', 0, '#3B82F6', true, false, NULL),
        (v_cs_pipeline_id, v_kosmos_org_id, 'active', 'Ativo', 1, '#10B981', false, false, NULL),
        (v_cs_pipeline_id, v_kosmos_org_id, 'expansion', 'Expansão', 2, '#8B5CF6', false, false, NULL),
        (v_cs_pipeline_id, v_kosmos_org_id, 'at_risk', 'Em Risco', 3, '#F59E0B', false, false, NULL),
        (v_cs_pipeline_id, v_kosmos_org_id, 'churned', 'Churned', 4, '#EF4444', false, true, 'negative')
      ON CONFLICT (pipeline_id, name) DO NOTHING;
    END IF;

    -- Create Marketing pipeline
    INSERT INTO public.pipelines (organization_id, name, display_name, description, icon, color, position, is_default, is_active)
    VALUES (v_kosmos_org_id, 'marketing', 'Marketing', 'Pipeline de marketing e awareness', 'megaphone', '#EC4899', 2, false, true)
    ON CONFLICT (organization_id, name) DO NOTHING
    RETURNING id INTO v_marketing_pipeline_id;

    -- If pipeline was created, add stages
    IF v_marketing_pipeline_id IS NOT NULL THEN
      INSERT INTO public.pipeline_stages (pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage, exit_type)
      VALUES
        (v_marketing_pipeline_id, v_kosmos_org_id, 'awareness', 'Conhecimento', 0, '#6366f1', true, false, NULL),
        (v_marketing_pipeline_id, v_kosmos_org_id, 'consideration', 'Consideração', 1, '#8B5CF6', false, false, NULL),
        (v_marketing_pipeline_id, v_kosmos_org_id, 'decision', 'Decisão', 2, '#F59E0B', false, false, NULL),
        (v_marketing_pipeline_id, v_kosmos_org_id, 'advocacy', 'Advocacia', 3, '#10B981', false, true, 'positive')
      ON CONFLICT (pipeline_id, name) DO NOTHING;
    END IF;
  END IF;
END $$;
