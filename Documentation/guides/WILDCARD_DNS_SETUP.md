# Wildcard DNS Setup for PrivyDesk

## ✅ **Confirmed by Hostinger Support**

**Key Information:**
- ❌ No API for DNS/domain management on shared hosting
- ✅ Wildcard DNS can be set up manually in hPanel
- ⚠️ Free SSL is **per subdomain**, not wildcard
- ✅ Each subdomain needs individual SSL certificate

---

## 🌐 **Step 1: Setup Wildcard DNS**

### **In Hostinger hPanel:**

1. **Navigate to DNS Zone Editor**
   - Go to: **Domains** → **privydesk.com** → **DNS Zone Editor**

2. **Add Wildcard A Record**
   ```
   Type: A
   Name/Host: *
   Value: [YOUR_SERVER_IP]
   TTL: 3600 (or default)
   ```

3. **Get Your Server IP**
   - Option A: Check existing A record for `privydesk.com`
   - Option B: Go to **Websites** → **privydesk.com** → **Details**
   - Option C: Run: `nslookup privydesk.com`

4. **Save Changes**
   - Click **Add Record** or **Save**
   - DNS propagation: 5 minutes to 48 hours (usually < 1 hour)

### **Verify DNS Propagation:**

```bash
# Check if wildcard is working
nslookup test-org.privydesk.com

# Should return the same IP as privydesk.com
```

---

## 🔒 **Step 2: SSL Certificate Strategy**

### **Important: No Wildcard SSL on Free Plan**

Hostinger's free SSL (Let's Encrypt) is **per subdomain**, not wildcard.

**Options:**

### **Option A: Per-Subdomain SSL (Free)** ⭐ **RECOMMENDED**

**Process:**
1. Create subdomain in hPanel
2. Wait 5-10 minutes
3. SSL auto-provisions for that specific subdomain
4. Repeat for each new organization

**Pros:**
- ✅ Free
- ✅ Automatic
- ✅ Reliable

**Cons:**
- ❌ Manual per subdomain
- ❌ Not instant

**Implementation:**
```typescript
// When organization is created:
1. Generate slug: "acme-corp"
2. Admin creates subdomain: acme-corp.privydesk.com
3. Wait for SSL (5-10 min)
4. Subdomain ready with HTTPS
```

---

### **Option B: Paid Wildcard SSL**

**Purchase wildcard SSL certificate:**
- Covers: `*.privydesk.com`
- Cost: ~$50-100/year
- Install via: **Websites** → **privydesk.com** → **Advanced SSL**

**Pros:**
- ✅ All subdomains covered instantly
- ✅ No per-subdomain setup

**Cons:**
- ❌ Annual cost
- ❌ Manual renewal

**Providers:**
- Sectigo (formerly Comodo)
- DigiCert
- Let's Encrypt (via certbot with DNS challenge)

---

### **Option C: Let's Encrypt Wildcard (Advanced)**

**Requirements:**
- SSH access to server
- Certbot installed
- DNS API access (or manual DNS challenge)

**Setup:**
```bash
# Install certbot
sudo apt-get install certbot

# Request wildcard certificate
sudo certbot certonly --manual \
  --preferred-challenges dns \
  -d privydesk.com \
  -d *.privydesk.com

# Follow prompts to add TXT record
# Certificate saved to: /etc/letsencrypt/live/privydesk.com/

# Install in Hostinger via Advanced SSL
```

**Pros:**
- ✅ Free
- ✅ Covers all subdomains
- ✅ Auto-renewal possible

**Cons:**
- ❌ Requires technical setup
- ❌ Need SSH access
- ❌ Manual DNS challenge

---

## 🎯 **Recommended Approach**

### **Phase 1: Manual Subdomain + Free SSL**

**Current Implementation:**

1. **User creates organization** → System generates slug
2. **Admin receives notification** with subdomain name
3. **Admin creates subdomain in hPanel:**
   - Go to: **Domains** → **privydesk.com** → **Subdomains**
   - Click: **Create Subdomain**
   - Enter: `acme-corp`
   - Document root: `/public_html/privydesk`
   - Save
4. **SSL auto-provisions** (5-10 minutes)
5. **Subdomain ready:** `https://acme-corp.privydesk.com`

**Time per subdomain:** 2-3 minutes manual work + 5-10 minutes SSL

---

### **Phase 2: Wildcard DNS + Routing (Future)**

**Once wildcard DNS is set up:**

