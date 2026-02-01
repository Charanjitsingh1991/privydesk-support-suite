# Free Email Hosting Services for Custom Domains

## 🎯 **Goal**

Find free email hosting to migrate from Hostinger, enabling Vercel wildcard subdomain automation.

---

## ✅ **Free Email Services**

### **1. Zoho Mail** ⚠️ **NO LONGER FREE**

**Update:** Zoho Mail discontinued their free plan for custom domains in 2022.

**Current Pricing:**
- Lite Plan: $1/user/month (billed annually)
- Standard Plan: $3/user/month
- Professional Plan: $6/user/month

**Features:**
- ✅ Custom domain support
- ✅ Webmail + IMAP/POP3
- ✅ Mobile apps (iOS/Android)
- ✅ No ads
- ✅ Professional features

**Cost:** $1-6/user/month (NOT FREE)

**Website:** https://zoho.com/mail/zohomail-pricing.html

---

### **2. ImprovMX** ⭐ **TRULY FREE - RECOMMENDED**

**Features:**
- ✅ Completely free
- ✅ Unlimited email aliases
- ✅ Email forwarding to Gmail/Outlook
- ✅ Custom domain support
- ✅ No user limit
- ✅ Simple setup (just MX records)

**Limits:**
- ⚠️ Forwarding only (not full mailbox)
- ⚠️ Can't send FROM custom domain (free plan)
- ⚠️ No webmail interface

**Perfect for:**
- Email forwarding to existing Gmail
- Simple receive-only setup
- Unlimited aliases

**Setup:**
1. Sign up at https://improvmx.com
2. Add domain: privydesk.com
3. Add MX records
4. Create aliases (support@privydesk.com → your@gmail.com)

**Cost:** $0/month (forever free)

**Website:** https://improvmx.com

---

### **3. Migadu Free Tier**

**Features:**
- ✅ Free tier available
- ✅ Custom domain support
- ✅ 10 outgoing emails/day
- ✅ IMAP/SMTP access
- ✅ Webmail included
- ✅ Multiple domains

**Limits:**
- 10 outgoing emails per day
- 200 MB storage
- 1 GB daily traffic

**Perfect for:**
- Low-volume email
- Testing/development
- Personal projects

**Cost:** $0/month (free tier) or $19/year (unlimited)

**Website:** https://migadu.com

---

### **4. Yandex Mail for Domain** ⚠️ **LIMITED AVAILABILITY**

**Features:**
- ✅ Free custom domain email
- ✅ Unlimited users
- ✅ 10 GB storage per user
- ✅ Webmail + mobile apps
- ✅ No ads

**Limits:**
- ⚠️ Not available in all countries
- ⚠️ Russian company (privacy concerns)
- ⚠️ Interface in Russian/English

**Cost:** $0/month

**Website:** https://domain.yandex.com

---

### **5. Cloudflare Email Routing** ⭐ **TRULY FREE**

**Features:**
- ✅ Completely free forever
- ✅ Unlimited email addresses
- ✅ Email forwarding to any email
- ✅ Custom domain support
- ✅ Simple setup
- ✅ Reliable (Cloudflare infrastructure)
- ✅ No user limit

**How it works:**
- Forward custom domain emails to Gmail/Outlook
- Receive at custom domain, reply from Gmail
- Can configure Gmail to send FROM custom domain

**Limits:**
- ⚠️ Forwarding only (not full mailbox)
- ⚠️ Requires Cloudflare DNS (but free)

**Perfect for:**
- Email forwarding needs
- Using with existing Gmail/Outlook
- Unlimited addresses

**Setup:**
1. Add domain to Cloudflare (free)
2. Enable Email Routing
3. Add destination email (your Gmail)
4. Create email addresses (support@privydesk.com → your@gmail.com)

**Cost:** $0/month (forever free)

**Website:** https://www.cloudflare.com/products/email-routing/

---

### **6. Gmail + Email Forwarding (Hybrid)**

**Features:**
- ✅ Use existing Gmail
- ✅ Forward custom domain to Gmail
- ✅ Send from custom domain via Gmail
- ✅ Free
- ✅ Familiar interface

**Setup:**
1. Use ImprovMX or similar for forwarding
2. Configure Gmail to send from custom domain
3. Add SMTP settings in Gmail

**Limits:**
- ⚠️ Not a true custom email service
- ⚠️ Requires existing Gmail account

**Cost:** $0/month

---

## 📊 **Comparison**

| Service | Cost | Users | Storage | Send/Receive | Webmail | Best For |
|---------|------|-------|---------|--------------|---------|----------|
| **Cloudflare Email** | Free | Unlimited | N/A | ❌/✅ | ❌ | Forwarding ⭐ |
| **ImprovMX** | Free | Unlimited | N/A | ❌/✅ | ❌ | Forwarding ⭐ |
| **Migadu** | Free | Unlimited | 200MB | ✅/✅ (10/day) | ✅ | Low volume |
| **Zoho Mail** | $1/user | 5+ | 5GB/user | ✅/✅ | ✅ | Paid option |
| **Gmail Hybrid** | Free | 1 | 15GB | ✅/✅ | ✅ | Personal |

