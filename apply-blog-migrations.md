# Apply Blog Posts Migrations to Supabase

## Option 1: Using Supabase Dashboard (Recommended)

### Step 1: Create blog_posts Table

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20260131_blog_posts.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)

You should see: "Success. No rows returned"

### Step 2: Seed Blog Posts Data

1. In the SQL Editor, click **New Query** again
2. Copy the entire contents of `supabase/migrations/20260131_seed_blog_posts.sql`
3. Paste into the SQL editor
4. Click **Run**

You should see: "Success. 6 rows affected"

### Step 3: Verify

Run this query to verify:
```sql
SELECT title, slug, status FROM blog_posts ORDER BY published_at DESC;
```

You should see 6 blog posts listed.

---

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link your project (if not already linked)
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
npx supabase db push

# Or apply specific migrations
psql YOUR_DATABASE_URL -f supabase/migrations/20260131_blog_posts.sql
psql YOUR_DATABASE_URL -f supabase/migrations/20260131_seed_blog_posts.sql
```

---

## Option 3: Manual SQL Execution

### Create Table SQL:
```sql
-- Blog Posts Table for SEO-optimized content management
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'PrivyDesk Content Team',
  category TEXT NOT NULL,
  featured_image TEXT,
  read_time TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image TEXT,
  canonical_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

-- RLS Policies
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public can read published blog posts"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Only authenticated users can manage blog posts
CREATE POLICY "Authenticated users can manage blog posts"
  ON public.blog_posts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();
```

Then run the seed data from `supabase/migrations/20260131_seed_blog_posts.sql`

---

## After Migration

Once migrations are applied:

1. **Restart your dev server** (if running)
2. **Navigate to** `http://localhost:8080/blog`
3. **Click on any blog post** - it should now work!
4. **TypeScript errors will disappear** after the table exists

---

## Troubleshooting

**If you get "relation already exists" errors:**
- The table already exists, skip to Step 2 (seed data)

**If you get permission errors:**
- Make sure you're logged into the correct Supabase project
- Check that you have admin access to the database

**If blog posts still don't show:**
- Check the browser console for errors
- Verify the table exists: `SELECT * FROM blog_posts LIMIT 1;`
- Check RLS policies are enabled correctly
