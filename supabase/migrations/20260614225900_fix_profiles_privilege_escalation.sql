-- ============================================================
-- MIGRATION: fix_profiles_privilege_escalation
-- Created   : 2026-06-14
-- Severity  : P0 — any authenticated user could set their own
--             role to super_admin or hijack another org's
--             organization_id via the permissive UPDATE policy.
-- Rollback  : 20260614225900_fix_profiles_privilege_escalation_ROLLBACK.sql
-- ============================================================

-- ─── 1. Drop the old permissive policy ───────────────────────
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- ─── 2. Privilege-escalation guard trigger ───────────────────
-- NOT SECURITY DEFINER — runs with the effective role of the
-- statement that caused the trigger to fire.
--
-- TRUSTED BYPASS PATHS (checked in order):
--   (A) Explicit GUC flag — set transaction-locally by any trusted
--       SECURITY DEFINER function (e.g. create_organization_and_claim_owner)
--       before it issues a privileged UPDATE.  This is the PRIMARY
--       path and does NOT rely on role-name resolution.
--   (B) current_user IN ('service_role','postgres') — Management API
--       SQL (runs as postgres, confirmed) and Edge Functions / JS
--       clients using the service-role key.  Secondary fallback only.
--
-- NOTE: The first super_admin for a deployment must be assigned via
-- the Management API SQL endpoint (current_user='postgres' → path B):
--   UPDATE public.profiles SET role = 'super_admin' WHERE id = '<uuid>';
-- Alternatively, use path A explicitly in any session:
--   DO $$ BEGIN
--     PERFORM set_config('privydesk.allow_privileged_profile_write','on',true);
--     UPDATE public.profiles SET role='super_admin' WHERE id='<uuid>';
--   END $$;
-- No client-facing code path can create a super_admin — intentional.

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- ── (A) Explicit GUC bypass — PRIMARY trusted path ─────────
  -- Trusted SECURITY DEFINER functions call
  --   PERFORM set_config('privydesk.allow_privileged_profile_write', 'on', true);
  -- (true = transaction-local) before issuing a privileged UPDATE.
  -- This is explicit and independent of role-name resolution.
  IF current_setting('privydesk.allow_privileged_profile_write', true) = 'on' THEN
    RETURN NEW;
  END IF;

  -- ── (B) Elevated-role fallback ───────────────────────────────
  -- 'service_role' : Edge Functions / JS clients using the svc key.
  -- 'postgres'     : Management API SQL endpoint (confirmed via
  --                  SELECT current_user against this project).
  -- Neither is the PRIMARY trust mechanism (see path A), but both
  -- are genuine server-side callers that bypass RLS entirely anyway.
  IF current_user IN ('service_role', 'postgres') THEN
    RETURN NEW;
  END IF;

  -- ── (C) id is always immutable ──────────────────────────────
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'permission denied: profiles.id is immutable'
      USING ERRCODE = '42501';
  END IF;

  -- ── (D) organization_id — only trusted paths may change ─────
  -- create_organization_and_claim_owner sets the GUC (path A) and
  -- is the sole legitimate client-facing path.  Direct Management
  -- API calls go through path B.  Client code must never touch this.
  IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
    RAISE EXCEPTION 'permission denied: organization_id can only be set by server operations'
      USING ERRCODE = '42501';
  END IF;

  -- ── (E) role — admins may change OTHERS; nobody may self-escalate ──
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Absolute: no one may change their own role via client
    IF NEW.id = auth.uid() THEN
      RAISE EXCEPTION 'permission denied: cannot change own role'
        USING ERRCODE = '42501';
    END IF;

    -- Only admin/super_admin of the same org may change another member's role
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles caller
      WHERE caller.id = auth.uid()
        AND caller.role IN ('admin', 'super_admin')
        AND caller.organization_id = OLD.organization_id
    ) THEN
      RAISE EXCEPTION 'permission denied: only admins may change member roles'
        USING ERRCODE = '42501';
    END IF;

    -- Even admins cannot promote to super_admin; that is platform-only
    IF NEW.role = 'super_admin' THEN
      RAISE EXCEPTION 'permission denied: super_admin can only be assigned by platform operations'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER before_profile_update_privilege_check
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- ─── 3. Replacement policies ─────────────────────────────────

