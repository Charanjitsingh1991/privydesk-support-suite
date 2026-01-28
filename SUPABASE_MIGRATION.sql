-- =============================================================================
-- PRIVYDESK COMPLETE DATABASE SCHEMA EXPORT
-- Generated for migration to external Supabase
-- =============================================================================

-- =====================
-- ENUMS
-- =====================

CREATE TYPE public.plan_type AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE public.org_status AS ENUM ('active', 'suspended', 'cancelled');
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'agent', 'client');
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- =====================
-- TABLES
-- =====================

-- Organizations
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  custom_domain TEXT,
  domain_verified BOOLEAN DEFAULT false,
  domain_verification_method TEXT,
  domain_verification_token TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  logo_url TEXT,
  plan plan_type DEFAULT 'free',
  status org_status DEFAULT 'active',
  timezone TEXT DEFAULT 'UTC',
  industry TEXT,
  company_size TEXT,
  metadata JSONB DEFAULT '{}',
  email_config JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{"footer_text": "", "social_links": {}, "company_address": ""}',
  security_settings JSONB DEFAULT '{"ip_binding_enabled": false, "scan_external_links": true, "session_max_age_days": 7, "max_concurrent_sessions": 3, "notify_new_device_login": true, "require_domain_approval": true, "session_timeout_minutes": 30, "block_dangerous_attachments": true, "block_generic_email_providers": false}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'client',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tickets
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status DEFAULT 'open',
  priority ticket_priority DEFAULT 'medium',
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  due_date TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  attachments JSONB[] DEFAULT '{}',
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- OTP Codes
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('login', 'signup', 'verify_email')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rate Limits
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  first_attempt_at TIMESTAMPTZ DEFAULT now(),
  last_attempt_at TIMESTAMPTZ DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  UNIQUE (identifier, action)
);

-- User Invitations
CREATE TABLE public.user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'agent',
  token TEXT NOT NULL UNIQUE,
  token_expires_at TIMESTAMPTZ NOT NULL,
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  custom_message TEXT,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Sessions
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  session_token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  device_type TEXT,
  device_fingerprint TEXT,
  geo_location JSONB DEFAULT '{}',
  is_current BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Security Events
CREATE TABLE public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES public.profiles(id),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blocked IPs
CREATE TABLE public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  ip_address TEXT NOT NULL,
  reason TEXT,
  is_global BOOLEAN DEFAULT false,
  blocked_by UUID REFERENCES public.profiles(id),
  blocked_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Allowed Domains
CREATE TABLE public.allowed_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  domain TEXT NOT NULL,
  added_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, domain)
);

-- Pending Clients
CREATE TABLE public.pending_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Flagged Content
CREATE TABLE public.flagged_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  content_type TEXT NOT NULL,
  content_id UUID,
  flagged_content TEXT,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  auto_flagged BOOLEAN DEFAULT true,
  flagged_by UUID REFERENCES public.profiles(id),
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscription Plans
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price_monthly NUMERIC DEFAULT 0,
  price_annual NUMERIC DEFAULT 0,
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{"max_users": 5, "max_storage_gb": 1, "max_emails_monthly": 500, "max_tickets_monthly": 100}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscription Usage
CREATE TABLE public.subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id),
  tickets_used_this_month INTEGER DEFAULT 0,
  emails_sent_this_month INTEGER DEFAULT 0,
  storage_used_mb NUMERIC DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SLA Configurations
CREATE TABLE public.sla_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  priority TEXT NOT NULL,
  first_response_minutes INTEGER NOT NULL DEFAULT 60,
  resolution_minutes INTEGER NOT NULL DEFAULT 480,
  business_hours_only BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, priority)
);

-- CSAT Responses
CREATE TABLE public.csat_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  rating_resolution INTEGER NOT NULL,
  rating_response_time INTEGER,
  rating_agent INTEGER,
  feedback_text TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics Daily Stats
CREATE TABLE public.analytics_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  stat_date DATE NOT NULL,
  tickets_created INTEGER DEFAULT 0,
  tickets_resolved INTEGER DEFAULT 0,
  tickets_closed INTEGER DEFAULT 0,
  avg_response_time_minutes NUMERIC,
  avg_resolution_time_minutes NUMERIC,
  sla_compliance_rate NUMERIC,
  csat_average NUMERIC,
  csat_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, stat_date)
);

