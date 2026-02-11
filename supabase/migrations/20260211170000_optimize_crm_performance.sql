-- ============================================
-- Phase 1: Database Optimization for CRM
-- ============================================

-- 1. Add pipeline_type to distinguish contact vs deal pipelines
ALTER TABLE pipelines 
ADD COLUMN IF NOT EXISTS pipeline_type TEXT DEFAULT 'deal' 
CHECK (pipeline_type IN ('contact', 'deal', 'custom'));

-- Update existing pipelines (assuming current ones are for deals)
UPDATE pipelines SET pipeline_type = 'deal' WHERE pipeline_type IS NULL;

-- 2. Add entity_type to tasks for better organization
ALTER TABLE crm_tasks
ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'contact'
CHECK (entity_type IN ('contact', 'deal', 'company'));

-- Update existing tasks based on what columns have data
UPDATE crm_tasks 
SET entity_type = CASE 
  WHEN deal_id IS NOT NULL THEN 'deal'
  WHEN company_id IS NOT NULL THEN 'company'
  ELSE 'contact'
END
WHERE entity_type IS NULL;

-- 3. Create optimized indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pipelines_org_type_active 
ON pipelines(organization_id, pipeline_type, is_active)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline_position 
ON pipeline_stages(pipeline_id, position);

CREATE INDEX IF NOT EXISTS idx_tasks_entity_deal 
ON crm_tasks(entity_type, deal_id, status)
WHERE entity_type = 'deal' AND status IN ('pending', 'overdue');

CREATE INDEX IF NOT EXISTS idx_tasks_entity_contact 
ON crm_tasks(entity_type, contact_org_id, status)
WHERE entity_type = 'contact' AND status IN ('pending', 'overdue');

CREATE INDEX IF NOT EXISTS idx_deals_org_stage_status 
ON deals(organization_id, stage_id, status)
WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_contact_pipeline_positions_stage 
ON contact_pipeline_positions(stage_id, contact_org_id);

-- 4. Create materialized view for pipeline performance
CREATE MATERIALIZED VIEW IF NOT EXISTS pipeline_summary AS
SELECT 
  p.id as pipeline_id,
  p.organization_id,
  p.name as pipeline_name,
  p.pipeline_type,
  ps.id as stage_id,
  ps.name as stage_name,
  ps.color as stage_color,
  ps.position as stage_position,
  COUNT(DISTINCT 
    CASE 
      WHEN p.pipeline_type = 'contact' THEN cpp.contact_org_id 
      ELSE NULL 
    END
  ) as contact_count,
  COUNT(DISTINCT 
    CASE 
      WHEN p.pipeline_type = 'deal' THEN d.id 
      ELSE NULL 
    END
  ) as deal_count,
  COALESCE(SUM(
    CASE 
      WHEN p.pipeline_type = 'deal' THEN d.amount 
      ELSE 0 
    END
  ), 0) as total_value,
  COALESCE(AVG(
    CASE 
      WHEN p.pipeline_type = 'deal' AND d.amount > 0 THEN d.probability 
      ELSE NULL 
    END
  ), 0) as avg_probability
FROM pipelines p
LEFT JOIN pipeline_stages ps ON ps.pipeline_id = p.id
LEFT JOIN contact_pipeline_positions cpp ON cpp.stage_id = ps.id
LEFT JOIN deals d ON d.stage_id = ps.id AND d.status = 'open'
WHERE p.is_active = true
GROUP BY p.id, p.organization_id, p.name, p.pipeline_type, ps.id, ps.name, ps.color, ps.position;

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_pipeline_summary_org 
ON pipeline_summary(organization_id, pipeline_id);

CREATE INDEX IF NOT EXISTS idx_pipeline_summary_stage 
ON pipeline_summary(pipeline_id, stage_id);

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_pipeline_summary_unique
ON pipeline_summary(pipeline_id, stage_id);

-- 5. Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_pipeline_summary()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY pipeline_summary;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback to non-concurrent refresh if concurrent fails
    REFRESH MATERIALIZED VIEW pipeline_summary;
END;
$$;

-- 6. Create triggers to auto-refresh on changes (using async job)
CREATE OR REPLACE FUNCTION trigger_refresh_pipeline_summary()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Schedule refresh in 5 seconds to batch multiple changes
  PERFORM pg_notify('refresh_pipeline_summary', '');
  RETURN NULL;
END;
$$;

-- Add triggers to relevant tables
DROP TRIGGER IF EXISTS refresh_pipeline_summary_on_deal_change ON deals;
CREATE TRIGGER refresh_pipeline_summary_on_deal_change
AFTER INSERT OR UPDATE OR DELETE ON deals
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_pipeline_summary();

DROP TRIGGER IF EXISTS refresh_pipeline_summary_on_position_change ON contact_pipeline_positions;
CREATE TRIGGER refresh_pipeline_summary_on_position_change
AFTER INSERT OR UPDATE OR DELETE ON contact_pipeline_positions
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_pipeline_summary();

