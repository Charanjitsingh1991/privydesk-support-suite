-- ============================================================
-- PrivyDesk Production Schema Snapshot
-- Project ref : mgnuddfytlbtgprckzto
-- Captured    : 2026-06-14 21:16 UTC
-- Method      : Supabase Management API (information_schema + pg_catalog)
--               NOTE: supabase db dump unavailable (no Docker on this host).
--               This file is schema-only; no data. It is the source of truth
--               for reconciliation — use it, not the migration files.
-- PostgreSQL   : 17.6 (aarch64-unknown-linux-gnu)
-- ============================================================

-- ENUMS -------------------------------------------------------
-- user_role: super_admin | admin | agent | client  (NO 'developer')
-- org_status: active | suspended | cancelled
-- plan_type: free | starter | pro | enterprise
-- ticket_status: open | in_progress | waiting_customer | resolved | closed
-- ticket_priority: low | medium | high | urgent

-- TABLES (82 base tables) -----------------------------------

-- TABLE: accessibility_preferences
CREATE TABLE public.accessibility_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  high_contrast_mode boolean DEFAULT false,
  large_text_mode boolean DEFAULT false,
  font_size_multiplier numeric DEFAULT 1.0,
  screen_reader_enabled boolean DEFAULT false,
  screen_reader_verbosity text DEFAULT 'normal'::text,
  keyboard_shortcuts_enabled boolean DEFAULT true,
  focus_indicators_enhanced boolean DEFAULT false,
  reduce_motion boolean DEFAULT false,
  reduce_transparency boolean DEFAULT false,
  color_blind_mode text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: agent_availability
CREATE TABLE public.agent_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'offline'::text,
  current_chats integer DEFAULT 0,
  max_concurrent_chats integer DEFAULT 5,
  last_activity_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: allowed_domains
CREATE TABLE public.allowed_domains (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  domain text NOT NULL,
  added_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: analytics_daily_stats
CREATE TABLE public.analytics_daily_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  stat_date date NOT NULL,
  tickets_created integer DEFAULT 0,
  tickets_resolved integer DEFAULT 0,
  tickets_closed integer DEFAULT 0,
  avg_response_time_minutes numeric,
  avg_resolution_time_minutes numeric,
  sla_compliance_rate numeric,
  csat_average numeric,
  csat_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: api_keys
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  permissions text[] DEFAULT '{}'::text[],
  rate_limit integer DEFAULT 60,
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone,
  last_used_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: api_request_logs
CREATE TABLE public.api_request_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  api_key_id uuid,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer NOT NULL,
  response_time_ms integer,
  ip_address text,
  user_agent text,
  request_body jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: app_feedback
CREATE TABLE public.app_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  feedback_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  device_type text,
  app_version text,
  os_version text,
  screenshot_urls text[],
  status text DEFAULT 'submitted'::text,
  admin_response text,
  responded_at timestamp with time zone,
  responded_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: app_installations
CREATE TABLE public.app_installations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  app_id uuid NOT NULL,
  configuration jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active'::text,
  installed_at timestamp with time zone DEFAULT now(),
  uninstalled_at timestamp with time zone,
  installed_by uuid
);

-- TABLE: app_reviews
CREATE TABLE public.app_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL,
  title text,
  comment text,
  is_verified_purchase boolean DEFAULT false,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: attachments
CREATE TABLE public.attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid,
  message_id uuid,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL,
  uploaded_by uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: audit_logs
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  before_snapshot jsonb,
  after_snapshot jsonb,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: automation_logs
CREATE TABLE public.automation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  automation_rule_id uuid NOT NULL,
  ticket_id uuid,
  status text DEFAULT 'success'::text,
  actions_executed jsonb,
  error_message text,
  executed_at timestamp with time zone DEFAULT now()
);

-- TABLE: automation_rules
CREATE TABLE public.automation_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  trigger_type text NOT NULL,
  trigger_conditions jsonb DEFAULT '{}'::jsonb,
  actions jsonb NOT NULL,
  execution_order integer DEFAULT 0,
  last_executed_at timestamp with time zone,
  execution_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: blocked_ips
