-- ============================================================================
-- BENCHMARKS - Serviço de Benchmarking KOSMOS
-- ============================================================================
-- Armazena análises de benchmark realizadas pela equipe KOSMOS para clientes.
-- Admin KOSMOS inputa dados manualmente, cliente visualiza dashboard interativo.
-- ============================================================================

-- Status do benchmark
CREATE TYPE public.benchmark_status AS ENUM ('draft', 'published', 'archived');

-- Tabela principal de benchmarks
CREATE TABLE public.benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Relacionamentos
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_org_id UUID NOT NULL REFERENCES public.contact_orgs(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,

  -- Metadados
  title TEXT NOT NULL,
  analysis_date DATE NOT NULL,
  status public.benchmark_status NOT NULL DEFAULT 'draft',

  -- Scores do cliente (0-100)
  score_causa NUMERIC(5,2),
  score_cultura NUMERIC(5,2),
  score_economia NUMERIC(5,2),
  score_total NUMERIC(5,2),

  -- Médias do mercado (benchmark)
  market_avg_causa NUMERIC(5,2),
  market_avg_cultura NUMERIC(5,2),
  market_avg_economia NUMERIC(5,2),
  market_avg_total NUMERIC(5,2),

  -- Posição percentil do cliente (0-100)
  percentile_causa INTEGER CHECK (percentile_causa >= 0 AND percentile_causa <= 100),
  percentile_cultura INTEGER CHECK (percentile_cultura >= 0 AND percentile_cultura <= 100),
  percentile_economia INTEGER CHECK (percentile_economia >= 0 AND percentile_economia <= 100),
  percentile_total INTEGER CHECK (percentile_total >= 0 AND percentile_total <= 100),

  -- Top 10% do mercado
  top10_causa NUMERIC(5,2),
  top10_cultura NUMERIC(5,2),
  top10_economia NUMERIC(5,2),
  top10_total NUMERIC(5,2),

  -- Métricas financeiras
  ticket_medio NUMERIC(12,2),
  ticket_medio_benchmark NUMERIC(12,2),
  ltv_estimado NUMERIC(12,2),
  ltv_benchmark NUMERIC(12,2),
  lucro_oculto NUMERIC(12,2),
  projecao_crescimento NUMERIC(5,2),

  -- Insights estruturados (JSONB)
  -- {
  --   "pontos_fortes": ["texto1", "texto2"],
  --   "oportunidades": ["texto1", "texto2"],
  --   "riscos": ["texto1"],
  --   "plano_acao": [{"prioridade": 1, "acao": "texto", "impacto": "alto"}],
  --   "analise_qualitativa": "texto longo..."
  -- }
  insights JSONB NOT NULL DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  UNIQUE(organization_id, contact_org_id, analysis_date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_benchmarks_organization_id ON public.benchmarks(organization_id);
CREATE INDEX idx_benchmarks_contact_org_id ON public.benchmarks(contact_org_id);
CREATE INDEX idx_benchmarks_created_by ON public.benchmarks(created_by);
CREATE INDEX idx_benchmarks_status ON public.benchmarks(status);
CREATE INDEX idx_benchmarks_analysis_date ON public.benchmarks(analysis_date DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;

-- Admin KOSMOS pode fazer tudo (membros da org KOSMOS master)
CREATE POLICY "benchmarks_admin_all" ON public.benchmarks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.profile_id = auth.uid()
        AND om.organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid
        AND om.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.profile_id = auth.uid()
        AND om.organization_id = 'c0000000-0000-0000-0000-000000000001'::uuid
        AND om.role IN ('admin', 'owner')
    )
  );

-- Cliente pode ver apenas benchmarks publicados da própria organização
CREATE POLICY "benchmarks_client_select" ON public.benchmarks
  FOR SELECT
  USING (
    status = 'published'
    AND EXISTS (
      SELECT 1 FROM public.org_members om
      WHERE om.profile_id = auth.uid()
        AND om.organization_id = benchmarks.organization_id
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para updated_at
CREATE TRIGGER set_benchmarks_updated_at
  BEFORE UPDATE ON public.benchmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para set published_at quando status muda para published
CREATE OR REPLACE FUNCTION public.handle_benchmark_publish()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_benchmark_published_at
  BEFORE UPDATE ON public.benchmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_benchmark_publish();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.benchmarks IS 'Análises de benchmark realizadas pela equipe KOSMOS para clientes';
COMMENT ON COLUMN public.benchmarks.score_causa IS 'Score do cliente no pilar Causa (0-100)';
COMMENT ON COLUMN public.benchmarks.score_cultura IS 'Score do cliente no pilar Cultura (0-100)';
COMMENT ON COLUMN public.benchmarks.score_economia IS 'Score do cliente no pilar Economia (0-100)';
COMMENT ON COLUMN public.benchmarks.market_avg_causa IS 'Média do mercado no pilar Causa';
COMMENT ON COLUMN public.benchmarks.percentile_causa IS 'Posição percentil do cliente no pilar Causa';
COMMENT ON COLUMN public.benchmarks.top10_causa IS 'Score do top 10% do mercado no pilar Causa';
COMMENT ON COLUMN public.benchmarks.insights IS 'Insights estruturados: pontos_fortes, oportunidades, riscos, plano_acao, analise_qualitativa';