-- API Keys
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- API Request Logs
CREATE TABLE public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  api_key_id UUID REFERENCES public.api_keys(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  request_body JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook Configs
CREATE TABLE public.webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  failure_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook Logs
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_config_id UUID NOT NULL REFERENCES public.webhook_configs(id),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  response_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  attempt_count INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email Archive
CREATE TABLE public.email_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  outlook_message_id TEXT,
  conversation_id TEXT,
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_recipients JSONB DEFAULT '[]',
  cc_recipients JSONB DEFAULT '[]',
  bcc_recipients JSONB DEFAULT '[]',
  body_content TEXT,
  body_content_type TEXT DEFAULT 'plain',
  body_preview TEXT,
  importance TEXT DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  categories JSONB DEFAULT '[]',
  folder_path TEXT,
  received_datetime TIMESTAMPTZ NOT NULL,
  sent_datetime TIMESTAMPTZ,
  linked_ticket_id UUID REFERENCES public.tickets(id),
  linked_client_id UUID REFERENCES public.profiles(id),
  auto_linked BOOLEAN DEFAULT false,
  search_vector TSVECTOR,
  imported_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email Attachments
CREATE TABLE public.email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_archive_id UUID NOT NULL REFERENCES public.email_archive(id),
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT,
  content_id TEXT,
  is_inline BOOLEAN DEFAULT false,
  download_status TEXT DEFAULT 'pending',
  downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email Import Jobs
CREATE TABLE public.email_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  pst_file_name TEXT,
  pst_file_size BIGINT,
  pst_file_url TEXT,
  status TEXT DEFAULT 'pending',
  total_emails INTEGER DEFAULT 0,
  processed_emails INTEGER DEFAULT 0,
  failed_emails INTEGER DEFAULT 0,
  total_attachments INTEGER DEFAULT 0,
  processed_attachments INTEGER DEFAULT 0,
  error_message TEXT,
  error_log JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Widget Config
CREATE TABLE public.widget_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id),
  is_enabled BOOLEAN DEFAULT true,
  position TEXT DEFAULT 'bottom-right',
  primary_color TEXT DEFAULT '#6366f1',
  welcome_message TEXT DEFAULT 'Hi there! How can we help you today?',
  trigger_text TEXT DEFAULT 'Chat with us',
  offline_message TEXT DEFAULT 'We''re currently offline. Leave a message and we''ll get back to you soon!',
  pre_chat_form_enabled BOOLEAN DEFAULT true,
  file_upload_enabled BOOLEAN DEFAULT true,
  emoji_picker_enabled BOOLEAN DEFAULT true,
  notification_sound TEXT DEFAULT 'default',
  topics TEXT[] DEFAULT ARRAY['Sales Inquiry', 'Technical Support', 'Billing Question', 'General Question'],
  business_hours JSONB DEFAULT '{"hours": {}, "enabled": false, "timezone": "UTC"}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Widget Visitors
CREATE TABLE public.widget_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  session_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  metadata JSONB DEFAULT '{}',
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Widget Conversations
CREATE TABLE public.widget_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  visitor_id UUID NOT NULL REFERENCES public.widget_visitors(id),
  assigned_agent_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  topic TEXT,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Widget Messages
CREATE TABLE public.widget_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.widget_conversations(id),
  sender_type TEXT NOT NULL,
  sender_id UUID,
  content TEXT NOT NULL,
  attachments JSONB[] DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agent Availability
CREATE TABLE public.agent_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.profiles(id),
  organization_id UUID NOT NULL REFERENCES public.organizations(id),
  status TEXT NOT NULL DEFAULT 'offline',
  current_chats INTEGER DEFAULT 0,
  max_concurrent_chats INTEGER DEFAULT 5,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (agent_id, organization_id)
);

-- =====================
-- INDEXES
-- =====================