CREATE TABLE public.blocked_ips (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  ip_address text NOT NULL,
  reason text,
  is_global boolean DEFAULT false,
  blocked_by uuid,
  blocked_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

-- TABLE: blog_posts
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  author text DEFAULT 'PrivyDesk Content Team'::text,
  category text NOT NULL,
  featured_image text,
  read_time text,
  published_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  meta_title text,
  meta_description text,
  meta_keywords text[],
  og_image text,
  canonical_url text,
  status text DEFAULT 'published'::text,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: branding_settings
CREATE TABLE public.branding_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  logo_url text,
  logo_dark_url text,
  favicon_url text,
  primary_color text DEFAULT '#a3e635'::text,
  secondary_color text,
  accent_color text,
  font_family text,
  email_header_logo_url text,
  email_footer_text text,
  email_footer_links jsonb DEFAULT '[]'::jsonb,
  widget_position text DEFAULT 'bottom-right'::text,
  widget_color text,
  widget_greeting_message text,
  custom_css text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: business_hours
CREATE TABLE public.business_hours (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  timezone text DEFAULT 'UTC'::text,
  schedule jsonb NOT NULL,
  holidays jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: canned_responses
CREATE TABLE public.canned_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  title text NOT NULL,
  shortcut text,
  content text NOT NULL,
  category text,
  tags text[] DEFAULT '{}'::text[],
  variables jsonb DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT true,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: channel_configurations
CREATE TABLE public.channel_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  channel_type text NOT NULL,
  channel_name text NOT NULL,
  is_active boolean DEFAULT false,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  credentials jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: compliance_certifications
CREATE TABLE public.compliance_certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  certification_type text NOT NULL,
  status text DEFAULT 'in_progress'::text,
  certification_date date,
  expiry_date date,
  certificate_url text,
  audit_report_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: crm_contacts
CREATE TABLE public.crm_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  integration_config_id uuid NOT NULL,
  external_contact_id text NOT NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  company text,
  phone text,
  crm_data jsonb DEFAULT '{}'::jsonb,
  user_id uuid,
  synced_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: csat_responses
CREATE TABLE public.csat_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  rating_resolution integer NOT NULL,
  rating_response_time integer,
  rating_agent integer,
  feedback_text text,
  submitted_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: custom_domains
CREATE TABLE public.custom_domains (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  domain text NOT NULL,
  subdomain text,
  verification_token text NOT NULL,
  is_verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  ssl_enabled boolean DEFAULT false,
  ssl_certificate text,
  ssl_private_key text,
  ssl_expires_at timestamp with time zone,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: custom_roles
CREATE TABLE public.custom_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_system_role boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: data_retention_policies
CREATE TABLE public.data_retention_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  resource_type text NOT NULL,
  retention_days integer NOT NULL,
  action_on_expiry text DEFAULT 'archive'::text,
  is_active boolean DEFAULT true,
  last_executed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: ecommerce_orders
CREATE TABLE public.ecommerce_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  integration_config_id uuid NOT NULL,
  external_order_id text NOT NULL,
  order_number text NOT NULL,
  customer_email text NOT NULL,
  customer_name text,
  customer_phone text,
  order_status text NOT NULL,
  order_total numeric NOT NULL,
  currency text DEFAULT 'USD'::text,
  order_date timestamp with time zone NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  shipping_address jsonb,
  tracking_number text,
  ticket_id uuid,
  synced_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: email_archive
CREATE TABLE public.email_archive (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  outlook_message_id text,
  conversation_id text,
  subject text NOT NULL,
  from_email text NOT NULL,
  from_name text,
  to_recipients jsonb DEFAULT '[]'::jsonb,
  cc_recipients jsonb DEFAULT '[]'::jsonb,
  bcc_recipients jsonb DEFAULT '[]'::jsonb,
  body_content text,
  body_content_type text DEFAULT 'plain'::text,
  body_preview text,
  importance text DEFAULT 'normal'::text,
  is_read boolean DEFAULT false,
  has_attachments boolean DEFAULT false,
  categories jsonb DEFAULT '[]'::jsonb,
  folder_path text,
  received_datetime timestamp with time zone NOT NULL,
  sent_datetime timestamp with time zone,
  linked_ticket_id uuid,
  linked_client_id uuid,
  auto_linked boolean DEFAULT false,
  search_vector tsvector,
  imported_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: email_attachments
CREATE TABLE public.email_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email_archive_id uuid NOT NULL,
  file_name text NOT NULL,
  content_type text NOT NULL,
  file_size integer NOT NULL,
  file_url text,
  content_id text,
  is_inline boolean DEFAULT false,
  download_status text DEFAULT 'pending'::text,
  downloaded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: email_import_jobs
CREATE TABLE public.email_import_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  created_by uuid NOT NULL,
  pst_file_name text,
  pst_file_size bigint,
  pst_file_url text,
  status text DEFAULT 'pending'::text,
  total_emails integer DEFAULT 0,
  processed_emails integer DEFAULT 0,
  failed_emails integer DEFAULT 0,
  total_attachments integer DEFAULT 0,
  processed_attachments integer DEFAULT 0,
  error_message text,
  error_log jsonb DEFAULT '[]'::jsonb,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: flagged_content
CREATE TABLE public.flagged_content (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  content_type text NOT NULL,
  content_id uuid,
  flagged_content text,
  reason text NOT NULL,
  severity text NOT NULL DEFAULT 'medium'::text,
  auto_flagged boolean DEFAULT true,
  flagged_by uuid,
  reviewed boolean DEFAULT false,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  action_taken text,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: forum_replies
CREATE TABLE public.forum_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL,
  parent_reply_id uuid,
  content text NOT NULL,
  is_best_answer boolean DEFAULT false,
  is_edited boolean DEFAULT false,
  vote_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: forum_topics
CREATE TABLE public.forum_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  category_id uuid,
  tags text[] DEFAULT '{}'::text[],
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  is_solved boolean DEFAULT false,
  view_count integer DEFAULT 0,
  reply_count integer DEFAULT 0,
  vote_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: gdpr_requests
CREATE TABLE public.gdpr_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid,
  request_type text NOT NULL,
  email text NOT NULL,
  status text DEFAULT 'pending'::text,
  export_file_url text,
  export_file_size bigint,
  processed_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: integration_configurations
CREATE TABLE public.integration_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  integration_type text NOT NULL,
  integration_name text NOT NULL,
  is_active boolean DEFAULT false,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  webhook_url text,
  webhook_secret text,
  sync_enabled boolean DEFAULT false,
  sync_frequency_minutes integer DEFAULT 15,
  last_sync_at timestamp with time zone,
  next_sync_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: integration_sync_logs
CREATE TABLE public.integration_sync_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  integration_config_id uuid NOT NULL,
  sync_type text NOT NULL,
  status text DEFAULT 'in_progress'::text,
  records_synced integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  error_details jsonb,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- TABLE: kb_articles
CREATE TABLE public.kb_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  excerpt text,
  category_id uuid,
  tags text[] DEFAULT '{}'::text[],
  language text DEFAULT 'en'::text,
  translated_from uuid,
  version integer DEFAULT 1,
  previous_version_id uuid,
  status text DEFAULT 'draft'::text,
  published_at timestamp with time zone,
  scheduled_publish_at timestamp with time zone,
  scheduled_unpublish_at timestamp with time zone,
  view_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  not_helpful_count integer DEFAULT 0,
  meta_title text,
  meta_description text,
  search_vector tsvector,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

-- TABLE: kb_categories
CREATE TABLE public.kb_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  parent_id uuid,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: marketplace_apps
CREATE TABLE public.marketplace_apps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL,
  long_description text,
  publisher_name text NOT NULL,
  publisher_email text NOT NULL,
  publisher_website text,
  category text NOT NULL,
  tags text[] DEFAULT '{}'::text[],
  pricing_model text NOT NULL,
  price_monthly numeric,
  price_yearly numeric,
  logo_url text NOT NULL,
  screenshots text[],
  video_url text,
  required_permissions text[] DEFAULT '{}'::text[],
  status text DEFAULT 'pending'::text,
  is_featured boolean DEFAULT false,
  install_count integer DEFAULT 0,
  rating_average numeric,
  rating_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  approved_by uuid
);

-- TABLE: messages
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments jsonb[] DEFAULT '{}'::jsonb[],
  read_by uuid[] DEFAULT '{}'::uuid[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: mobile_app_sessions
CREATE TABLE public.mobile_app_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id uuid NOT NULL,
  session_token text NOT NULL,
  ip_address text,
  user_agent text,
  started_at timestamp with time zone DEFAULT now(),
  last_activity_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone
);

-- TABLE: mobile_devices
CREATE TABLE public.mobile_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_type text NOT NULL,
  device_token text NOT NULL,
  device_name text,
  device_model text,
  os_version text,
  app_version text,
  is_active boolean DEFAULT true,
  last_active_at timestamp with time zone DEFAULT now(),
  registered_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: offline_sync_queue
CREATE TABLE public.offline_sync_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id uuid NOT NULL,
  action_type text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  payload jsonb NOT NULL,
  status text DEFAULT 'pending'::text,
  sync_attempts integer DEFAULT 0,
  last_sync_attempt_at timestamp with time zone,
  synced_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: omnichannel_conversations
CREATE TABLE public.omnichannel_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  ticket_id uuid,
  channel_type text NOT NULL,
  channel_identifier text NOT NULL,
  customer_name text,
  customer_identifier text NOT NULL,
  status text DEFAULT 'active'::text,
  last_message_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: organizations
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  custom_domain text,
  domain_verified boolean DEFAULT false,
  domain_verification_method text,
  domain_verification_token text,
  primary_color text DEFAULT '#6366f1'::text,
  logo_url text,
  plan plan_type DEFAULT 'free'::plan_type,
  status org_status DEFAULT 'active'::org_status,
  timezone text DEFAULT 'UTC'::text,
  industry text,
  company_size text,
  metadata jsonb DEFAULT '{}'::jsonb,
  email_config jsonb DEFAULT '{}'::jsonb,
  branding jsonb DEFAULT '{"footer_text": "", "social_links": {}, "company_address": ""}'::jsonb,
  security_settings jsonb DEFAULT '{"ip_binding_enabled": false, "scan_external_links": true, "session_max_age_days": 7, "max_concurrent_sessions": 3, "notify_new_device_login": true, "require_domain_approval": true, "session_timeout_minutes": 30, "block_dangerous_attachments": true, "block_generic_email_providers": false}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: otp_codes
CREATE TABLE public.otp_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  type text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: pending_clients
CREATE TABLE public.pending_clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  status text NOT NULL DEFAULT 'pending'::text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  rejection_reason text,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: platform_support_chats
CREATE TABLE public.platform_support_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid,
  admin_id uuid,
  subject text NOT NULL,
  status text DEFAULT 'open'::text,
  priority text DEFAULT 'medium'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone
);

-- TABLE: platform_support_messages
CREATE TABLE public.platform_support_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  organization_id uuid,
  email text NOT NULL,
  full_name text NOT NULL,
  role user_role DEFAULT 'client'::user_role,
  avatar_url text,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  email_verified boolean DEFAULT false,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: push_notifications
CREATE TABLE public.push_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  device_tokens text[],
  status text DEFAULT 'pending'::text,
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  error_message text,
  notification_type text,
  related_resource_type text,
  related_resource_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: rate_limits
CREATE TABLE public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  attempts integer DEFAULT 1,
  first_attempt_at timestamp with time zone DEFAULT now(),
  last_attempt_at timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone
);

-- TABLE: security_events
CREATE TABLE public.security_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid,
  user_id uuid,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'low'::text,
  ip_address text,
  user_agent text,
  details jsonb DEFAULT '{}'::jsonb,
  resolved boolean DEFAULT false,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: sla_configurations
CREATE TABLE public.sla_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  priority text NOT NULL,
  first_response_minutes integer NOT NULL DEFAULT 60,
  resolution_minutes integer NOT NULL DEFAULT 480,
  business_hours_only boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: sla_policies
CREATE TABLE public.sla_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  first_response_time integer NOT NULL,
  resolution_time integer NOT NULL,
  business_hours jsonb DEFAULT '{}'::jsonb,
  holidays jsonb DEFAULT '[]'::jsonb,
  timezone text DEFAULT 'UTC'::text,
  priority_overrides jsonb DEFAULT '{}'::jsonb,
  escalation_enabled boolean DEFAULT false,
  escalation_rules jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: sms_messages
CREATE TABLE public.sms_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  ticket_id uuid,
  channel_config_id uuid NOT NULL,
  sms_message_id text,
  from_number text NOT NULL,
  to_number text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'sent'::text,
  direction text NOT NULL,
  error_code text,
  error_message text,
  cost_amount numeric,
  cost_currency text DEFAULT 'USD'::text,
  sent_at timestamp with time zone DEFAULT now(),
  delivered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: social_media_messages
CREATE TABLE public.social_media_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  ticket_id uuid,
  channel_config_id uuid NOT NULL,
  platform text NOT NULL,
  platform_message_id text,
  conversation_id text,
  from_user_id text NOT NULL,
  from_username text,
  to_user_id text,
  message_type text NOT NULL,
  content text,
  media_urls text[],
  direction text NOT NULL,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: sso_configurations
CREATE TABLE public.sso_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  provider text NOT NULL,
  is_active boolean DEFAULT false,
  saml_entity_id text,
  saml_sso_url text,
  saml_certificate text,
  saml_sign_requests boolean DEFAULT false,
  oauth_client_id text,
  oauth_client_secret text,
  oauth_authorization_url text,
  oauth_token_url text,
  oauth_user_info_url text,
  jit_provisioning_enabled boolean DEFAULT false,
  default_role text DEFAULT 'client'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: subscription_plans
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  price_monthly numeric DEFAULT 0,
  price_annual numeric DEFAULT 0,
  features jsonb DEFAULT '[]'::jsonb,
  limits jsonb DEFAULT '{"max_users": 5, "max_storage_gb": 1, "max_emails_monthly": 500, "max_tickets_monthly": 100}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: subscription_usage
CREATE TABLE public.subscription_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  tickets_used_this_month integer DEFAULT 0,
  emails_sent_this_month integer DEFAULT 0,
  storage_used_mb numeric DEFAULT 0,
  last_reset_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: survey_responses
CREATE TABLE public.survey_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL,
  ticket_id uuid,
  user_id uuid,
  responses jsonb NOT NULL,
  score integer,
  ip_address text,
  user_agent text,
  submitted_at timestamp with time zone DEFAULT now()
);

-- TABLE: surveys
CREATE TABLE public.surveys (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  description text,
  questions jsonb NOT NULL,
  trigger_type text DEFAULT 'ticket_closed'::text,
  trigger_delay_hours integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: ticket_edit_locks
CREATE TABLE public.ticket_edit_locks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  user_id uuid NOT NULL,
  locked_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + '00:05:00'::interval)
);

