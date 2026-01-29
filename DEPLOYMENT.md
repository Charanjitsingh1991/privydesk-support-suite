# PRIVYDESK Deployment Guide

## 🚀 Production Deployment to Hostinger

This guide covers deploying PRIVYDESK to Hostinger with external Supabase database.

---

## Prerequisites

- ✅ Hostinger hosting account with Node.js support
- ✅ External Supabase project configured
- ✅ Domain name (optional but recommended)
- ✅ SSL certificate (Hostinger provides free Let's Encrypt SSL)

---

## Step 1: Prepare Your Environment

### 1.1 Configure Environment Variables

Create `.env.production` in the root directory:

```env
VITE_SUPABASE_PROJECT_ID="mgnuddfytlbtgprckzto"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://mgnuddfytlbtgprckzto.supabase.co"
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_APP_VERSION="1.0.0"
```

### 1.2 Update Supabase Edge Function Secrets

In your Supabase Dashboard → Edge Functions → Secrets, add:

```
SUPABASE_URL=https://mgnuddfytlbtgprckzto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# SMTP Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_NAME=PRIVYDESK
SMTP_FROM_EMAIL=noreply@yourdomain.com

# AI Gateway (Lovable AI)
LOVABLE_API_KEY=your-lovable-api-key
```

---

## Step 2: Build for Production

### 2.1 Install Dependencies

```bash
npm install
```

### 2.2 Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 2.3 Test the Build Locally (Optional)

```bash
npm run preview
```

Visit `http://localhost:4173` to test the production build.

---

## Step 3: Deploy to Hostinger

### 3.1 Access Hostinger File Manager

1. Log in to Hostinger control panel
2. Navigate to **File Manager**
3. Go to `public_html` directory

### 3.2 Upload Files

**Option A: Using File Manager**
1. Delete all existing files in `public_html` (if any)
2. Upload all contents from the `dist/` folder
3. Upload the `.htaccess` file from the project root

**Option B: Using FTP**
```bash
# Using FileZilla or similar FTP client
Host: ftp.yourdomain.com
Username: your-ftp-username
Password: your-ftp-password
Port: 21

# Upload all files from dist/ to public_html/
```

**Option C: Using Git (Recommended)**
```bash
# On Hostinger, enable Git version control
# Then clone and deploy
git clone your-repo-url
cd your-repo
npm install
npm run build
cp -r dist/* ../public_html/
cp .htaccess ../public_html/
```

### 3.3 Verify .htaccess Configuration

Ensure `.htaccess` is in `public_html/` with this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Step 4: Configure SSL (HTTPS)

### 4.1 Enable SSL in Hostinger

1. Go to **SSL** section in Hostinger panel
2. Select your domain
3. Click **Install SSL** (Let's Encrypt - Free)
4. Wait 5-10 minutes for SSL to activate

### 4.2 Force HTTPS

Uncomment these lines in `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

---

## Step 5: Configure Supabase

### 5.1 Update Supabase Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://yourdomain.com
```

**Redirect URLs (add all):**
```
https://yourdomain.com
https://yourdomain.com/auth/callback
https://yourdomain.com/dashboard
http://localhost:8080 (for development)
```

### 5.2 Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref mgnuddfytlbtgprckzto

# Deploy all edge functions
supabase functions deploy analyze-ticket
supabase functions deploy api-v1
supabase functions deploy send-otp
supabase functions deploy verify-otp
supabase functions deploy send-magic-link
supabase functions deploy send-team-invite
supabase functions deploy verify-domain
supabase functions deploy widget-script
supabase functions deploy process-email-import
supabase functions deploy security-scan
supabase functions deploy send-welcome-email
```

### 5.3 Run Database Migrations

```bash
# In Supabase Dashboard → SQL Editor
# Run the SUPABASE_MIGRATION.sql file
# This creates all tables, RLS policies, and functions
```

---

## Step 6: Post-Deployment Verification

### 6.1 Test Core Functionality

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads after login
- [ ] Ticket creation works
- [ ] File uploads work
- [ ] Email notifications send
- [ ] Chat widget embeds correctly
- [ ] Mobile responsive design works
- [ ] PWA install prompt appears

### 6.2 Performance Checks

```bash
# Test with Google Lighthouse
# Target scores:
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 95+
# - SEO: 90+
```

### 6.3 Security Checks

- [ ] HTTPS is enforced
- [ ] Security headers are set
- [ ] RLS policies are active
- [ ] API keys are not exposed
- [ ] CORS is properly configured

---

## Step 7: Monitoring & Maintenance

### 7.1 Set Up Monitoring

**Supabase Monitoring:**
- Monitor database usage in Supabase Dashboard
- Check Edge Function logs for errors
- Review authentication logs

**Application Monitoring:**
- Use browser console for client-side errors
- Monitor Hostinger resource usage
- Set up uptime monitoring (e.g., UptimeRobot)

### 7.2 Regular Maintenance

**Weekly:**
- Check error logs
- Review user feedback
- Monitor database size

**Monthly:**
- Update dependencies: `npm update`
- Review and optimize database queries
- Backup database (Supabase auto-backups)

**Quarterly:**
- Security audit
- Performance optimization
- Feature updates

---

## Troubleshooting

### Issue: 404 on Page Refresh

**Solution:** Ensure `.htaccess` is properly configured with rewrite rules.

### Issue: API Calls Failing

**Solution:** 
1. Check CORS settings in Supabase
2. Verify environment variables
3. Check browser console for errors

### Issue: Slow Performance

**Solution:**
1. Enable GZIP compression in `.htaccess`
2. Optimize images
3. Review database query performance
4. Enable browser caching

### Issue: Email Not Sending

**Solution:**
1. Verify SMTP credentials in Edge Function secrets
2. Check Hostinger email limits
3. Review Edge Function logs

---

## Rollback Procedure

If deployment fails:

1. **Keep backup of previous `dist/` folder**
2. **Restore from backup:**
   ```bash
   cp -r dist-backup/* public_html/
   ```
3. **Revert database changes if needed**
4. **Clear browser cache and test**

---

## CI/CD Automation (Optional)

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Hostinger
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ftp.yourdomain.com
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
```

---

## Performance Optimization Checklist

- [x] Enable GZIP compression
- [x] Set browser caching headers
- [x] Optimize images (WebP format)
- [x] Lazy load components
- [x] Code splitting with React.lazy()
- [x] PWA with service worker
- [x] CDN for static assets (optional)
- [x] Database query optimization
- [x] API response caching

---

## Security Checklist

- [x] HTTPS enforced
- [x] Security headers configured
- [x] RLS policies enabled
- [x] Input sanitization (DOMPurify)
- [x] Rate limiting on API
- [x] CSRF protection
- [x] XSS protection headers
- [x] Content Security Policy
- [x] Regular dependency updates

---

## Support & Resources

- **Hostinger Support:** https://www.hostinger.com/support
- **Supabase Docs:** https://supabase.com/docs
- **Project Repository:** [Your GitHub URL]
- **Issue Tracker:** [Your GitHub Issues URL]

---

**Last Updated:** January 2025
**Version:** 1.0.0
