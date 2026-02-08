-- ============================================================================
-- KOSMOS Platform - Phase 1: Foundation
-- ============================================================================
-- This migration creates the core infrastructure for the KOSMOS platform:
-- 1. Identity Layer (organizations, profiles, org_members)
-- 2. CRM Layer (contacts, contact_orgs, journey_stages)
-- 3. RLS helper functions
-- 4. RLS policies
-- 5. Seed data for KOSMOS master org
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Organization types
CREATE TYPE public.org_type AS ENUM ('master', 'client', 'community');

-- Organization status
CREATE TYPE public.org_status AS ENUM ('active', 'suspended', 'churned');

-- Org member roles
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Contact sources
CREATE TYPE public.contact_source AS ENUM ('kosmos_score', 'landing_page', 'manual', 'import', 'referral');

-- Contact org status
CREATE TYPE public.contact_org_status AS ENUM ('active', 'archived', 'unsubscribed');

-- ============================================================================
-- IDENTITY LAYER
-- ============================================================================

-- Organizations (tenants)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type public.org_type NOT NULL DEFAULT 'client',
  status public.org_status NOT NULL DEFAULT 'active',
  settings JSONB NOT NULL DEFAULT '{}',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Org members (who belongs to which org)
CREATE TABLE public.org_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.org_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, profile_id)
);

-- ============================================================================
-- CRM LAYER
-- ============================================================================

-- Journey stages (configurable per org)
CREATE TABLE public.journey_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Contacts (unified, by email)
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  full_name TEXT,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source public.contact_source NOT NULL DEFAULT 'manual',
  source_detail JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contact orgs (contact's relationship with each org)
CREATE TABLE public.contact_orgs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  journey_stage_id UUID REFERENCES public.journey_stages(id) ON DELETE SET NULL,
  score NUMERIC(5,2),
  score_breakdown JSONB NOT NULL DEFAULT '{}',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status public.contact_org_status NOT NULL DEFAULT 'active',
  notes TEXT,
  custom_fields JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_id, organization_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Organizations
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_type ON public.organizations(type);
CREATE INDEX idx_organizations_status ON public.organizations(status);

-- Profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Org members
CREATE INDEX idx_org_members_organization_id ON public.org_members(organization_id);
CREATE INDEX idx_org_members_profile_id ON public.org_members(profile_id);
CREATE INDEX idx_org_members_role ON public.org_members(role);

-- Journey stages
CREATE INDEX idx_journey_stages_organization_id ON public.journey_stages(organization_id);
CREATE INDEX idx_journey_stages_position ON public.journey_stages(organization_id, position);

-- Contacts
CREATE INDEX idx_contacts_email ON public.contacts(email);
CREATE INDEX idx_contacts_profile_id ON public.contacts(profile_id);
CREATE INDEX idx_contacts_source ON public.contacts(source);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at DESC);

-- Contact orgs
CREATE INDEX idx_contact_orgs_contact_id ON public.contact_orgs(contact_id);
CREATE INDEX idx_contact_orgs_organization_id ON public.contact_orgs(organization_id);
CREATE INDEX idx_contact_orgs_journey_stage_id ON public.contact_orgs(journey_stage_id);
CREATE INDEX idx_contact_orgs_owner_id ON public.contact_orgs(owner_id);
CREATE INDEX idx_contact_orgs_status ON public.contact_orgs(status);
CREATE INDEX idx_contact_orgs_score ON public.contact_orgs(score DESC NULLS LAST);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at
  BEFORE UPDATE ON public.org_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journey_stages_updated_at
  BEFORE UPDATE ON public.journey_stages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_orgs_updated_at
  BEFORE UPDATE ON public.contact_orgs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- RLS HELPER FUNCTIONS
-- ============================================================================

-- Get current user's profile ID
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get organization IDs the current user belongs to
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT organization_id
  FROM public.org_members
  WHERE profile_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is a member of a specific org
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.org_members
    WHERE organization_id = org_id
    AND profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user has a specific role in an org
CREATE OR REPLACE FUNCTION public.has_org_role(org_id UUID, required_role public.org_role)
RETURNS BOOLEAN AS $$
DECLARE
  user_role public.org_role;
