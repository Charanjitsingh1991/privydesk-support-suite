-- Phase 1: Canned Responses System
-- Create canned_responses table for quick reply templates

CREATE TABLE IF NOT EXISTS canned_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Response details
  title TEXT NOT NULL,
  shortcut TEXT, -- Quick access shortcut (e.g., "/greeting")
  content TEXT NOT NULL,
  
  -- Categorization
  category TEXT, -- e.g., "greeting", "closing", "technical", "billing"
  tags TEXT[] DEFAULT '{}',
  
  -- Variables support
  variables JSONB DEFAULT '[]', -- e.g., [{"name": "customer_name", "default": "Customer"}]
  
  -- Visibility
  is_public BOOLEAN DEFAULT true, -- If false, only visible to creator
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_canned_responses_organization_id ON canned_responses(organization_id);
CREATE INDEX idx_canned_responses_is_active ON canned_responses(is_active);
CREATE INDEX idx_canned_responses_shortcut ON canned_responses(shortcut);
CREATE INDEX idx_canned_responses_category ON canned_responses(category);
CREATE INDEX idx_canned_responses_created_by ON canned_responses(created_by);

-- RLS Policies
ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;

-- Users can view public responses or their own private responses
CREATE POLICY "Users can view canned responses"
  ON canned_responses
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    AND (is_public = true OR created_by = auth.uid())
  );

-- Admins and agents can create responses
CREATE POLICY "Admins and agents can create canned responses"
  ON canned_responses
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
    )
  );

-- Users can update their own responses, admins can update all
CREATE POLICY "Users can update their canned responses"
  ON canned_responses
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    AND (
      created_by = auth.uid()
      OR auth.uid() IN (
        SELECT id FROM users WHERE organization_id = canned_responses.organization_id AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Users can delete their own responses, admins can delete all
CREATE POLICY "Users can delete their canned responses"
  ON canned_responses
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    AND (
      created_by = auth.uid()
      OR auth.uid() IN (
        SELECT id FROM users WHERE organization_id = canned_responses.organization_id AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Function to increment response usage count
CREATE OR REPLACE FUNCTION increment_canned_response_usage(p_response_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE canned_responses
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = p_response_id;
END;
$$;

-- Function to replace variables in canned response content
CREATE OR REPLACE FUNCTION replace_canned_response_variables(
  p_content TEXT,
  p_variables JSONB
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_result TEXT := p_content;
  v_variable JSONB;
BEGIN
  FOR v_variable IN SELECT * FROM jsonb_array_elements(p_variables)
  LOOP
    v_result := REPLACE(
      v_result,
      '{{' || (v_variable->>'name') || '}}',
      COALESCE(v_variable->>'value', v_variable->>'default', '')
    );
  END LOOP;
  
  RETURN v_result;
END;
$$;

-- Comment
COMMENT ON TABLE canned_responses IS 'Quick reply templates for agents to respond faster to common questions';
COMMENT ON FUNCTION increment_canned_response_usage IS 'Increments the usage counter when a canned response is used';
COMMENT ON FUNCTION replace_canned_response_variables IS 'Replaces variables in canned response content with actual values';
