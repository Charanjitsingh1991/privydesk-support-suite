-- Consolidated Phase 1-9 Migrations
-- This file safely creates all new tables using IF NOT EXISTS

-- ============================================================================
-- PHASE 1: Foundation & Security
-- ============================================================================

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  before_snapshot JSONB,
  after_snapshot JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Usage Tracking
CREATE TABLE IF NOT EXISTS usage_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tickets_created INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  chat_messages INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, date)
);

CREATE INDEX IF NOT EXISTS idx_usage_daily_organization_id ON usage_daily(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_daily_date ON usage_daily(date DESC);

-- SLA Policies
CREATE TABLE IF NOT EXISTS sla_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sla_policies_organization_id ON sla_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_sla_policies_is_active ON sla_policies(is_active);

-- Ticket Templates
CREATE TABLE IF NOT EXISTS ticket_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  default_assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ticket_templates_organization_id ON ticket_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_ticket_templates_is_active ON ticket_templates(is_active);

-- Canned Responses
CREATE TABLE IF NOT EXISTS canned_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  shortcut TEXT,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  variables JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_canned_responses_organization_id ON canned_responses(organization_id);
CREATE INDEX IF NOT EXISTS idx_canned_responses_is_active ON canned_responses(is_active);
CREATE INDEX IF NOT EXISTS idx_canned_responses_shortcut ON canned_responses(shortcut);

-- ============================================================================
-- PHASE 2: API & Collaboration
-- ============================================================================

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read', 'write'],
  rate_limit_per_minute INTEGER DEFAULT 100,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  description TEXT,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_enabled BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_webhooks_organization_id ON webhooks(organization_id);

-- Webhook Deliveries
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);

-- Ticket Followers
CREATE TABLE IF NOT EXISTS ticket_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notify_on_update BOOLEAN DEFAULT true,
  notify_on_comment BOOLEAN DEFAULT true,
  notify_on_status_change BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ticket_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_followers_ticket_id ON ticket_followers(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_followers_user_id ON ticket_followers(user_id);

-- Ticket Mentions
CREATE TABLE IF NOT EXISTS ticket_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentioned_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_mentions_ticket_id ON ticket_mentions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_mentions_mentioned_user_id ON ticket_mentions(mentioned_user_id);

-- Ticket Relationships
CREATE TABLE IF NOT EXISTS ticket_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  child_ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(parent_ticket_id, child_ticket_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_ticket_relationships_parent_ticket_id ON ticket_relationships(parent_ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_relationships_child_ticket_id ON ticket_relationships(child_ticket_id);

-- Ticket Edit Locks
CREATE TABLE IF NOT EXISTS ticket_edit_locks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes',
  UNIQUE(ticket_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_edit_locks_ticket_id ON ticket_edit_locks(ticket_id);

-- ============================================================================
-- PHASE 3: AI & Automation
-- ============================================================================

-- Add AI fields to tickets (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='ai_category') THEN
    ALTER TABLE tickets ADD COLUMN ai_category TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='ai_sentiment') THEN
    ALTER TABLE tickets ADD COLUMN ai_sentiment TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='ai_intent') THEN
    ALTER TABLE tickets ADD COLUMN ai_intent TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='ai_priority_score') THEN
    ALTER TABLE tickets ADD COLUMN ai_priority_score INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='ai_suggested_response') THEN
    ALTER TABLE tickets ADD COLUMN ai_suggested_response TEXT;
  END IF;
END $$;

-- Automation Rules
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  trigger_type TEXT NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',
  actions JSONB NOT NULL,
  execution_order INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_organization_id ON automation_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON automation_rules(is_active);

-- Automation Logs
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'success',
  actions_executed JSONB,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_automation_rule_id ON automation_logs(automation_rule_id);

-- Business Hours
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  schedule JSONB NOT NULL,
  holidays JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_hours_organization_id ON business_hours(organization_id);

-- ============================================================================
-- PHASE 4: Analytics & Surveys
-- ============================================================================

-- Surveys
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  trigger_type TEXT DEFAULT 'ticket_closed',
  trigger_delay_hours INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_surveys_organization_id ON surveys(organization_id);
CREATE INDEX IF NOT EXISTS idx_surveys_type ON surveys(type);

-- Survey Responses
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  responses JSONB NOT NULL,
  score INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_score ON survey_responses(score);

-- Note: Additional Phase 5-9 tables will be created in subsequent batches
-- to avoid exceeding file size limits

COMMENT ON TABLE audit_logs IS 'Phase 1: Audit trail for compliance';
COMMENT ON TABLE usage_daily IS 'Phase 1: Daily usage tracking';
COMMENT ON TABLE sla_policies IS 'Phase 1: SLA management';
COMMENT ON TABLE ticket_templates IS 'Phase 1: Reusable ticket templates';
COMMENT ON TABLE canned_responses IS 'Phase 1: Quick reply templates';
COMMENT ON TABLE api_keys IS 'Phase 2: API authentication';
COMMENT ON TABLE webhooks IS 'Phase 2: Webhook endpoints';
COMMENT ON TABLE webhook_deliveries IS 'Phase 2: Webhook delivery tracking';
COMMENT ON TABLE ticket_followers IS 'Phase 2: Ticket watchers';
COMMENT ON TABLE ticket_mentions IS 'Phase 2: @mentions in tickets';
COMMENT ON TABLE ticket_relationships IS 'Phase 2: Ticket relationships';
COMMENT ON TABLE ticket_edit_locks IS 'Phase 2: Collision detection';
COMMENT ON TABLE automation_rules IS 'Phase 3: Workflow automation';
COMMENT ON TABLE automation_logs IS 'Phase 3: Automation execution logs';
COMMENT ON TABLE business_hours IS 'Phase 3: Business hours schedules';
COMMENT ON TABLE surveys IS 'Phase 4: Customer satisfaction surveys';
COMMENT ON TABLE survey_responses IS 'Phase 4: Survey responses';