CREATE INDEX idx_tickets_org_id ON public.tickets(organization_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_messages_ticket_id ON public.messages(ticket_id);
CREATE INDEX idx_profiles_org_id ON public.profiles(organization_id);
CREATE INDEX idx_otp_codes_email_type ON public.otp_codes(email, type);
CREATE INDEX idx_email_archive_org ON public.email_archive(organization_id);
CREATE INDEX idx_email_archive_search ON public.email_archive USING GIN(search_vector);

-- =====================
-- FUNCTIONS
-- =====================

-- Get user organization ID
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Check if super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
$$;

-- Handle new user (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'client'
  );
  RETURN NEW;
END;
$$;

-- Handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Generate OTP
CREATE OR REPLACE FUNCTION public.generate_otp(p_email TEXT, p_type TEXT, p_expires_minutes INTEGER DEFAULT 10)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  UPDATE public.otp_codes
  SET used_at = now()
  WHERE email = p_email AND type = p_type AND used_at IS NULL;
  
  INSERT INTO public.otp_codes (email, code, type, expires_at)
  VALUES (p_email, v_code, p_type, now() + (p_expires_minutes || ' minutes')::INTERVAL);
  
  RETURN v_code;
END;
$$;

-- Verify OTP
CREATE OR REPLACE FUNCTION public.verify_otp(p_email TEXT, p_code TEXT, p_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_otp otp_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_otp FROM public.otp_codes
  WHERE email = p_email AND code = p_code AND type = p_type
  AND used_at IS NULL AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_otp IS NULL THEN
    RETURN false;
  END IF;
  
  UPDATE public.otp_codes SET used_at = now() WHERE id = v_otp.id;
  
  RETURN true;
END;
$$;

-- Check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier TEXT, p_action TEXT, p_max_attempts INTEGER, p_window_minutes INTEGER)
RETURNS TABLE(allowed BOOLEAN, attempts_remaining INTEGER, blocked_until TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  SELECT * INTO v_record FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF v_record IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action, attempts)
    VALUES (p_identifier, p_action, 1);
    RETURN QUERY SELECT true, p_max_attempts - 1, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > now() THEN
    RETURN QUERY SELECT false, 0, v_record.blocked_until;
    RETURN;
  END IF;
  
  IF v_record.first_attempt_at < v_window_start THEN
    UPDATE public.rate_limits
    SET attempts = 1, first_attempt_at = now(), last_attempt_at = now(), blocked_until = NULL
    WHERE id = v_record.id;
    RETURN QUERY SELECT true, p_max_attempts - 1, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  IF v_record.attempts >= p_max_attempts THEN
    UPDATE public.rate_limits
    SET blocked_until = now() + (p_window_minutes || ' minutes')::INTERVAL, last_attempt_at = now()
    WHERE id = v_record.id;
    RETURN QUERY SELECT false, 0, (now() + (p_window_minutes || ' minutes')::INTERVAL);
    RETURN;
  END IF;
  
  UPDATE public.rate_limits
  SET attempts = attempts + 1, last_attempt_at = now()
  WHERE id = v_record.id;
  
  RETURN QUERY SELECT true, p_max_attempts - v_record.attempts - 1, NULL::TIMESTAMPTZ;
END;
$$;

-- Cleanup expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now();
  DELETE FROM public.rate_limits WHERE blocked_until < now() AND blocked_until IS NOT NULL;
END;
$$;

-- Generate invitation token
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Accept invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation user_invitations%ROWTYPE;
BEGIN
  SELECT * INTO v_invitation
  FROM public.user_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND token_expires_at > now();
  
  IF v_invitation IS NULL THEN
    RETURN false;
  END IF;
  
  UPDATE public.profiles
  SET 
    organization_id = v_invitation.organization_id,
    role = v_invitation.role,
    updated_at = now()
  WHERE id = p_user_id;
  
  UPDATE public.user_invitations
  SET 
    status = 'accepted',
    accepted_at = now()
  WHERE id = v_invitation.id;
  
  RETURN true;
END;
$$;

-- Cleanup expired invitations
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND token_expires_at < now();
END;
$$;

-- Validate API key
CREATE OR REPLACE FUNCTION public.validate_api_key(p_api_key TEXT)
RETURNS TABLE(api_key_id UUID, organization_id UUID, permissions TEXT[], rate_limit INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key_hash TEXT;
BEGIN
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
  
  UPDATE public.api_keys 
  SET last_used_at = now()
  WHERE key_hash = v_key_hash;
END;
$$;

-- Check API rate limit
CREATE OR REPLACE FUNCTION public.check_api_rate_limit(p_api_key_id UUID, p_rate_limit INTEGER)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_request_count INTEGER;
BEGIN
  v_window_start := date_trunc('minute', now());
  
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

-- Check domain allowed
CREATE OR REPLACE FUNCTION public.check_domain_allowed(p_organization_id UUID, p_email TEXT)
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
  v_domain := split_part(p_email, '@', 2);
  
  SELECT 
    COALESCE((security_settings->>'require_domain_approval')::boolean, true),
    COALESCE((security_settings->>'block_generic_email_providers')::boolean, false)
  INTO v_require_approval, v_block_generic
  FROM organizations
  WHERE id = p_organization_id;
  
  IF v_block_generic AND v_domain = ANY(v_generic_domains) THEN
    RETURN QUERY SELECT false, false;
    RETURN;
  END IF;
  
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

-- Log security event
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
    organization_id, event_type, user_id, ip_address, user_agent, details, severity
  ) VALUES (
    p_organization_id, p_event_type, p_user_id, p_ip_address, p_user_agent, p_details, p_severity
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < now();
  DELETE FROM blocked_ips WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$;

-- Create default SLA config
CREATE OR REPLACE FUNCTION public.create_default_sla_config()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.sla_configurations (organization_id, priority, first_response_minutes, resolution_minutes)
  VALUES
    (NEW.id, 'urgent', 60, 240),
    (NEW.id, 'high', 120, 480),
    (NEW.id, 'medium', 240, 1440),
    (NEW.id, 'low', 480, 2880);
  RETURN NEW;
END;
$$;

-- Get ticket analytics
CREATE OR REPLACE FUNCTION public.get_ticket_analytics(p_organization_id UUID, p_start_date TIMESTAMPTZ, p_end_date TIMESTAMPTZ)
RETURNS TABLE(
  total_tickets BIGINT,
  open_tickets BIGINT,
  in_progress_tickets BIGINT,
  resolved_tickets BIGINT,
  closed_tickets BIGINT,
  avg_response_minutes NUMERIC,
  avg_resolution_minutes NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_tickets,
    COUNT(*) FILTER (WHERE status = 'open')::BIGINT as open_tickets,
    COUNT(*) FILTER (WHERE status = 'in_progress')::BIGINT as in_progress_tickets,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved_tickets,
    COUNT(*) FILTER (WHERE status = 'closed')::BIGINT as closed_tickets,
    ROUND(AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 60)::NUMERIC, 2) as avg_response_minutes,
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60)::NUMERIC, 2) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_minutes
  FROM public.tickets
  WHERE organization_id = p_organization_id
    AND created_at >= p_start_date
    AND created_at <= p_end_date;
