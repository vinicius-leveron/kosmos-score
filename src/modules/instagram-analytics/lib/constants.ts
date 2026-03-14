export const INSTAGRAM_COLORS = {
  primary: '#E1306C',
  secondary: '#833AB4',
  accent: '#F77737',
  gradient: {
    from: '#833AB4',
    via: '#E1306C',
    to: '#F77737',
  },
} as const;

export const QUADRANT_COLORS = {
  ideal: '#22c55e',
  weak_middle: '#eab308',
  weak_hook: '#f97316',
  rethink_all: '#ef4444',
} as const;

export const QUADRANT_LABELS = {
  ideal: 'Hook bom + Conteudo bom',
  weak_middle: 'Hook bom + Conteudo fraco',
  weak_hook: 'Hook fraco + Conteudo bom',
  rethink_all: 'Repensar tudo',
} as const;

export const METRIC_LABELS = {
  views: 'Views',
  reach: 'Alcance',
  likes: 'Curtidas',
  comments: 'Comentarios',
  shares: 'Compartilhamentos',
  saves: 'Salvos',
  reposts: 'Reposts',
  engagement_rate: 'Taxa de Engajamento',
  retention_pct: 'Retencao %',
  skip_rate: 'Taxa de Skip',
  virality_rate: 'Taxa de Viralidade',
  impressions: 'Impressoes',
  thru_plays: 'ThruPlays',
  clicks: 'Cliques',
  ctr: 'CTR',
  cpc: 'CPC',
  cpm: 'CPM',
  spend: 'Investimento',
} as const;

export const DURATION_BUCKETS = [
  { label: '< 15s', min: 0, max: 15 },
  { label: '15-30s', min: 15, max: 30 },
  { label: '30-60s', min: 30, max: 60 },
  { label: '60s+', min: 60, max: Infinity },
] as const;

export const DAYS_OF_WEEK = [
  'Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado',
] as const;

export const DATE_RANGE_OPTIONS = [
  { value: '7d' as const, label: 'Ultimos 7 dias' },
  { value: '30d' as const, label: 'Ultimos 30 dias' },
  { value: '90d' as const, label: 'Ultimos 90 dias' },
  { value: '6m' as const, label: 'Ultimos 6 meses' },
  { value: '1y' as const, label: 'Ultimo ano' },
] as const;

export const SKIP_RATE_THRESHOLD = 50;
export const COMPLETION_RATE_THRESHOLD = 50;

export const META_API_VERSION = 'v22.0';
export const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;
