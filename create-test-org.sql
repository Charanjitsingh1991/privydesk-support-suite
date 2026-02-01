-- Create Test Organization for Subdomain Testing
-- This will test Vercel's automatic subdomain routing and SSL provisioning

-- Insert test organization
INSERT INTO organizations (
  name,
  slug,
  primary_color,
  logo_url,
  plan,
  status,
  metadata
) VALUES (
  'Acme Corporation',
  'acme-corp',
  '#10b981',
  NULL,
  'pro',
  'active',
  '{"test": true, "created_for": "subdomain_testing"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  primary_color = EXCLUDED.primary_color,
  plan = EXCLUDED.plan,
  status = EXCLUDED.status,
  updated_at = now();

-- Verify the organization was created
SELECT 
  id,
  name,
  slug,
  primary_color,
  plan,
  status,
  created_at
FROM organizations
WHERE slug = 'acme-corp';

-- Expected subdomain URL: https://acme-corp.privydesk.com
