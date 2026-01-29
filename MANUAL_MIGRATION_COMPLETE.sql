-- ============================================================================
-- COMPLETE DATABASE MIGRATION - Run this in Supabase SQL Editor
-- This includes all base tables + Phase 1-9 tables
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Enums (if not exists)
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE public.plan_type AS ENUM ('free', 'starter', 'pro', 'enterprise');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.org_status AS ENUM ('active', 'suspended', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'agent', 'client');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- STEP 2: Create Base Tables (organizations, profiles/users, tickets, etc.)
-- ============================================================================

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  custom_domain TEXT,
  domain_verified BOOLEAN DEFAULT false,
  primary_color TEXT DEFAULT '#6366f1',
  logo_url TEXT,
  plan public.plan_type DEFAULT 'free',
  status public.org_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Profiles (this is your "users" table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role DEFAULT 'client',
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create users view (alias for profiles)
CREATE OR REPLACE VIEW public.users AS SELECT * FROM public.profiles;

-- Tickets
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_number SERIAL,
  subject TEXT NOT NULL,
  description TEXT,
  status public.ticket_status DEFAULT 'open',
  priority public.ticket_priority DEFAULT 'medium',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_email TEXT,
  customer_name TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Attachments
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for base tables
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_tickets_organization_id ON public.tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON public.messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON public.attachments(ticket_id);

-- ============================================================================
-- STEP 3: Phase 1 - Foundation & Security
-- ============================================================================

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  before_snapshot JSONB,
  after_snapshot JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Usage Tracking
CREATE TABLE IF NOT EXISTS public.usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tickets_created INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  chat_messages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, date)
);

CREATE INDEX IF NOT EXISTS idx_usage_daily_organization_id ON public.usage_daily(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_daily_date ON public.usage_daily(date DESC);

-- SLA Policies
CREATE TABLE IF NOT EXISTS public.sla_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  first_response_time INTEGER NOT NULL,
  resolution_time INTEGER NOT NULL,
  business_hours JSONB DEFAULT '{}',
  holidays JSONB DEFAULT '[]',
  timezone TEXT DEFAULT 'UTC',
  priority_overrides JSONB DEFAULT '{}',
  escalation_enabled BOOLEAN DEFAULT false,
  escalation_rules JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sla_policies_organization_id ON public.sla_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_sla_policies_is_active ON public.sla_policies(is_active);

-- Ticket Templates
CREATE TABLE IF NOT EXISTS public.ticket_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  priority public.ticket_priority DEFAULT 'medium',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  default_assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ticket_templates_organization_id ON public.ticket_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_ticket_templates_is_active ON public.ticket_templates(is_active);

-- Canned Responses
CREATE TABLE IF NOT EXISTS public.canned_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  shortcut TEXT,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  variables JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_canned_responses_organization_id ON public.canned_responses(organization_id);
CREATE INDEX IF NOT EXISTS idx_canned_responses_is_active ON public.canned_responses(is_active);
CREATE INDEX IF NOT EXISTS idx_canned_responses_shortcut ON public.canned_responses(shortcut);

-- ============================================================================
-- STEP 4: Phase 2 - API & Collaboration
-- ============================================================================

-- API Keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read', 'write'],
  rate_limit_per_minute INTEGER DEFAULT 100,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_organization_id ON public.api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON public.api_keys(key_hash);

-- Webhooks
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  description TEXT,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_enabled BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_webhooks_organization_id ON public.webhooks(organization_id);

-- Webhook Deliveries
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  response_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON public.webhook_deliveries(status);

-- Ticket Followers
CREATE TABLE IF NOT EXISTS public.ticket_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notify_on_update BOOLEAN DEFAULT true,
  notify_on_comment BOOLEAN DEFAULT true,
  notify_on_status_change BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ticket_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_followers_ticket_id ON public.ticket_followers(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_followers_user_id ON public.ticket_followers(user_id);

-- Ticket Mentions
CREATE TABLE IF NOT EXISTS public.ticket_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentioned_by_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_mentions_ticket_id ON public.ticket_mentions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_mentions_mentioned_user_id ON public.ticket_mentions(mentioned_user_id);

-- Ticket Relationships
CREATE TABLE IF NOT EXISTS public.ticket_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  child_ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(parent_ticket_id, child_ticket_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_ticket_relationships_parent_ticket_id ON public.ticket_relationships(parent_ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_relationships_child_ticket_id ON public.ticket_relationships(child_ticket_id);

-- Ticket Edit Locks
CREATE TABLE IF NOT EXISTS public.ticket_edit_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  locked_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '5 minutes',
  UNIQUE(ticket_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_edit_locks_ticket_id ON public.ticket_edit_locks(ticket_id);

-- ============================================================================
-- STEP 5: Phase 3 - AI & Automation
-- ============================================================================

-- Add AI fields to tickets
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='ai_category') THEN
    ALTER TABLE public.tickets ADD COLUMN ai_category TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='ai_sentiment') THEN
    ALTER TABLE public.tickets ADD COLUMN ai_sentiment TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='ai_intent') THEN
    ALTER TABLE public.tickets ADD COLUMN ai_intent TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='ai_priority_score') THEN
    ALTER TABLE public.tickets ADD COLUMN ai_priority_score INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='ai_suggested_response') THEN
    ALTER TABLE public.tickets ADD COLUMN ai_suggested_response TEXT;
  END IF;
END $$;

-- Automation Rules
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  trigger_type TEXT NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',
  actions JSONB NOT NULL,
  execution_order INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_organization_id ON public.automation_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON public.automation_rules(is_active);

-- Automation Logs
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_rule_id UUID NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'success',
  actions_executed JSONB,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_automation_rule_id ON public.automation_logs(automation_rule_id);

-- Business Hours
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  schedule JSONB NOT NULL,
  holidays JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_business_hours_organization_id ON public.business_hours(organization_id);

-- ============================================================================
-- STEP 6: Phase 4 - Analytics & Surveys
-- ============================================================================

-- Surveys
CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  trigger_type TEXT DEFAULT 'ticket_closed',
  trigger_delay_hours INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_surveys_organization_id ON public.surveys(organization_id);
CREATE INDEX IF NOT EXISTS idx_surveys_type ON public.surveys(type);

-- Survey Responses
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  responses JSONB NOT NULL,
  score INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_score ON public.survey_responses(score);

-- ============================================================================
-- SUCCESS! All base tables + Phase 1-4 created
-- Run this entire file in Supabase SQL Editor
-- After successful execution, regenerate TypeScript types
-- ============================================================================
