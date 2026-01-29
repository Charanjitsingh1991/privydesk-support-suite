-- API Keys table for third-party integrations
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 8 chars for display (e.g., "pk_live_")
  key_hash TEXT NOT NULL, -- SHA-256 hash of the full key
  permissions TEXT[] NOT NULL DEFAULT '{}', -- Scopes like 'read:tickets', 'write:tickets'
  rate_limit INTEGER NOT NULL DEFAULT 60, -- Requests per minute
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook configurations table
CREATE TABLE public.webhook_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL, -- For HMAC signature verification
  events TEXT[] NOT NULL DEFAULT '{}', -- Events to subscribe to
  is_active BOOLEAN NOT NULL DEFAULT true,
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook delivery logs
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_config_id UUID NOT NULL REFERENCES public.webhook_configs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
  response_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- API request logs for audit
CREATE TABLE public.api_request_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  request_body JSONB,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_api_keys_org ON public.api_keys(organization_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_webhook_configs_org ON public.webhook_configs(organization_id);
CREATE INDEX idx_webhook_logs_config ON public.webhook_logs(webhook_config_id);
CREATE INDEX idx_webhook_logs_created ON public.webhook_logs(created_at DESC);
CREATE INDEX idx_api_request_logs_key ON public.api_request_logs(api_key_id);
CREATE INDEX idx_api_request_logs_created ON public.api_request_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Users can view their org API keys"
  ON public.api_keys FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can create API keys"
  ON public.api_keys FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can update API keys"
  ON public.api_keys FOR UPDATE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can delete API keys"
  ON public.api_keys FOR DELETE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

-- RLS Policies for webhook_configs
CREATE POLICY "Users can view their org webhooks"
  ON public.webhook_configs FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Admins can create webhooks"
  ON public.webhook_configs FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can update webhooks"
  ON public.webhook_configs FOR UPDATE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can delete webhooks"
  ON public.webhook_configs FOR DELETE
  USING (
    organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'super_admin')
  );

-- RLS Policies for webhook_logs
CREATE POLICY "Users can view their org webhook logs"
  ON public.webhook_logs FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "System can insert webhook logs"
  ON public.webhook_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for api_request_logs
CREATE POLICY "Users can view their org API logs"
  ON public.api_request_logs FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "System can insert API logs"
  ON public.api_request_logs FOR INSERT
  WITH CHECK (true);

-- Function to validate API key and return org info
CREATE OR REPLACE FUNCTION public.validate_api_key(p_api_key TEXT)
RETURNS TABLE(
  api_key_id UUID,
  organization_id UUID,
  permissions TEXT[],
  rate_limit INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key_hash TEXT;
BEGIN
  -- Hash the provided key
  v_key_hash := encode(sha256(p_api_key::bytea), 'hex');
  
  RETURN QUERY
  SELECT 
    ak.id,
    ak.organization_id,
    ak.permissions,
    ak.rate_limit
  FROM public.api_keys ak
  WHERE ak.key_hash = v_key_hash
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > now());
  
  -- Update last_used_at
  UPDATE public.api_keys 
  SET last_used_at = now()
  WHERE key_hash = v_key_hash;
END;
$$;

-- Function to check API rate limit
CREATE OR REPLACE FUNCTION public.check_api_rate_limit(
  p_api_key_id UUID,
  p_rate_limit INTEGER
)
RETURNS TABLE(
  allowed BOOLEAN,
  remaining INTEGER,
  reset_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_request_count INTEGER;
BEGIN
  v_window_start := date_trunc('minute', now());
  
  -- Count requests in current minute
  SELECT COUNT(*) INTO v_request_count
  FROM public.api_request_logs
  WHERE api_key_id = p_api_key_id
    AND created_at >= v_window_start;
  
  RETURN QUERY
  SELECT 
    v_request_count < p_rate_limit,
    GREATEST(0, p_rate_limit - v_request_count - 1),
    v_window_start + interval '1 minute';
END;
$$;

-- Updated_at triggers
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_webhook_configs_updated_at
  BEFORE UPDATE ON public.webhook_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();