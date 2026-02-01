# PrivyDesk Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Build & Deploy](#build--deploy)
5. [Post-Deployment](#post-deployment)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- ✅ **Supabase Account** (Database & Auth)
- ✅ **Vercel/Netlify Account** (Hosting) - or any static host
- ✅ **Domain Provider** (Optional - for custom domain)
- ✅ **Email Service** (Optional - for transactional emails)

### Required Tools
```bash
Node.js >= 18.x
npm or yarn
Git
```

---

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/privydesk-support-suite.git
cd privydesk-support-suite
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` file in root:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"

# Optional: Email Configuration
VITE_EMAIL_SERVICE_API_KEY="your-email-api-key"

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID="GA-XXXXXXXXX"

# Optional: AI Features
VITE_OPENAI_API_KEY="sk-..."
```

**Where to find Supabase credentials:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy Project URL and anon/public key

---

## Database Setup

### 1. Apply Migrations

**Option A: Using Supabase Dashboard**
1. Open Supabase Dashboard → SQL Editor
2. Run migrations in order:
   ```sql
   -- Core tables (already applied during development)
   -- Run these if starting fresh:
   
   -- Blog system
   supabase/migrations/20260131_blog_posts.sql
   supabase/migrations/20260131_seed_blog_posts.sql
   supabase/migrations/20260131_seed_more_blog_posts.sql
   supabase/migrations/20260131_seed_more_blog_posts_part2.sql
   
   -- Platform support
   supabase/migrations/20260131_platform_support.sql
   
   -- All other features (if not already applied)
   supabase/migrations/20260130_consolidated_phases_1_9.sql
   supabase/migrations/20260130_rls_policies_all_phases.sql
   ```

**Option B: Using Supabase CLI**
```bash
# Link project
npx supabase link --project-ref your-project-ref

# Push all migrations
npx supabase db push
```

### 2. Verify Database
```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check blog posts
SELECT COUNT(*) FROM blog_posts;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 3. Configure Storage Buckets

In Supabase Dashboard → Storage:
1. Create bucket: `ticket-attachments` (Public)
2. Create bucket: `profile-avatars` (Public)
3. Create bucket: `email-attachments` (Private)

**Set bucket policies:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-attachments');

-- Allow public read access
CREATE POLICY "Public can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ticket-attachments');
```

---

## Build & Deploy

### Local Testing
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Vercel

**Option 1: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Option 2: Using Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import Git repository
3. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables from `.env`
5. Click Deploy

### Deploy to Netlify

**Option 1: Using Netlify CLI**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**Option 2: Using Netlify Dashboard**
1. Go to https://app.netlify.com/start
2. Connect Git repository
3. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. Add environment variables
5. Click Deploy

### Deploy to Custom Server

**Build static files:**
```bash
npm run build
```

**Upload `dist/` folder to your server:**
```bash
# Using SCP
scp -r dist/* user@yourserver.com:/var/www/privydesk/

# Using FTP
# Upload dist/ contents to public_html or www folder
```

**Configure web server:**

**Nginx:**
```nginx
server {
    listen 80;
    server_name privydesk.com;
    root /var/www/privydesk;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Post-Deployment

### 1. Configure Custom Domain

**Vercel:**
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

**Netlify:**
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS

### 2. SSL Certificate
- Vercel/Netlify: Automatic SSL
- Custom server: Use Let's Encrypt
  ```bash
  sudo certbot --nginx -d privydesk.com -d www.privydesk.com
  ```

### 3. Update Environment URLs
Update `.env` with production URLs:
```env
VITE_APP_URL="https://privydesk.com"
```

### 4. Configure Email Templates
In Supabase Dashboard → Authentication → Email Templates:
- Customize confirmation email
- Customize password reset email
- Add your branding

### 5. Set Up Redirects
Create `public/_redirects` (Netlify) or `vercel.json` (Vercel):

**Netlify (_redirects):**
```
/api/*  https://your-api-url.com/:splat  200
/*      /index.html                       200
```

**Vercel (vercel.json):**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Monitoring

### 1. Set Up Error Tracking

**Sentry Integration:**
```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

### 2. Analytics

**Google Analytics:**
```typescript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXXXXXX"></script>
```

### 3. Uptime Monitoring
- Use UptimeRobot (free)
- Monitor: https://privydesk.com
- Alert via email/SMS on downtime

### 4. Database Monitoring
- Supabase Dashboard → Database → Metrics
- Monitor:
  - Connection count
  - Query performance
  - Storage usage

---

## Troubleshooting

### Build Errors

**"Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**
```bash
# Regenerate types
npx supabase gen types typescript --project-id your-project-id > src/integrations/supabase/types.ts
```

### Runtime Errors

**"Failed to fetch"**
- Check CORS settings in Supabase
- Verify API URL in `.env`
- Check network tab in browser DevTools

**Authentication not working**
- Verify Supabase URL and keys
- Check Site URL in Supabase Dashboard → Authentication → URL Configuration
- Add production URL to allowed redirect URLs

**Database connection errors**
- Check RLS policies are correct
- Verify user has proper permissions
- Check Supabase project is not paused

### Performance Issues

**Slow page loads**
```bash
# Analyze bundle size
npm run build -- --analyze

# Optimize images
# Use WebP format
# Implement lazy loading
```

**High database usage**
- Add indexes to frequently queried columns
- Implement caching with React Query
- Use pagination for large datasets

---

## Rollback Procedure

### Quick Rollback (Vercel/Netlify)
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Database Rollback
```bash
# Backup current state
pg_dump your_database > backup.sql

# Restore previous backup
psql your_database < previous_backup.sql
```

---

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] RLS policies are enabled on all tables
- [ ] API keys are not exposed in client code
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] File upload size limits are set
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection (React handles this by default)
- [ ] Authentication tokens are secure
- [ ] Sensitive data is encrypted

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Review performance metrics
- Monitor database size

**Monthly:**
- Update dependencies: `npm update`
- Review and optimize database queries
- Check for security updates

**Quarterly:**
- Full security audit
- Performance optimization review
- Backup verification test

---

## Support

**Issues:**
- GitHub Issues: https://github.com/yourusername/privydesk/issues
- Email: support@privydesk.com

**Documentation:**
- API Docs: https://privydesk.com/docs
- Developer Guide: See DEVELOPMENT_SETUP.md

---

## Deployment Checklist

Before going live:

- [ ] All migrations applied
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Custom domain configured
- [ ] Email templates customized
- [ ] Storage buckets created
- [ ] RLS policies verified
- [ ] Error tracking set up
- [ ] Analytics configured
- [ ] Backup system in place
- [ ] Monitoring alerts configured
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

**Last Updated:** February 1, 2026
**Version:** 1.0.0
