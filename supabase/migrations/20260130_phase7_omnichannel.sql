-- Phase 7: Omnichannel Support
-- Social media, WhatsApp, SMS, Voice integrations

-- Channel configurations
CREATE TABLE IF NOT EXISTS channel_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Channel details
  channel_type TEXT NOT NULL, -- 'whatsapp', 'sms', 'voice', 'facebook', 'instagram', 'twitter', 'linkedin'
  channel_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  
  -- Configuration (JSON for flexibility)
  configuration JSONB NOT NULL DEFAULT '{}',
  
  -- Credentials (encrypted)
  credentials JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE(organization_id, channel_type, channel_name)
);

-- WhatsApp messages
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  channel_config_id UUID NOT NULL REFERENCES channel_configurations(id) ON DELETE CASCADE,
  
  -- Message details
  whatsapp_message_id TEXT UNIQUE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  
  -- Content
  message_type TEXT NOT NULL, -- 'text', 'image', 'video', 'document', 'audio', 'location'
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  
  -- Status
  status TEXT DEFAULT 'sent', -- sent, delivered, read, failed
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS messages
CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  channel_config_id UUID NOT NULL REFERENCES channel_configurations(id) ON DELETE CASCADE,
  
  -- Message details
  sms_message_id TEXT UNIQUE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  
  -- Content
  content TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'sent', -- sent, delivered, failed
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  error_code TEXT,
  error_message TEXT,
  
  -- Pricing
  cost_amount DECIMAL(10, 4),
  cost_currency TEXT DEFAULT 'USD',
  
  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice calls
CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  channel_config_id UUID NOT NULL REFERENCES channel_configurations(id) ON DELETE CASCADE,
  
  -- Call details
  call_sid TEXT UNIQUE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'initiated', -- initiated, ringing, in-progress, completed, failed, busy, no-answer
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  
  -- Duration
  duration_seconds INTEGER,
  
  -- Recording
  recording_url TEXT,
  recording_duration_seconds INTEGER,
  
  -- Transcription
  transcription TEXT,
  transcription_status TEXT, -- pending, completed, failed
  
  -- Pricing
  cost_amount DECIMAL(10, 4),
  cost_currency TEXT DEFAULT 'USD',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social media messages
CREATE TABLE IF NOT EXISTS social_media_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  channel_config_id UUID NOT NULL REFERENCES channel_configurations(id) ON DELETE CASCADE,
  
  -- Message details
  platform TEXT NOT NULL, -- 'facebook', 'instagram', 'twitter', 'linkedin'
  platform_message_id TEXT,
  conversation_id TEXT,
  
  -- Sender/Recipient
  from_user_id TEXT NOT NULL,
  from_username TEXT,
  to_user_id TEXT,
  
  -- Content
  message_type TEXT NOT NULL, -- 'text', 'image', 'video', 'story_mention', 'comment'
  content TEXT,
  media_urls TEXT[],
  
  -- Status
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  is_read BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(platform, platform_message_id)
);

-- Omnichannel conversations (unified view)
CREATE TABLE IF NOT EXISTS omnichannel_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  
  -- Conversation details
  channel_type TEXT NOT NULL,
  channel_identifier TEXT NOT NULL, -- phone number, social media ID, etc.
  
  -- Participant
  customer_name TEXT,
  customer_identifier TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'active', -- active, closed
  last_message_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_channel_configurations_organization_id ON channel_configurations(organization_id);
CREATE INDEX idx_channel_configurations_channel_type ON channel_configurations(channel_type);
CREATE INDEX idx_whatsapp_messages_organization_id ON whatsapp_messages(organization_id);
CREATE INDEX idx_whatsapp_messages_ticket_id ON whatsapp_messages(ticket_id);
CREATE INDEX idx_whatsapp_messages_from_number ON whatsapp_messages(from_number);
CREATE INDEX idx_sms_messages_organization_id ON sms_messages(organization_id);
CREATE INDEX idx_sms_messages_ticket_id ON sms_messages(ticket_id);
CREATE INDEX idx_voice_calls_organization_id ON voice_calls(organization_id);
CREATE INDEX idx_voice_calls_ticket_id ON voice_calls(ticket_id);
CREATE INDEX idx_social_media_messages_organization_id ON social_media_messages(organization_id);
CREATE INDEX idx_social_media_messages_ticket_id ON social_media_messages(ticket_id);
CREATE INDEX idx_social_media_messages_platform ON social_media_messages(platform);
CREATE INDEX idx_omnichannel_conversations_organization_id ON omnichannel_conversations(organization_id);
CREATE INDEX idx_omnichannel_conversations_ticket_id ON omnichannel_conversations(ticket_id);

-- RLS Policies
ALTER TABLE channel_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE omnichannel_conversations ENABLE ROW LEVEL SECURITY;

-- Channel configurations policies
CREATE POLICY "Admins can manage channels"
  ON channel_configurations FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Messages policies (all channels)
CREATE POLICY "Users can view messages"
  ON whatsapp_messages FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view SMS"
  ON sms_messages FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view calls"
  ON voice_calls FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view social messages"
  ON social_media_messages FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view conversations"
  ON omnichannel_conversations FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Comment
COMMENT ON TABLE channel_configurations IS 'Omnichannel integration configurations';
COMMENT ON TABLE whatsapp_messages IS 'WhatsApp Business API messages';
COMMENT ON TABLE sms_messages IS 'SMS messages via Twilio';
COMMENT ON TABLE voice_calls IS 'Voice calls via Twilio';
COMMENT ON TABLE social_media_messages IS 'Social media messages (Facebook, Instagram, Twitter, LinkedIn)';
COMMENT ON TABLE omnichannel_conversations IS 'Unified view of all channel conversations';
