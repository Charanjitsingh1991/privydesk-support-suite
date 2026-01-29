-- Drop existing conflicting policy
DROP POLICY IF EXISTS "Users can view ticket attachments" ON storage.objects;

-- Recreate the policy with organization scoping
CREATE POLICY "Users can view ticket attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ticket-attachments' AND
  (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.profiles WHERE id = auth.uid())
);