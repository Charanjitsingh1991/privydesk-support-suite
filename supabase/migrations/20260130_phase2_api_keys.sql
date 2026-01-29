-- Phase 2: API Keys & Versioning
-- Create api_keys table for API authentication

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Key details
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- Hashed API key
  key_prefix TEXT NOT NULL, -- First 8 characters for display (e.g., "pk_live_")
  
  -- Permissions
  scopes TEXT[] DEFAULT ARRAY['read', 'write'], -- e.g., ['tickets:read', 'tickets:write', 'users:read']
  
  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 100,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_api_keys_organization_id ON api_keys(organization_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);

-- RLS Policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Admins and developers can view API keys
CREATE POLICY "Admins and developers can view API keys"
  ON api_keys
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'developer')
    )
  );

-- Admins and developers can create API keys
CREATE POLICY "Admins and developers can create API keys"
  ON api_keys
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'developer')
    )
  );

-- Admins and developers can update API keys
CREATE POLICY "Admins and developers can update API keys"
  ON api_keys
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'developer')
    )
  );

-- Only admins can delete API keys
CREATE POLICY "Admins can delete API keys"
  ON api_keys
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Function to update last_used_at
CREATE OR REPLACE FUNCTION update_api_key_last_used(p_key_hash TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE api_keys
  SET last_used_at = NOW()
  WHERE key_hash = p_key_hash;
END;
$$;

-- Comment
COMMENT ON TABLE api_keys IS 'API keys for programmatic access to PrivyDesk API';
COMMENT ON FUNCTION update_api_key_last_used IS 'Updates the last_used_at timestamp when an API key is used';