-- TABLE: ticket_followers
CREATE TABLE public.ticket_followers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  user_id uuid NOT NULL,
  notify_on_update boolean DEFAULT true,
  notify_on_comment boolean DEFAULT true,
  notify_on_status_change boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: ticket_mentions
CREATE TABLE public.ticket_mentions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL,
  message_id uuid,
  mentioned_user_id uuid NOT NULL,
  mentioned_by_user_id uuid NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: ticket_relationships
CREATE TABLE public.ticket_relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_ticket_id uuid NOT NULL,
  child_ticket_id uuid NOT NULL,
  relationship_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: ticket_templates
CREATE TABLE public.ticket_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  subject text NOT NULL,
  body text NOT NULL,
  priority ticket_priority DEFAULT 'medium'::ticket_priority,
  category text,
  tags text[] DEFAULT '{}'::text[],
  default_assignee_id uuid,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: tickets
CREATE TABLE public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status ticket_status DEFAULT 'open'::ticket_status,
  priority ticket_priority DEFAULT 'medium'::ticket_priority,
  created_by uuid NOT NULL,
  assigned_to uuid,
  category text,
  tags text[] DEFAULT '{}'::text[],
  due_date timestamp with time zone,
  resolved_at timestamp with time zone,
  first_response_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  ai_category text,
  ai_sentiment text,
  ai_intent text,
  ai_priority_score integer,
  ai_suggested_response text
);

