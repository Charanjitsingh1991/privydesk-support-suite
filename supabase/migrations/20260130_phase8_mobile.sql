-- Phase 8: Mobile & Accessibility
-- Mobile app support, push notifications, accessibility features

-- Mobile devices
CREATE TABLE IF NOT EXISTS mobile_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Device details
  device_type TEXT NOT NULL, -- 'ios', 'android'
  device_token TEXT NOT NULL UNIQUE,
  device_name TEXT,
  device_model TEXT,
  os_version TEXT,
  app_version TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push notifications
CREATE TABLE IF NOT EXISTS push_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification details
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  
  -- Targeting
  device_tokens TEXT[],
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, failed
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Response
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Metadata
  notification_type TEXT, -- 'ticket_assigned', 'mention', 'message', etc.
  related_resource_type TEXT,
  related_resource_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mobile app sessions
CREATE TABLE IF NOT EXISTS mobile_app_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,
  
  -- Session details
  session_token TEXT NOT NULL UNIQUE,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Offline sync queue
CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,
  
  -- Action details
  action_type TEXT NOT NULL, -- 'create_ticket', 'add_message', 'update_status', etc.
  resource_type TEXT NOT NULL,
  resource_id UUID,
  payload JSONB NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, synced, failed
  sync_attempts INTEGER DEFAULT 0,
  last_sync_attempt_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accessibility preferences
CREATE TABLE IF NOT EXISTS accessibility_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Visual preferences
  high_contrast_mode BOOLEAN DEFAULT false,
  large_text_mode BOOLEAN DEFAULT false,
  font_size_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  
  -- Screen reader
  screen_reader_enabled BOOLEAN DEFAULT false,
  screen_reader_verbosity TEXT DEFAULT 'normal', -- minimal, normal, verbose
  
  -- Keyboard navigation
  keyboard_shortcuts_enabled BOOLEAN DEFAULT true,
  focus_indicators_enhanced BOOLEAN DEFAULT false,
  
  -- Motion
  reduce_motion BOOLEAN DEFAULT false,
  reduce_transparency BOOLEAN DEFAULT false,
  
  -- Color blindness
  color_blind_mode TEXT, -- 'none', 'protanopia', 'deuteranopia', 'tritanopia'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- App feedback
CREATE TABLE IF NOT EXISTS app_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Feedback details
  feedback_type TEXT NOT NULL, -- 'bug', 'feature_request', 'general'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Device context
  device_type TEXT,
  app_version TEXT,
  os_version TEXT,
  
  -- Attachments
  screenshot_urls TEXT[],
  
  -- Status
  status TEXT DEFAULT 'submitted', -- submitted, reviewing, resolved, closed
  
  -- Response
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mobile_devices_user_id ON mobile_devices(user_id);
CREATE INDEX idx_mobile_devices_device_token ON mobile_devices(device_token);
CREATE INDEX idx_push_notifications_user_id ON push_notifications(user_id);
CREATE INDEX idx_push_notifications_status ON push_notifications(status);
CREATE INDEX idx_mobile_app_sessions_user_id ON mobile_app_sessions(user_id);
CREATE INDEX idx_mobile_app_sessions_device_id ON mobile_app_sessions(device_id);
CREATE INDEX idx_offline_sync_queue_user_id ON offline_sync_queue(user_id);
CREATE INDEX idx_offline_sync_queue_status ON offline_sync_queue(status);
CREATE INDEX idx_accessibility_preferences_user_id ON accessibility_preferences(user_id);
CREATE INDEX idx_app_feedback_user_id ON app_feedback(user_id);
CREATE INDEX idx_app_feedback_status ON app_feedback(status);

-- RLS Policies
ALTER TABLE mobile_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_app_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_feedback ENABLE ROW LEVEL SECURITY;

-- Mobile devices policies
CREATE POLICY "Users can manage their devices"
  ON mobile_devices FOR ALL
  USING (user_id = auth.uid());

-- Push notifications policies
CREATE POLICY "Users can view their notifications"
  ON push_notifications FOR SELECT
  USING (user_id = auth.uid());

-- Sessions policies
CREATE POLICY "Users can view their sessions"
  ON mobile_app_sessions FOR SELECT
  USING (user_id = auth.uid());

-- Offline sync policies
CREATE POLICY "Users can manage their sync queue"
  ON offline_sync_queue FOR ALL
  USING (user_id = auth.uid());

-- Accessibility preferences policies
CREATE POLICY "Users can manage their accessibility preferences"
  ON accessibility_preferences FOR ALL
  USING (user_id = auth.uid());

-- App feedback policies
CREATE POLICY "Users can submit feedback"
  ON app_feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their feedback"
  ON app_feedback FOR SELECT
  USING (user_id = auth.uid() OR auth.uid() IN (
    SELECT id FROM users WHERE role IN ('admin', 'super_admin')
  ));

-- Comment
COMMENT ON TABLE mobile_devices IS 'Registered mobile devices for push notifications';
COMMENT ON TABLE push_notifications IS 'Push notification delivery tracking';
COMMENT ON TABLE mobile_app_sessions IS 'Mobile app session tracking';
COMMENT ON TABLE offline_sync_queue IS 'Offline actions queue for sync when online';
COMMENT ON TABLE accessibility_preferences IS 'User accessibility preferences (WCAG 2.1)';
COMMENT ON TABLE app_feedback IS 'User feedback and bug reports from mobile apps';
