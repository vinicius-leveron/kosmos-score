-- ============================================================================
-- KOSMOS Platform - Stakeholder Analysis RLS Fixes
-- ============================================================================
-- Addresses security improvements identified by RLS validation:
-- 1. Add WITH CHECK to UPDATE policies
-- 2. Add cross-organization validation triggers
-- ============================================================================

-- ============================================================================
-- FIX 1: Add WITH CHECK to UPDATE policies
-- ============================================================================

-- Stakeholders UPDATE
DROP POLICY IF EXISTS "stakeholders_update_admin" ON public.stakeholders;
CREATE POLICY "stakeholders_update_admin" ON public.stakeholders FOR UPDATE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  )
  WITH CHECK (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- Stakeholder Relationships UPDATE
DROP POLICY IF EXISTS "stakeholder_relationships_update_admin" ON public.stakeholder_relationships;
CREATE POLICY "stakeholder_relationships_update_admin" ON public.stakeholder_relationships FOR UPDATE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  )
  WITH CHECK (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- Stakeholder Interactions UPDATE
DROP POLICY IF EXISTS "stakeholder_interactions_update_own" ON public.stakeholder_interactions;
CREATE POLICY "stakeholder_interactions_update_own" ON public.stakeholder_interactions FOR UPDATE
  USING (
    created_by = auth.uid()
    OR public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  )
  WITH CHECK (
    created_by = auth.uid()
    OR public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- FIX 2: Cross-organization validation triggers
-- ============================================================================

-- Validate stakeholder relationships belong to same org
CREATE OR REPLACE FUNCTION public.validate_stakeholder_relationship()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.stakeholders
    WHERE id = NEW.stakeholder_a_id
    AND organization_id = NEW.organization_id
  ) THEN
    RAISE EXCEPTION 'stakeholder_a_id must belong to the same organization';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.stakeholders
    WHERE id = NEW.stakeholder_b_id
    AND organization_id = NEW.organization_id
  ) THEN
    RAISE EXCEPTION 'stakeholder_b_id must belong to the same organization';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_stakeholder_relationship_trigger ON public.stakeholder_relationships;
CREATE TRIGGER validate_stakeholder_relationship_trigger
  BEFORE INSERT OR UPDATE ON public.stakeholder_relationships
  FOR EACH ROW EXECUTE FUNCTION public.validate_stakeholder_relationship();

-- Validate interactions reference stakeholders in same org
CREATE OR REPLACE FUNCTION public.validate_stakeholder_interaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.stakeholders
    WHERE id = NEW.stakeholder_id
    AND organization_id = NEW.organization_id
  ) THEN
    RAISE EXCEPTION 'stakeholder_id must belong to the same organization';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_stakeholder_interaction_trigger ON public.stakeholder_interactions;
CREATE TRIGGER validate_stakeholder_interaction_trigger
  BEFORE INSERT OR UPDATE ON public.stakeholder_interactions
  FOR EACH ROW EXECUTE FUNCTION public.validate_stakeholder_interaction();

-- ============================================================================
-- FIX 3: Add permission checks to SECURITY DEFINER functions
-- ============================================================================

-- Fix get_stakeholder_summary
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
DECLARE
  v_org_id UUID;
BEGIN
  -- Get the stakeholder's organization
  SELECT s.organization_id INTO v_org_id
  FROM public.stakeholders s
  WHERE s.id = p_stakeholder_id;

  -- Verify access (return empty if no access)
  IF v_org_id IS NULL OR NOT (public.is_org_member(v_org_id) OR public.is_kosmos_master()) THEN
    RETURN;
  END IF;

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

-- Fix get_stakeholder_relationships
CREATE OR REPLACE FUNCTION public.get_stakeholder_relationships(p_stakeholder_id UUID)
RETURNS TABLE (
  relationship_id UUID,
  related_stakeholder_id UUID,
  related_stakeholder_name TEXT,
  related_stakeholder_type public.stakeholder_type,
  relationship_type public.stakeholder_relationship_type,
  description TEXT
) AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get the stakeholder's organization
  SELECT s.organization_id INTO v_org_id
  FROM public.stakeholders s
  WHERE s.id = p_stakeholder_id;

  -- Verify access
  IF v_org_id IS NULL OR NOT (public.is_org_member(v_org_id) OR public.is_kosmos_master()) THEN
    RETURN;
  END IF;

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

-- Fix get_stakeholder_interactions
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
DECLARE
  v_org_id UUID;
BEGIN
  -- Get the stakeholder's organization
  SELECT s.organization_id INTO v_org_id
  FROM public.stakeholders s
  WHERE s.id = p_stakeholder_id;

  -- Verify access
  IF v_org_id IS NULL OR NOT (public.is_org_member(v_org_id) OR public.is_kosmos_master()) THEN
    RETURN;
  END IF;

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

-- Fix get_org_stakeholder_overview
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
  -- Verify access
  IF NOT (public.is_org_member(p_organization_id) OR public.is_kosmos_master()) THEN
    RETURN;
  END IF;

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

-- Drop the problematic get_stakeholder_stats function (replaced by get_org_stakeholder_overview)
DROP FUNCTION IF EXISTS public.get_stakeholder_stats(UUID);
