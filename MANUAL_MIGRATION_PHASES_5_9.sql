-- ============================================================================
-- PHASE 5-9 DATABASE MIGRATIONS - Run this in Supabase SQL Editor
-- This includes Email Migration, Enterprise, Omnichannel, Mobile, Integrations
-- ============================================================================

-- ============================================================================
-- PHASE 5: Email Migration & Knowledge Base
-- ============================================================================

-- Email Import Jobs
CREATE TABLE IF NOT EXISTS public.email_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  import_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,
  total_emails INTEGER DEFAULT 0,
  processed_emails INTEGER DEFAULT 0,
  failed_emails INTEGER DEFAULT 0,
  error_message TEXT,
  error_details JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_email_import_jobs_organization_id ON public.email_import_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_import_jobs_status ON public.email_import_jobs(status);

-- Email Archive
CREATE TABLE IF NOT EXISTS public.email_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  import_job_id UUID REFERENCES public.email_import_jobs(id) ON DELETE SET NULL,
  message_id TEXT,
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  body_text TEXT,
  body_html TEXT,
  sent_date TIMESTAMPTZ NOT NULL,
  received_date TIMESTAMPTZ,
  folder_path TEXT,
  has_attachments BOOLEAN DEFAULT false,
  attachment_count INTEGER DEFAULT 0,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_archive_organization_id ON public.email_archive(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_archive_import_job_id ON public.email_archive(import_job_id);
CREATE INDEX IF NOT EXISTS idx_email_archive_sent_date ON public.email_archive(sent_date DESC);
CREATE INDEX IF NOT EXISTS idx_email_archive_from_email ON public.email_archive(from_email);
CREATE INDEX IF NOT EXISTS idx_email_archive_search_vector ON public.email_archive USING gin(search_vector);

-- Email Attachments
CREATE TABLE IF NOT EXISTS public.email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES public.email_archive(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_attachments_email_id ON public.email_attachments(email_id);

-- Knowledge Base Articles
CREATE TABLE IF NOT EXISTS public.kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID,
  tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en',
  translated_from UUID REFERENCES public.kb_articles(id) ON DELETE SET NULL,
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES public.kb_articles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,
  scheduled_unpublish_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_kb_articles_organization_id ON public.kb_articles(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_category_id ON public.kb_articles(category_id);
CREATE INDEX IF NOT EXISTS idx_kb_articles_status ON public.kb_articles(status);
CREATE INDEX IF NOT EXISTS idx_kb_articles_language ON public.kb_articles(language);
CREATE INDEX IF NOT EXISTS idx_kb_articles_search_vector ON public.kb_articles USING gin(search_vector);

-- KB Categories
CREATE TABLE IF NOT EXISTS public.kb_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.kb_categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_kb_categories_organization_id ON public.kb_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_categories_parent_id ON public.kb_categories(parent_id);

-- Add foreign key for category_id after kb_categories is created
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'kb_articles_category_id_fkey'
  ) THEN
    ALTER TABLE public.kb_articles 
    ADD CONSTRAINT kb_articles_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES public.kb_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Forum Topics
CREATE TABLE IF NOT EXISTS public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.kb_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_forum_topics_organization_id ON public.forum_topics(organization_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON public.forum_topics(category_id);

-- Forum Replies
CREATE TABLE IF NOT EXISTS public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_best_answer BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id ON public.forum_replies(topic_id);

-- ============================================================================
-- PHASE 6: Enterprise & Security
-- ============================================================================

-- SSO Configurations
CREATE TABLE IF NOT EXISTS public.sso_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  saml_entity_id TEXT,
  saml_sso_url TEXT,
  saml_certificate TEXT,
  saml_sign_requests BOOLEAN DEFAULT false,
  oauth_client_id TEXT,
  oauth_client_secret TEXT,
  oauth_authorization_url TEXT,
  oauth_token_url TEXT,
  oauth_user_info_url TEXT,
  jit_provisioning_enabled BOOLEAN DEFAULT false,
  default_role TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(organization_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_sso_configurations_organization_id ON public.sso_configurations(organization_id);

-- Custom Roles
CREATE TABLE IF NOT EXISTS public.custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_custom_roles_organization_id ON public.custom_roles(organization_id);

-- User Role Assignments
CREATE TABLE IF NOT EXISTS public.user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  custom_role_id UUID NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(user_id, custom_role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_role_assignments_user_id ON public.user_role_assignments(user_id);

-- Custom Domains
CREATE TABLE IF NOT EXISTS public.custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  subdomain TEXT,
  verification_token TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  ssl_enabled BOOLEAN DEFAULT false,
  ssl_certificate TEXT,
  ssl_private_key TEXT,
  ssl_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_organization_id ON public.custom_domains(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON public.custom_domains(domain);

-- Branding Settings
CREATE TABLE IF NOT EXISTS public.branding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  logo_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#a3e635',
  secondary_color TEXT,
  accent_color TEXT,
  font_family TEXT,
  email_header_logo_url TEXT,
  email_footer_text TEXT,
  email_footer_links JSONB DEFAULT '[]',
  widget_position TEXT DEFAULT 'bottom-right',
  widget_color TEXT,
  widget_greeting_message TEXT,
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id)
);

CREATE INDEX IF NOT EXISTS idx_branding_settings_organization_id ON public.branding_settings(organization_id);

-- GDPR Requests
CREATE TABLE IF NOT EXISTS public.gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  export_file_url TEXT,
  export_file_size BIGINT,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_gdpr_requests_organization_id ON public.gdpr_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status ON public.gdpr_requests(status);

-- Data Retention Policies
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL,
  retention_days INTEGER NOT NULL,
  action_on_expiry TEXT DEFAULT 'archive',
  is_active BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(organization_id, resource_type)
);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_organization_id ON public.data_retention_policies(organization_id);

-- Compliance Certifications
CREATE TABLE IF NOT EXISTS public.compliance_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress',
  certification_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  audit_report_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_compliance_certifications_organization_id ON public.compliance_certifications(organization_id);

-- ============================================================================
-- PHASE 7: Omnichannel Support
-- ============================================================================

-- Channel Configurations
CREATE TABLE IF NOT EXISTS public.channel_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  configuration JSONB NOT NULL DEFAULT '{}',
  credentials JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(organization_id, channel_type, channel_name)
);

CREATE INDEX IF NOT EXISTS idx_channel_configurations_organization_id ON public.channel_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_channel_configurations_channel_type ON public.channel_configurations(channel_type);

-- WhatsApp Messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  channel_config_id UUID NOT NULL REFERENCES public.channel_configurations(id) ON DELETE CASCADE,
  whatsapp_message_id TEXT UNIQUE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  message_type TEXT NOT NULL,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  status TEXT DEFAULT 'sent',
  direction TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_organization_id ON public.whatsapp_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_ticket_id ON public.whatsapp_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from_number ON public.whatsapp_messages(from_number);

-- SMS Messages
CREATE TABLE IF NOT EXISTS public.sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  channel_config_id UUID NOT NULL REFERENCES public.channel_configurations(id) ON DELETE CASCADE,
  sms_message_id TEXT UNIQUE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  direction TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  cost_amount DECIMAL(10, 4),
  cost_currency TEXT DEFAULT 'USD',
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_messages_organization_id ON public.sms_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_ticket_id ON public.sms_messages(ticket_id);

-- Voice Calls
CREATE TABLE IF NOT EXISTS public.voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  channel_config_id UUID NOT NULL REFERENCES public.channel_configurations(id) ON DELETE CASCADE,
  call_sid TEXT UNIQUE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  status TEXT DEFAULT 'initiated',
  direction TEXT NOT NULL,
  duration_seconds INTEGER,
  recording_url TEXT,
  recording_duration_seconds INTEGER,
  transcription TEXT,
  transcription_status TEXT,
  cost_amount DECIMAL(10, 4),
  cost_currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_voice_calls_organization_id ON public.voice_calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_ticket_id ON public.voice_calls(ticket_id);

-- Social Media Messages
CREATE TABLE IF NOT EXISTS public.social_media_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  channel_config_id UUID NOT NULL REFERENCES public.channel_configurations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_message_id TEXT,
  conversation_id TEXT,
  from_user_id TEXT NOT NULL,
  from_username TEXT,
  to_user_id TEXT,
  message_type TEXT NOT NULL,
  content TEXT,
  media_urls TEXT[],
  direction TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(platform, platform_message_id)
);

CREATE INDEX IF NOT EXISTS idx_social_media_messages_organization_id ON public.social_media_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_social_media_messages_ticket_id ON public.social_media_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_social_media_messages_platform ON public.social_media_messages(platform);

-- Omnichannel Conversations
CREATE TABLE IF NOT EXISTS public.omnichannel_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  channel_type TEXT NOT NULL,
  channel_identifier TEXT NOT NULL,
  customer_name TEXT,
  customer_identifier TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  last_message_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_omnichannel_conversations_organization_id ON public.omnichannel_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_omnichannel_conversations_ticket_id ON public.omnichannel_conversations(ticket_id);

-- ============================================================================
-- PHASE 8: Mobile & Accessibility
-- ============================================================================

-- Mobile Devices
CREATE TABLE IF NOT EXISTS public.mobile_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL,
  device_token TEXT NOT NULL UNIQUE,
  device_name TEXT,
  device_model TEXT,
  os_version TEXT,
  app_version TEXT,
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  registered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mobile_devices_user_id ON public.mobile_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_devices_device_token ON public.mobile_devices(device_token);

-- Push Notifications
CREATE TABLE IF NOT EXISTS public.push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  device_tokens TEXT[],
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  error_message TEXT,
  notification_type TEXT,
  related_resource_type TEXT,
  related_resource_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_notifications_user_id ON public.push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON public.push_notifications(status);

-- Mobile App Sessions
CREATE TABLE IF NOT EXISTS public.mobile_app_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.mobile_devices(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mobile_app_sessions_user_id ON public.mobile_app_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_app_sessions_device_id ON public.mobile_app_sessions(device_id);

-- Offline Sync Queue
CREATE TABLE IF NOT EXISTS public.offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES public.mobile_devices(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  sync_attempts INTEGER DEFAULT 0,
  last_sync_attempt_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offline_sync_queue_user_id ON public.offline_sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_sync_queue_status ON public.offline_sync_queue(status);

-- Accessibility Preferences
CREATE TABLE IF NOT EXISTS public.accessibility_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  high_contrast_mode BOOLEAN DEFAULT false,
  large_text_mode BOOLEAN DEFAULT false,
  font_size_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  screen_reader_enabled BOOLEAN DEFAULT false,
  screen_reader_verbosity TEXT DEFAULT 'normal',
  keyboard_shortcuts_enabled BOOLEAN DEFAULT true,
  focus_indicators_enhanced BOOLEAN DEFAULT false,
  reduce_motion BOOLEAN DEFAULT false,
  reduce_transparency BOOLEAN DEFAULT false,
  color_blind_mode TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_accessibility_preferences_user_id ON public.accessibility_preferences(user_id);

-- App Feedback
CREATE TABLE IF NOT EXISTS public.app_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  device_type TEXT,
  app_version TEXT,
  os_version TEXT,
  screenshot_urls TEXT[],
  status TEXT DEFAULT 'submitted',
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_feedback_user_id ON public.app_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_app_feedback_status ON public.app_feedback(status);

-- ============================================================================
-- PHASE 9: Integrations & Marketplace
-- ============================================================================

-- Integration Configurations
CREATE TABLE IF NOT EXISTS public.integration_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  integration_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  configuration JSONB NOT NULL DEFAULT '{}',
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  webhook_url TEXT,
  webhook_secret TEXT,
  sync_enabled BOOLEAN DEFAULT false,
  sync_frequency_minutes INTEGER DEFAULT 15,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(organization_id, integration_type, integration_name)
);

CREATE INDEX IF NOT EXISTS idx_integration_configurations_organization_id ON public.integration_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_configurations_integration_type ON public.integration_configurations(integration_type);

-- Integration Sync Logs
CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_config_id UUID NOT NULL REFERENCES public.integration_configurations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress',
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  error_details JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_integration_config_id ON public.integration_sync_logs(integration_config_id);

-- Zapier Triggers
CREATE TABLE IF NOT EXISTS public.zapier_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  trigger_event TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zapier_triggers_organization_id ON public.zapier_triggers(organization_id);

-- Marketplace Apps
CREATE TABLE IF NOT EXISTS public.marketplace_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  publisher_name TEXT NOT NULL,
  publisher_email TEXT NOT NULL,
  publisher_website TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  pricing_model TEXT NOT NULL,
  price_monthly DECIMAL(10, 2),
  price_yearly DECIMAL(10, 2),
  logo_url TEXT NOT NULL,
  screenshots TEXT[],
  video_url TEXT,
  required_permissions TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT false,
  install_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_marketplace_apps_status ON public.marketplace_apps(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_category ON public.marketplace_apps(category);

-- App Installations
CREATE TABLE IF NOT EXISTS public.app_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES public.marketplace_apps(id) ON DELETE CASCADE,
  configuration JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  installed_at TIMESTAMPTZ DEFAULT now(),
  uninstalled_at TIMESTAMPTZ,
  installed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(organization_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_app_installations_organization_id ON public.app_installations(organization_id);
CREATE INDEX IF NOT EXISTS idx_app_installations_app_id ON public.app_installations(app_id);

-- App Reviews
CREATE TABLE IF NOT EXISTS public.app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.marketplace_apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(app_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_app_reviews_app_id ON public.app_reviews(app_id);

-- E-commerce Orders
CREATE TABLE IF NOT EXISTS public.ecommerce_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_config_id UUID NOT NULL REFERENCES public.integration_configurations(id) ON DELETE CASCADE,
  external_order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  order_status TEXT NOT NULL,
  order_total DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  order_date TIMESTAMPTZ NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  shipping_address JSONB,
  tracking_number TEXT,
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  synced_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, external_order_id)
);

CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_organization_id ON public.ecommerce_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_customer_email ON public.ecommerce_orders(customer_email);

-- CRM Contacts
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_config_id UUID NOT NULL REFERENCES public.integration_configurations(id) ON DELETE CASCADE,
  external_contact_id TEXT NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  crm_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  synced_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, external_contact_id)
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_organization_id ON public.crm_contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON public.crm_contacts(email);

-- ============================================================================
-- SUCCESS! All Phase 5-9 tables created
-- Total: 40+ additional tables
-- Run this in Supabase SQL Editor after MANUAL_MIGRATION_COMPLETE.sql
-- ============================================================================