BEGIN
  SELECT role INTO user_role
  FROM public.org_members
  WHERE organization_id = org_id
  AND profile_id = auth.uid();

  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Role hierarchy: owner > admin > member > viewer
  CASE user_role
    WHEN 'owner' THEN RETURN TRUE;
    WHEN 'admin' THEN RETURN required_role IN ('admin', 'member', 'viewer');
    WHEN 'member' THEN RETURN required_role IN ('member', 'viewer');
    WHEN 'viewer' THEN RETURN required_role = 'viewer';
    ELSE RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if current user is KOSMOS master (admin of master org)
CREATE OR REPLACE FUNCTION public.is_kosmos_master()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.org_members om
    JOIN public.organizations o ON o.id = om.organization_id
    WHERE om.profile_id = auth.uid()
    AND o.type = 'master'
    AND om.role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- ENABLE RLS
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_orgs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - ORGANIZATIONS
-- ============================================================================

-- Anyone can view active organizations (for public pages)
CREATE POLICY "organizations_select_active"
  ON public.organizations FOR SELECT
  USING (status = 'active' OR public.is_kosmos_master());

-- Only org owners/admins can update their org
CREATE POLICY "organizations_update_own"
  ON public.organizations FOR UPDATE
  USING (public.has_org_role(id, 'admin'));

-- Only KOSMOS master can create organizations
CREATE POLICY "organizations_insert_master"
  ON public.organizations FOR INSERT
  WITH CHECK (public.is_kosmos_master());

-- Only KOSMOS master can delete organizations
CREATE POLICY "organizations_delete_master"
  ON public.organizations FOR DELETE
  USING (public.is_kosmos_master());

-- ============================================================================
-- RLS POLICIES - PROFILES
-- ============================================================================

-- Users can view profiles of org members they share an org with
CREATE POLICY "profiles_select_shared_org"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.org_members om1
      JOIN public.org_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.profile_id = auth.uid()
      AND om2.profile_id = profiles.id
    )
    OR public.is_kosmos_master()
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- Profile is created via trigger (see below)
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- RLS POLICIES - ORG_MEMBERS
-- ============================================================================