END;
$$;

-- Get tickets by date
CREATE OR REPLACE FUNCTION public.get_tickets_by_date(p_organization_id UUID, p_start_date TIMESTAMPTZ, p_end_date TIMESTAMPTZ)
RETURNS TABLE(date DATE, created_count BIGINT, resolved_count BIGINT, closed_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.date::DATE,
    COALESCE(created.count, 0)::BIGINT as created_count,
    COALESCE(resolved.count, 0)::BIGINT as resolved_count,
    COALESCE(closed.count, 0)::BIGINT as closed_count
  FROM generate_series(p_start_date::DATE, p_end_date::DATE, '1 day'::INTERVAL) AS d(date)
  LEFT JOIN (
    SELECT DATE(created_at) as ticket_date, COUNT(*) as count
    FROM public.tickets
    WHERE organization_id = p_organization_id
      AND created_at >= p_start_date AND created_at <= p_end_date
    GROUP BY DATE(created_at)
  ) created ON d.date::DATE = created.ticket_date
  LEFT JOIN (
    SELECT DATE(resolved_at) as ticket_date, COUNT(*) as count
    FROM public.tickets
    WHERE organization_id = p_organization_id
      AND resolved_at >= p_start_date AND resolved_at <= p_end_date
    GROUP BY DATE(resolved_at)
  ) resolved ON d.date::DATE = resolved.ticket_date
  LEFT JOIN (
    SELECT DATE(updated_at) as ticket_date, COUNT(*) as count
    FROM public.tickets
    WHERE organization_id = p_organization_id
      AND status = 'closed'
      AND updated_at >= p_start_date AND updated_at <= p_end_date
    GROUP BY DATE(updated_at)
  ) closed ON d.date::DATE = closed.ticket_date
  ORDER BY d.date;
END;
$$;

-- Get agent performance
CREATE OR REPLACE FUNCTION public.get_agent_performance(p_organization_id UUID, p_start_date TIMESTAMPTZ, p_end_date TIMESTAMPTZ)
RETURNS TABLE(
  agent_id UUID,
  agent_name TEXT,
  agent_avatar TEXT,
  tickets_assigned BIGINT,
  tickets_resolved BIGINT,
  avg_response_minutes NUMERIC,
  avg_resolution_minutes NUMERIC,
  csat_average NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as agent_id,
    p.full_name as agent_name,
    p.avatar_url as agent_avatar,
    COUNT(DISTINCT t.id)::BIGINT as tickets_assigned,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('resolved', 'closed'))::BIGINT as tickets_resolved,
    ROUND(AVG(EXTRACT(EPOCH FROM (t.first_response_at - t.created_at)) / 60)::NUMERIC, 2) as avg_response_minutes,
    ROUND(AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 60)::NUMERIC, 2) FILTER (WHERE t.resolved_at IS NOT NULL) as avg_resolution_minutes,
    ROUND(AVG(c.rating_agent)::NUMERIC, 2) as csat_average
  FROM public.profiles p
  LEFT JOIN public.tickets t ON t.assigned_to = p.id
    AND t.organization_id = p_organization_id
    AND t.created_at >= p_start_date
    AND t.created_at <= p_end_date
  LEFT JOIN public.csat_responses c ON c.ticket_id = t.id
  WHERE p.organization_id = p_organization_id
    AND p.role IN ('agent', 'admin')
  GROUP BY p.id, p.full_name, p.avatar_url
  ORDER BY tickets_resolved DESC NULLS LAST;