---

## 🎯 **Recommendation: Cloudflare Email Routing (Truly Free)**

**Why Cloudflare Email Routing:**
1. ✅ Completely free forever
2. ✅ Unlimited email addresses
3. ✅ Reliable (Cloudflare infrastructure)
4. ✅ Simple setup
5. ✅ Works with existing Gmail/Outlook
6. ✅ Can send FROM custom domain via Gmail
7. ✅ No user limits

**Perfect for PrivyDesk:**
- support@privydesk.com → forward to your Gmail
- sales@privydesk.com → forward to your Gmail
- admin@privydesk.com → forward to your Gmail
- Unlimited addresses

**Bonus:** You'll already be using Cloudflare DNS for wildcard subdomains!

---

## 📋 **Migration Plan: Hostinger → Cloudflare (Free)**

### **Step 1: Sign Up for Cloudflare**

1. Go to https://cloudflare.com
2. Sign up (free account)
3. Click "Add a Site"
4. Enter: privydesk.com
5. Choose Free plan

### **Step 2: Cloudflare Scans DNS**

Cloudflare automatically imports existing DNS records from Hostinger.

Verify these are present:
- A record for @ (root domain)
- CNAME for www
- Any other records

### **Step 3: Add Vercel Records**

In Cloudflare DNS:

```
Type: A
Name: @
Value: 76.76.21.241
Proxy: ON (orange cloud)

Type: CNAME
Name: *
Value: cname.vercel-dns.com
Proxy: ON (orange cloud)
```

### **Step 4: Enable Email Routing**

1. In Cloudflare, go to **Email** → **Email Routing**
2. Click **Get Started**
3. Add destination email (your Gmail): `your@gmail.com`
4. Verify destination email (check Gmail for verification link)
5. Cloudflare automatically adds MX records

### **Step 5: Create Email Addresses**

In Email Routing, create custom addresses:

```
support@privydesk.com → your@gmail.com
sales@privydesk.com → your@gmail.com
admin@privydesk.com → your@gmail.com
noreply@privydesk.com → your@gmail.com
```

All forward to your existing Gmail!

### **Step 6: Change Nameservers**

Cloudflare shows you nameservers:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

1. Go to Hostinger
2. Find Nameservers section
3. Change to Cloudflare nameservers
4. Save

### **Step 7: Wait for DNS Propagation**

- Minimum: 5-10 minutes
- Typical: 15-30 minutes
- Maximum: 48 hours

### **Step 8: Configure Gmail to Send FROM Custom Domain**

1. In Gmail, go to Settings → Accounts
2. Click "Add another email address"
3. Enter: support@privydesk.com
4. Use SMTP: smtp.gmail.com
5. Port: 587
6. Username: your@gmail.com
7. Password: App Password (generate in Google Account)

Now you can send FROM support@privydesk.com via Gmail!

### **Step 9: Verify Everything**

**Test website:**
- https://privydesk.com ✅
- https://acme-corp.privydesk.com ✅
- https://techstart.privydesk.com ✅
- https://any-new-org.privydesk.com ✅

**Test email:**
- Send TO: support@privydesk.com (should arrive in Gmail) ✅
- Send FROM: support@privydesk.com via Gmail ✅
- Check spam folder ✅

---

## 🎉 **Final Result**

After migration to Zoho + Vercel DNS:

✅ **Wildcard subdomains work automatically**
- Create org in DB → Subdomain works instantly
- No manual Vercel configuration
- Unlimited organizations

✅ **Email works perfectly**
- Professional email on Zoho
- 5 users free forever
- Mobile apps + webmail

✅ **Zero monthly cost**
- Zoho Mail: Free
- Vercel: Free (Hobby plan)
- Total: $0/month

✅ **True automation achieved**
- Instant subdomain availability
- Automatic SSL certificates
- No manual work per organization

---

## ⏱️ **Time Investment**

**One-time setup:**
- Zoho signup: 10 min
- Domain verification: 5 min
- MX records setup: 10 min
- Create email accounts: 10 min
- Migrate to Vercel DNS: 15 min
- DNS propagation: 30 min
- Testing: 10 min
- **Total: ~90 minutes**

**Benefit:**
- Unlimited automatic subdomains forever
- Professional email forever
- $0/month forever

---

## 🔗 **Resources**

- [Zoho Mail Free Plan](https://zoho.com/mail/zohomail-pricing.html)
- [Zoho Setup Guide](https://www.zoho.com/mail/help/adminconsole/domain-setup.html)
- [ImprovMX](https://improvmx.com)
- [Migadu](https://migadu.com)
- [Vercel DNS Documentation](https://vercel.com/docs/projects/domains)

---

**Last Updated:** February 1, 2026
