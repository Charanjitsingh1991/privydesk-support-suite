-- ============================================================
-- ROLLBACK: lockdown_otp_rate_attachments_rls
-- Reverses   : 20260614192900_lockdown_otp_rate_attachments_rls.sql
-- WARNING    : Applying this rollback re-opens the P0 auth-bypass.
--              Only apply in a confirmed break-glass incident and
--              re-apply the forward migration as soon as possible.
-- ============================================================

-- ─── 3. attachments (reverse) ────────────────────────────────
DROP POLICY IF EXISTS "uploader or admin can delete attachment" ON public.attachments;
DROP POLICY IF EXISTS "org members can insert attachments"      ON public.attachments;
DROP POLICY IF EXISTS "org members can select attachments"      ON public.attachments;

ALTER TABLE public.attachments DISABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.attachments TO anon;

-- ─── 2. rate_limits (reverse) ────────────────────────────────
ALTER TABLE public.rate_limits DISABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.rate_limits TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.rate_limits TO authenticated;

-- ─── 1. otp_codes (reverse) ──────────────────────────────────
ALTER TABLE public.otp_codes DISABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.otp_codes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.otp_codes TO authenticated;
