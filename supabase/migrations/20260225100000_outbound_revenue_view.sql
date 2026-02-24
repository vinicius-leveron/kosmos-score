-- Migration: Outbound Revenue Views for D10 Dashboard
-- Creates views for revenue attribution by outbound source

-- View para receita por fonte de outbound
CREATE OR REPLACE VIEW outbound_revenue_by_source AS
SELECT
  co.organization_id,
  co.tenant,
  co.channel_in AS source,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status IN ('open', 'won')) AS deals_count,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'won') AS won_count,
  COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'open'), 0) AS pipeline_value,
  COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'won'), 0) AS revenue,
  COALESCE(AVG(d.amount) FILTER (WHERE d.status IN ('open', 'won')), 0) AS avg_deal_size,
  CASE
    WHEN COUNT(d.id) FILTER (WHERE d.status IN ('won', 'lost')) > 0 THEN
      ROUND((COUNT(d.id) FILTER (WHERE d.status = 'won')::numeric /
       COUNT(d.id) FILTER (WHERE d.status IN ('won', 'lost'))) * 100, 2)
    ELSE 0
  END AS win_rate,
  COUNT(DISTINCT co.id) AS leads_with_deals
FROM contact_orgs co
JOIN deal_contacts dc ON dc.contact_org_id = co.id
JOIN deals d ON d.id = dc.deal_id
WHERE co.channel_in IS NOT NULL
GROUP BY co.organization_id, co.tenant, co.channel_in;

-- View para totais de receita de outbound
CREATE OR REPLACE VIEW outbound_revenue_totals AS
SELECT
  co.organization_id,
  co.tenant,
  COUNT(DISTINCT d.id) AS total_deals,
  COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'open'), 0) AS total_pipeline,
  COALESCE(SUM(d.amount) FILTER (WHERE d.status = 'won'), 0) AS total_revenue,
  COALESCE(AVG(d.amount) FILTER (WHERE d.status IN ('open', 'won')), 0) AS avg_deal_size,
  CASE
    WHEN COUNT(d.id) FILTER (WHERE d.status IN ('won', 'lost')) > 0 THEN
      ROUND((COUNT(d.id) FILTER (WHERE d.status = 'won')::numeric /
       COUNT(d.id) FILTER (WHERE d.status IN ('won', 'lost'))) * 100, 2)
    ELSE 0
  END AS overall_win_rate
FROM contact_orgs co
JOIN deal_contacts dc ON dc.contact_org_id = co.id
JOIN deals d ON d.id = dc.deal_id
WHERE co.channel_in IS NOT NULL
GROUP BY co.organization_id, co.tenant;

-- Grant access to authenticated users
GRANT SELECT ON outbound_revenue_by_source TO authenticated;
GRANT SELECT ON outbound_revenue_totals TO authenticated;
