-- ============================================================================
-- KOSMOS Platform - Outbound Dashboard Views
-- ============================================================================
-- Cria views materializadas para os dashboards do Outbound Analytics
-- D2: Source Metrics
-- D3: Channel Metrics
-- D4: Scoring Distribution & Validation
-- D5: Engagement Heatmap
-- D9: Nurture Metrics (enhancement)
-- ============================================================================

-- ============================================================================
-- D2: SOURCE METRICS (por channel + method)
-- ============================================================================

CREATE OR REPLACE VIEW public.outbound_source_metrics AS
SELECT
  co.organization_id,
  co.tenant,
  COALESCE(co.channel, 'unknown') || COALESCE('_' || co.method, '') AS source,
  COUNT(*) AS total_leads,
  AVG(co.score_icp) AS avg_icp_score,
  COUNT(*) FILTER (WHERE co.classificacao = 'A') AS class_a_count,
  COUNT(*) FILTER (WHERE co.classificacao = 'B') AS class_b_count,
  COUNT(*) FILTER (WHERE co.classificacao = 'C') AS class_c_count,
  COUNT(*) FILTER (WHERE co.cadence_status = 'replied') AS replied_count,
  CASE
    WHEN COUNT(*) > 0
    THEN ROUND((COUNT(*) FILTER (WHERE co.cadence_status = 'replied')::numeric / COUNT(*)) * 100, 2)
    ELSE 0
  END AS reply_rate
FROM public.contact_orgs co
WHERE co.cadence_status IS NOT NULL  -- Only outbound contacts
GROUP BY co.organization_id, co.tenant, COALESCE(co.channel, 'unknown') || COALESCE('_' || co.method, '');

COMMENT ON VIEW public.outbound_source_metrics IS 'D2: Métricas por fonte/canal de entrada do lead';

-- ============================================================================
-- D3: CHANNEL METRICS (por tipo de atividade/canal de saída)
-- ============================================================================

CREATE OR REPLACE VIEW public.outbound_channel_metrics AS
WITH activity_channels AS (
  SELECT
    a.id,
    a.contact_org_id,
    a.created_at,
    CASE
      WHEN a.type IN ('email_sent', 'email_opened', 'email_clicked', 'email_bounced') THEN 'email'
      WHEN a.type IN ('whatsapp_sent', 'whatsapp_read') THEN 'whatsapp'
      WHEN a.type = 'custom' AND a.metadata->>'channel' = 'instagram_dm' THEN 'instagram_dm'
      ELSE NULL
    END AS channel,
    CASE WHEN a.type LIKE '%_sent' THEN 1 ELSE 0 END AS is_sent,
    CASE WHEN a.type IN ('email_opened', 'whatsapp_read') THEN 1 ELSE 0 END AS is_delivered,
    CASE WHEN a.type IN ('email_clicked') THEN 1 ELSE 0 END AS is_engaged
  FROM public.activities a
)
SELECT
  co.organization_id,
  co.tenant,
  ac.channel,
  DATE(ac.created_at) AS activity_date,
  SUM(ac.is_sent) AS sent,
  SUM(ac.is_delivered) AS delivered,
  SUM(ac.is_engaged) AS engaged,
  co.classificacao
FROM activity_channels ac
JOIN public.contact_orgs co ON co.id = ac.contact_org_id
WHERE ac.channel IS NOT NULL
  AND co.cadence_status IS NOT NULL
GROUP BY co.organization_id, co.tenant, ac.channel, DATE(ac.created_at), co.classificacao;

COMMENT ON VIEW public.outbound_channel_metrics IS 'D3: Métricas diárias por canal de comunicação (email, whatsapp, instagram_dm)';

-- ============================================================================
-- D4: SCORING DISTRIBUTION (distribuição de scores por bucket)
-- ============================================================================

