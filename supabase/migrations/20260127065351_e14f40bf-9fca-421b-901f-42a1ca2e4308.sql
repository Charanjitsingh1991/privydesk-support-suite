-- Add domain verification columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS domain_verification_token TEXT,
ADD COLUMN IF NOT EXISTS domain_verification_method TEXT CHECK (domain_verification_method IN ('dns', 'file')),
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS company_size TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS email_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{"social_links": {}, "footer_text": "", "company_address": ""}'::jsonb;

-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('organization-logos', 'organization-logos', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for organization logos bucket
CREATE POLICY "Anyone can view organization logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-logos');

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their organization logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organization-logos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their organization logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-logos'
  AND auth.role() = 'authenticated'
);