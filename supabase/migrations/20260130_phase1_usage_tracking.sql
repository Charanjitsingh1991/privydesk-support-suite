-- Phase 1: Usage Tracking & Rate Limiting
-- Create usage_daily table for tracking resource usage per organization

CREATE TABLE IF NOT EXISTS usage_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Usage metrics
  tickets_created INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  storage_used_bytes BIGINT DEFAULT 0,
  chat_messages INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one record per organization per day
  UNIQUE(organization_id, date)
);

-- Indexes
CREATE INDEX idx_usage_daily_organization_id ON usage_daily(organization_id);
CREATE INDEX idx_usage_daily_date ON usage_daily(date DESC);

-- RLS Policies
ALTER TABLE usage_daily ENABLE ROW LEVEL SECURITY;

-- Admins can view usage for their organization
CREATE POLICY "Admins can view usage"
  ON usage_daily
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- System can insert/update usage
CREATE POLICY "System can manage usage"
  ON usage_daily
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to increment usage counters
CREATE OR REPLACE FUNCTION increment_usage(
  p_organization_id UUID,
  p_metric TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO usage_daily (organization_id, date, tickets_created, emails_sent, api_calls, storage_used_bytes, chat_messages)
  VALUES (
    p_organization_id,
    CURRENT_DATE,
    CASE WHEN p_metric = 'tickets_created' THEN p_amount ELSE 0 END,
    CASE WHEN p_metric = 'emails_sent' THEN p_amount ELSE 0 END,
    CASE WHEN p_metric = 'api_calls' THEN p_amount ELSE 0 END,
    CASE WHEN p_metric = 'storage_used_bytes' THEN p_amount ELSE 0 END,
    CASE WHEN p_metric = 'chat_messages' THEN p_amount ELSE 0 END
  )
  ON CONFLICT (organization_id, date)
  DO UPDATE SET
    tickets_created = usage_daily.tickets_created + CASE WHEN p_metric = 'tickets_created' THEN p_amount ELSE 0 END,
    emails_sent = usage_daily.emails_sent + CASE WHEN p_metric = 'emails_sent' THEN p_amount ELSE 0 END,
    api_calls = usage_daily.api_calls + CASE WHEN p_metric = 'api_calls' THEN p_amount ELSE 0 END,
    storage_used_bytes = usage_daily.storage_used_bytes + CASE WHEN p_metric = 'storage_used_bytes' THEN p_amount ELSE 0 END,
    chat_messages = usage_daily.chat_messages + CASE WHEN p_metric = 'chat_messages' THEN p_amount ELSE 0 END,
    updated_at = NOW();
END;
$$;

-- Comment
COMMENT ON TABLE usage_daily IS 'Tracks daily resource usage per organization for billing and quota enforcement';
COMMENT ON FUNCTION increment_usage IS 'Increments usage counter for a specific metric';
