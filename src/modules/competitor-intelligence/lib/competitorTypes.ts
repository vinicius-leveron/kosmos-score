/**
 * Competitor Intelligence Module - TypeScript Types
 */

// ============================================================================
// Pipeline Status
// ============================================================================

export type CompetitorAnalysisStatus =
  | 'pending'
  | 'discovering'
  | 'scraping'
  | 'analyzing'
  | 'enriching'
  | 'completed'
  | 'failed';

// ============================================================================
// Database Entity Types
// ============================================================================

export interface CompetitorProfile {
  id: string;
  organization_id: string;
  created_by: string;
  instagram_handle: string;
  display_name: string | null;
  bio: string | null;
  website_url: string | null;
  avatar_url: string | null;
  category: string | null;
  total_channels: number;
  total_products: number;
  created_at: string;
  updated_at: string;
}

export interface CompetitorChannel {
  id: string;
  competitor_id: string;
  platform: ChannelPlatform;
  url: string;
  handle: string | null;
  followers: number | null;
  total_posts: number | null;
  engagement_rate: number | null;
  avg_likes: number | null;
  avg_comments: number | null;
  avg_views: number | null;
  avg_shares: number | null;
  growth_rate_monthly: number | null;
  primary_content_type: ContentType | null;
  primary_format: ContentFormat | null;
  posting_frequency: PostingFrequency | null;
  posts_per_week: number | null;
  raw_data: Record<string, unknown>;
  last_scraped_at: string | null;
  created_at: string;
}

export interface CompetitorProduct {
  id: string;
  competitor_id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string;
  product_type: ProductType | null;
  url: string | null;
  is_recurring: boolean;
  created_at: string;
}

export interface CompetitorAnalysisRun {
  id: string;
  competitor_id: string;
  status: CompetitorAnalysisStatus;
  current_agent: string | null;
  progress: number;
  discovery_result: Record<string, unknown> | null;
  scraping_result: Record<string, unknown> | null;
  analysis_result: Record<string, unknown> | null;
  enrichment_result: Record<string, unknown> | null;
  insights: CompetitorInsights;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

// ============================================================================
// Insights (LLM output)
// ============================================================================

export interface CompetitorInsights {
  posicionamento?: string;
  pontos_fortes?: string[];
  pontos_fracos?: string[];
  oportunidades?: string[];
  ameacas?: string[];
  recomendacoes?: string[];
  resumo_executivo?: string;
}

// ============================================================================
// Enums / Literals
// ============================================================================

export type ChannelPlatform =
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'website'
  | 'podcast'
  | 'newsletter'
  | 'twitter';

export type ContentType =
  | 'educativo'
  | 'entretenimento'
  | 'promocional'
  | 'storytelling';

export type ContentFormat =
  | 'video'
  | 'carrossel'
  | 'imagem'
  | 'texto'
  | 'audio'
  | 'live';

export type PostingFrequency =
  | 'diario'
  | '3x_semana'
  | 'semanal'
  | 'quinzenal'
  | 'mensal';

export type ProductType =
  | 'curso'
  | 'mentoria'
  | 'comunidade'
  | 'ebook'
  | 'consultoria'
  | 'SaaS';

// ============================================================================
// Composite Types (for UI)
// ============================================================================

export interface CompetitorWithLatestRun extends CompetitorProfile {
  latest_run: CompetitorAnalysisRun | null;
}

export interface CompetitorDetail extends CompetitorProfile {
  channels: CompetitorChannel[];
  products: CompetitorProduct[];
  latest_run: CompetitorAnalysisRun | null;
}