-- Members can view other members of orgs they belong to
CREATE POLICY "org_members_select_same_org"
  ON public.org_members FOR SELECT
  USING (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- Only owners/admins can add members
CREATE POLICY "org_members_insert_admin"
  ON public.org_members FOR INSERT
  WITH CHECK (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- Only owners/admins can update members
CREATE POLICY "org_members_update_admin"
  ON public.org_members FOR UPDATE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- Only owners can remove members, or users can remove themselves
CREATE POLICY "org_members_delete_owner"
  ON public.org_members FOR DELETE
  USING (
    profile_id = auth.uid()
    OR public.has_org_role(organization_id, 'owner')
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- RLS POLICIES - JOURNEY_STAGES
-- ============================================================================

-- Members can view journey stages of their orgs
CREATE POLICY "journey_stages_select_org"
  ON public.journey_stages FOR SELECT
  USING (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- Only admins can manage journey stages
CREATE POLICY "journey_stages_insert_admin"
  ON public.journey_stages FOR INSERT
  WITH CHECK (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

CREATE POLICY "journey_stages_update_admin"
  ON public.journey_stages FOR UPDATE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

CREATE POLICY "journey_stages_delete_admin"
  ON public.journey_stages FOR DELETE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- RLS POLICIES - CONTACTS
-- ============================================================================

-- Anyone can create a contact (lead magnets are public)
CREATE POLICY "contacts_insert_public"
  ON public.contacts FOR INSERT
  WITH CHECK (true);

-- Users can view contacts that have a contact_org in their orgs
CREATE POLICY "contacts_select_by_org"
  ON public.contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contact_orgs co
      WHERE co.contact_id = contacts.id
      AND co.organization_id IN (SELECT public.get_user_org_ids())
    )
    OR public.is_kosmos_master()
  );

-- Only org members can update contacts linked to their org
CREATE POLICY "contacts_update_by_org"
  ON public.contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.contact_orgs co
      WHERE co.contact_id = contacts.id
      AND co.organization_id IN (SELECT public.get_user_org_ids())
    )
    OR public.is_kosmos_master()
  );

-- Only KOSMOS master can delete contacts
CREATE POLICY "contacts_delete_master"
  ON public.contacts FOR DELETE
  USING (public.is_kosmos_master());

-- ============================================================================
-- RLS POLICIES - CONTACT_ORGS
-- ============================================================================

-- Anyone can create a contact_org (for lead magnets linking to KOSMOS)
CREATE POLICY "contact_orgs_insert_public"
  ON public.contact_orgs FOR INSERT
  WITH CHECK (true);

-- Members can view contact_orgs of their orgs
CREATE POLICY "contact_orgs_select_org"
  ON public.contact_orgs FOR SELECT
  USING (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- Members can update contact_orgs of their orgs
CREATE POLICY "contact_orgs_update_org"
  ON public.contact_orgs FOR UPDATE
  USING (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- Only admins can delete contact_orgs
CREATE POLICY "contact_orgs_delete_admin"
  ON public.contact_orgs FOR DELETE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- SEED DATA - KOSMOS MASTER ORG
-- ============================================================================

-- Create KOSMOS master organization
INSERT INTO public.organizations (id, slug, name, type, status, settings)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'kosmos',
  'KOSMOS',
  'master',
  'active',
  '{"theme": "dark", "features": ["crm", "toolkit", "content", "community"]}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Create default journey stages for KOSMOS
INSERT INTO public.journey_stages (organization_id, name, display_name, description, position, color, is_default)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'lead_magnet', 'Lead Magnet', 'Leads vindos de ferramentas gratuitas', 0, '#6366f1', true),
  ('c0000000-0000-0000-0000-000000000001', 'sales_room', 'Sala de Vendas', 'Leads em processo de qualificacao', 1, '#f59e0b', false),
  ('c0000000-0000-0000-0000-000000000001', 'client', 'Cliente', 'Clientes ativos do servico', 2, '#10b981', false),
  ('c0000000-0000-0000-0000-000000000001', 'member', 'Membro', 'Membros da comunidade', 3, '#8b5cf6', false),
  ('c0000000-0000-0000-0000-000000000001', 'churned', 'Churned', 'Clientes/membros inativos', 4, '#ef4444', false)
ON CONFLICT (organization_id, name) DO NOTHING;

-- ============================================================================
-- HELPER: UPSERT CONTACT
-- ============================================================================

-- Function to upsert a contact and link to an org (for lead magnets)
CREATE OR REPLACE FUNCTION public.upsert_contact_with_org(
  p_email TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_source public.contact_source DEFAULT 'kosmos_score',
  p_source_detail JSONB DEFAULT '{}',
  p_organization_id UUID DEFAULT 'c0000000-0000-0000-0000-000000000001',
  p_score NUMERIC DEFAULT NULL,
  p_score_breakdown JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_contact_id UUID;
  v_contact_org_id UUID;
  v_default_stage_id UUID;
BEGIN
  -- Upsert contact
  INSERT INTO public.contacts (email, full_name, phone, source, source_detail)
  VALUES (lower(trim(p_email)), p_full_name, p_phone, p_source, p_source_detail)
  ON CONFLICT (email) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, contacts.full_name),
    phone = COALESCE(EXCLUDED.phone, contacts.phone),
    updated_at = now()
  RETURNING id INTO v_contact_id;

  -- Get default journey stage for the org
  SELECT id INTO v_default_stage_id
  FROM public.journey_stages
  WHERE organization_id = p_organization_id
  AND is_default = true
  LIMIT 1;

  -- Upsert contact_org
  INSERT INTO public.contact_orgs (
    contact_id, organization_id, journey_stage_id, score, score_breakdown
  )
  VALUES (
    v_contact_id, p_organization_id, v_default_stage_id, p_score, p_score_breakdown
  )
  ON CONFLICT (contact_id, organization_id) DO UPDATE SET
    score = COALESCE(EXCLUDED.score, contact_orgs.score),
    score_breakdown = CASE
      WHEN EXCLUDED.score IS NOT NULL THEN EXCLUDED.score_breakdown
      ELSE contact_orgs.score_breakdown
    END,
    updated_at = now()
  RETURNING id INTO v_contact_org_id;

  RETURN v_contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
