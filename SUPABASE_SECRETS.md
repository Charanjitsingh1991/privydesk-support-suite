# Supabase Edge Function Secrets Configuration

## 📋 Required Secrets

These secrets must be configured in **Supabase Dashboard → Settings → Edge Functions → Secrets**

---

## 🔐 Core Supabase Secrets

### `SUPABASE_URL`
- **Value:** `https://mgnuddfytlbtgprckzto.supabase.co`
- **Description:** Your Supabase project URL
- **Required for:** All Edge Functions

### `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJ...` (Get from Supabase Dashboard → Settings → API → service_role key)
- **Description:** Service role key with admin privileges
- **Required for:** All Edge Functions that need to bypass RLS
- **⚠️ CRITICAL:** Never expose this in client-side code

### `SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbnVkZGZ5dGxidGdwcmNrenRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTQ1NTIsImV4cCI6MjA4NTIzMDU1Mn0.6fEtY6dITMdyqnhVurrEJdcmwTOTgBHNmYNt4NoaC6U`
- **Description:** Anonymous/public key for client-side operations
- **Required for:** Edge Functions that interact with client requests

---

## 📧 SMTP Configuration (Email Sending)

### `SMTP_HOST`
- **Value:** `smtp.hostinger.com` (or your email provider's SMTP server)
- **Description:** SMTP server hostname
- **Required for:** send-otp, send-magic-link, send-team-invite, send-welcome-email

### `SMTP_PORT`
- **Value:** `587` (for TLS) or `465` (for SSL)
- **Description:** SMTP server port
- **Required for:** All email-sending functions

### `SMTP_USER`
- **Value:** `noreply@yourdomain.com` (your SMTP username/email)
- **Description:** SMTP authentication username
- **Required for:** All email-sending functions

### `SMTP_PASSWORD`
- **Value:** `your-smtp-password`
- **Description:** SMTP authentication password
- **Required for:** All email-sending functions
- **⚠️ CRITICAL:** Keep this secret secure

### `SMTP_FROM_EMAIL`
- **Value:** `noreply@yourdomain.com`
- **Description:** Email address shown as sender
- **Required for:** All email-sending functions

### `SMTP_FROM_NAME`
- **Value:** `PRIVYDESK`
- **Description:** Display name for email sender
- **Required for:** All email-sending functions

---

## 🤖 AI Integration (Optional)

### AI Provider Configuration
- **AI_PROVIDER** - Choose: `groq`, `openrouter`, or `openai`
- **GROQ_API_KEY** - Groq API key (fast inference)
- **OPENROUTER_API_KEY** - OpenRouter API key (multiple models)
- **OPENAI_API_KEY** - OpenAI API key (GPT models)
- **Required for:** analyze-ticket function (AI-powered ticket analysis)
- **Optional:** Only needed if using AI features

---

## 📝 How to Set Secrets

### Method 1: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/mgnuddfytlbtgprckzto
2. Navigate to **Settings** → **Edge Functions** → **Secrets**
3. Click **Add Secret**
4. Enter secret name and value
5. Click **Save**

### Method 2: Via Supabase CLI
```bash
# Set individual secret
npx supabase secrets set SMTP_HOST=smtp.hostinger.com

# Set multiple secrets from file
npx supabase secrets set --env-file .env.secrets
```

### Method 3: Bulk Import
Create a `.env.secrets` file (DO NOT commit to git):
```env
SUPABASE_URL=https://mgnuddfytlbtgprckzto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=PRIVYDESK
AI_PROVIDER=groq
GROQ_API_KEY=your-groq-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
OPENAI_API_KEY=your-openai-api-key
```

Then run:
```bash
npx supabase secrets set --env-file .env.secrets
```

---

## ✅ Verification Checklist

Before deploying Edge Functions, verify all secrets are set:

```bash
# List all configured secrets
npx supabase secrets list
```

**Required Secrets:**
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] SUPABASE_ANON_KEY
- [ ] SMTP_HOST
- [ ] SMTP_PORT
- [ ] SMTP_USER
- [ ] SMTP_PASSWORD
- [ ] SMTP_FROM_EMAIL
- [ ] SMTP_FROM_NAME
- [ ] AI_PROVIDER (optional)
- [ ] GROQ_API_KEY (optional)
- [ ] OPENROUTER_API_KEY (optional)
- [ ] OPENAI_API_KEY (optional)

---

## 🔒 Security Best Practices

1. **Never commit secrets to Git**
   - Add `.env.secrets` to `.gitignore`
   - Use environment variables for local development

2. **Rotate keys regularly**
   - Change SMTP password periodically
   - Regenerate API keys if compromised

3. **Use different keys for development and production**
   - Separate Supabase projects for dev/prod
   - Different SMTP credentials if possible

4. **Limit access**
   - Only share service role key with trusted team members
   - Use anon key for client-side operations

---

## 📚 Edge Functions Using These Secrets

| Function | Required Secrets |
|----------|-----------------|
| `analyze-ticket` | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AI_PROVIDER, *_API_KEY |
| `api-v1` | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| `send-otp` | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_* |
| `verify-otp` | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| `send-magic-link` | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_* |
| `send-team-invite` | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_* |
| `send-welcome-email` | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_* |
| `verify-domain` | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| `widget-script` | SUPABASE_URL, SUPABASE_ANON_KEY |
| `process-email-import` | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |
| `security-scan` | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY |

---

## 🆘 Troubleshooting

### "Secret not found" error
- Verify secret name matches exactly (case-sensitive)
- Check secret is set in correct Supabase project
- Redeploy function after setting secrets

### Email not sending
- Verify SMTP credentials are correct
- Check SMTP_PORT matches your provider's requirements
- Test SMTP connection separately
- Check Hostinger email sending limits

### AI features not working
- Verify AI_PROVIDER is set correctly
- Check corresponding API key is set (GROQ_API_KEY, etc.)
- Verify API key is valid and not expired
- Monitor API usage limits

---

**Last Updated:** January 2025