1. **Wildcard DNS active:** `*.privydesk.com` → Server IP
2. **Application routing:**
   - All subdomains hit your app
   - App extracts subdomain from URL
   - Looks up organization by slug
   - Serves correct content
3. **SSL:** Still per-subdomain OR paid wildcard

**Benefits:**
- No subdomain creation needed
- Instant availability
- Fully automated

**Challenge:**
- Still need SSL per subdomain (unless paid wildcard)

---

## 📋 **Implementation Checklist**

### **Immediate Setup:**

- [ ] Get server IP for privydesk.com
- [ ] Add wildcard A record in DNS Zone Editor
- [ ] Verify DNS propagation
- [ ] Test with dummy subdomain

### **Per Organization:**

- [ ] User creates organization
- [ ] System generates slug
- [ ] Admin creates subdomain in hPanel
- [ ] Wait for SSL provisioning
- [ ] Verify HTTPS works
- [ ] Notify user

### **Future Optimization:**

- [ ] Implement application-level subdomain routing
- [ ] Consider paid wildcard SSL certificate
- [ ] Automate admin notifications
- [ ] Create admin dashboard for pending subdomains

---

## 🔧 **Technical Implementation**

### **1. Wildcard DNS Record**

```
Type: A
Name: *
Value: [YOUR_IP]
TTL: 3600
```

This makes ALL subdomains resolve to your server.

### **2. Web Server Configuration**

**Apache (.htaccess):**
```apache
RewriteEngine On

# Capture subdomain
RewriteCond %{HTTP_HOST} ^([^.]+)\.privydesk\.com$ [NC]
RewriteRule ^(.*)$ /index.html?org=%1 [QSA,L]
```

**Nginx:**
```nginx
server {
    listen 443 ssl;
    server_name ~^(?<org>.+)\.privydesk\.com$;
    
    root /var/www/privydesk;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        try_files $uri /index.html;
    }
}
```

### **3. Application Routing**

```typescript
// Extract organization from subdomain
const host = window.location.hostname;
const subdomain = host.split('.')[0];

// Look up organization
const { data: org } = await supabase
  .from('organizations')
  .select('*')
  .eq('slug', subdomain)
  .single();

// Load organization data
if (org) {
  // Apply branding, load tickets, etc.
}
```

---

## 🧪 **Testing**

### **Test Wildcard DNS:**

```bash
# Should all return same IP
nslookup privydesk.com
nslookup test1.privydesk.com
nslookup test2.privydesk.com
nslookup anything.privydesk.com
```

### **Test SSL:**

```bash
# Check SSL certificate
curl -I https://acme-corp.privydesk.com

# Should return 200 OK with valid SSL
```

### **Test Application Routing:**

```bash
# Visit different subdomains
https://org1.privydesk.com
https://org2.privydesk.com

# Should load correct organization data
```

---

## 💰 **Cost Analysis**

### **Free Option (Current):**
- Wildcard DNS: Free
- Per-subdomain SSL: Free (Let's Encrypt)
- Manual work: 2-3 min per subdomain

### **Paid Wildcard SSL:**
- Wildcard DNS: Free
- Wildcard SSL: $50-100/year
- Manual work: One-time setup
- All subdomains: Instant SSL

**Break-even:** ~20-30 organizations/year

---

## 📞 **Support**

**If you need help:**

1. **DNS Issues:**
   - Check DNS propagation: https://dnschecker.org
   - Wait up to 48 hours
   - Clear DNS cache: `ipconfig /flushdns`

2. **SSL Issues:**
   - Wait 10-15 minutes after subdomain creation
   - Check in hPanel: **Websites** → **SSL**
   - Force SSL renewal if needed

3. **Hostinger Support:**
   - Live chat: https://hostinger.com/support
   - Mention: "Wildcard DNS for shared hosting"

---

## 🎯 **Summary**

**What Works:**
- ✅ Wildcard DNS (manual setup in hPanel)
- ✅ Per-subdomain free SSL (automatic)
- ✅ Application-level routing (code-based)

**What Doesn't Work:**
- ❌ API for subdomain creation
- ❌ Free wildcard SSL certificate
- ❌ Automated subdomain provisioning

**Best Solution:**
1. Set up wildcard DNS once
2. Create subdomains manually as needed
3. Let SSL auto-provision
4. Use application routing for organization detection

**Time Investment:**
- One-time: 10 minutes (wildcard DNS setup)
- Per org: 2-3 minutes (subdomain creation)
- SSL: Automatic (5-10 min wait)

---

**Last Updated:** February 1, 2026
