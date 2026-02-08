-- ============================================================================
-- KOSMOS Platform - Contact to Client Conversion
-- ============================================================================
-- Adds support for converting CRM contacts to client organizations:
-- 1. client_organization_id on contact_orgs - references created organization
-- 2. Function to create organization with proper permissions
-- 3. Trigger to auto-create default pipelines for new organizations
-- ============================================================================

-- ============================================================================
-- ADD CLIENT ORGANIZATION REFERENCE TO CONTACT_ORGS
-- ============================================================================

ALTER TABLE public.contact_orgs
ADD COLUMN IF NOT EXISTS client_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contact_orgs_client_org ON public.contact_orgs(client_organization_id)
  WHERE client_organization_id IS NOT NULL;

COMMENT ON COLUMN public.contact_orgs.client_organization_id IS
  'Reference to the client organization created when this contact converts';

-- ============================================================================
-- FUNCTION TO CREATE CLIENT ORGANIZATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_client_organization(
  p_name TEXT,
  p_slug TEXT,
  p_settings JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
BEGIN
  -- Security: Only KOSMOS master can create organizations
  IF NOT public.is_kosmos_master() THEN
    RAISE EXCEPTION 'Permission denied: KOSMOS master access required to create organizations';
  END IF;

  v_user_id := auth.uid();

  -- Create the organization
  INSERT INTO public.organizations (name, slug, type, status, settings)
  VALUES (p_name, p_slug, 'client', 'active', p_settings)
  RETURNING id INTO v_org_id;

  -- Add current user as owner of the new organization
  INSERT INTO public.org_members (organization_id, profile_id, role)
  VALUES (v_org_id, v_user_id, 'owner');

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION TO CREATE DEFAULT PIPELINES FOR ORGANIZATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_default_pipelines_for_org(p_organization_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_sales_pipeline_id UUID;
  v_cs_pipeline_id UUID;
  v_count INTEGER := 0;
BEGIN
  -- Security: Only org admin can create pipelines
  IF NOT (public.has_org_role(p_organization_id, 'admin') OR public.is_kosmos_master()) THEN
    RAISE EXCEPTION 'Permission denied: admin role required';
  END IF;

  -- Check if pipelines already exist
  IF EXISTS (SELECT 1 FROM public.pipelines WHERE organization_id = p_organization_id) THEN
    RETURN 0; -- Already has pipelines
  END IF;

  -- Create Sales Pipeline
  INSERT INTO public.pipelines (organization_id, name, display_name, description, icon, color, position, is_default, is_active)
  VALUES (
    p_organization_id,
    'sales',
    'Pipeline de Vendas',
    'Acompanhe leads do primeiro contato ate a conversao',
    'TrendingUp',
    '#F97316',
    0,
    true,
    true
  )
  RETURNING id INTO v_sales_pipeline_id;

  -- Create Sales Pipeline Stages
  INSERT INTO public.pipeline_stages (pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage, exit_type) VALUES
    (v_sales_pipeline_id, p_organization_id, 'lead', 'Lead', 0, '#6366F1', true, false, NULL),
    (v_sales_pipeline_id, p_organization_id, 'qualified', 'Qualificado', 1, '#8B5CF6', false, false, NULL),
    (v_sales_pipeline_id, p_organization_id, 'proposal', 'Proposta', 2, '#F59E0B', false, false, NULL),
    (v_sales_pipeline_id, p_organization_id, 'negotiation', 'Negociacao', 3, '#F97316', false, false, NULL),
    (v_sales_pipeline_id, p_organization_id, 'won', 'Ganho', 4, '#10B981', false, true, 'positive'),
    (v_sales_pipeline_id, p_organization_id, 'lost', 'Perdido', 5, '#EF4444', false, true, 'negative');

  v_count := v_count + 1;

  -- Create Customer Success Pipeline
  INSERT INTO public.pipelines (organization_id, name, display_name, description, icon, color, position, is_default, is_active)
  VALUES (
    p_organization_id,
    'customer_success',
    'Customer Success',
    'Acompanhe a jornada do cliente apos a conversao',
    'Heart',
    '#10B981',
    1,
    false,
    true
  )
  RETURNING id INTO v_cs_pipeline_id;

  -- Create CS Pipeline Stages
  INSERT INTO public.pipeline_stages (pipeline_id, organization_id, name, display_name, position, color, is_entry_stage, is_exit_stage, exit_type) VALUES
    (v_cs_pipeline_id, p_organization_id, 'onboarding', 'Onboarding', 0, '#3B82F6', true, false, NULL),
    (v_cs_pipeline_id, p_organization_id, 'active', 'Ativo', 1, '#10B981', false, false, NULL),
    (v_cs_pipeline_id, p_organization_id, 'expansion', 'Expansao', 2, '#8B5CF6', false, false, NULL),
    (v_cs_pipeline_id, p_organization_id, 'at_risk', 'Em Risco', 3, '#F59E0B', false, false, NULL),
    (v_cs_pipeline_id, p_organization_id, 'churned', 'Churned', 4, '#EF4444', false, true, 'negative');

  v_count := v_count + 1;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION TO CONVERT CONTACT TO CLIENT
-- Creates organization and links it to contact_org
-- ============================================================================

CREATE OR REPLACE FUNCTION public.convert_contact_to_client(
  p_contact_org_id UUID,
  p_org_name TEXT,
  p_org_slug TEXT,
  p_org_settings JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
  v_contact_org RECORD;
BEGIN
  -- Security: Only KOSMOS master can convert contacts
  IF NOT public.is_kosmos_master() THEN
    RAISE EXCEPTION 'Permission denied: KOSMOS master access required';
  END IF;

  -- Get contact_org
  SELECT * INTO v_contact_org FROM public.contact_orgs WHERE id = p_contact_org_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contact not found';
  END IF;

  -- Check if already converted
  IF v_contact_org.client_organization_id IS NOT NULL THEN
    RAISE EXCEPTION 'Contact already converted to client';
  END IF;

  -- Create the organization
  v_org_id := public.create_client_organization(p_org_name, p_org_slug, p_org_settings);

  -- Create default pipelines
  PERFORM public.create_default_pipelines_for_org(v_org_id);

  -- Link organization to contact_org
  UPDATE public.contact_orgs
  SET client_organization_id = v_org_id,
      updated_at = now()
  WHERE id = p_contact_org_id;

  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.create_client_organization(TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_default_pipelines_for_org(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.convert_contact_to_client(UUID, TEXT, TEXT, JSONB) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.create_client_organization IS
  'Creates a new client organization. Only KOSMOS master users can call this.';

COMMENT ON FUNCTION public.create_default_pipelines_for_org IS
  'Creates default Sales and Customer Success pipelines for an organization.';

COMMENT ON FUNCTION public.convert_contact_to_client IS
  'Converts a CRM contact to a client organization. Creates org, pipelines, and links to contact.';