END;
$$;

-- Update email search vector
CREATE OR REPLACE FUNCTION public.update_email_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.body_preview, '')), 'C');
  RETURN NEW;
END;
$$;

-- =====================
-- TRIGGERS
-- =====================

-- Create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create default SLA on org creation
CREATE TRIGGER create_sla_on_org_created
  AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.create_default_sla_config();

-- Update email search vector
CREATE TRIGGER update_email_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.email_archive
  FOR EACH ROW EXECUTE FUNCTION public.update_email_search_vector();

-- =====================
-- ENABLE RLS
-- =====================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowed_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csat_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_availability ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS POLICIES
-- =====================

-- Organizations
CREATE POLICY "Users can view their organization" ON public.organizations
  FOR SELECT USING ((id = get_user_organization_id()) OR is_super_admin());

CREATE POLICY "Admins can update their organization" ON public.organizations
  FOR UPDATE USING ((id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- Profiles
CREATE POLICY "Users can view profiles in their organization" ON public.profiles
  FOR SELECT USING ((organization_id = get_user_organization_id()) OR is_super_admin() OR (id = auth.uid()));

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Tickets
CREATE POLICY "Users can view tickets in their organization" ON public.tickets
  FOR SELECT USING ((organization_id = get_user_organization_id()) AND ((get_user_role() = ANY (ARRAY['admin'::user_role, 'agent'::user_role, 'super_admin'::user_role])) OR (created_by = auth.uid())));

CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK ((organization_id = get_user_organization_id()) AND (created_by = auth.uid()));

CREATE POLICY "Agents and admins can update tickets" ON public.tickets
  FOR UPDATE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'agent'::user_role, 'super_admin'::user_role])));

-- Messages
CREATE POLICY "Users can view messages on their tickets" ON public.messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = messages.ticket_id
    AND t.organization_id = get_user_organization_id()
    AND ((get_user_role() = ANY (ARRAY['admin'::user_role, 'agent'::user_role, 'super_admin'::user_role])) OR ((t.created_by = auth.uid()) AND (NOT messages.is_internal)))
  ));

CREATE POLICY "Users can create messages on tickets" ON public.messages
  FOR INSERT WITH CHECK ((user_id = auth.uid()) AND (EXISTS (
    SELECT 1 FROM tickets t WHERE t.id = messages.ticket_id AND t.organization_id = get_user_organization_id()
  )));

