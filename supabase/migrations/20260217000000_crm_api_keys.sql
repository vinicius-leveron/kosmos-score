-- ============================================================================
-- CRM API KEYS & WEBHOOKS INFRASTRUCTURE
-- ============================================================================
-- This migration creates the infrastructure for external API integrations:
-- 1. API Keys - Per-organization authentication for external systems
-- 2. Rate Limiting - Request throttling per API key
-- 3. Webhooks - Receive data from external systems (Zapier, Typeform, etc.)
-- ============================================================================

-- ============================================================================
-- 1. API KEYS TABLE
-- ============================================================================

CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Key identification
  name TEXT NOT NULL,                    -- Human-readable name: "Zapier Integration"
  description TEXT,                      -- Optional description
  key_prefix TEXT NOT NULL UNIQUE,       -- First 15 chars for lookup: "ks_live_abc1234"
  key_hash TEXT NOT NULL,                -- bcrypt hash of full key

  -- Permissions (granular access control)
  permissions JSONB NOT NULL DEFAULT '{
    "contacts": {"read": true, "write": true, "delete": false},
    "companies": {"read": true, "write": true, "delete": false},
    "deals": {"read": true, "write": true, "delete": false},
    "activities": {"read": true, "write": true, "delete": false},
    "tags": {"read": true, "write": false, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false},
    "pipelines": {"read": true, "write": false, "delete": false}
  }'::jsonb,

  -- Security settings
  allowed_ips TEXT[],                    -- IP whitelist (null = allow all)
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  rate_limit_per_day INTEGER NOT NULL DEFAULT 10000,

  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  last_used_ip TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,

  -- Lifecycle
  expires_at TIMESTAMPTZ,                -- Optional expiration date
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Audit
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_api_keys_organization ON public.api_keys(organization_id);
CREATE INDEX idx_api_keys_prefix ON public.api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = true;

-- Updated at trigger
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. RATE LIMITING TABLE
-- ============================================================================

CREATE TABLE public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL,
  window_type TEXT NOT NULL CHECK (window_type IN ('minute', 'day')),
  request_count INTEGER NOT NULL DEFAULT 1,

  UNIQUE(api_key_id, window_start, window_type)
);

-- Index for fast lookups
CREATE INDEX idx_api_rate_limits_lookup ON public.api_rate_limits(api_key_id, window_type, window_start);

-- Cleanup old rate limit records (older than 2 days)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.api_rate_limits
  WHERE window_start < now() - INTERVAL '2 days';
END;
$$;

-- ============================================================================
-- 3. WEBHOOKS TABLE
-- ============================================================================

CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Identification
  name TEXT NOT NULL,                    -- "Typeform Leads", "Zapier Contact Sync"
  description TEXT,

  -- Endpoint configuration
  endpoint_path TEXT NOT NULL UNIQUE,    -- Random path: "wh_abc123xyz789"
  secret_token TEXT NOT NULL,            -- For signature validation

  -- Source configuration
  source TEXT NOT NULL DEFAULT 'custom', -- "typeform", "zapier", "hubspot", "custom"

  -- Field mapping (source field -> CRM field)
  field_mapping JSONB NOT NULL DEFAULT '{
    "email": "email",
    "name": "full_name",
    "phone": "phone"
  }'::jsonb,

  -- Default values for new contacts
  default_values JSONB DEFAULT '{}'::jsonb,

  -- Target configuration
  target_entity TEXT NOT NULL DEFAULT 'contact' CHECK (target_entity IN ('contact', 'company', 'deal', 'activity')),
  target_pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE SET NULL,
  target_stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE SET NULL,
  default_tags TEXT[],                   -- Tag names to auto-apply

  -- Status and metrics
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_received_at TIMESTAMPTZ,
  total_received INTEGER NOT NULL DEFAULT 0,
  total_processed INTEGER NOT NULL DEFAULT 0,
  total_errors INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_webhooks_organization ON public.webhooks(organization_id);
CREATE INDEX idx_webhooks_path ON public.webhooks(endpoint_path);
CREATE INDEX idx_webhooks_active ON public.webhooks(is_active) WHERE is_active = true;

-- Updated at trigger
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. WEBHOOK LOGS TABLE
-- ============================================================================

CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,

  -- Request data
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_headers JSONB,
  request_payload JSONB NOT NULL,
  source_ip TEXT,

  -- Processing status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'ignored')),

  -- Result
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_entity_type TEXT,
  created_entity_id UUID,

  -- Mapped data (after transformation)
  mapped_data JSONB
);

-- Indexes
CREATE INDEX idx_webhook_logs_webhook ON public.webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX idx_webhook_logs_received ON public.webhook_logs(received_at DESC);

-- Cleanup old logs (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.webhook_logs
  WHERE received_at < now() - INTERVAL '30 days';
END;
$$;

-- ============================================================================
-- 5. API REQUEST LOGS TABLE (for debugging and analytics)
-- ============================================================================

CREATE TABLE public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,

  -- Request info
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  query_params JSONB,
  request_body JSONB,
  source_ip TEXT,
  user_agent TEXT,

  -- Response info
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,

  -- Context
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL
);

