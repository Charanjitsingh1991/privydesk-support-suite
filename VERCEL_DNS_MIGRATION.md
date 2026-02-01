# Migrate to Vercel DNS for True Subdomain Automation

## 🎯 **Goal**

Enable automatic wildcard subdomain routing (`*.privydesk.com`) while keeping email working on Hostinger.

---

## ⚠️ **Why This is Necessary**

Vercel **requires nameservers** for wildcard domains (`*.privydesk.com`). CNAME method only works for individual subdomains.

**Trade-off:**
- ✅ Get true automation (unlimited subdomains)
- ⚠️ Need to migrate DNS to Vercel
- ✅ Email will still work (we'll migrate the records)

---

## 📋 **Step-by-Step Migration**

### **Step 1: Get Your Current Email DNS Records from Hostinger**

Before changing anything, **copy your email DNS records**:

1. Log in to Hostinger
2. Go to **Domains** → **privydesk.com** → **DNS Zone Editor**
3. **Copy these records** (you'll need them):

```
# MX Records (Email routing)
Type: MX
Name: @
Value: mx1.hostinger.com
Priority: 10

Type: MX
Name: @
Value: mx2.hostinger.com
Priority: 20

# SPF Record (Email authentication)
Type: TXT
Name: @
Value: v=spf1 include:_spf.hostinger.com ~all

# DKIM Record (Email authentication)
Type: TXT
Name: default._domainkey
Value: [COPY THE FULL VALUE - it's long]

# DMARC Record (if you have one)
Type: TXT
Name: _dmarc
Value: [COPY THE VALUE]
```

**⚠️ CRITICAL:** Write down or screenshot these records before proceeding!

---

### **Step 2: Configure Vercel DNS (Before Changing Nameservers)**

1. In Vercel, with `*.privydesk.com` still showing "Invalid Configuration"
2. Click **"Save"** to accept using Vercel nameservers
3. Vercel will show you the nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
4. **Don't change nameservers yet!** First, add your email records in Vercel.

---

### **Step 3: Add Email Records in Vercel DNS**

1. In Vercel Dashboard, go to your project
2. Go to **Settings** → **Domains** → Click on `privydesk.com`
3. Look for **"DNS Records"** or **"Manage DNS"** section
4. Add your email records one by one:

**MX Records:**
```
Type: MX
Name: @
Value: mx1.hostinger.com
Priority: 10

Type: MX
Name: @
Value: mx2.hostinger.com
Priority: 20
```

**TXT Records:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.hostinger.com ~all

Type: TXT
Name: default._domainkey
Value: [paste your DKIM value]
```

**If you have DMARC:**
```
Type: TXT
Name: _dmarc
Value: [paste your DMARC value]
```

---

### **Step 4: Change Nameservers in Hostinger**

Now that email records are in Vercel, change nameservers:

1. Go to Hostinger
2. Go to **Domains** → **privydesk.com**
3. Find **"Nameservers"** section
4. Change from Hostinger nameservers to:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
5. Click **"Save"** or **"Update"**

**⚠️ Warning:** This will cause brief downtime (5-30 minutes) while DNS propagates.

---

### **Step 5: Wait for DNS Propagation**

- **Minimum:** 5-10 minutes
- **Typical:** 15-30 minutes
- **Maximum:** 48 hours

**Check propagation:**
```bash
nslookup privydesk.com
```

Should return Vercel's IP.

---

### **Step 6: Verify Everything Works**

**Test Website:**
```bash
# Main domain
curl -I https://privydesk.com

# Wildcard subdomains
curl -I https://acme-corp.privydesk.com
curl -I https://techstart.privydesk.com
curl -I https://any-subdomain.privydesk.com
```

All should return `200 OK`.

**Test Email:**
1. Send test email to: `support@privydesk.com`
2. Send test email from: `support@privydesk.com`
3. Both should work normally

---

## 🎉 **Result: True Automation**

After migration:

✅ **Wildcard subdomains work automatically**
- `acme-corp.privydesk.com` ✅
- `techstart.privydesk.com` ✅
- `any-new-org.privydesk.com` ✅ (instant!)

✅ **Email still works**
- `support@privydesk.com` ✅
- All MX/SPF/DKIM records migrated

✅ **SSL automatic**
- Wildcard certificate covers all subdomains

✅ **Zero manual work**
- Create organization in DB → Subdomain works instantly

---

## 🔄 **Alternative: Keep Hostinger DNS (Manual Subdomains)**

If you don't want to migrate to Vercel DNS:

1. Remove `*.privydesk.com` from Vercel
2. Add each subdomain individually in Vercel
3. Add corresponding CNAME in Hostinger for each

**Pros:**
- Email definitely keeps working
- You control DNS

**Cons:**
- Manual work per organization
- Not truly automated

---

## 📊 **Comparison**

| Aspect | Vercel DNS | Hostinger DNS |
|--------|-----------|---------------|
| **Wildcard subdomains** | ✅ Automatic | ❌ Manual per subdomain |
| **Email** | ✅ Works (after migration) | ✅ Works |
| **DNS control** | Vercel | Hostinger |
| **Setup complexity** | Medium | Low |
| **Automation** | ✅ True automation | ❌ Manual |
| **Downtime** | 5-30 min during migration | None |

---

## 💡 **My Recommendation**

**Use Vercel DNS** for true automation. The migration is straightforward and email will keep working once you add the records.

**Steps:**
1. Copy email DNS records from Hostinger (5 min)
2. Add email records in Vercel DNS (5 min)
3. Change nameservers in Hostinger (2 min)
4. Wait for propagation (15-30 min)
5. Test everything (5 min)

**Total time:** ~1 hour including propagation

**Benefit:** Unlimited organizations with instant subdomains forever!

---

## 🆘 **Rollback Plan**

If something goes wrong:

1. Go back to Hostinger
2. Change nameservers back to Hostinger's:
   ```
   ns1.dns-parking.com
   ns2.dns-parking.com
   ```
   (Or whatever Hostinger's default nameservers are)
3. Wait for DNS to propagate back
4. Everything returns to previous state

---

## 🔗 **Useful Links**

- [Vercel DNS Documentation](https://vercel.com/docs/projects/domains/working-with-domains)
- [Hostinger Nameserver Guide](https://support.hostinger.com/en/articles/1583227-how-to-change-nameservers)
- [DNS Propagation Checker](https://dnschecker.org)

---

**Last Updated:** February 1, 2026
