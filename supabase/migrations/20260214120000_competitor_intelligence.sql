-- ============================================================================
-- KOSMOS Platform - Competitor Intelligence Module
-- ============================================================================
-- Sistema de inteligencia competitiva para analise de concorrentes.
-- A partir de um handle do Instagram, descobre canais, produtos e metricas.
--
-- Tabelas:
--   - competitor_profiles: Perfil principal do concorrente
--   - competitor_channels: Canais descobertos (Instagram, YouTube, etc.)
--   - competitor_products: Produtos descobertos (cursos, mentorias, etc.)
--   - competitor_analysis_runs: Execucoes do pipeline de analise
-- ============================================================================

-- ============================================================================
-- ENUM
-- ============================================================================

CREATE TYPE public.competitor_analysis_status AS ENUM (
  'pending',
  'discovering',
  'scraping',
  'analyzing',
  'enriching',
  'completed',
  'failed'
);

-- ============================================================================
-- COMPETITOR_PROFILES TABLE
-- ============================================================================

CREATE TABLE public.competitor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-tenant: links to organization
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Who created this competitor profile
  created_by UUID NOT NULL REFERENCES public.profiles(id),

  -- Profile information (populated from discovery/scraping)
  instagram_handle TEXT NOT NULL,
  display_name TEXT,
  bio TEXT,
  website_url TEXT,
  avatar_url TEXT,
  category TEXT,

  -- Aggregated counters (updated by analysis runs)
  total_channels INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Instagram handle unique per organization
  UNIQUE(organization_id, instagram_handle)
);

-- ============================================================================
-- COMPETITOR_CHANNELS TABLE
-- ============================================================================

CREATE TABLE public.competitor_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent competitor
  competitor_id UUID NOT NULL REFERENCES public.competitor_profiles(id) ON DELETE CASCADE,

  -- Channel identification
  platform TEXT NOT NULL,   -- instagram, youtube, tiktok, website, podcast, newsletter, twitter
  url TEXT NOT NULL,
  handle TEXT,

  -- Audience metrics
  followers INTEGER,
  total_posts INTEGER,
  engagement_rate NUMERIC(5,2),  -- percentage
  avg_likes INTEGER,
  avg_comments INTEGER,
  avg_views INTEGER,
  avg_shares INTEGER,
  growth_rate_monthly NUMERIC(5,2),  -- percentage

  -- Content strategy
  primary_content_type TEXT,  -- educativo, entretenimento, promocional, storytelling
  primary_format TEXT,        -- video, carrossel, imagem, texto, audio, live
  posting_frequency TEXT,     -- diario, 3x_semana, semanal, quinzenal, mensal
  posts_per_week NUMERIC(4,1),

  -- Raw scraping data for future reprocessing
  raw_data JSONB DEFAULT '{}',
  last_scraped_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- COMPETITOR_PRODUCTS TABLE
-- ============================================================================

CREATE TABLE public.competitor_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent competitor
  competitor_id UUID NOT NULL REFERENCES public.competitor_profiles(id) ON DELETE CASCADE,

  -- Product information
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2),
  currency TEXT DEFAULT 'BRL',
  product_type TEXT,   -- curso, mentoria, comunidade, ebook, consultoria, SaaS
  url TEXT,
  is_recurring BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- COMPETITOR_ANALYSIS_RUNS TABLE
-- ============================================================================

CREATE TABLE public.competitor_analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent competitor
  competitor_id UUID NOT NULL REFERENCES public.competitor_profiles(id) ON DELETE CASCADE,

  -- Pipeline state
  status public.competitor_analysis_status NOT NULL DEFAULT 'pending',
  current_agent TEXT,
  progress INTEGER DEFAULT 0,  -- 0 to 100

  -- Results from each pipeline stage
  discovery_result JSONB,
  scraping_result JSONB,
  analysis_result JSONB,
  enrichment_result JSONB,

  -- Final consolidated insights
  insights JSONB DEFAULT '{}',

  -- Execution timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Competitor Profiles
CREATE INDEX idx_competitor_profiles_org ON public.competitor_profiles(organization_id);
CREATE INDEX idx_competitor_profiles_org_handle ON public.competitor_profiles(organization_id, instagram_handle);
CREATE INDEX idx_competitor_profiles_created_by ON public.competitor_profiles(created_by);