-- Index for analytics
CREATE INDEX idx_api_request_logs_key ON public.api_request_logs(api_key_id);
CREATE INDEX idx_api_request_logs_time ON public.api_request_logs(requested_at DESC);
CREATE INDEX idx_api_request_logs_org ON public.api_request_logs(organization_id);

-- Cleanup old logs (keep 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_api_logs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.api_request_logs
  WHERE requested_at < now() - INTERVAL '7 days';
END;
$$;

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

-- API Keys: Only org admins/owners can manage
CREATE POLICY "api_keys_select" ON public.api_keys
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR public.is_kosmos_master()
  );

CREATE POLICY "api_keys_insert" ON public.api_keys
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR public.is_kosmos_master()
  );

CREATE POLICY "api_keys_update" ON public.api_keys
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR public.is_kosmos_master()
  );

CREATE POLICY "api_keys_delete" ON public.api_keys
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR public.is_kosmos_master()
  );

-- Rate limits: Internal only (accessed via service role)
CREATE POLICY "rate_limits_service" ON public.api_rate_limits
  FOR ALL USING (false);

-- Webhooks: Only org admins/owners can manage
CREATE POLICY "webhooks_select" ON public.webhooks
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR public.is_kosmos_master()
  );

CREATE POLICY "webhooks_insert" ON public.webhooks
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR public.is_kosmos_master()
  );

CREATE POLICY "webhooks_update" ON public.webhooks
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR public.is_kosmos_master()
  );

CREATE POLICY "webhooks_delete" ON public.webhooks
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR public.is_kosmos_master()
  );

-- Webhook logs: Viewable by org admins
CREATE POLICY "webhook_logs_select" ON public.webhook_logs
  FOR SELECT USING (
    webhook_id IN (
      SELECT id FROM public.webhooks
      WHERE organization_id IN (
        SELECT organization_id FROM public.org_members
        WHERE profile_id = auth.uid()
        AND role IN ('owner', 'admin')
      )
    )
    OR public.is_kosmos_master()
  );

-- API request logs: Viewable by org admins
CREATE POLICY "api_logs_select" ON public.api_request_logs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE profile_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR public.is_kosmos_master()
  );

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Generate webhook endpoint path
CREATE OR REPLACE FUNCTION generate_webhook_path()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_path TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random path: wh_[16 random chars]
    v_path := 'wh_' || encode(gen_random_bytes(12), 'hex');

    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM public.webhooks WHERE endpoint_path = v_path) INTO v_exists;

    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_path;
END;
$$;

-- Check and increment rate limit (returns true if allowed)
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_api_key_id UUID,
  p_limit_per_minute INTEGER,
  p_limit_per_day INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_minute_start TIMESTAMPTZ;
  v_day_start TIMESTAMPTZ;
  v_minute_count INTEGER;
  v_day_count INTEGER;
BEGIN
  -- Calculate window starts
  v_minute_start := date_trunc('minute', now());
  v_day_start := date_trunc('day', now());

  -- Get or create minute counter
  INSERT INTO public.api_rate_limits (api_key_id, window_start, window_type, request_count)
  VALUES (p_api_key_id, v_minute_start, 'minute', 1)
  ON CONFLICT (api_key_id, window_start, window_type)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1
  RETURNING request_count INTO v_minute_count;

  -- Check minute limit
  IF v_minute_count > p_limit_per_minute THEN
    RETURN false;
  END IF;

  -- Get or create day counter
  INSERT INTO public.api_rate_limits (api_key_id, window_start, window_type, request_count)
  VALUES (p_api_key_id, v_day_start, 'day', 1)
  ON CONFLICT (api_key_id, window_start, window_type)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1
  RETURNING request_count INTO v_day_count;

  -- Check day limit
  IF v_day_count > p_limit_per_day THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- ============================================================================
-- 8. COMMENTS
-- ============================================================================

COMMENT ON TABLE public.api_keys IS 'API keys for external integrations with the CRM';
COMMENT ON TABLE public.api_rate_limits IS 'Rate limiting counters for API keys';
COMMENT ON TABLE public.webhooks IS 'Webhook endpoints for receiving data from external systems';
COMMENT ON TABLE public.webhook_logs IS 'Logs of webhook requests received';
COMMENT ON TABLE public.api_request_logs IS 'Logs of API requests for debugging and analytics';

COMMENT ON COLUMN public.api_keys.key_prefix IS 'First 15 characters of the API key for safe display and lookup';
COMMENT ON COLUMN public.api_keys.key_hash IS 'bcrypt hash of the full API key';
COMMENT ON COLUMN public.api_keys.permissions IS 'Granular permissions for each CRM entity (read/write/delete)';
COMMENT ON COLUMN public.webhooks.endpoint_path IS 'Unique path for the webhook URL: /webhooks/{endpoint_path}';
COMMENT ON COLUMN public.webhooks.field_mapping IS 'Maps source fields to CRM fields';
