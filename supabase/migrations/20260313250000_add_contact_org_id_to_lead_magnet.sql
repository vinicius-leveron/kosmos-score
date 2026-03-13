-- ============================================================================
-- Add contact_org_id to lead_magnet_results and update CHECK constraint
-- ============================================================================

-- 1. Add contact_org_id column for CRM integration
ALTER TABLE public.lead_magnet_results
ADD COLUMN IF NOT EXISTS contact_org_id UUID REFERENCES public.contact_orgs(id) ON DELETE SET NULL;

-- 2. Add index for lookups
CREATE INDEX IF NOT EXISTS idx_lead_magnet_results_contact_org_id
  ON public.lead_magnet_results(contact_org_id);

-- 3. Update CHECK constraint to include new lead magnet types
-- First, drop old constraint
ALTER TABLE public.lead_magnet_results
DROP CONSTRAINT IF EXISTS lead_magnet_results_lead_magnet_type_check;

-- Add new constraint with all types
ALTER TABLE public.lead_magnet_results
ADD CONSTRAINT lead_magnet_results_lead_magnet_type_check
CHECK (
  lead_magnet_type IN (
    'ecosystem-calculator',
    'ht-readiness',
    'ht-template',
    'transition-calculator',
    'maturity-diagnostic',
    'raio-x-kosmos'
  )
);

COMMENT ON COLUMN public.lead_magnet_results.contact_org_id IS
  'Reference to the contact_org record when lead is synced to CRM';
