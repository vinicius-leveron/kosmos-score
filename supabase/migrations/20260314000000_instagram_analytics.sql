-- Instagram Analytics Module - Database Schema
-- Tables for storing Instagram account connections, media, and insights

-- =============================================================================
-- 1. instagram_accounts - Connected Instagram accounts via OAuth
-- =============================================================================
CREATE TABLE public.instagram_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  ig_user_id TEXT NOT NULL,
  ig_username TEXT NOT NULL,
  ig_name TEXT,
  ig_profile_picture_url TEXT,
  facebook_page_id TEXT NOT NULL,
  facebook_user_id TEXT NOT NULL,
  access_token_secret_id UUID,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'completed', 'error')),
  sync_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, ig_user_id)
);

CREATE INDEX idx_instagram_accounts_org ON public.instagram_accounts(organization_id);
CREATE INDEX idx_instagram_accounts_active ON public.instagram_accounts(organization_id, is_active) WHERE is_active = true;

ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instagram_accounts_select" ON public.instagram_accounts FOR SELECT
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_accounts_insert" ON public.instagram_accounts FOR INSERT
  WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_accounts_update" ON public.instagram_accounts FOR UPDATE
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master())
  WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_accounts_delete" ON public.instagram_accounts FOR DELETE
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

-- =============================================================================
-- 2. instagram_media - Posts, Reels, Carousels metadata
-- =============================================================================
CREATE TABLE public.instagram_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  account_id UUID NOT NULL REFERENCES public.instagram_accounts(id) ON DELETE CASCADE,
  ig_media_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO', 'CAROUSEL_ALBUM', 'REELS')),
  media_url TEXT,
  thumbnail_url TEXT,
  permalink TEXT,
  caption TEXT,
  "timestamp" TIMESTAMPTZ NOT NULL,
  duration_seconds NUMERIC,
  is_boosted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(account_id, ig_media_id)
);

CREATE INDEX idx_instagram_media_org ON public.instagram_media(organization_id);
CREATE INDEX idx_instagram_media_account ON public.instagram_media(account_id);
CREATE INDEX idx_instagram_media_type ON public.instagram_media(account_id, media_type);
CREATE INDEX idx_instagram_media_timestamp ON public.instagram_media(account_id, "timestamp" DESC);

ALTER TABLE public.instagram_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instagram_media_select" ON public.instagram_media FOR SELECT
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_media_insert" ON public.instagram_media FOR INSERT
  WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_media_update" ON public.instagram_media FOR UPDATE
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master())
  WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_media_delete" ON public.instagram_media FOR DELETE
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

-- =============================================================================
-- 3. instagram_media_insights - Organic metrics per media
-- =============================================================================
CREATE TABLE public.instagram_media_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  media_id UUID NOT NULL REFERENCES public.instagram_media(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  avg_watch_time_ms INTEGER,
  total_watch_time_ms INTEGER,
  skip_rate NUMERIC(5,2),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(media_id)
);

CREATE INDEX idx_instagram_media_insights_org ON public.instagram_media_insights(organization_id);
CREATE INDEX idx_instagram_media_insights_media ON public.instagram_media_insights(media_id);

ALTER TABLE public.instagram_media_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instagram_media_insights_select" ON public.instagram_media_insights FOR SELECT
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_media_insights_insert" ON public.instagram_media_insights FOR INSERT
  WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_media_insights_update" ON public.instagram_media_insights FOR UPDATE
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master())
  WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_media_insights_delete" ON public.instagram_media_insights FOR DELETE
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

-- =============================================================================
-- 4. instagram_ad_insights - Paid metrics (Marketing API)
-- =============================================================================
CREATE TABLE public.instagram_ad_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  media_id UUID NOT NULL REFERENCES public.instagram_media(id) ON DELETE CASCADE,
  ad_id TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  thru_plays INTEGER DEFAULT 0,
  video_p25 INTEGER DEFAULT 0,
  video_p50 INTEGER DEFAULT 0,
  video_p75 INTEGER DEFAULT 0,
  video_p95 INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(8,4),
  cpc NUMERIC(10,2),
  cpm NUMERIC(10,2),
  spend NUMERIC(10,2),
  actions JSONB DEFAULT '[]',
  cost_per_action JSONB DEFAULT '[]',
  purchase_roas JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(media_id, ad_id)
);

CREATE INDEX idx_instagram_ad_insights_org ON public.instagram_ad_insights(organization_id);
CREATE INDEX idx_instagram_ad_insights_media ON public.instagram_ad_insights(media_id);

ALTER TABLE public.instagram_ad_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instagram_ad_insights_select" ON public.instagram_ad_insights FOR SELECT
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_ad_insights_insert" ON public.instagram_ad_insights FOR INSERT
  WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_ad_insights_update" ON public.instagram_ad_insights FOR UPDATE
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master())
  WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_ad_insights_delete" ON public.instagram_ad_insights FOR DELETE
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

-- =============================================================================
-- 5. instagram_account_insights - Account-level daily metrics
-- =============================================================================
CREATE TABLE public.instagram_account_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  account_id UUID NOT NULL REFERENCES public.instagram_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  views_by_media_type JSONB DEFAULT '{}',
  views_by_follower_type JSONB DEFAULT '{}',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(account_id, date)
);

CREATE INDEX idx_instagram_account_insights_org ON public.instagram_account_insights(organization_id);
CREATE INDEX idx_instagram_account_insights_account_date ON public.instagram_account_insights(account_id, date DESC);

ALTER TABLE public.instagram_account_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instagram_account_insights_select" ON public.instagram_account_insights FOR SELECT
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_account_insights_insert" ON public.instagram_account_insights FOR INSERT
  WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_account_insights_update" ON public.instagram_account_insights FOR UPDATE
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master())
  WITH CHECK (public.is_org_member(organization_id) OR public.is_kosmos_master());

CREATE POLICY "instagram_account_insights_delete" ON public.instagram_account_insights FOR DELETE
  USING (public.is_org_member(organization_id) OR public.is_kosmos_master());
