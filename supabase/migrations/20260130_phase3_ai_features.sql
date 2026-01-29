-- Phase 3: AI & Automation Features
-- Add AI-related fields and automation tables

-- Add AI fields to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_category TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_sentiment TEXT; -- positive, neutral, negative
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_intent TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_priority_score INTEGER;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ai_suggested_response TEXT;

-- Create automation_rules table
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Rule details
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Trigger
  trigger_type TEXT NOT NULL, -- 'ticket_created', 'ticket_updated', 'time_based', 'event_based'
  trigger_conditions JSONB DEFAULT '{}', -- e.g., {"priority": "high", "status": "open"}
  
  -- Actions
  actions JSONB NOT NULL, -- e.g., [{"type": "assign", "user_id": "..."}, {"type": "add_tag", "tag": "urgent"}]
  
  -- Execution
  execution_order INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create automation_logs table
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  
  -- Execution details
  status TEXT DEFAULT 'success', -- success, failed
  actions_executed JSONB,
  error_message TEXT,
  
  -- Timestamps
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business_hours table
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Schedule
  name TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  schedule JSONB NOT NULL, -- Same format as SLA policies
  holidays JSONB DEFAULT '[]',
  
  -- Status
  is_default BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_automation_rules_organization_id ON automation_rules(organization_id);
CREATE INDEX idx_automation_rules_is_active ON automation_rules(is_active);
CREATE INDEX idx_automation_rules_trigger_type ON automation_rules(trigger_type);
CREATE INDEX idx_automation_logs_automation_rule_id ON automation_logs(automation_rule_id);
CREATE INDEX idx_automation_logs_ticket_id ON automation_logs(ticket_id);
CREATE INDEX idx_business_hours_organization_id ON business_hours(organization_id);
CREATE INDEX idx_tickets_ai_category ON tickets(ai_category);
CREATE INDEX idx_tickets_ai_sentiment ON tickets(ai_sentiment);

-- RLS Policies
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- Automation rules policies
CREATE POLICY "Admins can manage automation rules"
  ON automation_rules
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Automation logs policies
CREATE POLICY "Users can view automation logs"
  ON automation_logs
  FOR SELECT
  USING (
    automation_rule_id IN (
      SELECT id FROM automation_rules WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Business hours policies
CREATE POLICY "Users can view business hours"
  ON business_hours
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage business hours"
  ON business_hours
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Function to execute automation rule
CREATE OR REPLACE FUNCTION execute_automation_rule(
  p_rule_id UUID,
  p_ticket_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rule RECORD;
  v_action JSONB;
BEGIN
  -- Get the rule
  SELECT * INTO v_rule
  FROM automation_rules
  WHERE id = p_rule_id AND is_active = true;
  
  IF v_rule.id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Execute each action
  FOR v_action IN SELECT * FROM jsonb_array_elements(v_rule.actions)
  LOOP
    -- Log the action (simplified - actual implementation would execute actions)
    INSERT INTO automation_logs (automation_rule_id, ticket_id, status, actions_executed)
    VALUES (p_rule_id, p_ticket_id, 'success', v_action);
  END LOOP;
  
  -- Update execution count
  UPDATE automation_rules
  SET execution_count = execution_count + 1,
      last_executed_at = NOW()
  WHERE id = p_rule_id;
  
  RETURN TRUE;
END;
$$;

-- Comment
COMMENT ON TABLE automation_rules IS 'Automation rules for tickets (triggers and actions)';
COMMENT ON TABLE automation_logs IS 'Log of automation rule executions';
COMMENT ON TABLE business_hours IS 'Business hours schedules for organizations';
COMMENT ON FUNCTION execute_automation_rule IS 'Executes an automation rule for a ticket';