CREATE OR REPLACE VIEW public.outbound_score_distribution AS
SELECT
  co.organization_id,
  co.tenant,
  CASE
    WHEN co.score_icp IS NULL THEN 'Sem Score'
    WHEN co.score_icp <= 20 THEN '0-20'
    WHEN co.score_icp <= 40 THEN '21-40'
    WHEN co.score_icp <= 60 THEN '41-60'
    WHEN co.score_icp <= 80 THEN '61-80'
    ELSE '81-100'
  END AS score_bucket,
  co.classificacao,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE co.cadence_status = 'replied') AS replied,
  CASE
    WHEN COUNT(*) > 0
    THEN ROUND((COUNT(*) FILTER (WHERE co.cadence_status = 'replied')::numeric / COUNT(*)) * 100, 2)
    ELSE 0
  END AS reply_rate
FROM public.contact_orgs co
WHERE co.cadence_status IS NOT NULL
GROUP BY co.organization_id, co.tenant,
  CASE
    WHEN co.score_icp IS NULL THEN 'Sem Score'
    WHEN co.score_icp <= 20 THEN '0-20'
    WHEN co.score_icp <= 40 THEN '21-40'
    WHEN co.score_icp <= 60 THEN '41-60'
    WHEN co.score_icp <= 80 THEN '61-80'
    ELSE '81-100'
  END,
  co.classificacao;

COMMENT ON VIEW public.outbound_score_distribution IS 'D4: Distribuição de leads por bucket de score ICP';

-- ============================================================================
-- D4: SCORING VALIDATION (validação do modelo de scoring)
-- ============================================================================

CREATE OR REPLACE VIEW public.outbound_scoring_validation AS
SELECT
  co.organization_id,
  co.tenant,
  AVG(co.score_icp) FILTER (WHERE co.cadence_status = 'replied') AS avg_score_replied,
  AVG(co.score_icp) FILTER (WHERE co.cadence_status NOT IN ('replied', 'converted')) AS avg_score_not_replied,
  -- False Positive Rate: Class A que nunca respondeu
  CASE
    WHEN COUNT(*) FILTER (WHERE co.classificacao = 'A') > 0
    THEN ROUND(
      (COUNT(*) FILTER (WHERE co.classificacao = 'A' AND co.cadence_status NOT IN ('replied', 'converted'))::numeric /
       COUNT(*) FILTER (WHERE co.classificacao = 'A')) * 100, 2)
    ELSE 0
  END AS false_positive_rate,
  -- False Negative Rate: Class C que converteu
  CASE
    WHEN COUNT(*) FILTER (WHERE co.classificacao = 'C') > 0
    THEN ROUND(
      (COUNT(*) FILTER (WHERE co.classificacao = 'C' AND co.cadence_status IN ('replied', 'converted'))::numeric /
       COUNT(*) FILTER (WHERE co.classificacao = 'C')) * 100, 2)
    ELSE 0
  END AS false_negative_rate
FROM public.contact_orgs co
WHERE co.cadence_status IS NOT NULL
  AND co.score_icp IS NOT NULL
GROUP BY co.organization_id, co.tenant;

COMMENT ON VIEW public.outbound_scoring_validation IS 'D4: Métricas de validação do modelo de scoring ICP';

-- ============================================================================
-- D5: ENGAGEMENT HEATMAP (mapa de calor por dia/hora)
-- ============================================================================

CREATE OR REPLACE VIEW public.outbound_engagement_heatmap AS
WITH sent_activities AS (
  SELECT
    a.id,
    a.contact_org_id,
    a.created_at,
    EXTRACT(DOW FROM a.created_at) AS day_of_week,
    EXTRACT(HOUR FROM a.created_at) AS hour_of_day
  FROM public.activities a
  WHERE a.type IN ('email_sent', 'whatsapp_sent')
),
replied_activities AS (
  SELECT DISTINCT a.contact_org_id
  FROM public.activities a
  WHERE a.type IN ('email_clicked', 'whatsapp_read')
    OR (a.type = 'note' AND a.title ILIKE '%reply%')
)
SELECT
  co.organization_id,
  co.tenant,
  sa.day_of_week::int,
  sa.hour_of_day::int,
  COUNT(*) AS messages_sent,
  COUNT(*) FILTER (WHERE ra.contact_org_id IS NOT NULL) AS messages_replied,
  CASE
    WHEN COUNT(*) > 0
    THEN ROUND((COUNT(*) FILTER (WHERE ra.contact_org_id IS NOT NULL)::numeric / COUNT(*)) * 100, 2)
    ELSE 0
  END AS reply_rate