-- TABLE: usage_daily
CREATE TABLE public.usage_daily (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  date date NOT NULL,
  tickets_created integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  api_calls integer DEFAULT 0,
  storage_used_bytes bigint DEFAULT 0,
  chat_messages integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: user_invitations
CREATE TABLE public.user_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'agent'::user_role,
  token text NOT NULL,
  token_expires_at timestamp with time zone NOT NULL,
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  custom_message text,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: user_role_assignments
CREATE TABLE public.user_role_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  custom_role_id uuid NOT NULL,
  assigned_at timestamp with time zone DEFAULT now(),
  assigned_by uuid
);

-- TABLE: user_sessions
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token_hash text NOT NULL,
  ip_address text,
  user_agent text,
  browser text,
  os text,
  device_type text,
  device_fingerprint text,
  geo_location jsonb DEFAULT '{}'::jsonb,
  is_current boolean DEFAULT false,
  last_activity_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: voice_calls
CREATE TABLE public.voice_calls (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  ticket_id uuid,
  channel_config_id uuid NOT NULL,
  call_sid text,
  from_number text NOT NULL,
  to_number text NOT NULL,
  status text DEFAULT 'initiated'::text,
  direction text NOT NULL,
  duration_seconds integer,
  recording_url text,
  recording_duration_seconds integer,
  transcription text,
  transcription_status text,
  cost_amount numeric,
  cost_currency text DEFAULT 'USD'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  started_at timestamp with time zone,
  answered_at timestamp with time zone,
  ended_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: webhook_configs
CREATE TABLE public.webhook_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  secret text NOT NULL,
  events text[] DEFAULT '{}'::text[],
  is_active boolean DEFAULT true,
  failure_count integer DEFAULT 0,
  last_triggered_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: webhook_deliveries
CREATE TABLE public.webhook_deliveries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  status text DEFAULT 'pending'::text,
  attempts integer DEFAULT 0,
  response_code integer,
  response_body text,
  error_message text,
  last_attempt_at timestamp with time zone,
  next_retry_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: webhook_logs
CREATE TABLE public.webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  webhook_config_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  event text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  response_code integer,
  response_body text,
  error_message text,
  attempt_count integer DEFAULT 1,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: webhooks
CREATE TABLE public.webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  url text NOT NULL,
  secret text NOT NULL,
  description text,
  events text[] NOT NULL,
  is_active boolean DEFAULT true,
  retry_enabled boolean DEFAULT true,
  max_retries integer DEFAULT 3,
  timeout_seconds integer DEFAULT 30,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- TABLE: whatsapp_messages
CREATE TABLE public.whatsapp_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  ticket_id uuid,
  channel_config_id uuid NOT NULL,
  whatsapp_message_id text,
  from_number text NOT NULL,
  to_number text NOT NULL,
  message_type text NOT NULL,
  content text,
  media_url text,
  media_type text,
  status text DEFAULT 'sent'::text,
  direction text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  sent_at timestamp with time zone DEFAULT now(),
  delivered_at timestamp with time zone,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: widget_config
CREATE TABLE public.widget_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  is_enabled boolean DEFAULT true,
  position text DEFAULT 'bottom-right'::text,
  primary_color text DEFAULT '#6366f1'::text,
  welcome_message text DEFAULT 'Hi there! How can we help you today?'::text,
  trigger_text text DEFAULT 'Chat with us'::text,
  offline_message text DEFAULT 'We''re currently offline. Leave a message and we''ll get back to you soon!'::text,
  pre_chat_form_enabled boolean DEFAULT true,
  file_upload_enabled boolean DEFAULT true,
  emoji_picker_enabled boolean DEFAULT true,
  notification_sound text DEFAULT 'default'::text,
  topics text[] DEFAULT ARRAY['Sales Inquiry'::text, 'Technical Support'::text, 'Billing Question'::text, 'General Question'::text],
  business_hours jsonb DEFAULT '{"hours": {}, "enabled": false, "timezone": "UTC"}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: widget_conversations
CREATE TABLE public.widget_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  visitor_id uuid NOT NULL,
  assigned_agent_id uuid,
  status text NOT NULL DEFAULT 'pending'::text,
  topic text,
  page_url text,
  referrer text,
  user_agent text,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: widget_messages
CREATE TABLE public.widget_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_type text NOT NULL,
  sender_id uuid,
  content text NOT NULL,
  attachments jsonb[] DEFAULT '{}'::jsonb[],
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- TABLE: widget_visitors
CREATE TABLE public.widget_visitors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  session_id text NOT NULL,
  name text,
  email text,
  metadata jsonb DEFAULT '{}'::jsonb,
  first_seen_at timestamp with time zone DEFAULT now(),
  last_seen_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- TABLE: zapier_triggers
CREATE TABLE public.zapier_triggers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  trigger_event text NOT NULL,
  webhook_url text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_triggered_at timestamp with time zone,
  trigger_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- VIEW: users (alias over profiles) --------------------------
CREATE OR REPLACE VIEW public.users AS
  SELECT id, organization_id, email, full_name, role, avatar_url,
         is_active, last_login_at, email_verified, preferences, created_at, updated_at
  FROM public.profiles;

-- FUNCTIONS (26 total) ----------------------------------------
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token text, p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invitation user_invitations%ROWTYPE;
BEGIN
  SELECT * INTO v_invitation
  FROM public.user_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND token_expires_at > now();
  
  IF v_invitation IS NULL THEN
    RETURN false;
  END IF;
  
  UPDATE public.profiles
  SET 
    organization_id = v_invitation.organization_id,
    role = v_invitation.role,
    updated_at = now()
  WHERE id = p_user_id;
  
  UPDATE public.user_invitations
  SET 
    status = 'accepted',
    accepted_at = now()
  WHERE id = v_invitation.id;
  
  RETURN true;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.check_api_rate_limit(p_api_key_id uuid, p_rate_limit integer)
 RETURNS TABLE(allowed boolean, remaining integer, reset_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_request_count INTEGER;
BEGIN
  v_window_start := date_trunc('minute', now());
  
  SELECT COUNT(*) INTO v_request_count
  FROM public.api_request_logs
  WHERE api_key_id = p_api_key_id
    AND created_at >= v_window_start;
  
  RETURN QUERY
  SELECT 
    v_request_count < p_rate_limit,
    GREATEST(0, p_rate_limit - v_request_count - 1),
    v_window_start + interval '1 minute';
END;
$function$

;

CREATE OR REPLACE FUNCTION public.check_domain_allowed(p_organization_id uuid, p_email text)
 RETURNS TABLE(allowed boolean, requires_approval boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_domain TEXT;
  v_domain_exists BOOLEAN;
  v_require_approval BOOLEAN;
  v_block_generic BOOLEAN;
  v_generic_domains TEXT[] := ARRAY['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'];
BEGIN
  v_domain := split_part(p_email, '@', 2);
  
  SELECT 
    COALESCE((security_settings->>'require_domain_approval')::boolean, true),
    COALESCE((security_settings->>'block_generic_email_providers')::boolean, false)
  INTO v_require_approval, v_block_generic
  FROM organizations
  WHERE id = p_organization_id;
  
  IF v_block_generic AND v_domain = ANY(v_generic_domains) THEN
    RETURN QUERY SELECT false, false;
    RETURN;
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM allowed_domains 
    WHERE organization_id = p_organization_id 
    AND domain = v_domain
  ) INTO v_domain_exists;
  
  IF v_domain_exists THEN
    RETURN QUERY SELECT true, false;
  ELSIF v_require_approval THEN
    RETURN QUERY SELECT false, true;
  ELSE
    RETURN QUERY SELECT true, false;
  END IF;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.check_plan_limit(org_id uuid, limit_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  org_plan TEXT;
  plan_limit INTEGER;
  current_usage INTEGER;
BEGIN
  -- Get organization's plan
  SELECT plan INTO org_plan FROM public.organizations WHERE id = org_id;
  
  -- Get plan limit
  SELECT (limits->>limit_type)::INTEGER INTO plan_limit
  FROM public.subscription_plans
  WHERE slug = org_plan;
  
  -- If limit is -1 (unlimited), return true
  IF plan_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Check current usage based on limit type
  CASE limit_type
    WHEN 'max_users' THEN
      SELECT COUNT(*) INTO current_usage
      FROM public.profiles
      WHERE organization_id = org_id AND is_active = true;
    
    WHEN 'max_tickets_monthly' THEN
      SELECT tickets_used_this_month INTO current_usage
      FROM public.subscription_usage
      WHERE organization_id = org_id;
    
    WHEN 'max_storage_gb' THEN
      SELECT CEIL(storage_used_mb / 1024) INTO current_usage
      FROM public.subscription_usage
      WHERE organization_id = org_id;
    
    WHEN 'max_emails_monthly' THEN
      SELECT emails_sent_this_month INTO current_usage
      FROM public.subscription_usage
      WHERE organization_id = org_id;
    
    ELSE
      RETURN TRUE;
  END CASE;
  
  -- Return true if within limit
  RETURN current_usage < plan_limit;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_max_attempts integer, p_window_minutes integer)
 RETURNS TABLE(allowed boolean, attempts_remaining integer, blocked_until timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_record rate_limits%ROWTYPE;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  SELECT * INTO v_record FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF v_record IS NULL THEN
    INSERT INTO public.rate_limits (identifier, action, attempts)
    VALUES (p_identifier, p_action, 1);
    RETURN QUERY SELECT true, p_max_attempts - 1, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  IF v_record.blocked_until IS NOT NULL AND v_record.blocked_until > now() THEN
    RETURN QUERY SELECT false, 0, v_record.blocked_until;
    RETURN;
  END IF;
  
  IF v_record.first_attempt_at < v_window_start THEN
    UPDATE public.rate_limits
    SET attempts = 1, first_attempt_at = now(), last_attempt_at = now(), blocked_until = NULL
    WHERE id = v_record.id;
    RETURN QUERY SELECT true, p_max_attempts - 1, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  IF v_record.attempts >= p_max_attempts THEN
    UPDATE public.rate_limits
    SET blocked_until = now() + (p_window_minutes || ' minutes')::INTERVAL, last_attempt_at = now()
    WHERE id = v_record.id;
    RETURN QUERY SELECT false, 0, (now() + (p_window_minutes || ' minutes')::INTERVAL);
    RETURN;
  END IF;
  
  UPDATE public.rate_limits
  SET attempts = attempts + 1, last_attempt_at = now()
  WHERE id = v_record.id;
  
  RETURN QUERY SELECT true, p_max_attempts - v_record.attempts - 1, NULL::TIMESTAMPTZ;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND token_expires_at < now();
END;
$function$

;

CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < now();
  DELETE FROM public.rate_limits WHERE blocked_until < now() AND blocked_until IS NOT NULL;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < now();
  DELETE FROM blocked_ips WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$function$

;

CREATE OR REPLACE FUNCTION public.create_default_sla_config()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.sla_configurations (organization_id, priority, first_response_minutes, resolution_minutes)
  VALUES
    (NEW.id, 'urgent', 60, 240),
    (NEW.id, 'high', 120, 480),
    (NEW.id, 'medium', 240, 1440),
    (NEW.id, 'low', 480, 2880);
  RETURN NEW;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.generate_invitation_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$function$

;

CREATE OR REPLACE FUNCTION public.generate_otp(p_email text, p_type text, p_expires_minutes integer DEFAULT 10)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_code TEXT;
BEGIN
  v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  UPDATE public.otp_codes
  SET used_at = now()
  WHERE email = p_email AND type = p_type AND used_at IS NULL;
  
  INSERT INTO public.otp_codes (email, code, type, expires_at)
  VALUES (p_email, v_code, p_type, now() + (p_expires_minutes || ' minutes')::INTERVAL);
  
  RETURN v_code;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.get_agent_performance(p_organization_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone)
 RETURNS TABLE(agent_id uuid, agent_name text, agent_avatar text, tickets_assigned bigint, tickets_resolved bigint, avg_response_minutes numeric, avg_resolution_minutes numeric, csat_average numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.id as agent_id,
    p.full_name as agent_name,
    p.avatar_url as agent_avatar,
    COUNT(DISTINCT t.id)::BIGINT as tickets_assigned,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('resolved', 'closed'))::BIGINT as tickets_resolved,
    ROUND(AVG(EXTRACT(EPOCH FROM (t.first_response_at - t.created_at)) / 60)::NUMERIC, 2) as avg_response_minutes,
    ROUND(AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 60)::NUMERIC, 2) FILTER (WHERE t.resolved_at IS NOT NULL) as avg_resolution_minutes,
    ROUND(AVG(c.rating_agent)::NUMERIC, 2) as csat_average
  FROM public.profiles p
  LEFT JOIN public.tickets t ON t.assigned_to = p.id
    AND t.organization_id = p_organization_id
    AND t.created_at >= p_start_date
    AND t.created_at <= p_end_date
  LEFT JOIN public.csat_responses c ON c.ticket_id = t.id
  WHERE p.organization_id = p_organization_id
    AND p.role IN ('agent', 'admin')
  GROUP BY p.id, p.full_name, p.avatar_url
  ORDER BY tickets_resolved DESC NULLS LAST;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.get_ticket_analytics(p_organization_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone)
 RETURNS TABLE(total_tickets bigint, open_tickets bigint, in_progress_tickets bigint, resolved_tickets bigint, closed_tickets bigint, avg_response_minutes numeric, avg_resolution_minutes numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_tickets,
    COUNT(*) FILTER (WHERE status = 'open')::BIGINT as open_tickets,
    COUNT(*) FILTER (WHERE status = 'in_progress')::BIGINT as in_progress_tickets,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved_tickets,
    COUNT(*) FILTER (WHERE status = 'closed')::BIGINT as closed_tickets,
    ROUND(AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 60)::NUMERIC, 2) as avg_response_minutes,
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60)::NUMERIC, 2) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_minutes
  FROM public.tickets
  WHERE organization_id = p_organization_id
    AND created_at >= p_start_date
    AND created_at <= p_end_date;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.get_tickets_by_date(p_organization_id uuid, p_start_date timestamp with time zone, p_end_date timestamp with time zone)
 RETURNS TABLE(date date, created_count bigint, resolved_count bigint, closed_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    d.date::DATE,
    COALESCE(created.count, 0)::BIGINT as created_count,
    COALESCE(resolved.count, 0)::BIGINT as resolved_count,
    COALESCE(closed.count, 0)::BIGINT as closed_count
  FROM generate_series(p_start_date::DATE, p_end_date::DATE, '1 day'::INTERVAL) AS d(date)
  LEFT JOIN (
    SELECT DATE(created_at) as ticket_date, COUNT(*) as count
    FROM public.tickets
    WHERE organization_id = p_organization_id
      AND created_at >= p_start_date AND created_at <= p_end_date
    GROUP BY DATE(created_at)
  ) created ON d.date::DATE = created.ticket_date
  LEFT JOIN (
    SELECT DATE(resolved_at) as ticket_date, COUNT(*) as count
    FROM public.tickets
    WHERE organization_id = p_organization_id
      AND resolved_at >= p_start_date AND resolved_at <= p_end_date
    GROUP BY DATE(resolved_at)
  ) resolved ON d.date::DATE = resolved.ticket_date
  LEFT JOIN (
    SELECT DATE(updated_at) as ticket_date, COUNT(*) as count
    FROM public.tickets
    WHERE organization_id = p_organization_id
      AND status = 'closed'
      AND updated_at >= p_start_date AND updated_at <= p_end_date
    GROUP BY DATE(updated_at)
  ) closed ON d.date::DATE = closed.ticket_date
  ORDER BY d.date;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.get_user_organization_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$function$

;

CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$function$

;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'client'
  );
  RETURN NEW;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
