-- Phase 6: Enterprise & Security Features
-- SSO, enhanced RBAC, white-label, compliance

-- SSO configurations
CREATE TABLE IF NOT EXISTS sso_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- SSO details
  provider TEXT NOT NULL, -- 'saml', 'okta', 'azure_ad', 'google_workspace'
  is_active BOOLEAN DEFAULT false,
  
  -- SAML configuration
  saml_entity_id TEXT,
  saml_sso_url TEXT,
  saml_certificate TEXT,
  saml_sign_requests BOOLEAN DEFAULT false,
  
  -- OAuth configuration
  oauth_client_id TEXT,
  oauth_client_secret TEXT,
  oauth_authorization_url TEXT,
  oauth_token_url TEXT,
  oauth_user_info_url TEXT,
  
  -- JIT provisioning
  jit_provisioning_enabled BOOLEAN DEFAULT false,
  default_role TEXT DEFAULT 'user',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE(organization_id, provider)
);

-- Custom roles (enhanced RBAC)
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Role details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Permissions
  permissions JSONB NOT NULL DEFAULT '{}', -- e.g., {"tickets": ["read", "write"], "users": ["read"]}
  
  -- Metadata
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE(organization_id, name)
);

-- User role assignments
CREATE TABLE IF NOT EXISTS user_role_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  custom_role_id UUID NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
  
  -- Metadata
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE(user_id, custom_role_id)
);

-- Custom domains
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Domain details
  domain TEXT NOT NULL UNIQUE,
  subdomain TEXT,
  
  -- Verification
  verification_token TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- SSL
  ssl_enabled BOOLEAN DEFAULT false,
  ssl_certificate TEXT,
  ssl_private_key TEXT,
  ssl_expires_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- White-label branding
CREATE TABLE IF NOT EXISTS branding_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Logo
  logo_url TEXT,
  logo_dark_url TEXT,
  favicon_url TEXT,
  
  -- Colors
  primary_color TEXT DEFAULT '#a3e635',
  secondary_color TEXT,
  accent_color TEXT,
  
  -- Typography
  font_family TEXT,
  
  -- Email branding
  email_header_logo_url TEXT,
  email_footer_text TEXT,
  email_footer_links JSONB DEFAULT '[]',
  
  -- Widget branding
  widget_position TEXT DEFAULT 'bottom-right',
  widget_color TEXT,
  widget_greeting_message TEXT,
  
  -- Custom CSS
  custom_css TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id)
);

-- GDPR data requests
CREATE TABLE IF NOT EXISTS gdpr_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Request details
  request_type TEXT NOT NULL, -- 'export', 'delete', 'rectify'
  email TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  
  -- Data
  export_file_url TEXT,
  export_file_size BIGINT,
  
  -- Processing
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Data retention policies
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Policy details
  resource_type TEXT NOT NULL, -- 'tickets', 'messages', 'audit_logs', etc.
  retention_days INTEGER NOT NULL,
  
  -- Actions
  action_on_expiry TEXT DEFAULT 'archive', -- 'archive', 'delete'
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE(organization_id, resource_type)
);

-- Compliance certifications tracking
CREATE TABLE IF NOT EXISTS compliance_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Certification details
  certification_type TEXT NOT NULL, -- 'soc2', 'iso27001', 'gdpr', 'hipaa'
  status TEXT DEFAULT 'in_progress', -- in_progress, certified, expired
  
  -- Dates
  certification_date DATE,
  expiry_date DATE,
  
  -- Documents
  certificate_url TEXT,
  audit_report_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_sso_configurations_organization_id ON sso_configurations(organization_id);
CREATE INDEX idx_custom_roles_organization_id ON custom_roles(organization_id);
CREATE INDEX idx_user_role_assignments_user_id ON user_role_assignments(user_id);
CREATE INDEX idx_custom_domains_organization_id ON custom_domains(organization_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_branding_settings_organization_id ON branding_settings(organization_id);
CREATE INDEX idx_gdpr_requests_organization_id ON gdpr_requests(organization_id);
CREATE INDEX idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX idx_data_retention_policies_organization_id ON data_retention_policies(organization_id);
CREATE INDEX idx_compliance_certifications_organization_id ON compliance_certifications(organization_id);

-- RLS Policies
ALTER TABLE sso_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_certifications ENABLE ROW LEVEL SECURITY;

-- SSO configurations policies
CREATE POLICY "Admins can manage SSO"
  ON sso_configurations FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Custom roles policies
CREATE POLICY "Users can view roles"
  ON custom_roles FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON custom_roles FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Custom domains policies
CREATE POLICY "Admins can manage domains"
  ON custom_domains FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Branding policies
CREATE POLICY "Users can view branding"
  ON branding_settings FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage branding"
  ON branding_settings FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- GDPR requests policies
CREATE POLICY "Users can view their GDPR requests"
  ON gdpr_requests FOR SELECT
  USING (user_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Anyone can create GDPR requests"
  ON gdpr_requests FOR INSERT
  WITH CHECK (true);

-- Comment
COMMENT ON TABLE sso_configurations IS 'SSO configurations (SAML, OAuth, etc.)';
COMMENT ON TABLE custom_roles IS 'Custom roles for enhanced RBAC';
COMMENT ON TABLE user_role_assignments IS 'User assignments to custom roles';
COMMENT ON TABLE custom_domains IS 'Custom domain configurations';
COMMENT ON TABLE branding_settings IS 'White-label branding settings';
COMMENT ON TABLE gdpr_requests IS 'GDPR data export/deletion requests';
COMMENT ON TABLE data_retention_policies IS 'Data retention policies by resource type';
COMMENT ON TABLE compliance_certifications IS 'Compliance certification tracking';
