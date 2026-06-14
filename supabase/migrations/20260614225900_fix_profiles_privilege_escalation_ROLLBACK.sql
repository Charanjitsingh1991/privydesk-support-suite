-- ============================================================
-- ROLLBACK: fix_profiles_privilege_escalation
-- Reverses : 20260614225900_fix_profiles_privilege_escalation.sql
-- WARNING  : Applying this rollback re-opens the P0 privilege-
--            escalation vector.  Apply only in a break-glass
--            incident and re-apply the forward migration ASAP.
-- ============================================================

-- 1. Remove the RPC
DROP FUNCTION IF EXISTS public.create_organization_and_claim_owner(
  text, text, text, text, text, text, text, boolean, text, text,
  text, text, jsonb, jsonb, boolean
);

-- 2. Remove the trigger and guard function
DROP TRIGGER IF EXISTS before_profile_update_privilege_check ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_profile_privilege_escalation();

-- 3. Remove the replacement policies
DROP POLICY IF EXISTS "users can update own profile"            ON public.profiles;
DROP POLICY IF EXISTS "admins can update org member profiles"   ON public.profiles;

-- 4. Restore the original permissive policy (no WITH CHECK, no column guard)
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());