-- 7. Create view for dashboard metrics (real-time)
CREATE OR REPLACE VIEW crm_dashboard_metrics AS
WITH date_ranges AS (
  SELECT 
    date_trunc('day', CURRENT_DATE) as today_start,
    date_trunc('week', CURRENT_DATE) as week_start,
    date_trunc('month', CURRENT_DATE) as month_start,
    date_trunc('quarter', CURRENT_DATE) as quarter_start
),
contact_metrics AS (
  SELECT 
    o.id as organization_id,
    COUNT(*) FILTER (WHERE co.created_at >= dr.today_start) as contacts_today,
    COUNT(*) FILTER (WHERE co.created_at >= dr.week_start) as contacts_week,
    COUNT(*) FILTER (WHERE co.created_at >= dr.month_start) as contacts_month,
    COUNT(*) as contacts_total,
    AVG(co.score) as avg_contact_score
  FROM organizations o
  CROSS JOIN date_ranges dr
  LEFT JOIN contact_orgs co ON co.organization_id = o.id
  GROUP BY o.id
),
deal_metrics AS (
  SELECT
    o.id as organization_id,
    COUNT(*) FILTER (WHERE d.created_at >= dr.today_start) as deals_created_today,
    COUNT(*) FILTER (WHERE d.created_at >= dr.week_start) as deals_created_week,
    COUNT(*) FILTER (WHERE d.created_at >= dr.month_start) as deals_created_month,
    COUNT(*) FILTER (WHERE d.status = 'open') as deals_open,
    COUNT(*) FILTER (WHERE d.status = 'won' AND d.actual_close_date >= dr.month_start::date) as deals_won_month,
    COUNT(*) FILTER (WHERE d.status = 'lost' AND d.actual_close_date >= dr.month_start::date) as deals_lost_month,
    SUM(d.amount) FILTER (WHERE d.status = 'open') as pipeline_value,
    SUM(d.amount) FILTER (WHERE d.status = 'won' AND d.actual_close_date >= dr.month_start::date) as revenue_month,
    AVG(d.actual_close_date - d.created_at::date) FILTER (WHERE d.status = 'won' AND d.actual_close_date IS NOT NULL) as avg_sales_cycle_days
  FROM organizations o
  CROSS JOIN date_ranges dr
  LEFT JOIN deals d ON d.organization_id = o.id
  GROUP BY o.id
),
task_metrics AS (
  SELECT 
    o.id as organization_id,
    COUNT(*) FILTER (WHERE t.status = 'pending') as tasks_pending,
    COUNT(*) FILTER (WHERE t.status = 'overdue' OR (t.status = 'pending' AND t.due_at < NOW())) as tasks_overdue,
    COUNT(*) FILTER (WHERE t.completed_at >= dr.today_start) as tasks_completed_today,
    COUNT(*) FILTER (WHERE t.completed_at >= dr.week_start) as tasks_completed_week
  FROM organizations o
  CROSS JOIN date_ranges dr
  LEFT JOIN crm_tasks t ON t.organization_id = o.id
  GROUP BY o.id
)
SELECT 
  cm.organization_id,
  -- Contact metrics
  cm.contacts_today,
  cm.contacts_week,
  cm.contacts_month,
  cm.contacts_total,
  cm.avg_contact_score,
  -- Deal metrics
  dm.deals_created_today,
  dm.deals_created_week,
  dm.deals_created_month,
  dm.deals_open,
  dm.deals_won_month,
  dm.deals_lost_month,
  dm.pipeline_value,
  dm.revenue_month,
  dm.avg_sales_cycle_days,
  -- Task metrics
  tm.tasks_pending,
  tm.tasks_overdue,
  tm.tasks_completed_today,
  tm.tasks_completed_week,
  -- Conversion rates
  CASE 
    WHEN dm.deals_won_month + dm.deals_lost_month > 0 
    THEN (dm.deals_won_month::float / (dm.deals_won_month + dm.deals_lost_month)) * 100
    ELSE 0 
  END as win_rate_month,
  -- Calculated metrics
  CASE 
    WHEN cm.contacts_month > 0 
    THEN (dm.deals_created_month::float / cm.contacts_month) * 100
    ELSE 0 
  END as lead_to_deal_rate
FROM contact_metrics cm
JOIN deal_metrics dm ON dm.organization_id = cm.organization_id
JOIN task_metrics tm ON tm.organization_id = cm.organization_id;

-- 8. Grant permissions
GRANT SELECT ON pipeline_summary TO authenticated;
GRANT SELECT ON crm_dashboard_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_pipeline_summary() TO authenticated;

-- Initial refresh (non-concurrent for first time)
REFRESH MATERIALIZED VIEW pipeline_summary;