-- User Invitations
CREATE POLICY "Admins can view invitations in their org" ON public.user_invitations
  FOR SELECT USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Admins can create invitations in their org" ON public.user_invitations
  FOR INSERT WITH CHECK ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Admins can update invitations in their org" ON public.user_invitations
  FOR UPDATE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Admins can delete invitations in their org" ON public.user_invitations
  FOR DELETE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- User Sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own sessions" ON public.user_sessions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Security Events
CREATE POLICY "Admins can view org security events" ON public.security_events
  FOR SELECT USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "System can insert security events" ON public.security_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update security events" ON public.security_events
  FOR UPDATE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- Blocked IPs
CREATE POLICY "Admins can manage blocked IPs" ON public.blocked_ips
  FOR ALL USING (((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))) OR is_super_admin())
  WITH CHECK (((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role]))) OR is_super_admin());

-- Allowed Domains
CREATE POLICY "Org members can view allowed domains" ON public.allowed_domains
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage allowed domains" ON public.allowed_domains
  FOR ALL USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])))
  WITH CHECK ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- Pending Clients
CREATE POLICY "Admins can view pending clients" ON public.pending_clients
  FOR SELECT USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Anyone can create pending client" ON public.pending_clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update pending clients" ON public.pending_clients
  FOR UPDATE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- Flagged Content
CREATE POLICY "Admins can view flagged content" ON public.flagged_content
  FOR SELECT USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'agent'::user_role, 'super_admin'::user_role])));

CREATE POLICY "System can insert flagged content" ON public.flagged_content
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update flagged content" ON public.flagged_content
  FOR UPDATE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- Subscription Plans
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- Subscription Usage
CREATE POLICY "Users can view their organization usage" ON public.subscription_usage
  FOR SELECT USING ((organization_id = get_user_organization_id()) OR is_super_admin());

-- SLA Configurations
CREATE POLICY "Org members can view SLA configurations" ON public.sla_configurations
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage SLA configurations" ON public.sla_configurations
  FOR ALL USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])))
  WITH CHECK ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- CSAT Responses
CREATE POLICY "Org members can view CSAT responses" ON public.csat_responses
  FOR SELECT USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'agent'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Clients can submit CSAT for their tickets" ON public.csat_responses
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM tickets t WHERE t.id = csat_responses.ticket_id AND t.created_by = auth.uid()));

-- Analytics Daily Stats
CREATE POLICY "Admins and agents can view analytics" ON public.analytics_daily_stats
  FOR SELECT USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'agent'::user_role, 'super_admin'::user_role])));

-- API Keys
CREATE POLICY "Users can view their org API keys" ON public.api_keys
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can create API keys" ON public.api_keys
  FOR INSERT WITH CHECK ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Admins can update API keys" ON public.api_keys
  FOR UPDATE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Admins can delete API keys" ON public.api_keys
  FOR DELETE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- API Request Logs
CREATE POLICY "Users can view their org API logs" ON public.api_request_logs
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "System can insert API logs" ON public.api_request_logs
  FOR INSERT WITH CHECK (true);

-- Webhook Configs
CREATE POLICY "Users can view their org webhooks" ON public.webhook_configs
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can create webhooks" ON public.webhook_configs
  FOR INSERT WITH CHECK ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Admins can update webhooks" ON public.webhook_configs
  FOR UPDATE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Admins can delete webhooks" ON public.webhook_configs
  FOR DELETE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- Webhook Logs
CREATE POLICY "Users can view their org webhook logs" ON public.webhook_logs
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "System can insert webhook logs" ON public.webhook_logs
  FOR INSERT WITH CHECK (true);

-- Email Archive
CREATE POLICY "Admins and agents can view org emails" ON public.email_archive
  FOR SELECT USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'agent'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Clients can view emails linked to them" ON public.email_archive
  FOR SELECT USING ((organization_id = get_user_organization_id()) AND (linked_client_id = auth.uid()));

CREATE POLICY "Admins can insert emails" ON public.email_archive
  FOR INSERT WITH CHECK ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Admins and agents can update emails" ON public.email_archive
  FOR UPDATE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'agent'::user_role, 'super_admin'::user_role])));

-- Email Attachments
CREATE POLICY "Users can view attachments for accessible emails" ON public.email_attachments
  FOR SELECT USING (EXISTS (SELECT 1 FROM email_archive ea WHERE ea.id = email_attachments.email_archive_id AND ea.organization_id = get_user_organization_id()));

