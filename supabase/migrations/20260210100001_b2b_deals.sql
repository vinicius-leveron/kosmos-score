-- ============================================================================
-- KOSMOS Platform - B2B CRM: Deals (Opportunities)
-- ============================================================================

-- Deal status enum
CREATE TYPE public.deal_status AS ENUM ('open', 'won', 'lost', 'abandoned');

-- Deals Table
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(15,2),
  currency TEXT DEFAULT 'BRL',
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  expected_revenue NUMERIC(15,2) GENERATED ALWAYS AS (amount * probability / 100.0) STORED,
  expected_close_date DATE,
  actual_close_date DATE,
  status public.deal_status NOT NULL DEFAULT 'open',
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  primary_contact_id UUID REFERENCES public.contact_orgs(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE SET NULL,
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  entered_stage_at TIMESTAMPTZ DEFAULT now(),
  entered_pipeline_at TIMESTAMPTZ DEFAULT now(),
  close_reason TEXT,
  competitor_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  source TEXT,
  source_detail JSONB DEFAULT '{}',
  custom_fields JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deal-Contact Junction
CREATE TABLE public.deal_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  contact_org_id UUID NOT NULL REFERENCES public.contact_orgs(id) ON DELETE CASCADE,
  role public.contact_role,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deal_id, contact_org_id)
);

-- Deal Activities
CREATE TABLE public.deal_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'email_sent', 'call', 'meeting', 'proposal_sent', 'stage_changed', 'amount_changed', 'close_date_changed', 'won', 'lost', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_deals_org ON public.deals(organization_id);
CREATE INDEX idx_deals_company ON public.deals(company_id);
CREATE INDEX idx_deals_pipeline ON public.deals(pipeline_id);
CREATE INDEX idx_deals_stage ON public.deals(stage_id);
CREATE INDEX idx_deals_status ON public.deals(organization_id, status);
CREATE INDEX idx_deals_owner ON public.deals(owner_id);
CREATE INDEX idx_deals_close_date ON public.deals(expected_close_date) WHERE status = 'open';

CREATE INDEX idx_deal_contacts_deal ON public.deal_contacts(deal_id);
CREATE INDEX idx_deal_contacts_contact ON public.deal_contacts(contact_org_id);

CREATE INDEX idx_deal_activities_deal ON public.deal_activities(deal_id);
CREATE INDEX idx_deal_activities_created ON public.deal_activities(deal_id, created_at DESC);

-- Triggers
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Log deal stage changes
CREATE OR REPLACE FUNCTION public.log_deal_stage_change()
RETURNS TRIGGER AS $$
DECLARE
  v_old_stage_name TEXT;
  v_new_stage_name TEXT;
BEGIN
  IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    SELECT display_name INTO v_old_stage_name FROM public.pipeline_stages WHERE id = OLD.stage_id;
    SELECT display_name INTO v_new_stage_name FROM public.pipeline_stages WHERE id = NEW.stage_id;

    INSERT INTO public.deal_activities (deal_id, type, title, metadata, actor_id)
    VALUES (
      NEW.id,
      'stage_changed',
      'Movido para ' || COALESCE(v_new_stage_name, 'desconhecido'),
      jsonb_build_object('from_stage_id', OLD.stage_id, 'from_stage_name', v_old_stage_name, 'to_stage_id', NEW.stage_id, 'to_stage_name', v_new_stage_name),
      auth.uid()
    );

    NEW.entered_stage_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_deal_stage_change_trigger BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.log_deal_stage_change();

-- RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "deals_select" ON public.deals FOR SELECT USING (public.is_org_member(organization_id) OR public.is_kosmos_master());
CREATE POLICY "deals_insert" ON public.deals FOR INSERT WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());
CREATE POLICY "deals_update" ON public.deals FOR UPDATE USING (public.is_org_member(organization_id) OR public.is_kosmos_master());
CREATE POLICY "deals_delete" ON public.deals FOR DELETE USING (public.has_org_role(organization_id, 'admin') OR public.is_kosmos_master());

CREATE POLICY "deal_contacts_all" ON public.deal_contacts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_contacts.deal_id AND public.is_org_member(d.organization_id))
  OR public.is_kosmos_master()
);

CREATE POLICY "deal_activities_select" ON public.deal_activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_activities.deal_id AND public.is_org_member(d.organization_id))
  OR public.is_kosmos_master()
);

CREATE POLICY "deal_activities_insert" ON public.deal_activities FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_activities.deal_id AND public.is_org_member(d.organization_id))
  OR public.is_kosmos_master()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.deal_contacts TO authenticated;
GRANT SELECT, INSERT ON public.deal_activities TO authenticated;
