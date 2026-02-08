-- ============================================================================
-- KOSMOS Platform - Stakeholder Score Calculation (US-04)
-- ============================================================================
-- Automatic score calculation based on interactions:
-- - Meetings (reuniões): 25% weight - frequency in last 90 days
-- - Mentoring (mentorias): 30% weight - sessions with impact score
-- - Referrals (indicações): 20% weight - number of referrals
-- - Decisions (decisões): 15% weight - participation in decisions
-- - Investments (investimentos): 10% weight - proportional to value
-- ============================================================================

-- ============================================================================
-- SCORE CALCULATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_stakeholder_score(p_stakeholder_id UUID)
RETURNS TABLE (
  total_score NUMERIC,
  breakdown JSONB
) AS $$
DECLARE
  v_stakeholder RECORD;
  v_org_id UUID;
  v_meeting_score NUMERIC := 0;
  v_mentoring_score NUMERIC := 0;
  v_referral_score NUMERIC := 0;
  v_decision_score NUMERIC := 0;
  v_investment_score NUMERIC := 0;
  v_meeting_count INTEGER := 0;
  v_mentoring_count INTEGER := 0;
  v_mentoring_avg_impact NUMERIC := 0;
  v_referral_count INTEGER := 0;
  v_decision_count INTEGER := 0;
  v_investment_amount NUMERIC := 0;
  v_org_max_investment NUMERIC := 0;
  v_final_score NUMERIC := 0;
  v_breakdown JSONB;
  v_decay_factor NUMERIC := 1.0;
  v_last_interaction_days INTEGER;
