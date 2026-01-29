# 🚀 PRIVYDESK Supabase Setup & Deployment Guide

## Complete Step-by-Step Setup Instructions

---

## Step 1: Login to Supabase CLI

Since the automated login doesn't work in non-interactive terminals, you have two options:

### Option A: Manual Login (Recommended)

1. **Open a new PowerShell window** (not in IDE terminal)
2. Navigate to your project:
   ```powershell
   cd G:\PRIVYDESK
   ```
3. Run the login command:
   ```powershell
   npx supabase login
   ```
4. This will open your browser for authentication
5. Authorize the CLI in your browser
6. Return to PowerShell - you should see "Logged in successfully"

### Option B: Use Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Click **Generate New Token**
3. Copy the token
4. Set it as an environment variable:
   ```powershell
   $env:SUPABASE_ACCESS_TOKEN="your-token-here"
   ```
5. Or use it directly:
   ```powershell
   npx supabase login --token your-token-here
   ```

---

## Step 2: Link Your Project

After logging in, link to your Supabase project:

```powershell
npx supabase link --project-ref mgnuddfytlbtgprckzto
```

You'll be prompted for your database password. Enter it when asked.

**Verify the link:**
```powershell
npx supabase status
```

---

## Step 3: Configure Edge Function Secrets

### Required Secrets Checklist

Go to: https://supabase.com/dashboard/project/mgnuddfytlbtgprckzto/settings/functions

Click **"Secrets"** and add the following:

#### Core Supabase Secrets
- [ ] **SUPABASE_URL**
  - Value: `https://mgnuddfytlbtgprckzto.supabase.co`

- [ ] **SUPABASE_SERVICE_ROLE_KEY**
  - Go to: Settings → API → Project API keys
  - Copy the `service_role` key (secret)
  - ⚠️ **CRITICAL:** Never expose this publicly

- [ ] **SUPABASE_ANON_KEY**
  - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbnVkZGZ5dGxidGdwcmNrenRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTQ1NTIsImV4cCI6MjA4NTIzMDU1Mn0.6fEtY6dITMdyqnhVurrEJdcmwTOTgBHNmYNt4NoaC6U`

#### SMTP Configuration (for email sending)
- [ ] **SMTP_HOST**
  - Value: `smtp.hostinger.com` (or your SMTP provider)

- [ ] **SMTP_PORT**
  - Value: `587` (TLS) or `465` (SSL)

- [ ] **SMTP_USER**
  - Your SMTP username (usually your email)
  - Example: `noreply@yourdomain.com`

- [ ] **SMTP_PASSWORD**
  - Your SMTP password
  - ⚠️ Keep this secure

- [ ] **SMTP_FROM_EMAIL**
  - Value: `noreply@yourdomain.com`

- [ ] **SMTP_FROM_NAME**
  - Value: `PRIVYDESK`

#### Optional: AI Integration
- [ ] **LOVABLE_API_KEY** (optional - for AI ticket analysis)
  - Only needed if using AI features

### Verify Secrets

After adding all secrets, verify they're set:

```powershell
npx supabase secrets list
```

Or use the automated script:
```powershell
npm run supabase:secrets
```

---

## Step 4: Generate TypeScript Types

Generate TypeScript types from your database schema:

```powershell
npm run supabase:types
```

Or manually:
```powershell
npx supabase gen types typescript --project-id mgnuddfytlbtgprckzto > src/integrations/supabase/types.ts
```

This ensures your frontend has the latest database type definitions.

---

## Step 5: Deploy Edge Functions

### Option A: Deploy All Functions (Automated)

```powershell
npm run supabase:deploy
```

This will deploy all 11 Edge Functions:
- analyze-ticket
- api-v1
- send-otp
- verify-otp
- send-magic-link
- send-team-invite
- send-welcome-email
- verify-domain
- widget-script
- process-email-import
- security-scan

### Option B: Deploy Individual Functions

```powershell
npx supabase functions deploy analyze-ticket
npx supabase functions deploy api-v1
npx supabase functions deploy send-otp
# ... etc
```

### Verify Deployment

Check function logs:
```powershell
npx supabase functions logs analyze-ticket
```

Test a function:
```powershell
curl -X POST https://mgnuddfytlbtgprckzto.supabase.co/functions/v1/analyze-ticket \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "test"}'
```

---

## Step 6: Run Database Migrations

If you haven't already, run the database migrations:

1. Go to Supabase Dashboard → SQL Editor
2. Open `SUPABASE_MIGRATION.sql` from your project
3. Copy and paste the entire SQL into the editor
4. Click **Run**

This creates all tables, RLS policies, functions, and triggers.

---

## Step 7: Test the Application

### Local Development
```powershell
npm run dev
```

Visit http://localhost:8080

### Production Build
```powershell
npm run build
npm run preview
```

---

## 📋 Quick Reference Commands

### Supabase CLI Commands
```powershell
# Login
npm run supabase:login

# Link project
npm run supabase:link

# Check secrets
npm run supabase:secrets

# Generate types
npm run supabase:types

# Deploy functions
npm run supabase:deploy

# View function logs
npx supabase functions logs <function-name>

# List all functions
npx supabase functions list
```

### Development Commands
```powershell
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

---

## 🔍 Troubleshooting

### "Not logged in" error
- Run `npx supabase login` in a regular PowerShell window (not IDE terminal)
- Or use access token method

### "Project not linked" error
- Run `npx supabase link --project-ref mgnuddfytlbtgprckzto`
- Enter your database password when prompted

### "Secret not found" error
- Verify all secrets are set in Supabase Dashboard
- Check secret names match exactly (case-sensitive)
- Redeploy functions after setting secrets

### Edge Function deployment fails
- Check you're logged in: `npx supabase login`
- Verify project is linked: `npx supabase status`
- Check function code for syntax errors
- Review function logs: `npx supabase functions logs <name>`

### Email not sending
- Verify all SMTP_* secrets are set correctly
- Test SMTP credentials separately
- Check Hostinger email sending limits
- Review send-otp function logs

### TypeScript type errors
- Regenerate types: `npm run supabase:types`
- Restart TypeScript server in IDE
- Check database schema matches expectations

---

## 🎯 Post-Deployment Checklist

After completing all steps:

- [ ] All Edge Functions deployed successfully
- [ ] All required secrets configured
- [ ] TypeScript types generated
- [ ] Database migrations applied
- [ ] Local development server works
- [ ] Production build succeeds
- [ ] Email sending tested
- [ ] Authentication flows tested
- [ ] Ticket creation tested
- [ ] Live chat widget tested

---

## 📚 Additional Resources

- **Supabase CLI Docs:** https://supabase.com/docs/reference/cli
- **Edge Functions Guide:** https://supabase.com/docs/guides/functions
- **Project Blueprint:** `PROJECT_BLUEPRINT.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **Secrets Reference:** `SUPABASE_SECRETS.md`

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review function logs: `npx supabase functions logs <name>`
3. Check Supabase Dashboard for errors
4. Review `SUPABASE_SECRETS.md` for secret configuration
5. Ensure all prerequisites are met

---

**Last Updated:** January 2025
**Version:** 1.0.0
