# Vercel Deployment Guide for PrivyDesk

## 🎯 **Why Vercel?**

✅ **Free tier** - Perfect for testing and small projects
✅ **Automatic wildcard subdomains** - No manual work
✅ **Free SSL** - For all subdomains
✅ **Global CDN** - Fast everywhere
✅ **Zero configuration** - Works with Vite out of the box

---

## 🚀 **Deployment Steps**

### **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**

```bash
vercel login
```

This will open your browser to authenticate.

### **Step 3: Deploy Your App**

```bash
cd g:\PRIVYDESK
vercel
```

**Follow the prompts:**
- Set up and deploy? **Y**
- Which scope? **Select your account**
- Link to existing project? **N**
- What's your project's name? **privydesk** (or your choice)
- In which directory is your code located? **./** (press Enter)
- Want to override the settings? **N**

Vercel will:
1. Build your app (`npm run build`)
2. Deploy to a preview URL
3. Give you a URL like: `https://privydesk-abc123.vercel.app`

### **Step 4: Test Preview**

Visit the preview URL and test your app. Make sure everything works!

---

## 🌐 **Add Custom Domain**

### **Step 1: Add Domain in Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **privydesk** project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `privydesk.com`
6. Click **Add**

### **Step 2: Vercel Shows DNS Records**

Vercel will show you records like:

```
Type: A
Name: @
Value: 76.76.21.241

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For wildcard subdomains, you'll also need:**

```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

### **Step 3: Add DNS Records in Hostinger**

1. Log in to Hostinger
2. Go to **Domains** → **privydesk.com** → **DNS Zone Editor**
3. Add/Update these records:

```
# Main domain (Vercel)
Type: A
Name: @ (or leave blank)
Value: 76.76.21.241
TTL: 3600

# Wildcard subdomains (Vercel)
Type: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: 3600

# WWW (optional)
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**IMPORTANT: Keep all existing email records:**

```
# Email (Hostinger - DON'T TOUCH)
Type: MX
Name: @
Value: mx1.hostinger.com
Priority: 10

Type: MX
Name: @
Value: mx2.hostinger.com
Priority: 20

Type: TXT
Name: @
Value: v=spf1 include:_spf.hostinger.com ~all

Type: TXT
Name: default._domainkey
Value: [your existing DKIM key]
```

### **Step 4: Wait for DNS Propagation**

- Usually: 5-30 minutes
- Maximum: 48 hours
- Check status: https://dnschecker.org

### **Step 5: Verify in Vercel**

1. Go back to Vercel Dashboard → Domains
2. Vercel will automatically verify DNS
3. Once verified, SSL will provision (1-2 minutes)
4. Domain status will show: ✅ **Valid Configuration**

---

## 🔒 **SSL Certificate**

**Automatic!** Vercel provisions SSL certificates automatically:

- ✅ Main domain: `privydesk.com`
- ✅ WWW: `www.privydesk.com`
- ✅ Wildcard: `*.privydesk.com`

All subdomains get SSL instantly. No manual work needed.

---

## 🌍 **Environment Variables**

### **Add Production Environment Variables**

1. Go to Vercel Dashboard → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:

```
VITE_SUPABASE_PROJECT_ID=mgnuddfytlbtgprckzto
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbnVkZGZ5dGxidGdwcmNrenRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTQ1NTIsImV4cCI6MjA4NTIzMDU1Mn0.6fEtY6dITMdyqnhVurrEJdcmwTOTgBHNmYNt4NoaC6U
VITE_SUPABASE_URL=https://mgnuddfytlbtgprckzto.supabase.co
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_APP_VERSION=1.0.0
```

4. Select **Production** environment
5. Click **Save**

### **Redeploy**

After adding environment variables:

```bash
vercel --prod
```

Or trigger redeploy from Vercel Dashboard.

---

## 🧪 **Testing**

### **Test Main Domain**

```bash
# Should load your app
curl -I https://privydesk.com

# Should return 200 OK with SSL
```

### **Test Subdomains**

```bash
# Should work automatically
curl -I https://test-org.privydesk.com
curl -I https://acme-corp.privydesk.com
curl -I https://anything.privydesk.com

# All should return 200 OK
```

### **Test Email**

```bash
# Send test email
# Should still work on Hostinger
```

---

## 🔄 **Continuous Deployment**

### **Connect to GitHub (Recommended)**

1. Go to Vercel Dashboard → Your Project
2. Go to **Settings** → **Git**
3. Click **Connect Git Repository**
4. Select your GitHub repo
5. Click **Connect**

**Now:**
- Every push to `main` → Auto-deploys to production
- Every PR → Gets preview deployment
- Zero manual work!

### **Manual Deployment**

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

---

## 📊 **Vercel Free Tier Limits**

| Feature | Free Tier | Pro ($20/month) |
|---------|-----------|-----------------|
| **Bandwidth** | 100 GB/month | 1 TB/month |
| **Build Time** | 100 hours/month | 400 hours/month |
| **Serverless Functions** | 100 GB-hours | 1000 GB-hours |
| **Domains** | Unlimited | Unlimited |
| **Team Members** | 1 | Unlimited |
| **Commercial Use** | ❌ No | ✅ Yes |

**Important:** Free tier is for **personal/hobby projects only**. For commercial use (PrivyDesk), you need Pro ($20/month).

---

## 💰 **Cost Breakdown**

### **Free Tier (Testing/Hobby):**
- Vercel: **$0/month**
- Hostinger Email: **$1-2/month**
- **Total: $1-2/month**

### **Pro Tier (Commercial):**
- Vercel: **$20/month**
- Hostinger Email: **$1-2/month**
- **Total: $21-22/month**

---

## 🎯 **Subdomain Routing**

### **How Subdomains Work**

Vercel automatically routes ALL subdomains to your app. You just need to detect the subdomain in your code:

```typescript
// In your app (e.g., App.tsx or a middleware)
const hostname = window.location.hostname;
const parts = hostname.split('.');

// Extract subdomain
let subdomain = null;
if (parts.length >= 3) {
  // e.g., acme-corp.privydesk.com
  subdomain = parts[0];
} else if (parts.length === 2) {
  // e.g., privydesk.com (no subdomain)
  subdomain = null;
}

// Load organization by subdomain
if (subdomain) {
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', subdomain)
    .single();
  
  if (org) {
    // Apply organization branding
    // Load organization data
  }
}
```

### **Example Flow**

1. User visits: `https://acme-corp.privydesk.com`
2. Vercel routes to your app
3. App detects subdomain: `acme-corp`
4. App queries Supabase for organization with slug `acme-corp`
5. App loads organization branding and data
6. User sees customized PrivyDesk instance

**No manual subdomain creation needed!**

---

## 🔧 **Troubleshooting**

### **Build Fails**

```bash
# Check build locally first
npm run build

# If it works locally, check Vercel logs
vercel logs
```

### **Domain Not Working**

1. Check DNS propagation: https://dnschecker.org
2. Verify DNS records in Hostinger
3. Check Vercel domain status
4. Wait up to 48 hours for full propagation

### **SSL Not Provisioning**

1. Verify domain is correctly configured
2. Check DNS records are correct
3. Wait 5-10 minutes
4. Contact Vercel support if still failing

### **Email Stopped Working**

1. Check MX records are still present
2. Verify SPF/DKIM records
3. Test email sending and receiving
4. Check Hostinger email panel

### **Environment Variables Not Working**

1. Verify variables are added in Vercel Dashboard
2. Check variable names match (case-sensitive)
3. Redeploy after adding variables
4. Check Vercel deployment logs

---

## 📚 **Useful Commands**

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm [deployment-url]

# Link local project to Vercel
vercel link

# Pull environment variables locally
vercel env pull
```

---

## 🎉 **Success Checklist**

- [ ] Vercel CLI installed
- [ ] Logged in to Vercel
- [ ] App deployed to Vercel
- [ ] Preview URL working
- [ ] Custom domain added in Vercel
- [ ] DNS records updated in Hostinger
- [ ] Email records kept intact
- [ ] DNS propagated (check dnschecker.org)
- [ ] SSL certificate active
- [ ] Main domain working (privydesk.com)
- [ ] Subdomains working (*.privydesk.com)
- [ ] Email still working
- [ ] Environment variables added
- [ ] GitHub connected (optional)
- [ ] Production deployment successful

---

## 🆘 **Need Help?**

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [DNS Checker](https://dnschecker.org)

---

**Last Updated:** February 1, 2026
