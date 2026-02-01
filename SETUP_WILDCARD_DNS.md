# Setup Wildcard DNS for Vercel

## 🚨 **CRITICAL: DNS Configuration Required**

The subdomain automation tests failed because wildcard DNS is not configured yet.

**Error:** `ENOTFOUND acme-corp.privydesk.com`

**Cause:** No wildcard DNS record pointing `*.privydesk.com` to Vercel

---

## ✅ **Solution: Add Wildcard DNS Record**

### **Step 1: Find Your Vercel DNS Values**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **privydesk** project
3. Go to **Settings** → **Domains**
4. You should see your domain: `privydesk.com`
5. Vercel will show DNS records needed

**Vercel provides these values:**
```
Type: A
Name: @
Value: 76.76.21.241

Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

---

### **Step 2: Add DNS Records in Hostinger**

1. **Log in to Hostinger**
   - Go to https://hostinger.com
   - Log in to your account

2. **Navigate to DNS Zone Editor**
   - Go to: **Domains** → **privydesk.com** → **DNS Zone Editor**

3. **Add/Update A Record (Main Domain)**
   ```
   Type: A
   Name: @ (or leave blank for root)
   Value: 76.76.21.241
   TTL: 3600
   ```
   Click **Add Record** or **Update**

4. **Add CNAME Record (Wildcard Subdomains)** ⭐ **CRITICAL**
   ```
   Type: CNAME
   Name: *
   Value: cname.vercel-dns.com
   TTL: 3600
   ```
   Click **Add Record**

5. **Keep Email Records** (Don't delete these!)
   ```
   Type: MX
   Name: @
   Value: mx1.hostinger.com
   Priority: 10

   Type: MX
   Name: @
   Value: mx2.hostinger.com
   Priority: 20

   Type: TXT (SPF)
   Name: @
   Value: v=spf1 include:_spf.hostinger.com ~all

   Type: TXT (DKIM)
   Name: default._domainkey
   Value: [your existing DKIM key]
   ```

6. **Save Changes**

---

### **Step 3: Wait for DNS Propagation**

- **Minimum:** 5-10 minutes
- **Typical:** 15-30 minutes
- **Maximum:** 48 hours (rare)

**Check propagation:**
```bash
# Check if wildcard DNS is working
nslookup acme-corp.privydesk.com

# Or use online tool
# https://dnschecker.org
```

---

### **Step 4: Re-run Tests**

After DNS propagates:

```bash
node test-subdomain.js
```

**Expected results:**
```
📡 Test 1: DNS Resolution
✅ DNS Resolution: SUCCESS
   IP Address: 76.76.21.241
   Duration: 45ms

🔒 Test 2: HTTPS Connection & SSL Certificate
✅ HTTPS Connection: SUCCESS
   Status Code: 200
   Duration: 234ms

📜 SSL Certificate Details:
   Subject: *.privydesk.com
   Issuer: Let's Encrypt
   Valid From: [date]
   Valid To: [date]
   Days Remaining: 73 days
```

---

## 🎯 **What Each Record Does**

### **A Record (Main Domain)**
```
@ → 76.76.21.241
```
- Points `privydesk.com` to Vercel
- Main site loads from Vercel

### **CNAME Record (Wildcard)** ⭐ **MOST IMPORTANT**
```
* → cname.vercel-dns.com
```
- Points ALL subdomains to Vercel
- `acme-corp.privydesk.com` → Vercel
- `any-subdomain.privydesk.com` → Vercel
- Enables automatic subdomain routing

### **MX Records (Email)**
```
@ → mx1.hostinger.com
@ → mx2.hostinger.com
```
- Email routing (keep these!)
- Email continues working on Hostinger

---

## 🔍 **Verify DNS Configuration**

### **Check Main Domain**
```bash
nslookup privydesk.com
```
**Expected:** Should return Vercel IP (76.76.21.241)

### **Check Wildcard Subdomain**
```bash
nslookup acme-corp.privydesk.com
```
**Expected:** Should return Vercel IP (76.76.21.241)

### **Check Another Subdomain**
```bash
nslookup test-org.privydesk.com
```
**Expected:** Should return Vercel IP (76.76.21.241)

---

## ⚠️ **Common Issues**

### **Issue 1: DNS Not Propagating**

**Symptom:** `ENOTFOUND` error after 30+ minutes

**Solutions:**
1. Wait longer (up to 48 hours)
2. Clear DNS cache: `ipconfig /flushdns`
3. Try different DNS server: `nslookup acme-corp.privydesk.com 8.8.8.8`
4. Check DNS records are correct in Hostinger

### **Issue 2: Wrong IP Address**

**Symptom:** DNS resolves but to wrong IP

**Solutions:**
1. Verify A record points to correct Vercel IP
2. Check for conflicting DNS records
3. Remove old A records

### **Issue 3: Wildcard Not Working**

**Symptom:** Main domain works but subdomains don't

**Solutions:**
1. Verify CNAME record for `*` exists
2. Check CNAME value is `cname.vercel-dns.com`
3. Remove any conflicting subdomain records

### **Issue 4: Email Stopped Working**

**Symptom:** Can't send/receive email

**Solutions:**
1. Verify MX records still exist
2. Check SPF/DKIM records intact
3. Test email: send to support@privydesk.com

---

## 📋 **Complete DNS Configuration Checklist**

- [ ] A record for @ → 76.76.21.241
- [ ] CNAME record for * → cname.vercel-dns.com
- [ ] MX records for email (kept from before)
- [ ] SPF record (kept from before)
- [ ] DKIM record (kept from before)
- [ ] Saved changes in Hostinger
- [ ] Waited for DNS propagation (15-30 min)
- [ ] Verified with nslookup
- [ ] Re-ran test-subdomain.js
- [ ] Tested in browser

---

## 🎉 **After DNS is Configured**

Once DNS propagates, you'll have:

✅ **Main domain:** `privydesk.com` → Vercel
✅ **All subdomains:** `*.privydesk.com` → Vercel
✅ **Automatic SSL:** Wildcard certificate
✅ **Email:** Still works on Hostinger
✅ **Zero manual work:** New subdomains work instantly

---

## 🔗 **Quick Links**

- [Hostinger DNS Manager](https://hpanel.hostinger.com/domains)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [DNS Checker](https://dnschecker.org)
- [What's My DNS](https://www.whatsmydns.net)

---

**Last Updated:** February 1, 2026