FROM sent_activities sa
JOIN public.contact_orgs co ON co.id = sa.contact_org_id
LEFT JOIN replied_activities ra ON ra.contact_org_id = sa.contact_org_id
WHERE co.cadence_status IS NOT NULL
GROUP BY co.organization_id, co.tenant, sa.day_of_week, sa.hour_of_day;

COMMENT ON VIEW public.outbound_engagement_heatmap IS 'D5: Heatmap de engajamento por dia da semana e hora do dia';

-- ============================================================================
-- D9: NURTURE METRICS (pool de nurturing)
-- ============================================================================

CREATE OR REPLACE VIEW public.outbound_nurture_metrics AS
SELECT
  co.organization_id,
  co.tenant,
  co.cadence_status,
  co.classificacao,
  COUNT(*) AS count,
  AVG(
    EXTRACT(EPOCH FROM (now() - COALESCE(co.last_contacted, co.created_at))) / 86400
  )::int AS avg_days_dormant
FROM public.contact_orgs co
WHERE co.cadence_status IN ('nurture', 'paused', 'archived')
GROUP BY co.organization_id, co.tenant, co.cadence_status, co.classificacao;

COMMENT ON VIEW public.outbound_nurture_metrics IS 'D9: Pool de leads em nurture/paused/archived com dias de dormência';

-- ============================================================================
-- D9: NURTURE TOTALS (totais consolidados)
-- ============================================================================

CREATE OR REPLACE VIEW public.outbound_nurture_totals AS
SELECT
  co.organization_id,
  co.tenant,
  COUNT(*) AS total_in_nurture,
  COUNT(*) FILTER (WHERE co.classificacao = 'A') AS class_a_count,
  COUNT(*) FILTER (WHERE co.classificacao = 'B') AS class_b_count,
  COUNT(*) FILTER (WHERE co.classificacao = 'C') AS class_c_count,
  AVG(
    EXTRACT(EPOCH FROM (now() - COALESCE(co.last_contacted, co.created_at))) / 86400
  )::int AS avg_days_dormant
FROM public.contact_orgs co
WHERE co.cadence_status IN ('nurture', 'paused')
GROUP BY co.organization_id, co.tenant;

COMMENT ON VIEW public.outbound_nurture_totals IS 'D9: Totais consolidados do pool de nurture';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.outbound_source_metrics TO authenticated;
GRANT SELECT ON public.outbound_channel_metrics TO authenticated;
GRANT SELECT ON public.outbound_score_distribution TO authenticated;
GRANT SELECT ON public.outbound_scoring_validation TO authenticated;
GRANT SELECT ON public.outbound_engagement_heatmap TO authenticated;
GRANT SELECT ON public.outbound_nurture_metrics TO authenticated;
GRANT SELECT ON public.outbound_nurture_totals TO authenticated;

-- ============================================================================
-- LOG
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '=== Outbound Dashboard Views Created ===';
  RAISE NOTICE 'D2: outbound_source_metrics';
  RAISE NOTICE 'D3: outbound_channel_metrics';
  RAISE NOTICE 'D4: outbound_score_distribution';
  RAISE NOTICE 'D4: outbound_scoring_validation';
  RAISE NOTICE 'D5: outbound_engagement_heatmap';
  RAISE NOTICE 'D9: outbound_nurture_metrics';
  RAISE NOTICE 'D9: outbound_nurture_totals';
END $$;
