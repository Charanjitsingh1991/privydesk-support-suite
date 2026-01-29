-- Phase 9: Integrations & Marketplace
-- Third-party integrations, app marketplace

-- Integration configurations
CREATE TABLE IF NOT EXISTS integration_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Integration details
  integration_type TEXT NOT NULL, -- 'zapier', 'slack', 'teams', 'salesforce', 'hubspot', 'shopify', 'woocommerce', etc.
  integration_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  
  -- Configuration
  configuration JSONB NOT NULL DEFAULT '{}',
  
  -- OAuth tokens (encrypted)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Webhooks
  webhook_url TEXT,
  webhook_secret TEXT,
  
  -- Sync settings
  sync_enabled BOOLEAN DEFAULT false,
  sync_frequency_minutes INTEGER DEFAULT 15,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE(organization_id, integration_type, integration_name)
);

-- Integration sync logs
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_config_id UUID NOT NULL REFERENCES integration_configurations(id) ON DELETE CASCADE,
  
  -- Sync details
  sync_type TEXT NOT NULL, -- 'full', 'incremental', 'manual'
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, failed
  
  -- Statistics
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  -- Error tracking
  error_message TEXT,
  error_details JSONB,
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Zapier triggers
CREATE TABLE IF NOT EXISTS zapier_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Trigger details
  trigger_event TEXT NOT NULL, -- 'ticket.created', 'ticket.updated', etc.
  webhook_url TEXT NOT NULL,
  
  -- Filters
  filters JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace apps
CREATE TABLE IF NOT EXISTS marketplace_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- App details
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  
  -- Publisher
  publisher_name TEXT NOT NULL,
  publisher_email TEXT NOT NULL,
  publisher_website TEXT,
  
  -- Categorization
  category TEXT NOT NULL, -- 'productivity', 'analytics', 'communication', 'crm', etc.
  tags TEXT[] DEFAULT '{}',
  
  -- Pricing
  pricing_model TEXT NOT NULL, -- 'free', 'paid', 'freemium', 'trial'
  price_monthly DECIMAL(10, 2),
  price_yearly DECIMAL(10, 2),
  
  -- Assets
  logo_url TEXT NOT NULL,
  screenshots TEXT[],
  video_url TEXT,
  
  -- Permissions required
  required_permissions TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, suspended
  is_featured BOOLEAN DEFAULT false,
  
  -- Statistics
  install_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2),
  rating_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- App installations
CREATE TABLE IF NOT EXISTS app_installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES marketplace_apps(id) ON DELETE CASCADE,
  
  -- Installation details
  configuration JSONB DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'active', -- active, suspended, uninstalled
  
  -- Timestamps
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  uninstalled_at TIMESTAMPTZ,
  installed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE(organization_id, app_id)
);

-- App reviews
CREATE TABLE IF NOT EXISTS app_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID NOT NULL REFERENCES marketplace_apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Review details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  
  -- Status
  is_verified_purchase BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(app_id, user_id)
);

-- E-commerce integrations
CREATE TABLE IF NOT EXISTS ecommerce_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_config_id UUID NOT NULL REFERENCES integration_configurations(id) ON DELETE CASCADE,
  
  -- Order details
  external_order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  
  -- Customer
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  
  -- Order data
  order_status TEXT NOT NULL,
  order_total DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  order_date TIMESTAMPTZ NOT NULL,
  
  -- Items
  items JSONB NOT NULL DEFAULT '[]',
  
  -- Shipping
  shipping_address JSONB,
  tracking_number TEXT,
  
  -- Related ticket
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  
  -- Timestamps
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, external_order_id)
);

-- CRM contacts sync
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_config_id UUID NOT NULL REFERENCES integration_configurations(id) ON DELETE CASCADE,
  
  -- Contact details
  external_contact_id TEXT NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  
  -- CRM data
  crm_data JSONB DEFAULT '{}',
  
  -- Related user
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, external_contact_id)
);

-- Indexes
CREATE INDEX idx_integration_configurations_organization_id ON integration_configurations(organization_id);
CREATE INDEX idx_integration_configurations_integration_type ON integration_configurations(integration_type);
CREATE INDEX idx_integration_sync_logs_integration_config_id ON integration_sync_logs(integration_config_id);
CREATE INDEX idx_zapier_triggers_organization_id ON zapier_triggers(organization_id);
CREATE INDEX idx_marketplace_apps_status ON marketplace_apps(status);
CREATE INDEX idx_marketplace_apps_category ON marketplace_apps(category);
CREATE INDEX idx_app_installations_organization_id ON app_installations(organization_id);
CREATE INDEX idx_app_installations_app_id ON app_installations(app_id);
CREATE INDEX idx_app_reviews_app_id ON app_reviews(app_id);
CREATE INDEX idx_ecommerce_orders_organization_id ON ecommerce_orders(organization_id);
CREATE INDEX idx_ecommerce_orders_customer_email ON ecommerce_orders(customer_email);
CREATE INDEX idx_crm_contacts_organization_id ON crm_contacts(organization_id);
CREATE INDEX idx_crm_contacts_email ON crm_contacts(email);

-- RLS Policies
ALTER TABLE integration_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE zapier_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecommerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;

-- Integration configurations policies
CREATE POLICY "Admins can manage integrations"
  ON integration_configurations FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Marketplace apps policies
CREATE POLICY "Anyone can view approved apps"
  ON marketplace_apps FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Admins can manage apps"
  ON marketplace_apps FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'super_admin'));

-- App installations policies
CREATE POLICY "Users can view their org's installations"
  ON app_installations FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage installations"
  ON app_installations FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- App reviews policies
CREATE POLICY "Anyone can view published reviews"
  ON app_reviews FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can create reviews"
  ON app_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- E-commerce orders policies
CREATE POLICY "Users can view orders"
  ON ecommerce_orders FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- CRM contacts policies
CREATE POLICY "Users can view CRM contacts"
  ON crm_contacts FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Comment
COMMENT ON TABLE integration_configurations IS 'Third-party integration configurations';
COMMENT ON TABLE integration_sync_logs IS 'Integration sync operation logs';
COMMENT ON TABLE zapier_triggers IS 'Zapier webhook triggers';
COMMENT ON TABLE marketplace_apps IS 'App marketplace listings';
COMMENT ON TABLE app_installations IS 'Installed apps per organization';
COMMENT ON TABLE app_reviews IS 'User reviews for marketplace apps';
COMMENT ON TABLE ecommerce_orders IS 'Synced e-commerce orders (Shopify, WooCommerce)';
COMMENT ON TABLE crm_contacts IS 'Synced CRM contacts (Salesforce, HubSpot)';
