
-- Security Events table to log all security incidents
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allowed domains for client email verification
CREATE TABLE public.allowed_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, domain)
);

-- Pending client approvals
CREATE TABLE public.pending_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, email)
);

-- User sessions for session management
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL UNIQUE,
  device_fingerprint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  device_type TEXT,
  geo_location JSONB DEFAULT '{}',
  is_current BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blocked IPs table
CREATE TABLE public.blocked_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  reason TEXT,
  blocked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  blocked_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_global BOOLEAN DEFAULT false,
  UNIQUE(organization_id, ip_address)
);

-- Flagged content for review
CREATE TABLE public.flagged_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('message', 'attachment', 'link', 'email')),
  content_id UUID,
  flagged_content TEXT,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  auto_flagged BOOLEAN DEFAULT true,
  flagged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add security settings to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{
  "block_generic_email_providers": false,
  "require_domain_approval": true,
  "max_concurrent_sessions": 3,
  "session_timeout_minutes": 30,
  "session_max_age_days": 7,
  "ip_binding_enabled": false,
  "notify_new_device_login": true,
  "scan_external_links": true,
  "block_dangerous_attachments": true
}'::jsonb;

-- Indexes for performance
CREATE INDEX idx_security_events_org ON public.security_events(organization_id);
CREATE INDEX idx_security_events_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_created ON public.security_events(created_at DESC);
CREATE INDEX idx_security_events_user ON public.security_events(user_id);

CREATE INDEX idx_allowed_domains_org ON public.allowed_domains(organization_id);
CREATE INDEX idx_pending_clients_org ON public.pending_clients(organization_id);
CREATE INDEX idx_pending_clients_status ON public.pending_clients(status);

CREATE INDEX idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON public.user_sessions(expires_at);

CREATE INDEX idx_blocked_ips_org ON public.blocked_ips(organization_id);
CREATE INDEX idx_blocked_ips_expires ON public.blocked_ips(expires_at);

CREATE INDEX idx_flagged_content_org ON public.flagged_content(organization_id);
CREATE INDEX idx_flagged_content_reviewed ON public.flagged_content(reviewed);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowed_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for security_events
CREATE POLICY "Admins can view org security events" ON public.security_events
  FOR SELECT USING (
    organization_id = get_user_organization_id() 
    AND get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "System can insert security events" ON public.security_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update security events" ON public.security_events
  FOR UPDATE USING (
    organization_id = get_user_organization_id() 
    AND get_user_role() IN ('admin', 'super_admin')
  );

-- RLS Policies for allowed_domains
CREATE POLICY "Org members can view allowed domains" ON public.allowed_domains
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage allowed domains" ON public.allowed_domains
  FOR ALL USING (
    organization_id = get_user_organization_id() 
    AND get_user_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    organization_id = get_user_organization_id() 
    AND get_user_role() IN ('admin', 'super_admin')
  );

-- RLS Policies for pending_clients
CREATE POLICY "Admins can view pending clients" ON public.pending_clients
  FOR SELECT USING (
    organization_id = get_user_organization_id() 
    AND get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Anyone can create pending client" ON public.pending_clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update pending clients" ON public.pending_clients
  FOR UPDATE USING (
    organization_id = get_user_organization_id() 
    AND get_user_role() IN ('admin', 'super_admin')
  );

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for blocked_ips
CREATE POLICY "Admins can manage blocked IPs" ON public.blocked_ips
  FOR ALL USING (
    (organization_id = get_user_organization_id() AND get_user_role() IN ('admin', 'super_admin'))
    OR is_super_admin()
  )
  WITH CHECK (
    (organization_id = get_user_organization_id() AND get_user_role() IN ('admin', 'super_admin'))
    OR is_super_admin()
  );

-- RLS Policies for flagged_content
CREATE POLICY "Admins can view flagged content" ON public.flagged_content
  FOR SELECT USING (
    organization_id = get_user_organization_id() 
    AND get_user_role() IN ('admin', 'agent', 'super_admin')
  );

CREATE POLICY "System can insert flagged content" ON public.flagged_content
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update flagged content" ON public.flagged_content
  FOR UPDATE USING (
    organization_id = get_user_organization_id() 
    AND get_user_role() IN ('admin', 'super_admin')
  );

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_organization_id UUID,
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'low'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO security_events (
    organization_id,
    event_type,
    user_id,
    ip_address,
    user_agent,
    details,
    severity
  ) VALUES (
    p_organization_id,
    p_event_type,
    p_user_id,
    p_ip_address,
    p_user_agent,
    p_details,
    p_severity
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function to check if domain is allowed
CREATE OR REPLACE FUNCTION public.check_domain_allowed(
  p_organization_id UUID,
  p_email TEXT
)
RETURNS TABLE(allowed BOOLEAN, requires_approval BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_domain TEXT;
  v_domain_exists BOOLEAN;
  v_require_approval BOOLEAN;
  v_block_generic BOOLEAN;
  v_generic_domains TEXT[] := ARRAY['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'];
BEGIN
  -- Extract domain from email
  v_domain := split_part(p_email, '@', 2);
  
  -- Get org security settings
  SELECT 
    COALESCE((security_settings->>'require_domain_approval')::boolean, true),
    COALESCE((security_settings->>'block_generic_email_providers')::boolean, false)
  INTO v_require_approval, v_block_generic
  FROM organizations
  WHERE id = p_organization_id;
  
  -- Check if generic domain and blocked
  IF v_block_generic AND v_domain = ANY(v_generic_domains) THEN
    RETURN QUERY SELECT false, false;
    RETURN;
  END IF;
  
  -- Check if domain is in allowed list
  SELECT EXISTS(
    SELECT 1 FROM allowed_domains 
    WHERE organization_id = p_organization_id 
    AND domain = v_domain
  ) INTO v_domain_exists;
  
  IF v_domain_exists THEN
    RETURN QUERY SELECT true, false;
  ELSIF v_require_approval THEN
    RETURN QUERY SELECT false, true;
  ELSE
    RETURN QUERY SELECT true, false;
  END IF;
END;
$$;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < now();
  DELETE FROM blocked_ips WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$;
