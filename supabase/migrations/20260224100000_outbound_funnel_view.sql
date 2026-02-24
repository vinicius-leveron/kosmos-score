-- Migration: Outbound Funnel Views for D1 Dashboard
-- Creates views for funnel metrics aggregation

-- View para métricas do funil de outbound por status e classificação
CREATE OR REPLACE VIEW outbound_funnel_metrics AS
SELECT
  co.organization_id,
  co.tenant,
  co.cadence_status,
  co.classificacao,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (co.next_action_date - co.last_contacted))/86400)::numeric(10,2) as avg_days_in_stage,
  COUNT(*) FILTER (WHERE co.created_at >= NOW() - INTERVAL '7 days') as new_last_7_days,
  COUNT(*) FILTER (WHERE co.created_at >= NOW() - INTERVAL '30 days') as new_last_30_days
FROM contact_orgs co
WHERE co.cadence_status IS NOT NULL
GROUP BY co.organization_id, co.tenant, co.cadence_status, co.classificacao;

-- View para totais gerais do funil
CREATE OR REPLACE VIEW outbound_funnel_totals AS
SELECT
  co.organization_id,
  co.tenant,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE co.cadence_status = 'new') as new_leads,
  COUNT(*) FILTER (WHERE co.cadence_status = 'ready') as ready,
  COUNT(*) FILTER (WHERE co.cadence_status = 'in_sequence') as in_sequence,
  COUNT(*) FILTER (WHERE co.cadence_status = 'paused') as paused,
  COUNT(*) FILTER (WHERE co.cadence_status = 'replied') as replied,
  COUNT(*) FILTER (WHERE co.cadence_status = 'nurture') as in_nurture,
  COUNT(*) FILTER (WHERE co.cadence_status = 'bounced') as bounced,
  COUNT(*) FILTER (WHERE co.cadence_status = 'unsubscribed') as unsubscribed,
  -- Reply rate: replied / (in_sequence + replied + nurture)
  ROUND(
    COUNT(*) FILTER (WHERE co.cadence_status = 'replied')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE co.cadence_status IN ('in_sequence', 'replied', 'nurture')), 0) * 100,
    2
  ) as reply_rate,
  -- Velocity: average days from new to replied
  AVG(
    CASE WHEN co.cadence_status = 'replied' AND co.last_contacted IS NOT NULL
    THEN EXTRACT(EPOCH FROM (co.last_contacted - co.created_at))/86400
    ELSE NULL END
  )::numeric(10,2) as avg_days_to_reply
FROM contact_orgs co
WHERE co.cadence_status IS NOT NULL
GROUP BY co.organization_id, co.tenant;

-- Grant access to authenticated users
GRANT SELECT ON outbound_funnel_metrics TO authenticated;
GRANT SELECT ON outbound_funnel_totals TO authenticated;
