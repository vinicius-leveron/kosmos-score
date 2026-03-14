export interface InstagramAccount {
  id: string;
  organization_id: string;
  ig_user_id: string;
  ig_username: string;
  ig_name: string | null;
  ig_profile_picture_url: string | null;
  facebook_page_id: string;
  facebook_user_id: string;
  token_expires_at: string;
  scopes: string[];
  is_active: boolean;
  last_sync_at: string | null;
  sync_status: 'pending' | 'syncing' | 'completed' | 'error';
  sync_error: string | null;
  created_at: string;
  updated_at: string;
}

export type MediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REELS';

export interface InstagramMedia {
  id: string;
  organization_id: string;
  account_id: string;
  ig_media_id: string;
  media_type: MediaType;
  media_url: string | null;
  thumbnail_url: string | null;
  permalink: string | null;
  caption: string | null;
  timestamp: string;
  duration_seconds: number | null;
  is_boosted: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaInsights {
  id: string;
  organization_id: string;
  media_id: string;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reposts: number;
  avg_watch_time_ms: number | null;
  total_watch_time_ms: number | null;
  skip_rate: number | null;
  fetched_at: string;
}

export interface AdInsights {
  id: string;
  organization_id: string;
  media_id: string;
  ad_id: string;
  impressions: number;
  reach: number;
  thru_plays: number;
  video_p25: number;
  video_p50: number;
  video_p75: number;
  video_p95: number;
  clicks: number;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  spend: number | null;
  actions: Record<string, unknown>[];
  cost_per_action: Record<string, unknown>[];
  purchase_roas: Record<string, unknown> | null;
  fetched_at: string;
}

export interface AccountDailyInsights {
  id: string;
  organization_id: string;
  account_id: string;
  date: string;
  views: number;
  reach: number;
  follower_count: number;
  views_by_media_type: {
    reels?: number;
    feed?: number;
    stories?: number;
  };
  views_by_follower_type: {
    follower?: number;
    non_follower?: number;
  };
  fetched_at: string;
}

export interface DerivedMetrics {
  engagement_rate: number;
  retention_pct: number | null;
  virality_rate: number;
  repost_rate: number;
  completion_rate: number | null;
}

export type HookQuadrant = 'ideal' | 'weak_middle' | 'weak_hook' | 'rethink_all';

export interface ReelWithInsights extends InstagramMedia {
  insights: MediaInsights | null;
  ad_insights: AdInsights | null;
  derived: DerivedMetrics;
  hook_quadrant: HookQuadrant | null;
}

export type DateRange = '7d' | '30d' | '90d' | '6m' | '1y';

export type DashboardTab = 'overview' | 'reels' | 'retention' | 'evolution' | 'virality' | 'benchmarking' | 'roi';