-- Policy A: every user may update their own row (safe columns).
-- The trigger above enforces that role/organization_id cannot
-- be changed through this path.
CREATE POLICY "users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy B: admins and super_admins may update OTHER members'
-- profiles within their own organisation (role management,
-- is_active toggle, GDPR anonymisation).  The trigger still
-- fires and prevents super_admin promotion and org hijacking.
CREATE POLICY "admins can update org member profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    id != auth.uid()
    AND organization_id = get_user_organization_id()
    AND get_user_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    id != auth.uid()
    AND organization_id = get_user_organization_id()
  );

-- ─── 4. create_organization_and_claim_owner ──────────────────
-- Atomic: insert org → set caller's profile org+role → seed usage.
-- SECURITY DEFINER so it can set the GUC bypass flag before the
-- privileged UPDATE; the trigger reads that flag (path A above).
-- Rejects callers who already have an organization_id.
-- Cannot assign super_admin — that is reserved for platform ops.

CREATE OR REPLACE FUNCTION public.create_organization_and_claim_owner(
  p_name                      text,
  p_slug                      text,
  p_industry                  text    DEFAULT NULL,
  p_company_size              text    DEFAULT NULL,
  p_timezone                  text    DEFAULT 'UTC',
  p_plan                      text    DEFAULT 'free',
  p_custom_domain             text    DEFAULT NULL,
  p_domain_verified           boolean DEFAULT false,
  p_domain_verification_token text    DEFAULT NULL,
  p_domain_verification_method text   DEFAULT 'dns_txt',
  p_primary_color             text    DEFAULT '#6366f1',
  p_logo_url                  text    DEFAULT NULL,
  p_branding                  jsonb   DEFAULT '{}',
  p_email_config              jsonb   DEFAULT '{}',
  p_email_verified            boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_org_id  uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated'
      USING ERRCODE = '42501';
  END IF;

  -- Guard: reject if caller already belongs to an org
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_user_id
      AND organization_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'already_has_organization: user already belongs to an organisation'
      USING ERRCODE = '23505';
  END IF;

  -- 1. Create the organisation
  INSERT INTO public.organizations (
    name, slug, industry, company_size, timezone, plan,
    custom_domain, domain_verified, domain_verification_token,
    domain_verification_method, primary_color, logo_url,
    branding, email_config
  ) VALUES (
    p_name, p_slug, p_industry, p_company_size, p_timezone, p_plan::plan_type,
    p_custom_domain, p_domain_verified, p_domain_verification_token,
    p_domain_verification_method, p_primary_color, p_logo_url,
    p_branding, p_email_config
  )
  RETURNING id INTO v_org_id;

  -- 2. Claim ownership.
  -- Set the transaction-local GUC flag so the trigger's (A) path
  -- allows this privileged UPDATE without relying on role names.
  PERFORM set_config('privydesk.allow_privileged_profile_write', 'on', true);

  UPDATE public.profiles
    SET organization_id = v_org_id,
        role            = 'admin',
        email_verified  = p_email_verified
    WHERE id = v_user_id;

  -- The GUC resets automatically at transaction end (local=true).

  -- 3. Seed subscription usage counter
  INSERT INTO public.subscription_usage (
    organization_id,
    tickets_used_this_month,
    emails_sent_this_month,
    storage_used_mb
  ) VALUES (v_org_id, 0, 0, 0)
  ON CONFLICT (organization_id) DO NOTHING;

  RETURN v_org_id;
END;
$$;

-- Grant execute to authenticated users (the function enforces its
-- own caller checks internally).
GRANT EXECUTE ON FUNCTION public.create_organization_and_claim_owner(
  text, text, text, text, text, text, text, boolean, text, text,
  text, text, jsonb, jsonb, boolean
) TO authenticated;
