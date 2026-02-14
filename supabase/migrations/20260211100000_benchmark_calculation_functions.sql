-- ============================================================================
-- BENCHMARK CALCULATION FUNCTIONS
-- ============================================================================
-- Fun\u00e7\u00f5es para c\u00e1lculo autom\u00e1tico de benchmarks de mercado a partir do
-- dataset de audit_results. Usado na Fase 1 (MVP) do Benchmarking Autom\u00e1tico.
--
-- Thresholds:
--   5  = m\u00ednimo para agrega\u00e7\u00f5es significativas (mediana de <5 valores \u00e9 ru\u00eddo)
--   30 = amostra confi\u00e1vel pelo Teorema Central do Limite (m\u00e9dias est\u00e1veis)
-- ============================================================================

-- ============================================================================
-- 1. get_market_benchmarks()
-- Calcula m\u00e9dias, medianas, desvio padr\u00e3o, percentis e top 10% por pilar
-- a partir de todos os audit_results v\u00e1lidos.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_market_benchmarks()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  result JSON;
  total_count INTEGER;
BEGIN
  SELECT json_build_object(
    'is_reliable', COUNT(*) >= 30,
    'total_count', COUNT(*)::integer,
    'min_required', 30,
    -- Causa
    'causa', json_build_object(
      'avg', ROUND(AVG(score_causa)::numeric, 1),
      'median', ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score_causa)::numeric, 1),
      'stddev', ROUND(COALESCE(STDDEV(score_causa), 0)::numeric, 1),
      'p10', ROUND(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY score_causa)::numeric, 1),
      'p25', ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY score_causa)::numeric, 1),
      'p50', ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score_causa)::numeric, 1),
      'p75', ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY score_causa)::numeric, 1),
      'p90', ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY score_causa)::numeric, 1)
    ),
    -- Cultura
    'cultura', json_build_object(
      'avg', ROUND(AVG(score_cultura)::numeric, 1),
      'median', ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score_cultura)::numeric, 1),
      'stddev', ROUND(COALESCE(STDDEV(score_cultura), 0)::numeric, 1),
      'p10', ROUND(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY score_cultura)::numeric, 1),
      'p25', ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY score_cultura)::numeric, 1),
      'p50', ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score_cultura)::numeric, 1),
      'p75', ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY score_cultura)::numeric, 1),
      'p90', ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY score_cultura)::numeric, 1)
    ),
    -- Economia
    'economia', json_build_object(
      'avg', ROUND(AVG(score_economia)::numeric, 1),
      'median', ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score_economia)::numeric, 1),
      'stddev', ROUND(COALESCE(STDDEV(score_economia), 0)::numeric, 1),
      'p10', ROUND(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY score_economia)::numeric, 1),
      'p25', ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY score_economia)::numeric, 1),
      'p50', ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY score_economia)::numeric, 1),
      'p75', ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY score_economia)::numeric, 1),
      'p90', ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY score_economia)::numeric, 1)
    ),
    -- Score Total
    'total', json_build_object(
      'avg', ROUND(AVG(kosmos_asset_score)::numeric, 1),
      'median', ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY kosmos_asset_score)::numeric, 1),
      'stddev', ROUND(COALESCE(STDDEV(kosmos_asset_score), 0)::numeric, 1),
      'p10', ROUND(PERCENTILE_CONT(0.1) WITHIN GROUP (ORDER BY kosmos_asset_score)::numeric, 1),
      'p25', ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY kosmos_asset_score)::numeric, 1),
      'p50', ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY kosmos_asset_score)::numeric, 1),
      'p75', ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY kosmos_asset_score)::numeric, 1),
      'p90', ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY kosmos_asset_score)::numeric, 1)
    )
  ) INTO result
  FROM public.audit_results
  WHERE kosmos_asset_score > 0
    AND score_causa > 0
    AND score_cultura > 0
    AND score_economia > 0;

  -- Extrai total_count do resultado para check de m\u00ednimo
  total_count := (result->>'total_count')::integer;

  IF total_count < 5 THEN
    RETURN json_build_object(
      'is_reliable', false,
      'total_count', total_count,
      'min_required', 30,
      'message', 'Dataset insuficiente para gerar benchmarks confi\u00e1veis'
    );
  END IF;

  RETURN result;
END;
$$;

-- ============================================================================
-- 2. calculate_individual_percentile(scores)
-- Calcula em qual percentil cada score se encontra em rela\u00e7\u00e3o \u00e0 base.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_individual_percentile(
  p_score_causa NUMERIC,
  p_score_cultura NUMERIC,
  p_score_economia NUMERIC,
  p_score_total NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  result JSON;
  total_count INTEGER;
  below_causa INTEGER;
  below_cultura INTEGER;
  below_economia INTEGER;
  below_total INTEGER;
BEGIN
  -- Valida\u00e7\u00e3o de input (scores devem estar entre 0 e 100)
  IF p_score_causa < 0 OR p_score_causa > 100
     OR p_score_cultura < 0 OR p_score_cultura > 100
     OR p_score_economia < 0 OR p_score_economia > 100
     OR p_score_total < 0 OR p_score_total > 100
  THEN
    RETURN json_build_object(
      'is_reliable', false,
      'total_count', 0,
      'percentile_causa', 0,
      'percentile_cultura', 0,
      'percentile_economia', 0,
      'percentile_total', 0
    );
  END IF;

  -- Query \u00fanica: conta total e quantos est\u00e3o abaixo de cada score
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE score_causa < p_score_causa),
    COUNT(*) FILTER (WHERE score_cultura < p_score_cultura),
    COUNT(*) FILTER (WHERE score_economia < p_score_economia),
    COUNT(*) FILTER (WHERE kosmos_asset_score < p_score_total)
  INTO total_count, below_causa, below_cultura, below_economia, below_total
  FROM public.audit_results
  WHERE kosmos_asset_score > 0
    AND score_causa > 0
    AND score_cultura > 0
    AND score_economia > 0;

  IF total_count < 5 THEN
    RETURN json_build_object(
      'is_reliable', false,
      'total_count', total_count,
      'percentile_causa', 50,
      'percentile_cultura', 50,
      'percentile_economia', 50,
      'percentile_total', 50
    );
  END IF;

  SELECT json_build_object(
    'is_reliable', total_count >= 30,
    'total_count', total_count,
    'percentile_causa', ROUND((below_causa::numeric / total_count) * 100),
    'percentile_cultura', ROUND((below_cultura::numeric / total_count) * 100),
    'percentile_economia', ROUND((below_economia::numeric / total_count) * 100),
    'percentile_total', ROUND((below_total::numeric / total_count) * 100)
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================================
-- PERMISSIONS
-- ============================================================================
-- Lead magnet \u00e9 p\u00fablico (usu\u00e1rios n\u00e3o autenticados), por isso grant para anon.

GRANT EXECUTE ON FUNCTION public.get_market_benchmarks() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_individual_percentile(NUMERIC, NUMERIC, NUMERIC, NUMERIC) TO anon, authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.get_market_benchmarks() IS 'Calcula m\u00e9tricas agregadas de mercado (m\u00e9dias, percentis, top 10%) a partir de audit_results';
COMMENT ON FUNCTION public.calculate_individual_percentile(NUMERIC, NUMERIC, NUMERIC, NUMERIC) IS 'Calcula o percentil individual de um resultado em rela\u00e7\u00e3o \u00e0 base de audit_results';