BEGIN
  -- Get stakeholder's organization for permission check
  SELECT s.organization_id INTO v_org_id
  FROM public.stakeholders s
  WHERE s.id = p_stakeholder_id;

  -- Security: Verify caller has access to this organization
  IF v_org_id IS NULL OR NOT (public.is_org_member(v_org_id) OR public.is_kosmos_master()) THEN
    RETURN QUERY SELECT 0::NUMERIC, '{}'::JSONB;
    RETURN;
  END IF;

  -- Get stakeholder data
  SELECT s.*,
         COALESCE(s.investment_amount, 0) as inv_amount
  INTO v_stakeholder
  FROM public.stakeholders s
  WHERE s.id = p_stakeholder_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT 0::NUMERIC, '{}'::JSONB;
    RETURN;
  END IF;

  -- ============================================================================
  -- MEETINGS SCORE (25% weight)
  -- Based on meeting count in last 90 days
  -- Formula: min(100, (meeting_count / 4) * 100) - assumes 4 meetings = max score
  -- ============================================================================
  SELECT COUNT(*)
  INTO v_meeting_count
  FROM public.stakeholder_interactions si
  WHERE si.stakeholder_id = p_stakeholder_id
    AND si.interaction_type = 'meeting'
    AND si.occurred_at >= CURRENT_DATE - INTERVAL '90 days';

  v_meeting_score := LEAST(100, (v_meeting_count::NUMERIC / 4.0) * 100);

  -- ============================================================================
  -- MENTORING SCORE (30% weight)
  -- Based on mentoring sessions count * average impact score
  -- Formula: min(100, (count * avg_impact / 10) * 100) - assumes 10 high-impact sessions = max
  -- ============================================================================
  SELECT COUNT(*), COALESCE(AVG(si.impact_score), 3)
  INTO v_mentoring_count, v_mentoring_avg_impact
  FROM public.stakeholder_interactions si
  WHERE si.stakeholder_id = p_stakeholder_id
    AND si.interaction_type = 'mentoring'
    AND si.occurred_at >= CURRENT_DATE - INTERVAL '180 days';

  v_mentoring_score := LEAST(100, (v_mentoring_count * v_mentoring_avg_impact / 15.0) * 100);

  -- ============================================================================
  -- REFERRALS SCORE (20% weight)
  -- Based on referral count (all time)
  -- Formula: min(100, (referral_count / 5) * 100) - assumes 5 referrals = max score
  -- ============================================================================
  SELECT COUNT(*)
  INTO v_referral_count
  FROM public.stakeholder_interactions si
  WHERE si.stakeholder_id = p_stakeholder_id
    AND si.interaction_type = 'referral';

  v_referral_score := LEAST(100, (v_referral_count::NUMERIC / 5.0) * 100);

  -- ============================================================================
  -- DECISIONS SCORE (15% weight)
  -- Based on decision participation in last 180 days
  -- Formula: min(100, (decision_count / 6) * 100) - assumes 6 decisions = max score
  -- ============================================================================
  SELECT COUNT(*)
  INTO v_decision_count
  FROM public.stakeholder_interactions si
  WHERE si.stakeholder_id = p_stakeholder_id
    AND si.interaction_type = 'decision'
    AND si.occurred_at >= CURRENT_DATE - INTERVAL '180 days';

  v_decision_score := LEAST(100, (v_decision_count::NUMERIC / 6.0) * 100);

  -- ============================================================================
  -- INVESTMENTS SCORE (10% weight)
  -- Based on investment amount relative to max in organization
  -- Formula: (stakeholder_investment / max_org_investment) * 100
  -- ============================================================================
  v_investment_amount := COALESCE(v_stakeholder.investment_amount, 0);

  SELECT COALESCE(MAX(s.investment_amount), 1)
  INTO v_org_max_investment
  FROM public.stakeholders s
  WHERE s.organization_id = v_stakeholder.organization_id
    AND s.status = 'active';

  IF v_org_max_investment > 0 THEN
    v_investment_score := (v_investment_amount / v_org_max_investment) * 100;
  ELSE
    v_investment_score := 0;
  END IF;

  -- ============================================================================
  -- TEMPORAL DECAY FACTOR
  -- Reduce score if no interactions in last 60 days
  -- ============================================================================
  SELECT COALESCE(
    CURRENT_DATE - MAX(si.occurred_at),
    365 -- Default to 365 days if no interactions
  )
  INTO v_last_interaction_days
  FROM public.stakeholder_interactions si
  WHERE si.stakeholder_id = p_stakeholder_id;

  IF v_last_interaction_days > 60 THEN
    -- Linear decay: 100% at 60 days, 70% at 120 days, 50% at 180+ days
    v_decay_factor := GREATEST(0.5, 1.0 - ((v_last_interaction_days - 60) / 240.0));
  END IF;

  -- ============================================================================
  -- FINAL SCORE CALCULATION
  -- Weighted average with decay factor
  -- ============================================================================
  v_final_score := (
    (v_meeting_score * 0.25) +
    (v_mentoring_score * 0.30) +
    (v_referral_score * 0.20) +
    (v_decision_score * 0.15) +
    (v_investment_score * 0.10)
  ) * v_decay_factor;

  -- Round to 2 decimal places and cap at 100
  v_final_score := LEAST(100, ROUND(v_final_score, 2));

  -- Build breakdown JSON
  v_breakdown := jsonb_build_object(
    'meetings', jsonb_build_object(
      'count', v_meeting_count,
      'score', ROUND(v_meeting_score, 2),
      'weight', 0.25,
      'weighted_score', ROUND(v_meeting_score * 0.25, 2),
      'period_days', 90
    ),
    'mentoring', jsonb_build_object(
      'count', v_mentoring_count,
      'avg_impact', ROUND(v_mentoring_avg_impact, 2),
      'score', ROUND(v_mentoring_score, 2),
      'weight', 0.30,
      'weighted_score', ROUND(v_mentoring_score * 0.30, 2),
      'period_days', 180
    ),
    'referrals', jsonb_build_object(
      'count', v_referral_count,
      'score', ROUND(v_referral_score, 2),
      'weight', 0.20,
      'weighted_score', ROUND(v_referral_score * 0.20, 2),
      'period_days', NULL
    ),
    'decisions', jsonb_build_object(
      'count', v_decision_count,
      'score', ROUND(v_decision_score, 2),
      'weight', 0.15,
      'weighted_score', ROUND(v_decision_score * 0.15, 2),
      'period_days', 180
    ),
    'investments', jsonb_build_object(
      'amount', v_investment_amount,
      'org_max', v_org_max_investment,
      'score', ROUND(v_investment_score, 2),
      'weight', 0.10,
      'weighted_score', ROUND(v_investment_score * 0.10, 2)
    ),
    'decay', jsonb_build_object(
      'days_since_interaction', v_last_interaction_days,
      'factor', ROUND(v_decay_factor, 3)
    ),
    'calculated_at', now()
  );

  RETURN QUERY SELECT v_final_score, v_breakdown;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- UPDATE STAKEHOLDER SCORE FUNCTION
