-- ============================================================
-- ROLLBACK: Restore original storage.objects policies
-- Run this to revert 20260615080000_fix_storage_isolation.sql
-- ============================================================

-- Drop all new org-scoped policies
DROP POLICY IF EXISTS "ticket-attachments: org-scoped SELECT"  ON storage.objects;
DROP POLICY IF EXISTS "ticket-attachments: org-scoped INSERT"  ON storage.objects;
DROP POLICY IF EXISTS "ticket-attachments: org-scoped UPDATE"  ON storage.objects;
DROP POLICY IF EXISTS "ticket-attachments: org-scoped DELETE"  ON storage.objects;
DROP POLICY IF EXISTS "email-attachments: org-scoped SELECT"   ON storage.objects;
DROP POLICY IF EXISTS "email-attachments: org-scoped INSERT"   ON storage.objects;
DROP POLICY IF EXISTS "email-attachments: org-scoped UPDATE"   ON storage.objects;
DROP POLICY IF EXISTS "email-attachments: org-scoped DELETE"   ON storage.objects;
DROP POLICY IF EXISTS "email-imports: org-scoped SELECT"       ON storage.objects;
DROP POLICY IF EXISTS "email-imports: org-scoped INSERT"       ON storage.objects;
DROP POLICY IF EXISTS "email-imports: org-scoped UPDATE"       ON storage.objects;
DROP POLICY IF EXISTS "email-imports: org-scoped DELETE"       ON storage.objects;
DROP POLICY IF EXISTS "organization-logos: public SELECT"      ON storage.objects;
DROP POLICY IF EXISTS "organization-logos: org-scoped INSERT"  ON storage.objects;
DROP POLICY IF EXISTS "organization-logos: org-scoped UPDATE"  ON storage.objects;
DROP POLICY IF EXISTS "organization-logos: org-scoped DELETE"  ON storage.objects;

-- Restore original policies
CREATE POLICY "Public read for ticket attachments"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'ticket-attachments');

CREATE POLICY "Authenticated users can upload ticket attachments"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'ticket-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage email attachments"
  ON storage.objects FOR ALL TO public
  USING (bucket_id = 'email-attachments' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'email-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage email imports"
  ON storage.objects FOR ALL TO public
  USING (bucket_id = 'email-imports' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'email-imports' AND auth.role() = 'authenticated');

CREATE POLICY "Public read for organization logos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'organization-logos');

CREATE POLICY "Authenticated users can upload org logos"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'organization-logos' AND auth.role() = 'authenticated');
