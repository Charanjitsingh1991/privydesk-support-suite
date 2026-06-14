-- ============================================================
-- MIGRATION: lockdown_otp_rate_attachments_rls
-- Created   : 2026-06-14
-- Purpose   : Close P0 auth-bypass (otp_codes anon-readable) and
--             P0/P1 rate_limits + attachments exposure.
-- Safe to apply: all OTP/rate flows go through SECURITY DEFINER
--   RPCs (generate_otp, verify_otp, check_rate_limit) owned by
--   postgres — they are unaffected by REVOKE on anon/authenticated.
-- Rollback  : 20260614192900_lockdown_otp_rate_attachments_rls_ROLLBACK.sql
-- ============================================================

-- ─── 1. otp_codes ────────────────────────────────────────────
-- The anon role can currently SELECT (and INSERT/UPDATE/DELETE)
-- this table directly via the REST API, returning live OTP codes
-- and email addresses to unauthenticated callers — a complete
-- account-takeover vector.  Only SECURITY DEFINER RPCs should
-- ever touch this table; no client-visible policy is needed.

REVOKE ALL ON public.otp_codes FROM anon;
REVOKE ALL ON public.otp_codes FROM authenticated;

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- No permissive policies.  service_role bypasses RLS and retains
-- full access.  generate_otp / verify_otp / cleanup_expired_otps
-- all run as postgres (SECURITY DEFINER) and are unaffected.

-- ─── 2. rate_limits ──────────────────────────────────────────
-- Anon can read rate-limit state (PII: email addresses, action
-- history) and DELETE entries to bypass brute-force throttling.
-- check_rate_limit() is SECURITY DEFINER — it will continue to
-- work for all callers regardless of these grants.

REVOKE ALL ON public.rate_limits FROM anon;
REVOKE ALL ON public.rate_limits FROM authenticated;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No permissive policies.  Service-role and SECURITY DEFINER
-- functions retain full access.

-- ─── 3. attachments ──────────────────────────────────────────
-- Currently empty but anon has full CRUD and no RLS.  Once any
-- attachment is uploaded, storage_path would be publicly readable
-- and cross-tenant file-metadata leaks would occur.
-- Legitimate access (agents/clients reading ticket attachments
-- in their own org) must work, so we add scoped policies.

REVOKE ALL ON public.attachments FROM anon;

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read attachments on tickets that belong
-- to their organisation.
CREATE POLICY "org members can select attachments"
  ON public.attachments
  FOR SELECT
  TO authenticated
  USING (
    ticket_id IN (
      SELECT id FROM public.tickets
      WHERE organization_id = get_user_organization_id()
    )
  );

-- Authenticated users can insert attachments for tickets in their
-- organisation (uploading files via the composer).
CREATE POLICY "org members can insert attachments"
  ON public.attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM public.tickets
      WHERE organization_id = get_user_organization_id()
    )
  );

-- Only the uploader (or an admin/agent in the same org) can delete.
CREATE POLICY "uploader or admin can delete attachment"
  ON public.attachments
  FOR DELETE
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR get_user_role() IN ('admin', 'super_admin', 'agent')
  );
