-- ============================================================================
-- KOSMOS Platform - B2B CRM: Data Migration
-- ============================================================================
-- Migrates existing contacts to companies and creates deals from pipeline positions

-- ============================================================================
-- STEP 1: Create companies from existing contact emails
-- ============================================================================

INSERT INTO public.companies (organization_id, name, domain)
SELECT DISTINCT
  co.organization_id,
  initcap(split_part(lower(split_part(c.email, '@', 2)), '.', 1)) as name,
  lower(split_part(c.email, '@', 2)) as domain
FROM public.contact_orgs co
JOIN public.contacts c ON c.id = co.contact_id
WHERE lower(split_part(c.email, '@', 2)) NOT IN (
  'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com',
  'icloud.com', 'live.com', 'uol.com.br', 'bol.com.br', 'terra.com.br'
)
AND split_part(c.email, '@', 2) IS NOT NULL
AND split_part(c.email, '@', 2) != ''
ON CONFLICT (organization_id, domain) DO NOTHING;

-- ============================================================================
-- STEP 2: Link existing contacts to their companies
-- ============================================================================

INSERT INTO public.contact_companies (contact_org_id, company_id, is_primary)
SELECT
  co.id as contact_org_id,
  comp.id as company_id,
  true as is_primary
FROM public.contact_orgs co
JOIN public.contacts c ON c.id = co.contact_id
JOIN public.companies comp ON
  comp.organization_id = co.organization_id
  AND comp.domain = lower(split_part(c.email, '@', 2))
ON CONFLICT (contact_org_id, company_id) DO NOTHING;

-- ============================================================================
-- STEP 3: Create deals from contact_pipeline_positions
-- ============================================================================

INSERT INTO public.deals (
  organization_id,
  name,
  company_id,
  primary_contact_id,
  owner_id,
  pipeline_id,
  stage_id,
  entered_stage_at,
  entered_pipeline_at,
  status,
  source
)
SELECT
  co.organization_id,
  COALESCE(c.full_name, c.email) || ' - Oportunidade' as name,
  cc.company_id,
  cpp.contact_org_id as primary_contact_id,
  cpp.owner_id,
  cpp.pipeline_id,
  cpp.stage_id,
  cpp.entered_stage_at,
  cpp.entered_pipeline_at,
  CASE
    WHEN ps.exit_type = 'positive' THEN 'won'::public.deal_status
    WHEN ps.exit_type = 'negative' THEN 'lost'::public.deal_status
    ELSE 'open'::public.deal_status
  END as status,
  c.source::TEXT
FROM public.contact_pipeline_positions cpp
JOIN public.contact_orgs co ON co.id = cpp.contact_org_id
JOIN public.contacts c ON c.id = co.contact_id
JOIN public.pipeline_stages ps ON ps.id = cpp.stage_id
LEFT JOIN public.contact_companies cc ON cc.contact_org_id = cpp.contact_org_id AND cc.is_primary = true
WHERE cc.company_id IS NOT NULL;

-- ============================================================================
-- STEP 4: Link deal contacts
-- ============================================================================

INSERT INTO public.deal_contacts (deal_id, contact_org_id, is_primary)
SELECT
  d.id as deal_id,
  d.primary_contact_id as contact_org_id,
  true as is_primary
FROM public.deals d
WHERE d.primary_contact_id IS NOT NULL
ON CONFLICT (deal_id, contact_org_id) DO NOTHING;
