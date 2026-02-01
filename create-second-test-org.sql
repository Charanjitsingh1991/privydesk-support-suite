-- Create Second Test Organization
-- Testing multiple organizations with automatic subdomain routing

-- Insert second test organization
INSERT INTO organizations (
  name,
  slug,
  primary_color,
  logo_url,
  plan,
  status,
  metadata
) VALUES (
  'TechStart Solutions',
  'techstart',
  '#3b82f6',
  NULL,
  'starter',
  'active',
  '{"test": true, "created_for": "multi_org_testing"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  primary_color = EXCLUDED.primary_color,
  plan = EXCLUDED.plan,
  status = EXCLUDED.status,
  updated_at = now();

-- Verify both organizations exist
SELECT 
  id,
  name,
  slug,
  primary_color,
  plan,
  status,
  created_at
FROM organizations
WHERE slug IN ('acme-corp', 'techstart')
ORDER BY created_at;

-- Expected subdomain URLs:
-- 1. https://acme-corp.privydesk.com (Acme Corporation - Green)
-- 2. https://techstart.privydesk.com (TechStart Solutions - Blue)
