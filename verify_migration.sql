-- Verify the migration was successful

-- 1. Check that all 4 plans were created
SELECT 
  name,
  slug,
  price_monthly,
  (limits->>'max_users')::int as max_users,
  (limits->>'max_tickets_monthly')::int as max_tickets,
  (limits->>'max_storage_gb')::int as max_storage_gb
FROM public.subscription_plans
ORDER BY price_monthly;

-- 2. Test the check_plan_limit function exists
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE proname = 'check_plan_limit';

-- 3. Check if there are any existing organizations
SELECT 
  id,
  name,
  plan,
  created_at
FROM public.organizations
ORDER BY created_at DESC
LIMIT 10;

-- 4. Update existing organizations to 'free' plan if they don't have a plan set
UPDATE public.organizations
SET plan = 'free'
WHERE plan IS NULL OR plan NOT IN ('free', 'starter', 'pro', 'enterprise');

-- 5. Show updated organizations
SELECT 
  id,
  name,
  plan,
  status
FROM public.organizations
ORDER BY created_at DESC;