CREATE POLICY "Admins can insert attachments" ON public.email_attachments
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM email_archive ea WHERE ea.id = email_attachments.email_archive_id AND ea.organization_id = get_user_organization_id() AND get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- Email Import Jobs
CREATE POLICY "Admins can view import jobs" ON public.email_import_jobs
  FOR SELECT USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Admins can create import jobs" ON public.email_import_jobs
  FOR INSERT WITH CHECK ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

CREATE POLICY "Admins can update import jobs" ON public.email_import_jobs
  FOR UPDATE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- Widget Config
CREATE POLICY "Anyone can read widget config by org id" ON public.widget_config
  FOR SELECT USING (true);

CREATE POLICY "Organization admins can manage widget config" ON public.widget_config
  FOR ALL USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])))
  WITH CHECK ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- Widget Visitors (public table)
-- No RLS policies needed as visitors are anonymous

-- Widget Conversations
CREATE POLICY "Anyone can view their conversations" ON public.widget_conversations
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create conversations" ON public.widget_conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Agents can update conversations" ON public.widget_conversations
  FOR UPDATE USING ((organization_id = get_user_organization_id()) AND (get_user_role() = ANY (ARRAY['admin'::user_role, 'agent'::user_role, 'super_admin'::user_role])));

-- Widget Messages
CREATE POLICY "Anyone can view messages" ON public.widget_messages
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert messages" ON public.widget_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Agents can update messages" ON public.widget_messages
  FOR UPDATE USING (EXISTS (SELECT 1 FROM widget_conversations c WHERE c.id = widget_messages.conversation_id AND c.organization_id = get_user_organization_id()));

-- Agent Availability
CREATE POLICY "Anyone can view agent availability" ON public.agent_availability
  FOR SELECT USING (true);

CREATE POLICY "Agents can manage their own availability" ON public.agent_availability
  FOR ALL USING (agent_id = auth.uid()) WITH CHECK (agent_id = auth.uid());

-- =====================
-- STORAGE BUCKETS
-- =====================

INSERT INTO storage.buckets (id, name, public) VALUES ('organization-logos', 'organization-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-attachments', 'ticket-attachments', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('email-imports', 'email-imports', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('email-attachments', 'email-attachments', false);

-- Storage Policies
CREATE POLICY "Public read for organization logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'organization-logos');

CREATE POLICY "Authenticated users can upload org logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'organization-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Public read for ticket attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ticket-attachments');

CREATE POLICY "Authenticated users can upload ticket attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ticket-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage email imports"
  ON storage.objects FOR ALL
  USING (bucket_id = 'email-imports' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'email-imports' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage email attachments"
  ON storage.objects FOR ALL
  USING (bucket_id = 'email-attachments' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'email-attachments' AND auth.role() = 'authenticated');

-- =====================
-- REALTIME
-- =====================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.widget_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.widget_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_availability;

-- =====================
-- SEED DATA (Subscription Plans)
-- =====================

INSERT INTO public.subscription_plans (name, slug, price_monthly, price_annual, features, limits) VALUES
('Free', 'free', 0, 0, '["Up to 5 users", "100 tickets/month", "Basic analytics", "Email support"]', '{"max_users": 5, "max_storage_gb": 1, "max_emails_monthly": 500, "max_tickets_monthly": 100}'),
('Starter', 'starter', 29, 290, '["Up to 15 users", "500 tickets/month", "Advanced analytics", "Priority email support", "Custom branding"]', '{"max_users": 15, "max_storage_gb": 5, "max_emails_monthly": 2000, "max_tickets_monthly": 500}'),
('Pro', 'pro', 79, 790, '["Up to 50 users", "Unlimited tickets", "Full analytics suite", "24/7 support", "Custom domain", "API access"]', '{"max_users": 50, "max_storage_gb": 25, "max_emails_monthly": 10000, "max_tickets_monthly": -1}'),
('Enterprise', 'enterprise', 199, 1990, '["Unlimited users", "Unlimited tickets", "White-label solution", "Dedicated support", "SLA guarantees", "Custom integrations"]', '{"max_users": -1, "max_storage_gb": 100, "max_emails_monthly": -1, "max_tickets_monthly": -1}');

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
