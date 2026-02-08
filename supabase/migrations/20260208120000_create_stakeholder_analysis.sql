-- ============================================================================
-- KOSMOS Platform - Stakeholder Analysis Module
-- ============================================================================
-- Creates the stakeholder management system for tracking financial partners:
-- - stakeholders: Investors, partners, co-founders, advisors
-- - stakeholder_relationships: Connections between stakeholders
-- - stakeholder_interactions: Activity tracking and timeline
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Stakeholder types
CREATE TYPE public.stakeholder_type AS ENUM (
  'investor',
  'partner',
  'co_founder',
  'advisor'
);

-- Stakeholder status
CREATE TYPE public.stakeholder_status AS ENUM (
  'active',
  'inactive',
  'exited'
);

-- Relationship types between stakeholders
CREATE TYPE public.stakeholder_relationship_type AS ENUM (
  'co_investor',
  'referral',
  'mentor',
  'partner'
);

-- Interaction types
CREATE TYPE public.stakeholder_interaction_type AS ENUM (
  'meeting',
  'mentoring',
  'referral',
  'decision',
  'investment'
);

-- ============================================================================
-- STAKEHOLDERS TABLE
-- ============================================================================

CREATE TABLE public.stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant: links to organization
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Optional link to existing contact
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,

  -- Profile information
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  expertise TEXT[] DEFAULT '{}',
  sector TEXT,
  linkedin_url TEXT,

  -- Historical data
  joined_at DATE,
  stakeholder_type public.stakeholder_type NOT NULL DEFAULT 'partner',
  participation_pct NUMERIC(5,2) CHECK (participation_pct IS NULL OR (participation_pct >= 0 AND participation_pct <= 100)),
  investment_amount NUMERIC(12,2) CHECK (investment_amount IS NULL OR investment_amount >= 0),

  -- Scoring
  contribution_score NUMERIC(5,2) DEFAULT 0 CHECK (contribution_score >= 0),
  score_breakdown JSONB NOT NULL DEFAULT '{}',

  -- Metadata
  status public.stakeholder_status NOT NULL DEFAULT 'active',
  custom_fields JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique email per organization (if email is provided)
  UNIQUE NULLS NOT DISTINCT (organization_id, email)
);

-- ============================================================================
-- STAKEHOLDER_RELATIONSHIPS TABLE
-- ============================================================================

CREATE TABLE public.stakeholder_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant: links to organization
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- The two stakeholders in the relationship
  stakeholder_a_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  stakeholder_b_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,

  -- Relationship details
  relationship_type public.stakeholder_relationship_type NOT NULL,
  description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Prevent duplicate relationships (A-B same as B-A)
  CONSTRAINT stakeholder_relationship_order CHECK (stakeholder_a_id < stakeholder_b_id),
  UNIQUE (organization_id, stakeholder_a_id, stakeholder_b_id)
);

-- ============================================================================
-- STAKEHOLDER_INTERACTIONS TABLE
-- ============================================================================

CREATE TABLE public.stakeholder_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant: links to organization
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Link to stakeholder
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,

  -- Interaction details
  interaction_type public.stakeholder_interaction_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact_score INTEGER CHECK (impact_score IS NULL OR (impact_score >= 1 AND impact_score <= 5)),
  occurred_at DATE NOT NULL,

  -- Who created this interaction
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Stakeholders
CREATE INDEX idx_stakeholders_organization ON public.stakeholders(organization_id);
CREATE INDEX idx_stakeholders_contact ON public.stakeholders(contact_id);
CREATE INDEX idx_stakeholders_type ON public.stakeholders(organization_id, stakeholder_type);
CREATE INDEX idx_stakeholders_status ON public.stakeholders(organization_id, status);
CREATE INDEX idx_stakeholders_email ON public.stakeholders(organization_id, email);
CREATE INDEX idx_stakeholders_score ON public.stakeholders(organization_id, contribution_score DESC);
CREATE INDEX idx_stakeholders_created_at ON public.stakeholders(created_at DESC);

-- Stakeholder Relationships
CREATE INDEX idx_stakeholder_relationships_organization ON public.stakeholder_relationships(organization_id);
CREATE INDEX idx_stakeholder_relationships_stakeholder_a ON public.stakeholder_relationships(stakeholder_a_id);
CREATE INDEX idx_stakeholder_relationships_stakeholder_b ON public.stakeholder_relationships(stakeholder_b_id);
CREATE INDEX idx_stakeholder_relationships_type ON public.stakeholder_relationships(organization_id, relationship_type);

-- Stakeholder Interactions
CREATE INDEX idx_stakeholder_interactions_organization ON public.stakeholder_interactions(organization_id);
CREATE INDEX idx_stakeholder_interactions_stakeholder ON public.stakeholder_interactions(stakeholder_id);
CREATE INDEX idx_stakeholder_interactions_type ON public.stakeholder_interactions(organization_id, interaction_type);
CREATE INDEX idx_stakeholder_interactions_occurred_at ON public.stakeholder_interactions(occurred_at DESC);
CREATE INDEX idx_stakeholder_interactions_created_by ON public.stakeholder_interactions(created_by);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER update_stakeholders_updated_at
  BEFORE UPDATE ON public.stakeholders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_interactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - STAKEHOLDERS
