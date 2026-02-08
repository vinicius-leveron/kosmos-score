-- ============================================================================
-- KOSMOS Platform - B2B CRM: Companies & Contact-Company Relationships
-- ============================================================================

-- ENUMs
CREATE TYPE public.company_status AS ENUM ('prospect', 'customer', 'churned', 'partner', 'competitor');
CREATE TYPE public.company_size AS ENUM ('solo', 'micro', 'small', 'medium', 'large', 'enterprise');
CREATE TYPE public.contact_role AS ENUM ('decision_maker', 'influencer', 'champion', 'blocker', 'end_user', 'technical', 'financial', 'other');

-- Companies Table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT,
  domains TEXT[] DEFAULT '{}',
  website TEXT,
  industry TEXT,
  size public.company_size,
  employee_count INTEGER,
  annual_revenue NUMERIC(15,2),
  description TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  status public.company_status NOT NULL DEFAULT 'prospect',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  linkedin_url TEXT,
  custom_fields JSONB NOT NULL DEFAULT '{}',
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, domain)
);

-- Contact-Company Junction
CREATE TABLE public.contact_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_org_id UUID NOT NULL REFERENCES public.contact_orgs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT,
  role public.contact_role,
  department TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  started_at DATE,
  ended_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(contact_org_id, company_id)
);

-- Indexes
CREATE INDEX idx_companies_org ON public.companies(organization_id);
CREATE INDEX idx_companies_domain ON public.companies(organization_id, domain);
CREATE INDEX idx_companies_status ON public.companies(organization_id, status);
CREATE INDEX idx_contact_companies_contact ON public.contact_companies(contact_org_id);
CREATE INDEX idx_contact_companies_company ON public.contact_companies(company_id);

-- Triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_companies_updated_at BEFORE UPDATE ON public.contact_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "companies_select" ON public.companies FOR SELECT USING (public.is_org_member(organization_id) OR public.is_kosmos_master());
CREATE POLICY "companies_insert" ON public.companies FOR INSERT WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());
CREATE POLICY "companies_update" ON public.companies FOR UPDATE USING (public.is_org_member(organization_id) OR public.is_kosmos_master());
CREATE POLICY "companies_delete" ON public.companies FOR DELETE USING (public.has_org_role(organization_id, 'admin') OR public.is_kosmos_master());

CREATE POLICY "contact_companies_all" ON public.contact_companies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies c WHERE c.id = contact_companies.company_id AND public.is_org_member(c.organization_id))
  OR public.is_kosmos_master()
);

-- Helper: Check if personal email domain
CREATE OR REPLACE FUNCTION public.is_personal_email_domain(p_domain TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN lower(p_domain) IN ('gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'live.com', 'uol.com.br', 'bol.com.br', 'terra.com.br');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper: Get or create company from email
CREATE OR REPLACE FUNCTION public.get_or_create_company_from_email(p_email TEXT, p_organization_id UUID)
RETURNS UUID AS $$
DECLARE
  v_domain TEXT;
  v_company_id UUID;
BEGIN
  v_domain := lower(split_part(p_email, '@', 2));
  IF public.is_personal_email_domain(v_domain) THEN RETURN NULL; END IF;

  SELECT id INTO v_company_id FROM public.companies
  WHERE organization_id = p_organization_id AND (domain = v_domain OR v_domain = ANY(domains)) LIMIT 1;

  IF v_company_id IS NULL THEN
    INSERT INTO public.companies (organization_id, name, domain)
    VALUES (p_organization_id, initcap(split_part(v_domain, '.', 1)), v_domain)
    RETURNING id INTO v_company_id;
  END IF;

  RETURN v_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_companies TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_personal_email_domain(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_company_from_email(TEXT, UUID) TO authenticated;