-- Competitor Channels
CREATE INDEX idx_competitor_channels_competitor ON public.competitor_channels(competitor_id);
CREATE INDEX idx_competitor_channels_competitor_platform ON public.competitor_channels(competitor_id, platform);

-- Competitor Products
CREATE INDEX idx_competitor_products_competitor ON public.competitor_products(competitor_id);

-- Competitor Analysis Runs
CREATE INDEX idx_competitor_analysis_runs_competitor ON public.competitor_analysis_runs(competitor_id);
CREATE INDEX idx_competitor_analysis_runs_competitor_status ON public.competitor_analysis_runs(competitor_id, status);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE TRIGGER update_competitor_profiles_updated_at
  BEFORE UPDATE ON public.competitor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.competitor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_analysis_runs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - COMPETITOR_PROFILES (org-level access)
-- ============================================================================

-- SELECT: org members + KOSMOS master
CREATE POLICY "competitor_profiles_select" ON public.competitor_profiles FOR SELECT
  USING (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- INSERT: org members + KOSMOS master
CREATE POLICY "competitor_profiles_insert" ON public.competitor_profiles FOR INSERT
  WITH CHECK (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- UPDATE: org members + KOSMOS master
CREATE POLICY "competitor_profiles_update" ON public.competitor_profiles FOR UPDATE
  USING (
    public.is_org_member(organization_id)
    OR public.is_kosmos_master()
  );

-- DELETE: org admins + KOSMOS master
CREATE POLICY "competitor_profiles_delete" ON public.competitor_profiles FOR DELETE
  USING (
    public.has_org_role(organization_id, 'admin')
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- RLS POLICIES - COMPETITOR_CHANNELS (via competitor_profiles subquery)
-- ============================================================================

-- SELECT: org members via competitor profile
CREATE POLICY "competitor_channels_select" ON public.competitor_channels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_channels.competitor_id
      AND (public.is_org_member(cp.organization_id) OR public.is_kosmos_master())
    )
  );

-- INSERT: org members via competitor profile
CREATE POLICY "competitor_channels_insert" ON public.competitor_channels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_channels.competitor_id
      AND (public.is_org_member(cp.organization_id) OR public.is_kosmos_master())
    )
  );

-- UPDATE: org members via competitor profile
CREATE POLICY "competitor_channels_update" ON public.competitor_channels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_channels.competitor_id
      AND (public.is_org_member(cp.organization_id) OR public.is_kosmos_master())
    )
  );

-- DELETE: org admins via competitor profile
CREATE POLICY "competitor_channels_delete" ON public.competitor_channels FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_channels.competitor_id
      AND (public.has_org_role(cp.organization_id, 'admin') OR public.is_kosmos_master())
    )
  );

-- ============================================================================
-- RLS POLICIES - COMPETITOR_PRODUCTS (via competitor_profiles subquery)
-- ============================================================================

-- SELECT: org members via competitor profile
CREATE POLICY "competitor_products_select" ON public.competitor_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_products.competitor_id
      AND (public.is_org_member(cp.organization_id) OR public.is_kosmos_master())
    )
  );

-- INSERT: org members via competitor profile
CREATE POLICY "competitor_products_insert" ON public.competitor_products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_products.competitor_id
      AND (public.is_org_member(cp.organization_id) OR public.is_kosmos_master())
    )
  );

-- UPDATE: org members via competitor profile
CREATE POLICY "competitor_products_update" ON public.competitor_products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_products.competitor_id
      AND (public.is_org_member(cp.organization_id) OR public.is_kosmos_master())
    )
  );

-- DELETE: org admins via competitor profile
CREATE POLICY "competitor_products_delete" ON public.competitor_products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_products.competitor_id
      AND (public.has_org_role(cp.organization_id, 'admin') OR public.is_kosmos_master())
    )
  );

-- ============================================================================
-- RLS POLICIES - COMPETITOR_ANALYSIS_RUNS (via competitor_profiles subquery)
-- ============================================================================

