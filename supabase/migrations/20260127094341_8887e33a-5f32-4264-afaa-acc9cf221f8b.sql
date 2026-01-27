-- Email Archive table - stores imported emails
CREATE TABLE IF NOT EXISTS public.email_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  outlook_message_id TEXT,
  conversation_id TEXT,
  folder_path TEXT,
  
  -- Email content
  subject TEXT NOT NULL,
  body_preview TEXT,
  body_content TEXT,
  body_content_type TEXT DEFAULT 'plain',
  
  -- Participants
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_recipients JSONB DEFAULT '[]'::jsonb,
  cc_recipients JSONB DEFAULT '[]'::jsonb,
  bcc_recipients JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  importance TEXT DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  categories JSONB DEFAULT '[]'::jsonb,
  
  -- Linking to PRIVYDESK
  linked_ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  linked_client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  auto_linked BOOLEAN DEFAULT false,
  
  -- Timestamps
  received_datetime TIMESTAMPTZ NOT NULL,
  sent_datetime TIMESTAMPTZ,
  imported_at TIMESTAMPTZ DEFAULT now(),
  
  -- Full-text search
  search_vector TSVECTOR,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(organization_id, outlook_message_id)
);

-- Email Attachments table
CREATE TABLE IF NOT EXISTS public.email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_archive_id UUID NOT NULL REFERENCES public.email_archive(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT,
  download_status TEXT DEFAULT 'pending',
  is_inline BOOLEAN DEFAULT false,
  content_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  downloaded_at TIMESTAMPTZ
);

-- Email Import Jobs table
CREATE TABLE IF NOT EXISTS public.email_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  pst_file_name TEXT,
  pst_file_size BIGINT,
  pst_file_url TEXT,
  status TEXT DEFAULT 'pending',
  total_emails INTEGER DEFAULT 0,
  processed_emails INTEGER DEFAULT 0,
  failed_emails INTEGER DEFAULT 0,
  total_attachments INTEGER DEFAULT 0,
  processed_attachments INTEGER DEFAULT 0,
  error_message TEXT,
  error_log JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_import_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_archive
CREATE POLICY "Admins and agents can view org emails"
ON public.email_archive FOR SELECT
TO authenticated
USING (
  organization_id = public.get_user_organization_id() AND
  public.get_user_role() IN ('admin', 'agent', 'super_admin')
);

CREATE POLICY "Clients can view emails linked to them"
ON public.email_archive FOR SELECT
TO authenticated
USING (
  organization_id = public.get_user_organization_id() AND
  linked_client_id = auth.uid()
);

CREATE POLICY "Admins can insert emails"
ON public.email_archive FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = public.get_user_organization_id() AND
  public.get_user_role() IN ('admin', 'super_admin')
);

CREATE POLICY "Admins and agents can update emails"
ON public.email_archive FOR UPDATE
TO authenticated
USING (
  organization_id = public.get_user_organization_id() AND
  public.get_user_role() IN ('admin', 'agent', 'super_admin')
);

-- RLS Policies for email_attachments
CREATE POLICY "Users can view attachments for accessible emails"
ON public.email_attachments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.email_archive ea
    WHERE ea.id = email_attachments.email_archive_id
    AND ea.organization_id = public.get_user_organization_id()
  )
);

CREATE POLICY "Admins can insert attachments"
ON public.email_attachments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.email_archive ea
    WHERE ea.id = email_attachments.email_archive_id
    AND ea.organization_id = public.get_user_organization_id()
    AND public.get_user_role() IN ('admin', 'super_admin')
  )
);

-- RLS Policies for email_import_jobs
CREATE POLICY "Admins can view import jobs"
ON public.email_import_jobs FOR SELECT
TO authenticated
USING (
  organization_id = public.get_user_organization_id() AND
  public.get_user_role() IN ('admin', 'super_admin')
);

CREATE POLICY "Admins can create import jobs"
ON public.email_import_jobs FOR INSERT
TO authenticated
WITH CHECK (
  organization_id = public.get_user_organization_id() AND
  public.get_user_role() IN ('admin', 'super_admin')
);

CREATE POLICY "Admins can update import jobs"
ON public.email_import_jobs FOR UPDATE
TO authenticated
USING (
  organization_id = public.get_user_organization_id() AND
  public.get_user_role() IN ('admin', 'super_admin')
);

-- Indexes for performance
CREATE INDEX idx_email_archive_org ON public.email_archive(organization_id);
CREATE INDEX idx_email_archive_received ON public.email_archive(received_datetime DESC);
CREATE INDEX idx_email_archive_from ON public.email_archive(from_email);
CREATE INDEX idx_email_archive_folder ON public.email_archive(folder_path);
CREATE INDEX idx_email_archive_ticket ON public.email_archive(linked_ticket_id) WHERE linked_ticket_id IS NOT NULL;
CREATE INDEX idx_email_archive_client ON public.email_archive(linked_client_id) WHERE linked_client_id IS NOT NULL;
CREATE INDEX idx_email_archive_search ON public.email_archive USING GIN(search_vector);
CREATE INDEX idx_email_attachments_email ON public.email_attachments(email_archive_id);
CREATE INDEX idx_email_import_jobs_org ON public.email_import_jobs(organization_id);

-- Trigger to update search vector
CREATE OR REPLACE FUNCTION public.update_email_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.body_preview, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER email_archive_search_update
  BEFORE INSERT OR UPDATE ON public.email_archive
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_search_vector();

-- Trigger for updated_at
CREATE TRIGGER update_email_archive_updated_at
  BEFORE UPDATE ON public.email_archive
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_email_import_jobs_updated_at
  BEFORE UPDATE ON public.email_import_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for email imports
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('email-imports', 'email-imports', false, 10737418240) -- 10GB limit
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for email attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('email-attachments', 'email-attachments', false, 104857600) -- 100MB limit
ON CONFLICT (id) DO NOTHING;

-- Storage policies for email-imports bucket
CREATE POLICY "Admins can upload email imports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'email-imports' AND
  (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()) AND
  public.get_user_role() IN ('admin', 'super_admin')
);

CREATE POLICY "Admins can view email imports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'email-imports' AND
  (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.profiles WHERE id = auth.uid())
);

-- Storage policies for email-attachments bucket
CREATE POLICY "Users can view email attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'email-attachments' AND
  (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can upload email attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'email-attachments' AND
  (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()) AND
  public.get_user_role() IN ('admin', 'super_admin')
);

-- Enable realtime for import jobs (progress updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_import_jobs;