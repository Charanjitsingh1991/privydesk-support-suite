# Hostinger Setup Guide for PrivyDesk

## Overview

PrivyDesk uses Hostinger for hosting and requires API access for automated subdomain creation and SSL management.

---

## 🔑 **Getting Hostinger API Key**

### **Step 1: Access Hostinger API**

1. Log in to your Hostinger account: https://hostinger.com
2. Go to **Dashboard** → **API**
3. If API access is not available, contact Hostinger support to enable it
4. Generate a new API key

### **Step 2: Configure API Key**

Add to your `.env` file:

```env
VITE_HOSTINGER_API_URL="https://api.hostinger.com/v1"
VITE_HOSTINGER_API_KEY="your-hostinger-api-key-here"
```

**⚠️ Important:** Never commit your API key to Git!

---

## 🌐 **Subdomain Configuration**

### **Automatic Subdomain Creation**

When a new organization is created, PrivyDesk automatically:

1. Generates a slug from organization name
2. Creates subdomain: `{slug}.privydesk.com`
3. Configures DNS records
4. Enables SSL certificate (free via Hostinger)

### **Manual Subdomain Setup (If API Not Available)**

If Hostinger API is not configured, you'll need to manually create subdomains:

1. Log in to Hostinger control panel
2. Go to **Domains** → **privydesk.com** → **Subdomains**
3. Click **Create Subdomain**
4. Enter subdomain name (e.g., `acme-corp`)
5. Set document root to: `/public_html/privydesk`
6. Click **Create**

---

## 🔒 **SSL Certificate Management**

### **Automatic SSL (Recommended)**

Hostinger provides **free SSL certificates** for all subdomains via Let's Encrypt.

**Features:**
- Automatic provisioning
- Auto-renewal every 90 days
- No configuration needed

### **Verify SSL is Enabled**

1. Go to Hostinger control panel
2. Navigate to **SSL** section
3. Verify `*.privydesk.com` has SSL enabled
4. Check expiry date

### **Manual SSL Installation (If Needed)**

If SSL is not auto-enabled:

1. Go to **SSL** → **Install SSL**
2. Select domain: `*.privydesk.com` (wildcard)
3. Choose **Let's Encrypt** (free)
4. Click **Install**
5. Wait 5-10 minutes for propagation

---

## 🔧 **DNS Configuration**

### **Main Domain DNS Records**

Ensure these records exist for `privydesk.com`:

```
Type: A
Name: @
Value: [Your Hostinger IP]
TTL: 3600

Type: A
Name: *
Value: [Your Hostinger IP]
TTL: 3600

Type: CNAME
Name: www
Value: privydesk.com
TTL: 3600
```

### **Custom Domain DNS Records**

For custom domains (e.g., `support.acme.com`), users need to add:

```
Type: TXT
Name: _privydesk.support.acme.com
Value: privydesk-verify={token}
TTL: 3600

Type: CNAME
Name: support.acme.com
Value: custom.privydesk.com
TTL: 3600
```

---

## 📋 **Hostinger API Endpoints Used**

### **1. Create Subdomain**

```http
POST /v1/domains/subdomains
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "domain": "privydesk.com",
  "subdomain": "acme-corp",
  "document_root": "/public_html/privydesk"
}
```

### **2. Enable SSL**

```http
POST /v1/ssl/install
Authorization: Bearer {API_KEY}
Content-Type: application/json

{
  "domain": "acme-corp.privydesk.com",
  "type": "letsencrypt"
}
```

### **3. Delete Subdomain**

```http
DELETE /v1/domains/subdomains/{subdomain}
Authorization: Bearer {API_KEY}
```

---

## 🧪 **Testing**

### **Test Subdomain Creation**

```bash
# Create test organization
curl -X POST https://api.privydesk.com/organizations \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Corp"}'

# Verify subdomain is accessible
curl -I https://test-corp.privydesk.com

# Should return 200 OK with SSL
```

### **Test Custom Domain**

```bash
# Add custom domain
curl -X POST https://api.privydesk.com/domains \
  -H "Content-Type: application/json" \
  -d '{"domain": "support.test.com"}'

# Get DNS instructions
curl https://api.privydesk.com/domains/{id}/dns

# Verify domain
curl -X POST https://api.privydesk.com/domains/{id}/verify
```

---

## 🚨 **Troubleshooting**

### **Subdomain Not Created**

**Problem:** API returns error when creating subdomain

**Solutions:**
1. Check API key is valid
2. Verify API access is enabled in Hostinger
3. Check subdomain doesn't already exist
4. Ensure document root path is correct

### **SSL Not Working**

**Problem:** HTTPS shows certificate error

**Solutions:**
1. Wait 10-15 minutes for SSL propagation
2. Check SSL is enabled in Hostinger panel
3. Verify DNS records are correct
4. Try force SSL renewal via API

### **DNS Not Propagating**

**Problem:** Subdomain not accessible

**Solutions:**
1. Wait up to 48 hours for DNS propagation
2. Check DNS records in Hostinger panel
3. Use `nslookup` to verify DNS:
   ```bash
   nslookup acme-corp.privydesk.com
   ```
4. Clear DNS cache:
   ```bash
   ipconfig /flushdns  # Windows
   sudo dscacheutil -flushcache  # macOS
   ```

---

## 📊 **Monitoring**

### **SSL Certificate Expiry**

Set up a cron job to check expiring certificates:

```typescript
// Run daily
async function checkExpiringSSL() {
  const expiring = await SSLService.getExpiringCertificates(30);
  
  for (const domain of expiring) {
    await SSLService.renewSSL(domain);
  }
}
```

### **Subdomain Health Check**

Monitor subdomain accessibility:

```typescript
async function healthCheck(subdomain: string) {
  try {
    const response = await fetch(`https://${subdomain}`);
    return response.ok;
  } catch {
    return false;
  }
}
```

---

## 💰 **Costs**

### **Hostinger Pricing**

- **Business Plan**: $3.99/month
  - Unlimited subdomains
  - Free SSL certificates
  - 100 GB storage
  - Unlimited bandwidth

- **API Access**: Free (included in Business plan)

### **SSL Certificates**

- **Let's Encrypt**: Free
- **Auto-renewal**: Free
- **Wildcard SSL**: Free

---

## 🔗 **Resources**

- [Hostinger API Documentation](https://api.hostinger.com/docs)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [DNS Propagation Checker](https://dnschecker.org/)
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html)

---

## 📞 **Support**

If you encounter issues:

1. **Hostinger Support**: https://hostinger.com/support
2. **PrivyDesk Docs**: [Documentation/](../)
3. **GitHub Issues**: https://github.com/Charanjitsingh1991/privydesk-support-suite/issues

---

**Last Updated:** February 1, 2026
