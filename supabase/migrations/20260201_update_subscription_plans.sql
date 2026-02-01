-- Update subscription plans with correct pricing and limits
-- This migration adds the FREE plan and updates existing plans

-- Clear existing plans (if any seed data exists)
TRUNCATE TABLE public.subscription_plans;

-- Insert FREE plan
INSERT INTO public.subscription_plans (name, slug, price_monthly, price_annual, features, limits, is_active)
VALUES (
  'Free',
  'free',
  0,
  0,
  '["Email ticketing", "Basic live chat", "Mobile app access", "Basic analytics", "Knowledge base (10 articles)", "Community support"]'::jsonb,
  '{"max_users": 3, "max_tickets_monthly": 100, "max_storage_gb": 1, "max_emails_monthly": 200, "max_kb_articles": 10}'::jsonb,
  true
);

-- Insert STARTER plan
INSERT INTO public.subscription_plans (name, slug, price_monthly, price_annual, features, limits, is_active)
VALUES (
  'Starter',
  'starter',
  29,
  290,
  '["Up to 5 team members", "1,000 tickets/month", "Email ticketing", "Basic live chat", "Email support (24h)", "Basic analytics", "5 GB storage", "Knowledge base (50 articles)", "Mobile app access", "Basic automation"]'::jsonb,
  '{"max_users": 5, "max_tickets_monthly": 1000, "max_storage_gb": 5, "max_emails_monthly": 2000, "max_kb_articles": 50}'::jsonb,
  true
);

-- Insert PROFESSIONAL plan
INSERT INTO public.subscription_plans (name, slug, price_monthly, price_annual, features, limits, is_active)
VALUES (
  'Professional',
  'pro',
  79,
  790,
  '["Up to 20 team members", "10,000 tickets/month", "Multi-channel support", "Advanced live chat", "Priority support (4h)", "Advanced analytics", "AI-powered routing", "AI suggestions", "50 GB storage", "Custom branding", "API access", "Webhooks", "Unlimited KB articles", "Custom fields", "SLA management"]'::jsonb,
  '{"max_users": 20, "max_tickets_monthly": 10000, "max_storage_gb": 50, "max_emails_monthly": 10000, "max_kb_articles": -1}'::jsonb,
  true
);

-- Insert ENTERPRISE plan
INSERT INTO public.subscription_plans (name, slug, price_monthly, price_annual, features, limits, is_active)
VALUES (
  'Enterprise',
  'enterprise',
  199,
  1990,
  '["Unlimited team members", "Unlimited tickets", "All Professional features", "Dedicated account manager", "Dedicated support (1h)", "Custom AI training", "Advanced automation", "Unlimited storage", "White-label", "99.9% SLA", "Custom integrations", "SSO", "Multi-tenant", "Custom workflows", "Priority features", "On-premise option"]'::jsonb,
  '{"max_users": -1, "max_tickets_monthly": -1, "max_storage_gb": -1, "max_emails_monthly": -1, "max_kb_articles": -1}'::jsonb,
  true
);

-- Add comment explaining limits
COMMENT ON COLUMN public.subscription_plans.limits IS 'Plan limits where -1 means unlimited';

-- Create function to check if organization is within plan limits
CREATE OR REPLACE FUNCTION public.check_plan_limit(
  org_id UUID,
  limit_type TEXT
) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON public.subscription_plans(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON public.organizations(plan);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_org ON public.subscription_usage(organization_id);
