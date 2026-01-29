-- Phase 1: SLA Management System
-- Create sla_policies table for defining service level agreements

CREATE TABLE IF NOT EXISTS sla_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Policy details
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- SLA targets (in minutes)
  first_response_time INTEGER NOT NULL, -- Time to first response
  resolution_time INTEGER NOT NULL, -- Time to resolve ticket
  
  -- Business hours
  business_hours JSONB DEFAULT '{
    "monday": {"start": "09:00", "end": "17:00", "enabled": true},
    "tuesday": {"start": "09:00", "end": "17:00", "enabled": true},
    "wednesday": {"start": "09:00", "end": "17:00", "enabled": true},
    "thursday": {"start": "09:00", "end": "17:00", "enabled": true},
    "friday": {"start": "09:00", "end": "17:00", "enabled": true},
    "saturday": {"start": "09:00", "end": "17:00", "enabled": false},
    "sunday": {"start": "09:00", "end": "17:00", "enabled": false}
  }',
  
  -- Holidays (array of dates)
  holidays JSONB DEFAULT '[]',
  
  -- Timezone
  timezone TEXT DEFAULT 'UTC',
  
  -- Priority-based SLA (optional)
  priority_overrides JSONB DEFAULT '{}', -- e.g., {"high": {"first_response_time": 30, "resolution_time": 240}}
  
  -- Escalation rules
  escalation_enabled BOOLEAN DEFAULT false,
  escalation_rules JSONB DEFAULT '[]', -- e.g., [{"after_minutes": 60, "notify_user_ids": []}]
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_sla_policies_organization_id ON sla_policies(organization_id);
CREATE INDEX idx_sla_policies_is_active ON sla_policies(is_active);

-- RLS Policies
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;

-- Admins can manage SLA policies
CREATE POLICY "Admins can view SLA policies"
  ON sla_policies
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can create SLA policies"
  ON sla_policies
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update SLA policies"
  ON sla_policies
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete SLA policies"
  ON sla_policies
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Add SLA tracking to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_policy_id UUID REFERENCES sla_policies(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_first_response_due_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_resolution_due_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_first_response_breached BOOLEAN DEFAULT false;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_resolution_breached BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_tickets_sla_policy_id ON tickets(sla_policy_id);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_first_response_due_at ON tickets(sla_first_response_due_at);
CREATE INDEX IF NOT EXISTS idx_tickets_sla_resolution_due_at ON tickets(sla_resolution_due_at);

-- Function to calculate SLA due dates
CREATE OR REPLACE FUNCTION calculate_sla_due_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_sla_policy RECORD;
  v_first_response_minutes INTEGER;
  v_resolution_minutes INTEGER;
BEGIN
  -- Get the active SLA policy for the organization
  SELECT * INTO v_sla_policy
  FROM sla_policies
  WHERE organization_id = NEW.organization_id
    AND is_active = true
  LIMIT 1;
  
  IF v_sla_policy.id IS NOT NULL THEN
    NEW.sla_policy_id := v_sla_policy.id;
    
    -- Check for priority overrides
    IF v_sla_policy.priority_overrides ? NEW.priority THEN
      v_first_response_minutes := (v_sla_policy.priority_overrides->NEW.priority->>'first_response_time')::INTEGER;
      v_resolution_minutes := (v_sla_policy.priority_overrides->NEW.priority->>'resolution_time')::INTEGER;
    ELSE
      v_first_response_minutes := v_sla_policy.first_response_time;
      v_resolution_minutes := v_sla_policy.resolution_time;
    END IF;
    
    -- Calculate due dates (simple version - not accounting for business hours yet)
    NEW.sla_first_response_due_at := NEW.created_at + (v_first_response_minutes || ' minutes')::INTERVAL;
    NEW.sla_resolution_due_at := NEW.created_at + (v_resolution_minutes || ' minutes')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to calculate SLA due dates on ticket creation
DROP TRIGGER IF EXISTS trigger_calculate_sla_due_dates ON tickets;
CREATE TRIGGER trigger_calculate_sla_due_dates
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sla_due_dates();

-- Comment
COMMENT ON TABLE sla_policies IS 'Defines service level agreements for ticket response and resolution times';
COMMENT ON FUNCTION calculate_sla_due_dates IS 'Calculates SLA due dates when a ticket is created';
