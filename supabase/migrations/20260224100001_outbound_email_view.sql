-- Migration: Outbound Email Views for D8 Dashboard
-- Creates views for email health metrics

-- View para métricas de email diárias
CREATE OR REPLACE VIEW outbound_email_daily AS
SELECT
  co.organization_id,
  co.tenant,
  date_trunc('day', a.created_at)::date as activity_date,
  COUNT(*) FILTER (WHERE a.type = 'email_sent') as sent,
  COUNT(*) FILTER (WHERE a.type = 'email_opened') as opened,
  COUNT(*) FILTER (WHERE a.type = 'email_clicked') as clicked,
  COUNT(*) FILTER (WHERE a.type = 'email_bounced') as bounced
FROM activities a
JOIN contact_orgs co ON co.id = a.contact_org_id
WHERE a.type IN ('email_sent', 'email_opened', 'email_clicked', 'email_bounced')
  AND a.created_at >= NOW() - INTERVAL '30 days'
GROUP BY co.organization_id, co.tenant, date_trunc('day', a.created_at)::date
ORDER BY activity_date DESC;

-- View para totais de email (health metrics)
CREATE OR REPLACE VIEW outbound_email_health AS
SELECT
  co.organization_id,
  co.tenant,
  COUNT(*) FILTER (WHERE a.type = 'email_sent') as total_sent,
  COUNT(*) FILTER (WHERE a.type = 'email_opened') as total_opened,
  COUNT(*) FILTER (WHERE a.type = 'email_clicked') as total_clicked,
  COUNT(*) FILTER (WHERE a.type = 'email_bounced') as total_bounced,
  -- Bounce rate
  ROUND(
    COUNT(*) FILTER (WHERE a.type = 'email_bounced')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE a.type = 'email_sent'), 0) * 100, 2
  ) as bounce_rate,
  -- Open rate
  ROUND(
    COUNT(*) FILTER (WHERE a.type = 'email_opened')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE a.type = 'email_sent'), 0) * 100, 2
  ) as open_rate,
  -- Click rate (clicks / opens, not sends)
  ROUND(
    COUNT(*) FILTER (WHERE a.type = 'email_clicked')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE a.type = 'email_opened'), 0) * 100, 2
  ) as click_rate,
  -- Health status: 'healthy', 'warning', 'critical'
  CASE
    WHEN COUNT(*) FILTER (WHERE a.type = 'email_bounced')::numeric /
         NULLIF(COUNT(*) FILTER (WHERE a.type = 'email_sent'), 0) * 100 > 5 THEN 'critical'
    WHEN COUNT(*) FILTER (WHERE a.type = 'email_bounced')::numeric /
         NULLIF(COUNT(*) FILTER (WHERE a.type = 'email_sent'), 0) * 100 > 2 THEN 'warning'
    ELSE 'healthy'
  END as health_status
FROM activities a
JOIN contact_orgs co ON co.id = a.contact_org_id
WHERE a.type IN ('email_sent', 'email_opened', 'email_clicked', 'email_bounced')
  AND a.created_at >= NOW() - INTERVAL '30 days'
GROUP BY co.organization_id, co.tenant;

-- Grant access to authenticated users
GRANT SELECT ON outbound_email_daily TO authenticated;
GRANT SELECT ON outbound_email_health TO authenticated;