$function$

;

CREATE OR REPLACE FUNCTION public.log_security_event(p_organization_id uuid, p_event_type text, p_user_id uuid DEFAULT NULL::uuid, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text, p_details jsonb DEFAULT '{}'::jsonb, p_severity text DEFAULT 'low'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO security_events (
    organization_id, event_type, user_id, ip_address, user_agent, details, severity
  ) VALUES (
    p_organization_id, p_event_type, p_user_id, p_ip_address, p_user_agent, p_details, p_severity
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.update_chat_on_new_message()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.platform_support_chats
  SET updated_at = NOW()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.update_email_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.body_preview, '')), 'C');
  RETURN NEW;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.update_platform_chat_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.validate_api_key(p_api_key text)
 RETURNS TABLE(api_key_id uuid, organization_id uuid, permissions text[], rate_limit integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_key_hash TEXT;
BEGIN
  v_key_hash := encode(sha256(p_api_key::bytea), 'hex');
  
  RETURN QUERY
  SELECT 
    ak.id,
    ak.organization_id,
    ak.permissions,
    ak.rate_limit
  FROM public.api_keys ak
  WHERE ak.key_hash = v_key_hash
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > now());
  
  UPDATE public.api_keys 
  SET last_used_at = now()
  WHERE key_hash = v_key_hash;
