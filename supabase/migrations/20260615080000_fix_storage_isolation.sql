-- ============================================================
-- P0 Storage Isolation Fix
-- Replaces all permissive / unscoped storage.objects policies
-- with org-scoped, authenticated-only policies.
--
-- ticket-attachments : org-scoped R/W — path = {orgId}/{ticketId}/...
-- email-attachments  : org-scoped R/W — path = {orgId}/...
-- email-imports      : org-scoped R/W — path = {orgId}/...
-- organization-logos : public SELECT (intentional) + org-scoped INSERT
-- ============================================================

-- ── 1. DROP ALL EXISTING POLICIES ON storage.objects ────────

DROP POLICY IF EXISTS "Public read for ticket attachments"             ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ticket attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage email attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage email imports"    ON storage.objects;
DROP POLICY IF EXISTS "Public read for organization logos"              ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload org logos"        ON storage.objects;

-- ── 2. TICKET-ATTACHMENTS ────────────────────────────────────
-- Path convention: ticket-attachments/{orgId}/{ticketId}/filename
-- First folder segment (foldername[1]) must equal the caller's org id.

CREATE POLICY "ticket-attachments: org-scoped SELECT"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "ticket-attachments: org-scoped INSERT"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "ticket-attachments: org-scoped UPDATE"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "ticket-attachments: org-scoped DELETE"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'ticket-attachments'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- ── 3. EMAIL-ATTACHMENTS ─────────────────────────────────────
-- Path convention: email-attachments/{orgId}/filename

CREATE POLICY "email-attachments: org-scoped SELECT"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'email-attachments'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "email-attachments: org-scoped INSERT"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'email-attachments'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "email-attachments: org-scoped UPDATE"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'email-attachments'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'email-attachments'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "email-attachments: org-scoped DELETE"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'email-attachments'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- ── 4. EMAIL-IMPORTS ─────────────────────────────────────────

CREATE POLICY "email-imports: org-scoped SELECT"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'email-imports'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "email-imports: org-scoped INSERT"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'email-imports'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "email-imports: org-scoped UPDATE"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'email-imports'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'email-imports'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "email-imports: org-scoped DELETE"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'email-imports'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- ── 5. ORGANIZATION-LOGOS ────────────────────────────────────
-- SELECT: intentionally public (logos appear on public-facing widget/landing)
-- INSERT/UPDATE/DELETE: org-scoped (only the org's own admin can change their logo)

CREATE POLICY "organization-logos: public SELECT"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'organization-logos');

CREATE POLICY "organization-logos: org-scoped INSERT"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'organization-logos'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "organization-logos: org-scoped UPDATE"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'organization-logos'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'organization-logos'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "organization-logos: org-scoped DELETE"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'organization-logos'
    AND (storage.foldername(name))[1] = (
      SELECT organization_id::text
      FROM public.profiles
      WHERE id = auth.uid()
    )
  );
