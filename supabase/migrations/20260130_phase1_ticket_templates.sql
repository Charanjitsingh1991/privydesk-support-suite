-- Phase 1: Ticket Templates System
-- Create ticket_templates table for reusable ticket templates

CREATE TABLE IF NOT EXISTS ticket_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Template details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template content
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Default values
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Assignment
  default_assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_ticket_templates_organization_id ON ticket_templates(organization_id);
CREATE INDEX idx_ticket_templates_is_active ON ticket_templates(is_active);
CREATE INDEX idx_ticket_templates_name ON ticket_templates(name);

-- RLS Policies
ALTER TABLE ticket_templates ENABLE ROW LEVEL SECURITY;

-- All users can view templates in their organization
CREATE POLICY "Users can view ticket templates"
  ON ticket_templates
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Admins and agents can create templates
CREATE POLICY "Admins and agents can create ticket templates"
  ON ticket_templates
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
    )
  );

-- Admins and agents can update templates
CREATE POLICY "Admins and agents can update ticket templates"
  ON ticket_templates
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
    )
  );

-- Only admins can delete templates
CREATE POLICY "Admins can delete ticket templates"
  ON ticket_templates
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ticket_templates
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = p_template_id;
END;
$$;

-- Comment
COMMENT ON TABLE ticket_templates IS 'Reusable templates for creating tickets with predefined content and settings';
COMMENT ON FUNCTION increment_template_usage IS 'Increments the usage counter when a template is used';
