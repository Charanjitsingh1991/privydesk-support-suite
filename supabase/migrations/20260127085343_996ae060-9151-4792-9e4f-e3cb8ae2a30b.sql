-- Create storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for ticket attachments bucket
-- Allow authenticated users to upload to their organization's folder
CREATE POLICY "Users can upload ticket attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-attachments' AND
  auth.uid() IS NOT NULL
);

-- Allow authenticated users to view ticket attachments
CREATE POLICY "Users can view ticket attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'ticket-attachments' AND
  auth.uid() IS NOT NULL
);

-- Allow users to delete their own attachments
CREATE POLICY "Users can delete their ticket attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'ticket-attachments' AND
  auth.uid() IS NOT NULL
);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;