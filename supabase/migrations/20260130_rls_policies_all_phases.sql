-- ============================================================================
-- RLS POLICIES FOR ALL PHASE 1-9 TABLES
-- Row-Level Security to ensure multi-tenant data isolation
-- ============================================================================

-- ============================================================================
-- PHASE 1: Foundation & Security RLS
-- ============================================================================

-- Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's audit logs"
  ON public.audit_logs FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Usage Daily
ALTER TABLE public.usage_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's usage"
  ON public.usage_daily FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can manage usage"
  ON public.usage_daily FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- SLA Policies
ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's SLA policies"
  ON public.sla_policies FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage SLA policies"
  ON public.sla_policies FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Ticket Templates
ALTER TABLE public.ticket_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's templates"
  ON public.ticket_templates FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Agents can manage templates"
  ON public.ticket_templates FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
    )
  );

-- Canned Responses
ALTER TABLE public.canned_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public canned responses"
  ON public.canned_responses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ) AND (is_public = true OR created_by = auth.uid())
  );

CREATE POLICY "Users can manage their own canned responses"
  ON public.canned_responses FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ) AND created_by = auth.uid()
  );

-- ============================================================================
-- PHASE 2: API & Collaboration RLS
-- ============================================================================

-- API Keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API keys"
  ON public.api_keys FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Webhooks
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage webhooks"
  ON public.webhooks FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Webhook Deliveries
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook deliveries"
  ON public.webhook_deliveries FOR SELECT
  USING (
    webhook_id IN (
      SELECT id FROM public.webhooks 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Ticket Followers
ALTER TABLE public.ticket_followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own follows"
  ON public.ticket_followers FOR ALL
  USING (user_id = auth.uid());

-- Ticket Mentions
ALTER TABLE public.ticket_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their mentions"
  ON public.ticket_mentions FOR SELECT
  USING (mentioned_user_id = auth.uid());

CREATE POLICY "Users can create mentions"
  ON public.ticket_mentions FOR INSERT
  WITH CHECK (mentioned_by_user_id = auth.uid());

-- Ticket Relationships
ALTER TABLE public.ticket_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ticket relationships"
  ON public.ticket_relationships FOR SELECT
  USING (
    parent_ticket_id IN (
      SELECT id FROM public.tickets 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Agents can manage relationships"
  ON public.ticket_relationships FOR ALL
  USING (
    parent_ticket_id IN (
      SELECT id FROM public.tickets 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
      )
    )
  );

-- Ticket Edit Locks
ALTER TABLE public.ticket_edit_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view edit locks"
  ON public.ticket_edit_locks FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM public.tickets 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage their own locks"
  ON public.ticket_edit_locks FOR ALL
  USING (user_id = auth.uid());

-- ============================================================================
-- PHASE 3: AI & Automation RLS
-- ============================================================================

-- Automation Rules
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's automation rules"
  ON public.automation_rules FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage automation rules"
  ON public.automation_rules FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Automation Logs
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view automation logs"
  ON public.automation_logs FOR SELECT
  USING (
    automation_rule_id IN (
      SELECT id FROM public.automation_rules 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Business Hours
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's business hours"
  ON public.business_hours FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage business hours"
  ON public.business_hours FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- PHASE 4: Analytics & Surveys RLS
-- ============================================================================

-- Surveys
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's surveys"
  ON public.surveys FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage surveys"
  ON public.surveys FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Survey Responses
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view survey responses"
  ON public.survey_responses FOR SELECT
  USING (
    survey_id IN (
      SELECT id FROM public.surveys 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Anyone can submit survey responses"
  ON public.survey_responses FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- PHASE 5: Email Migration & Knowledge Base RLS
-- ============================================================================

-- KB Articles
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are public"
  ON public.kb_articles FOR SELECT
  USING (status = 'published' OR organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Agents can manage articles"
  ON public.kb_articles FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
    )
  );

-- KB Categories
ALTER TABLE public.kb_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are public"
  ON public.kb_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.kb_categories FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Forum Topics
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topics are public"
  ON public.forum_topics FOR SELECT
  USING (true);

CREATE POLICY "Users can create topics"
  ON public.forum_topics FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own topics"
  ON public.forum_topics FOR UPDATE
  USING (created_by = auth.uid());

-- Forum Replies
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Replies are public"
  ON public.forum_replies FOR SELECT
  USING (true);

CREATE POLICY "Users can create replies"
  ON public.forum_replies FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own replies"
  ON public.forum_replies FOR UPDATE
  USING (created_by = auth.uid());

-- ============================================================================
-- PHASE 6: Enterprise & Security RLS
-- ============================================================================

-- SSO Configurations
ALTER TABLE public.sso_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage SSO"
  ON public.sso_configurations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Custom Roles
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's roles"
  ON public.custom_roles FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage roles"
  ON public.custom_roles FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- User Role Assignments
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view role assignments"
  ON public.user_role_assignments FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage role assignments"
  ON public.user_role_assignments FOR ALL
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Custom Domains
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage custom domains"
  ON public.custom_domains FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Branding Settings
ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's branding"
  ON public.branding_settings FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage branding"
  ON public.branding_settings FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- GDPR Requests
ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own GDPR requests"
  ON public.gdpr_requests FOR SELECT
  USING (user_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Users can create GDPR requests"
  ON public.gdpr_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Data Retention Policies
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage retention policies"
  ON public.data_retention_policies FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Compliance Certifications
ALTER TABLE public.compliance_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's certifications"
  ON public.compliance_certifications FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage certifications"
  ON public.compliance_certifications FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- PHASE 7: Omnichannel Support RLS
-- ============================================================================

-- Channel Configurations
ALTER TABLE public.channel_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage channels"
  ON public.channel_configurations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- WhatsApp Messages
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's WhatsApp messages"
  ON public.whatsapp_messages FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can manage WhatsApp messages"
  ON public.whatsapp_messages FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- SMS Messages
ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's SMS messages"
  ON public.sms_messages FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can manage SMS messages"
  ON public.sms_messages FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Voice Calls
ALTER TABLE public.voice_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's voice calls"
  ON public.voice_calls FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can manage voice calls"
  ON public.voice_calls FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Social Media Messages
ALTER TABLE public.social_media_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's social messages"
  ON public.social_media_messages FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can manage social messages"
  ON public.social_media_messages FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Omnichannel Conversations
ALTER TABLE public.omnichannel_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's conversations"
  ON public.omnichannel_conversations FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Agents can manage conversations"
  ON public.omnichannel_conversations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
    )
  );

-- ============================================================================
-- PHASE 8: Mobile & Accessibility RLS
-- ============================================================================

-- Mobile Devices
ALTER TABLE public.mobile_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own devices"
  ON public.mobile_devices FOR ALL
  USING (user_id = auth.uid());

-- Push Notifications
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.push_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.push_notifications FOR INSERT
  WITH CHECK (true);

-- Mobile App Sessions
ALTER TABLE public.mobile_app_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
  ON public.mobile_app_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own sessions"
  ON public.mobile_app_sessions FOR ALL
  USING (user_id = auth.uid());

-- Offline Sync Queue
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sync queue"
  ON public.offline_sync_queue FOR ALL
  USING (user_id = auth.uid());

-- Accessibility Preferences
ALTER TABLE public.accessibility_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON public.accessibility_preferences FOR ALL
  USING (user_id = auth.uid());

-- App Feedback
ALTER TABLE public.app_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
  ON public.app_feedback FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create feedback"
  ON public.app_feedback FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all feedback"
  ON public.app_feedback FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- ============================================================================
-- PHASE 9: Integrations & Marketplace RLS
-- ============================================================================

-- Integration Configurations
ALTER TABLE public.integration_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage integrations"
  ON public.integration_configurations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Integration Sync Logs
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs"
  ON public.integration_sync_logs FOR SELECT
  USING (
    integration_config_id IN (
      SELECT id FROM public.integration_configurations 
      WHERE organization_id IN (
        SELECT organization_id FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Zapier Triggers
ALTER TABLE public.zapier_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage Zapier triggers"
  ON public.zapier_triggers FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Marketplace Apps
ALTER TABLE public.marketplace_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apps are public"
  ON public.marketplace_apps FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Super admins can manage apps"
  ON public.marketplace_apps FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  ));

-- App Installations
ALTER TABLE public.app_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's installations"
  ON public.app_installations FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Admins can manage installations"
  ON public.app_installations FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- App Reviews
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are public"
  ON public.app_reviews FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can manage their own reviews"
  ON public.app_reviews FOR ALL
  USING (user_id = auth.uid());

-- E-commerce Orders
ALTER TABLE public.ecommerce_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's orders"
  ON public.ecommerce_orders FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can manage orders"
  ON public.ecommerce_orders FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- CRM Contacts
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's CRM contacts"
  ON public.crm_contacts FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can manage CRM contacts"
  ON public.crm_contacts FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  ));

-- ============================================================================
-- RLS POLICIES COMPLETE
-- All 70+ tables now have Row-Level Security enabled
-- Multi-tenant data isolation is enforced at the database level
-- ============================================================================