-- Updates the stakeholder record with calculated score
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_stakeholder_score(p_stakeholder_id UUID)
RETURNS VOID AS $$
DECLARE
  v_score NUMERIC;
  v_breakdown JSONB;
BEGIN
  SELECT cs.total_score, cs.breakdown
  INTO v_score, v_breakdown
  FROM public.calculate_stakeholder_score(p_stakeholder_id) cs;

  UPDATE public.stakeholders
  SET contribution_score = v_score,
      score_breakdown = v_breakdown,
      updated_at = now()
  WHERE id = p_stakeholder_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER FUNCTION FOR AUTO-UPDATE
-- Recalculates score when interactions change
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_update_stakeholder_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.update_stakeholder_score(OLD.stakeholder_id);
    RETURN OLD;
  ELSE
    PERFORM public.update_stakeholder_score(NEW.stakeholder_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER ON STAKEHOLDER_INTERACTIONS
-- ============================================================================

DROP TRIGGER IF EXISTS recalculate_stakeholder_score ON public.stakeholder_interactions;

CREATE TRIGGER recalculate_stakeholder_score
  AFTER INSERT OR UPDATE OR DELETE ON public.stakeholder_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_stakeholder_score();

-- ============================================================================
-- TRIGGER FOR INVESTMENT AMOUNT CHANGES
-- Recalculates score when investment_amount changes on stakeholder
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_recalc_score_on_investment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.investment_amount IS DISTINCT FROM NEW.investment_amount THEN
    PERFORM public.update_stakeholder_score(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS recalculate_score_on_investment ON public.stakeholders;

CREATE TRIGGER recalculate_score_on_investment
  AFTER UPDATE OF investment_amount ON public.stakeholders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalc_score_on_investment_change();

-- ============================================================================
-- BATCH RECALCULATION FUNCTION
-- Useful for recalculating all stakeholder scores (admin operation)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.recalculate_all_stakeholder_scores(p_organization_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_stakeholder_id UUID;
BEGIN
  -- Security: Only KOSMOS master or org admin can batch recalculate
  IF p_organization_id IS NOT NULL THEN
    IF NOT (public.has_org_role(p_organization_id, 'admin') OR public.is_kosmos_master()) THEN
      RAISE EXCEPTION 'Permission denied: admin role required';
    END IF;
  ELSE
    -- If no org specified, must be KOSMOS master
    IF NOT public.is_kosmos_master() THEN
      RAISE EXCEPTION 'Permission denied: KOSMOS master access required';
    END IF;
  END IF;

  FOR v_stakeholder_id IN
    SELECT s.id
    FROM public.stakeholders s
    WHERE (p_organization_id IS NULL OR s.organization_id = p_organization_id)
      AND s.status = 'active'
  LOOP
    PERFORM public.update_stakeholder_score(v_stakeholder_id);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SCORE HISTORY TABLE (for trend tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.stakeholder_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stakeholder_score_history_stakeholder
  ON public.stakeholder_score_history(stakeholder_id);
CREATE INDEX idx_stakeholder_score_history_recorded
  ON public.stakeholder_score_history(stakeholder_id, recorded_at DESC);

-- RLS for score history
ALTER TABLE public.stakeholder_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stakeholder_score_history_select" ON public.stakeholder_score_history FOR SELECT
  USING (
    stakeholder_id IN (
      SELECT s.id FROM public.stakeholders s
      WHERE public.is_org_member(s.organization_id) OR public.is_kosmos_master()
    )
  );

-- Only system/trigger can insert score history
CREATE POLICY "stakeholder_score_history_insert" ON public.stakeholder_score_history FOR INSERT
  WITH CHECK (
    stakeholder_id IN (
      SELECT s.id FROM public.stakeholders s
      WHERE public.has_org_role(s.organization_id, 'admin') OR public.is_kosmos_master()
    )
  );

GRANT SELECT, INSERT ON public.stakeholder_score_history TO authenticated;

-- ============================================================================
-- FUNCTION TO RECORD SCORE SNAPSHOT
-- Called weekly via cron job or manually
-- ============================================================================

CREATE OR REPLACE FUNCTION public.record_stakeholder_score_snapshot(p_stakeholder_id UUID)
RETURNS VOID AS $$
DECLARE
  v_stakeholder RECORD;
  v_org_id UUID;
BEGIN
  -- Get stakeholder's organization for permission check
  SELECT s.organization_id, s.contribution_score, s.score_breakdown
  INTO v_org_id, v_stakeholder.contribution_score, v_stakeholder.score_breakdown
  FROM public.stakeholders s
  WHERE s.id = p_stakeholder_id;

  -- Security: Verify caller has admin access to this organization
  IF v_org_id IS NULL OR NOT (public.has_org_role(v_org_id, 'admin') OR public.is_kosmos_master()) THEN
    RETURN;
  END IF;

  IF v_stakeholder.contribution_score IS NOT NULL THEN
    INSERT INTO public.stakeholder_score_history (stakeholder_id, score, breakdown)
    VALUES (p_stakeholder_id, v_stakeholder.contribution_score, COALESCE(v_stakeholder.score_breakdown, '{}'));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record snapshots for all active stakeholders
CREATE OR REPLACE FUNCTION public.record_all_score_snapshots(p_organization_id UUID DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_stakeholder_id UUID;
BEGIN
  -- Security: Only KOSMOS master or org admin can record snapshots
  IF p_organization_id IS NOT NULL THEN
    IF NOT (public.has_org_role(p_organization_id, 'admin') OR public.is_kosmos_master()) THEN
      RAISE EXCEPTION 'Permission denied: admin role required';
    END IF;
  ELSE
    -- If no org specified, must be KOSMOS master
    IF NOT public.is_kosmos_master() THEN
      RAISE EXCEPTION 'Permission denied: KOSMOS master access required';
    END IF;
  END IF;

  FOR v_stakeholder_id IN
    SELECT s.id
    FROM public.stakeholders s
    WHERE (p_organization_id IS NULL OR s.organization_id = p_organization_id)
      AND s.status = 'active'
  LOOP
    -- Call internal insert directly since we already checked permissions
    INSERT INTO public.stakeholder_score_history (stakeholder_id, score, breakdown)
    SELECT s.id, s.contribution_score, COALESCE(s.score_breakdown, '{}')
    FROM public.stakeholders s
    WHERE s.id = v_stakeholder_id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET SCORE TREND FUNCTION
-- Returns score history for a stakeholder (last 6 months by default)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_stakeholder_score_trend(
  p_stakeholder_id UUID,
  p_months INTEGER DEFAULT 6
)
RETURNS TABLE (
  recorded_at TIMESTAMPTZ,
  score NUMERIC,
  trend TEXT
) AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get stakeholder's organization for permission check
  SELECT s.organization_id INTO v_org_id
  FROM public.stakeholders s
  WHERE s.id = p_stakeholder_id;

  -- Security: Verify caller has access to this organization
  IF v_org_id IS NULL OR NOT (public.is_org_member(v_org_id) OR public.is_kosmos_master()) THEN
    RETURN; -- Return empty result set
  END IF;

  RETURN QUERY
  WITH history AS (
    SELECT
      sh.recorded_at,
      sh.score,
      LAG(sh.score) OVER (ORDER BY sh.recorded_at) as prev_score
    FROM public.stakeholder_score_history sh
    WHERE sh.stakeholder_id = p_stakeholder_id
      AND sh.recorded_at >= CURRENT_DATE - (p_months || ' months')::INTERVAL
    ORDER BY sh.recorded_at DESC
  )
  SELECT
    h.recorded_at,
    h.score,
    CASE
      WHEN h.prev_score IS NULL THEN 'neutral'
      WHEN h.score > h.prev_score THEN 'up'
      WHEN h.score < h.prev_score THEN 'down'
      ELSE 'neutral'
    END::TEXT as trend
  FROM history h;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.calculate_stakeholder_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_stakeholder_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_all_stakeholder_scores(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_stakeholder_score_snapshot(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_all_score_snapshots(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_stakeholder_score_trend(UUID, INTEGER) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.calculate_stakeholder_score IS
  'Calculates contribution score for a stakeholder based on interactions';

COMMENT ON FUNCTION public.update_stakeholder_score IS
  'Updates stakeholder record with calculated score';

COMMENT ON FUNCTION public.recalculate_all_stakeholder_scores IS
  'Batch recalculation of all stakeholder scores (admin operation)';

COMMENT ON TABLE public.stakeholder_score_history IS
  'Historical snapshots of stakeholder scores for trend analysis';

COMMENT ON FUNCTION public.get_stakeholder_score_trend IS
  'Returns score history with trend direction (up/down/neutral)';