-- SELECT: org members via competitor profile
CREATE POLICY "competitor_analysis_runs_select" ON public.competitor_analysis_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_analysis_runs.competitor_id
      AND (public.is_org_member(cp.organization_id) OR public.is_kosmos_master())
    )
  );

-- INSERT: org members via competitor profile
CREATE POLICY "competitor_analysis_runs_insert" ON public.competitor_analysis_runs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_analysis_runs.competitor_id
      AND (public.is_org_member(cp.organization_id) OR public.is_kosmos_master())
    )
  );

-- UPDATE: org members via competitor profile
CREATE POLICY "competitor_analysis_runs_update" ON public.competitor_analysis_runs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_analysis_runs.competitor_id
      AND (public.is_org_member(cp.organization_id) OR public.is_kosmos_master())
    )
  );

-- DELETE: org admins via competitor profile
CREATE POLICY "competitor_analysis_runs_delete" ON public.competitor_analysis_runs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_profiles cp
      WHERE cp.id = competitor_analysis_runs.competitor_id
      AND (public.has_org_role(cp.organization_id, 'admin') OR public.is_kosmos_master())
    )
  );

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitor_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitor_channels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitor_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitor_analysis_runs TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.competitor_profiles IS 'Perfis de concorrentes analisados pela organizacao. Ponto de entrada a partir do handle do Instagram.';
COMMENT ON TABLE public.competitor_channels IS 'Canais digitais descobertos para cada concorrente (Instagram, YouTube, TikTok, etc.).';
COMMENT ON TABLE public.competitor_products IS 'Produtos e ofertas descobertos para cada concorrente (cursos, mentorias, comunidades, etc.).';
COMMENT ON TABLE public.competitor_analysis_runs IS 'Execucoes do pipeline de analise de concorrentes com status, progresso e resultados por etapa.';

COMMENT ON COLUMN public.competitor_profiles.instagram_handle IS 'Handle do Instagram do concorrente (sem @). Ponto de partida para descoberta.';
COMMENT ON COLUMN public.competitor_profiles.total_channels IS 'Contador agregado de canais descobertos. Atualizado pelo pipeline de analise.';
COMMENT ON COLUMN public.competitor_profiles.total_products IS 'Contador agregado de produtos descobertos. Atualizado pelo pipeline de analise.';

COMMENT ON COLUMN public.competitor_channels.platform IS 'Plataforma do canal: instagram, youtube, tiktok, website, podcast, newsletter, twitter.';
COMMENT ON COLUMN public.competitor_channels.engagement_rate IS 'Taxa de engajamento em porcentagem (ex: 3.50 = 3.5%).';
COMMENT ON COLUMN public.competitor_channels.growth_rate_monthly IS 'Taxa de crescimento mensal de seguidores em porcentagem.';
COMMENT ON COLUMN public.competitor_channels.primary_content_type IS 'Tipo predominante de conteudo: educativo, entretenimento, promocional, storytelling.';
COMMENT ON COLUMN public.competitor_channels.primary_format IS 'Formato predominante: video, carrossel, imagem, texto, audio, live.';
COMMENT ON COLUMN public.competitor_channels.posting_frequency IS 'Frequencia de publicacao: diario, 3x_semana, semanal, quinzenal, mensal.';
COMMENT ON COLUMN public.competitor_channels.raw_data IS 'Dados brutos do scraping para reprocessamento futuro.';

COMMENT ON COLUMN public.competitor_products.product_type IS 'Tipo do produto: curso, mentoria, comunidade, ebook, consultoria, SaaS.';
COMMENT ON COLUMN public.competitor_products.is_recurring IS 'Indica se o produto tem cobranca recorrente (assinatura).';

COMMENT ON COLUMN public.competitor_analysis_runs.status IS 'Status do pipeline: pending, discovering, scraping, analyzing, enriching, completed, failed.';
COMMENT ON COLUMN public.competitor_analysis_runs.current_agent IS 'Nome do agente de IA atualmente processando esta analise.';
COMMENT ON COLUMN public.competitor_analysis_runs.progress IS 'Progresso da analise de 0 a 100 porcento.';
COMMENT ON COLUMN public.competitor_analysis_runs.insights IS 'Insights consolidados gerados ao final da analise.';