END;
$function$

;

CREATE OR REPLACE FUNCTION public.verify_otp(p_email text, p_code text, p_type text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_otp otp_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_otp FROM public.otp_codes
  WHERE email = p_email AND code = p_code AND type = p_type
  AND used_at IS NULL AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_otp IS NULL THEN
    RETURN false;
  END IF;
  
  UPDATE public.otp_codes SET used_at = now() WHERE id = v_otp.id;
  
  RETURN true;
END;
$function$

;

-- TRIGGERS (10 in public schema + 1 on auth.users) -----------
-- AFTER INSERT ON auth.users       -> on_auth_user_created (calls handle_new_user)
-- BEFORE UPDATE ON blog_posts       -> blog_posts_updated_at
-- BEFORE INSERT/UPDATE ON email_archive -> update_email_search_vector_trigger
-- BEFORE UPDATE ON messages         -> update_messages_updated_at
-- AFTER INSERT ON organizations     -> create_sla_on_org_created
-- BEFORE UPDATE ON organizations    -> update_organizations_updated_at
-- BEFORE UPDATE ON platform_support_chats -> platform_chat_updated_at
-- AFTER INSERT ON platform_support_messages -> update_chat_timestamp_on_message
-- BEFORE UPDATE ON profiles         -> update_profiles_updated_at
-- BEFORE UPDATE ON tickets          -> update_tickets_updated_at
-- NOTE: increment_ticket_usage  => DOES NOT EXIST in live DB
-- NOTE: reset_monthly_usage     => DOES NOT EXIST in live DB

-- RLS POLICIES (162 total; shown: profiles table) ------------
-- Tables WITHOUT RLS enabled (3): attachments, otp_codes, rate_limits

CREATE POLICY "Users can insert their own profile" ON public.profiles
  AS PERMISSIVE FOR INSERT
  WITH CHECK ((id = auth.uid()))
;

CREATE POLICY "Users can update their own profile" ON public.profiles
  AS PERMISSIVE FOR UPDATE
  USING ((id = auth.uid()))
;

CREATE POLICY "Users can view profiles in their organization" ON public.profiles
  AS PERMISSIVE FOR SELECT
  USING (((organization_id = get_user_organization_id()) OR is_super_admin() OR (id = auth.uid())))
;

-- Full policy list available in supabase/_introspection/_schema_policies.json
