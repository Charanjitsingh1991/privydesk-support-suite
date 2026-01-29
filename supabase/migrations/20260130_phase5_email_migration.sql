-- Phase 5: Email Migration & Knowledge Base
-- Email archive and import system

-- Email import jobs tracking
CREATE TABLE IF NOT EXISTS email_import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Job details
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT NOT NULL, -- Storage path
  import_type TEXT NOT NULL, -- 'pst', 'eml', 'imap'
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  progress_percentage INTEGER DEFAULT 0,
  
  -- Statistics
  total_emails INTEGER DEFAULT 0,
  processed_emails INTEGER DEFAULT 0,
  failed_emails INTEGER DEFAULT 0,
  
  -- Error tracking
  error_message TEXT,
  error_details JSONB,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Email archive storage
CREATE TABLE IF NOT EXISTS email_archive (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  import_job_id UUID REFERENCES email_import_jobs(id) ON DELETE SET NULL,
  
  -- Email metadata
  message_id TEXT,
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  
  -- Content
  body_text TEXT,
  body_html TEXT,
  
  -- Metadata
  sent_date TIMESTAMPTZ NOT NULL,
  received_date TIMESTAMPTZ,
  folder_path TEXT,
  has_attachments BOOLEAN DEFAULT false,
  attachment_count INTEGER DEFAULT 0,
  
  -- Search
  search_vector tsvector,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email attachments
CREATE TABLE IF NOT EXISTS email_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id UUID NOT NULL REFERENCES email_archive(id) ON DELETE CASCADE,
  
  -- Attachment details
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge base articles (enhanced)
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Article details
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- Categorization
  category_id UUID,
  tags TEXT[] DEFAULT '{}',
  
  -- Multi-language support
  language TEXT DEFAULT 'en',
  translated_from UUID REFERENCES kb_articles(id) ON DELETE SET NULL,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES kb_articles(id) ON DELETE SET NULL,
  
  -- Publishing
  status TEXT DEFAULT 'draft', -- draft, published, archived
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,
  scheduled_unpublish_at TIMESTAMPTZ,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Search
  search_vector tsvector,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE(organization_id, slug)
);

-- KB categories
CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Category details
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Hierarchy
  parent_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, slug)
);

-- Community forums
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Topic details
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Categorization
  category_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Status
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  
  -- Engagement
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  UNIQUE(organization_id, slug)
);

-- Forum replies
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE SET NULL,
  
  -- Reply details
  content TEXT NOT NULL,
  
  -- Status
  is_best_answer BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  
  -- Engagement
  vote_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_email_import_jobs_organization_id ON email_import_jobs(organization_id);
CREATE INDEX idx_email_import_jobs_status ON email_import_jobs(status);
CREATE INDEX idx_email_archive_organization_id ON email_archive(organization_id);
CREATE INDEX idx_email_archive_import_job_id ON email_archive(import_job_id);
CREATE INDEX idx_email_archive_sent_date ON email_archive(sent_date DESC);
CREATE INDEX idx_email_archive_from_email ON email_archive(from_email);
CREATE INDEX idx_email_archive_search_vector ON email_archive USING gin(search_vector);
CREATE INDEX idx_email_attachments_email_id ON email_attachments(email_id);
CREATE INDEX idx_kb_articles_organization_id ON kb_articles(organization_id);
CREATE INDEX idx_kb_articles_category_id ON kb_articles(category_id);
CREATE INDEX idx_kb_articles_status ON kb_articles(status);
CREATE INDEX idx_kb_articles_language ON kb_articles(language);
CREATE INDEX idx_kb_articles_search_vector ON kb_articles USING gin(search_vector);
CREATE INDEX idx_kb_categories_organization_id ON kb_categories(organization_id);
CREATE INDEX idx_kb_categories_parent_id ON kb_categories(parent_id);
CREATE INDEX idx_forum_topics_organization_id ON forum_topics(organization_id);
CREATE INDEX idx_forum_topics_category_id ON forum_topics(category_id);
CREATE INDEX idx_forum_replies_topic_id ON forum_replies(topic_id);

-- Full-text search triggers
CREATE OR REPLACE FUNCTION update_email_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.body_text, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_search_vector
  BEFORE INSERT OR UPDATE ON email_archive
  FOR EACH ROW
  EXECUTE FUNCTION update_email_search_vector();

CREATE OR REPLACE FUNCTION update_kb_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_kb_search_vector
  BEFORE INSERT OR UPDATE ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_kb_search_vector();

-- RLS Policies
ALTER TABLE email_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Email import jobs policies
CREATE POLICY "Users can view their org's import jobs"
  ON email_import_jobs FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage import jobs"
  ON email_import_jobs FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ));

-- Email archive policies
CREATE POLICY "Users can view their org's emails"
  ON email_archive FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- KB articles policies
CREATE POLICY "Anyone can view published articles"
  ON kb_articles FOR SELECT
  USING (status = 'published' OR organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Admins and agents can manage articles"
  ON kb_articles FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'agent')
  ));

-- Forum policies
CREATE POLICY "Anyone can view forum topics"
  ON forum_topics FOR SELECT
  USING (true);

CREATE POLICY "Users can create forum topics"
  ON forum_topics FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can reply to topics"
  ON forum_replies FOR INSERT
  WITH CHECK (true);

-- Comment
COMMENT ON TABLE email_import_jobs IS 'Email import job tracking (PST/EML/IMAP)';
COMMENT ON TABLE email_archive IS 'Archived emails from imports';
COMMENT ON TABLE email_attachments IS 'Email attachments storage references';
COMMENT ON TABLE kb_articles IS 'Knowledge base articles with versioning and multi-language support';
COMMENT ON TABLE kb_categories IS 'Knowledge base categories';
COMMENT ON TABLE forum_topics IS 'Community forum topics';
COMMENT ON TABLE forum_replies IS 'Forum topic replies';