-- ============================================================================

-- Members can view stakeholders in their orgs
CREATE POLICY "stakeholders_select_org" ON public.stakeholders FOR SELECT
  USING (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- Only admins can create stakeholders
CREATE POLICY "stakeholders_insert_admin" ON public.stakeholders FOR INSERT
  WITH CHECK (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- Only admins can update stakeholders
CREATE POLICY "stakeholders_update_admin" ON public.stakeholders FOR UPDATE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- Only owners can delete stakeholders
CREATE POLICY "stakeholders_delete_owner" ON public.stakeholders FOR DELETE
  USING (
    public.has_org_role(organization_id, 'owner')
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- RLS POLICIES - STAKEHOLDER_RELATIONSHIPS
-- ============================================================================

-- Members can view relationships in their orgs
CREATE POLICY "stakeholder_relationships_select_org" ON public.stakeholder_relationships FOR SELECT
  USING (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- Only admins can create relationships
CREATE POLICY "stakeholder_relationships_insert_admin" ON public.stakeholder_relationships FOR INSERT
  WITH CHECK (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- Only admins can update relationships
CREATE POLICY "stakeholder_relationships_update_admin" ON public.stakeholder_relationships FOR UPDATE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- Only admins can delete relationships
CREATE POLICY "stakeholder_relationships_delete_admin" ON public.stakeholder_relationships FOR DELETE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- RLS POLICIES - STAKEHOLDER_INTERACTIONS
-- ============================================================================

-- Members can view interactions in their orgs
CREATE POLICY "stakeholder_interactions_select_org" ON public.stakeholder_interactions FOR SELECT
  USING (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- Members can create interactions in their orgs
CREATE POLICY "stakeholder_interactions_insert_org" ON public.stakeholder_interactions FOR INSERT
  WITH CHECK (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- Only the creator or admins can update an interaction
CREATE POLICY "stakeholder_interactions_update_own" ON public.stakeholder_interactions FOR UPDATE
  USING (
    created_by = auth.uid()
    OR public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- Only admins can delete interactions
CREATE POLICY "stakeholder_interactions_delete_admin" ON public.stakeholder_interactions FOR DELETE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get stakeholder with their relationships count
CREATE OR REPLACE FUNCTION public.get_stakeholder_summary(p_stakeholder_id UUID)
RETURNS TABLE (
  id UUID,
  organization_id UUID,
  full_name TEXT,
  email TEXT,
  stakeholder_type public.stakeholder_type,
  status public.stakeholder_status,
  participation_pct NUMERIC,
  investment_amount NUMERIC,
  contribution_score NUMERIC,
  relationships_count BIGINT,
  interactions_count BIGINT,
  last_interaction_at DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.organization_id,
    s.full_name,
    s.email,
    s.stakeholder_type,
    s.status,
    s.participation_pct,
    s.investment_amount,
    s.contribution_score,
    (
      SELECT COUNT(*)
      FROM public.stakeholder_relationships sr
      WHERE sr.stakeholder_a_id = s.id OR sr.stakeholder_b_id = s.id
    ) as relationships_count,
    (
      SELECT COUNT(*)
      FROM public.stakeholder_interactions si
      WHERE si.stakeholder_id = s.id
    ) as interactions_count,
    (
      SELECT MAX(si.occurred_at)
      FROM public.stakeholder_interactions si
      WHERE si.stakeholder_id = s.id
    ) as last_interaction_at
  FROM public.stakeholders s
  WHERE s.id = p_stakeholder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get stakeholder relationships (both directions)
CREATE OR REPLACE FUNCTION public.get_stakeholder_relationships(p_stakeholder_id UUID)
RETURNS TABLE (
  relationship_id UUID,
  related_stakeholder_id UUID,
  related_stakeholder_name TEXT,
  related_stakeholder_type public.stakeholder_type,
  relationship_type public.stakeholder_relationship_type,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.id as relationship_id,
    CASE
      WHEN sr.stakeholder_a_id = p_stakeholder_id THEN sr.stakeholder_b_id
      ELSE sr.stakeholder_a_id
    END as related_stakeholder_id,
    s.full_name as related_stakeholder_name,
    s.stakeholder_type as related_stakeholder_type,
    sr.relationship_type,
    sr.description
  FROM public.stakeholder_relationships sr
  JOIN public.stakeholders s ON s.id = CASE
    WHEN sr.stakeholder_a_id = p_stakeholder_id THEN sr.stakeholder_b_id
    ELSE sr.stakeholder_a_id
  END
  WHERE sr.stakeholder_a_id = p_stakeholder_id OR sr.stakeholder_b_id = p_stakeholder_id
  ORDER BY s.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get stakeholder interactions with pagination
CREATE OR REPLACE FUNCTION public.get_stakeholder_interactions(
  p_stakeholder_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  interaction_type public.stakeholder_interaction_type,
  title TEXT,
  description TEXT,
  impact_score INTEGER,
  occurred_at DATE,
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.id,
    si.interaction_type,
    si.title,
    si.description,
    si.impact_score,
    si.occurred_at,
    si.created_by,
    p.full_name as created_by_name,
    si.created_at
  FROM public.stakeholder_interactions si
  LEFT JOIN public.profiles p ON p.id = si.created_by
  WHERE si.stakeholder_id = p_stakeholder_id
  ORDER BY si.occurred_at DESC, si.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get organization stakeholder statistics
CREATE OR REPLACE FUNCTION public.get_stakeholder_stats(p_organization_id UUID)
RETURNS TABLE (
  total_stakeholders BIGINT,
  active_stakeholders BIGINT,
  total_investment NUMERIC,
  total_participation_pct NUMERIC,
  avg_contribution_score NUMERIC,
  stakeholders_by_type JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_stakeholders,
    COUNT(*) FILTER (WHERE s.status = 'active') as active_stakeholders,
    COALESCE(SUM(s.investment_amount) FILTER (WHERE s.status = 'active'), 0) as total_investment,
    COALESCE(SUM(s.participation_pct) FILTER (WHERE s.status = 'active'), 0) as total_participation_pct,
    COALESCE(AVG(s.contribution_score) FILTER (WHERE s.status = 'active'), 0) as avg_contribution_score,
    jsonb_object_agg(
      s.stakeholder_type::TEXT,
      type_counts.count
    ) as stakeholders_by_type
  FROM public.stakeholders s
  LEFT JOIN LATERAL (
    SELECT s2.stakeholder_type, COUNT(*) as count
    FROM public.stakeholders s2
    WHERE s2.organization_id = p_organization_id AND s2.status = 'active'
    GROUP BY s2.stakeholder_type
  ) type_counts ON type_counts.stakeholder_type = s.stakeholder_type
  WHERE s.organization_id = p_organization_id
  GROUP BY type_counts.stakeholder_type, type_counts.count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Simpler stats function for organization overview
CREATE OR REPLACE FUNCTION public.get_org_stakeholder_overview(p_organization_id UUID)
RETURNS TABLE (
  total_stakeholders BIGINT,
  active_stakeholders BIGINT,
  investors_count BIGINT,
  partners_count BIGINT,
  advisors_count BIGINT,
  cofounders_count BIGINT,
  total_investment NUMERIC,
  total_participation NUMERIC,
  avg_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_stakeholders,
    COUNT(*) FILTER (WHERE s.status = 'active') as active_stakeholders,
    COUNT(*) FILTER (WHERE s.stakeholder_type = 'investor' AND s.status = 'active') as investors_count,
    COUNT(*) FILTER (WHERE s.stakeholder_type = 'partner' AND s.status = 'active') as partners_count,
    COUNT(*) FILTER (WHERE s.stakeholder_type = 'advisor' AND s.status = 'active') as advisors_count,
    COUNT(*) FILTER (WHERE s.stakeholder_type = 'co_founder' AND s.status = 'active') as cofounders_count,
    COALESCE(SUM(s.investment_amount) FILTER (WHERE s.status = 'active'), 0) as total_investment,
    COALESCE(SUM(s.participation_pct) FILTER (WHERE s.status = 'active'), 0) as total_participation,
    ROUND(COALESCE(AVG(s.contribution_score) FILTER (WHERE s.status = 'active'), 0), 2) as avg_score
  FROM public.stakeholders s
  WHERE s.organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stakeholders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stakeholder_relationships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stakeholder_interactions TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_stakeholder_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_stakeholder_relationships(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_stakeholder_interactions(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_stakeholder_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_org_stakeholder_overview(UUID) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.stakeholders IS 'Financial stakeholders of the community (investors, partners, co-founders, advisors)';
COMMENT ON TABLE public.stakeholder_relationships IS 'Relationships between stakeholders in the same organization';
COMMENT ON TABLE public.stakeholder_interactions IS 'Timeline of activities and interactions with stakeholders';

COMMENT ON COLUMN public.stakeholders.participation_pct IS 'Percentage of participation/equity (0-100)';
COMMENT ON COLUMN public.stakeholders.investment_amount IS 'Total investment amount in the organization currency';
COMMENT ON COLUMN public.stakeholders.contribution_score IS 'Calculated score based on stakeholder contributions';
COMMENT ON COLUMN public.stakeholders.score_breakdown IS 'JSON breakdown of contribution score components';
COMMENT ON COLUMN public.stakeholders.expertise IS 'Array of expertise areas/skills';

COMMENT ON COLUMN public.stakeholder_relationships.stakeholder_a_id IS 'First stakeholder (must have smaller UUID)';
COMMENT ON COLUMN public.stakeholder_relationships.stakeholder_b_id IS 'Second stakeholder (must have larger UUID)';

COMMENT ON COLUMN public.stakeholder_interactions.impact_score IS 'Impact rating from 1 (low) to 5 (high)';
