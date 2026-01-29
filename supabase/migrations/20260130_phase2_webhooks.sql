-- Phase 2: Webhook System
-- Create webhooks and webhook_deliveries tables

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Webhook details
  url TEXT NOT NULL,
  secret TEXT NOT NULL, -- For HMAC signature verification
  description TEXT,
  
  -- Events to listen to
  events TEXT[] NOT NULL, -- e.g., ['ticket.created', 'ticket.updated', 'user.invited']
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  retry_enabled BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  
  -- Delivery status
  status TEXT DEFAULT 'pending', -- pending, success, failed
  attempts INTEGER DEFAULT 0,
  
  -- Response
  response_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  
  -- Timing
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhooks_organization_id ON webhooks(organization_id);
CREATE INDEX idx_webhooks_is_active ON webhooks(is_active);
CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_next_retry_at ON webhook_deliveries(next_retry_at);
CREATE INDEX idx_webhook_deliveries_created_at ON webhook_deliveries(created_at DESC);

-- RLS Policies
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Admins and developers can manage webhooks
CREATE POLICY "Admins and developers can view webhooks"
  ON webhooks
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'developer')
    )
  );

CREATE POLICY "Admins and developers can create webhooks"
  ON webhooks
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'developer')
    )
  );

CREATE POLICY "Admins and developers can update webhooks"
  ON webhooks
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'developer')
    )
  );

CREATE POLICY "Admins can delete webhooks"
  ON webhooks
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Webhook deliveries policies
CREATE POLICY "Users can view webhook deliveries"
  ON webhook_deliveries
  FOR SELECT
  USING (
    webhook_id IN (
      SELECT id FROM webhooks WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'developer')
      )
    )
  );

-- System can insert/update webhook deliveries
CREATE POLICY "System can manage webhook deliveries"
  ON webhook_deliveries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to create webhook delivery
CREATE OR REPLACE FUNCTION create_webhook_delivery(
  p_webhook_id UUID,
  p_event_type TEXT,
  p_payload JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_delivery_id UUID;
BEGIN
  INSERT INTO webhook_deliveries (webhook_id, event_type, payload, status, attempts)
  VALUES (p_webhook_id, p_event_type, p_payload, 'pending', 0)
  RETURNING id INTO v_delivery_id;
  
  RETURN v_delivery_id;
END;
$$;

-- Function to update webhook delivery status
CREATE OR REPLACE FUNCTION update_webhook_delivery_status(
  p_delivery_id UUID,
  p_status TEXT,
  p_response_code INTEGER DEFAULT NULL,
  p_response_body TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE webhook_deliveries
  SET 
    status = p_status,
    attempts = attempts + 1,
    response_code = COALESCE(p_response_code, response_code),
    response_body = COALESCE(p_response_body, response_body),
    error_message = COALESCE(p_error_message, error_message),
    last_attempt_at = NOW(),
    delivered_at = CASE WHEN p_status = 'success' THEN NOW() ELSE delivered_at END,
    next_retry_at = CASE 
      WHEN p_status = 'failed' AND attempts < 3 
      THEN NOW() + (POWER(2, attempts) || ' minutes')::INTERVAL 
      ELSE NULL 
    END
  WHERE id = p_delivery_id;
END;
$$;

-- Comment
COMMENT ON TABLE webhooks IS 'Webhook endpoints for real-time event notifications';
COMMENT ON TABLE webhook_deliveries IS 'Webhook delivery attempts and status tracking';
COMMENT ON FUNCTION create_webhook_delivery IS 'Creates a new webhook delivery for an event';
COMMENT ON FUNCTION update_webhook_delivery_status IS 'Updates webhook delivery status after attempt';
