# Custom Domain Architecture - PrivyDesk

## Overview

PrivyDesk supports custom domains for Professional and Enterprise customers, allowing them to use their own domain (e.g., `support.acme.com`) instead of the default subdomain (`acme-corp.privydesk.com`).

---

## 🏗️ Architecture

### **Default Subdomain (All Plans)**

Every organization gets a subdomain automatically:

```
Organization: Acme Corp
Slug: acme-corp
URL: https://acme-corp.privydesk.com
```

**How it works:**
1. User creates organization with name "Acme Corp"
2. System generates slug: `acme-corp` (lowercase, hyphens)
3. Subdomain is immediately available
4. No DNS configuration required

### **Custom Domain (Professional/Enterprise)**

Organizations can use their own domain:

```
Organization: Acme Corp
Custom Domain: support.acme.com
URL: https://support.acme.com
```

**How it works:**
1. User adds custom domain in settings
2. System generates verification token
3. User configures DNS records
4. System verifies DNS configuration
5. SSL certificate provisioned automatically
6. Domain becomes active

---

## 📋 Domain Setup Process

### **Step 1: Add Domain**

User enters their domain in Settings → Domain:

```typescript
// Frontend
await BrandingService.addCustomDomain(orgId, 'support.acme.com');

// Backend creates record
{
  id: 'domain-uuid',
  organization_id: 'org-uuid',
  domain: 'support.acme.com',
  verification_token: 'abc123xyz',
  is_verified: false,
  is_active: false,
  ssl_status: 'pending'
}
```

### **Step 2: DNS Configuration**

User must add these DNS records:

**TXT Record (Verification):**
```
Type: TXT
Name: _privydesk.support.acme.com
Value: privydesk-verify=abc123xyz
TTL: 3600
```

**CNAME Record (Routing):**
```
Type: CNAME
Name: support.acme.com (or @)
Value: custom.privydesk.com
TTL: 3600
```

**A Record (Alternative to CNAME):**
```
Type: A
Name: support.acme.com (or @)
Value: 76.76.21.21 (PrivyDesk IP)
TTL: 3600
```

### **Step 3: Verification**

User clicks "Verify Domain" button:

```typescript
// Frontend
const result = await BrandingService.verifyCustomDomain(domainId);

// Backend checks DNS
1. Lookup TXT record: _privydesk.support.acme.com
2. Verify token matches: privydesk-verify=abc123xyz
3. Lookup CNAME/A record: support.acme.com
4. Verify points to: custom.privydesk.com or 76.76.21.21
5. Update database: is_verified = true
```

### **Step 4: SSL Provisioning**

After verification, SSL certificate is automatically provisioned:

```typescript
// Backend (using Let's Encrypt)
1. Request certificate for support.acme.com
2. Complete ACME challenge
3. Install certificate
4. Update database: ssl_status = 'active', ssl_expires_at = now + 90 days
5. Set up auto-renewal
```

### **Step 5: Activation**

User sets domain as active:

```typescript
// Frontend
await BrandingService.setActiveDomain(domainId);

// Backend
1. Deactivate all other domains for this org
2. Set this domain as active
3. Update routing configuration
```

---

## 🔄 Request Routing

### **How Requests are Routed**

```
┌─────────────────────────────────────────────────┐
│  Incoming Request                               │
│  Host: support.acme.com                         │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Hostinger / Reverse Proxy                      │
│  - Receives request                             │
│  - Checks Host header                           │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  PrivyDesk Backend                              │
│  - Extract domain from Host header              │
│  - Query: SELECT * FROM custom_domains          │
│    WHERE domain = 'support.acme.com'            │
│    AND is_active = true                         │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Organization Lookup                            │
│  - Found: organization_id = 'org-uuid'          │
│  - Load organization data                       │
│  - Load branding settings                       │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Render Response                                │
│  - Apply custom branding                        │
│  - Show organization's tickets                  │
│  - Use organization's settings                  │
└─────────────────────────────────────────────────┘
```

### **Middleware Implementation**

```typescript
// src/middleware/domainResolver.ts
export async function resolveDomain(req: Request): Promise<Organization | null> {
  const host = req.headers.get('host');
  
  // Check if custom domain
  if (!host.endsWith('.privydesk.com')) {
    // Lookup custom domain
    const { data: domain } = await supabase
      .from('custom_domains')
      .select('organization_id, organizations(*)')
      .eq('domain', host)
      .eq('is_active', true)
      .eq('is_verified', true)
      .single();
    
    if (domain) {
      return domain.organizations;
    }
  }
  
  // Fall back to subdomain
  const subdomain = host.split('.')[0];
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', subdomain)
    .single();
  
  return org;
}
```

---

## 🔒 DNS Verification

### **Verification Methods**

**1. TXT Record Verification (Recommended)**
```typescript
async function verifyTxtRecord(domain: string, token: string): Promise<boolean> {
  const txtRecord = `_privydesk.${domain}`;
  
  // Use DNS lookup service (e.g., Google DNS API)
  const response = await fetch(
    `https://dns.google/resolve?name=${txtRecord}&type=TXT`
  );
  
  const data = await response.json();
  const records = data.Answer?.map(a => a.data) || [];
  
  return records.some(r => r.includes(`privydesk-verify=${token}`));
}
```

**2. CNAME/A Record Verification**
```typescript
async function verifyCnameRecord(domain: string): Promise<boolean> {
  const response = await fetch(
    `https://dns.google/resolve?name=${domain}&type=CNAME`
  );
  
  const data = await response.json();
  const cname = data.Answer?.[0]?.data;
  
  return cname === 'custom.privydesk.com.';
}
```

**3. HTTP File Verification (Alternative)**
```typescript
async function verifyHttpFile(domain: string, token: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${domain}/.well-known/privydesk-verification.txt`);
    const content = await response.text();
    return content.trim() === token;
  } catch {
    return false;
  }
}
```

---

## 🔐 SSL Certificate Management

### **Let's Encrypt Integration**

```typescript
// Using ACME protocol
import { ACME } from 'acme-client';

async function provisionSSL(domain: string): Promise<void> {
  const client = new ACME.Client({
    directoryUrl: ACME.directory.letsencrypt.production,
    accountKey: await ACME.forge.createPrivateKey(),
  });

  // Create certificate order
  const order = await client.createOrder({
    identifiers: [{ type: 'dns', value: domain }],
  });

  // Complete challenges
  const authorizations = await client.getAuthorizations(order);
  for (const auth of authorizations) {
    const challenge = auth.challenges.find(c => c.type === 'http-01');
    await client.completeChallenge(challenge);
  }

  // Finalize order
  const [key, csr] = await ACME.forge.createCsr({
    commonName: domain,
  });

  await client.finalizeOrder(order, csr);
  const cert = await client.getCertificate(order);

  // Install certificate
  await installCertificate(domain, cert, key);
}
```

### **Certificate Renewal**

```typescript
// Cron job runs daily
async function renewExpiringCertificates(): Promise<void> {
  const { data: domains } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('is_verified', true)
    .lt('ssl_expires_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days

  for (const domain of domains) {
    await provisionSSL(domain.domain);
    
    await supabase
      .from('custom_domains')
      .update({
        ssl_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        ssl_renewed_at: new Date(),
      })
      .eq('id', domain.id);
  }
}
```

---

## 📊 Database Schema

```sql
-- Custom domains table
CREATE TABLE custom_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  verification_token TEXT NOT NULL,
  verification_method TEXT DEFAULT 'txt', -- 'txt', 'cname', 'http'
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  ssl_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'expired', 'failed'
  ssl_expires_at TIMESTAMPTZ,
  ssl_renewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_custom_domains_organization_id ON custom_domains(organization_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_custom_domains_active ON custom_domains(is_active, is_verified);

-- RLS Policies
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage domains"
  ON custom_domains FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

---

## 🚦 Plan Restrictions

| Feature | Free | Starter | Professional | Enterprise |
|---------|------|---------|--------------|------------|
| **Custom Domain** | ❌ | ❌ | ✅ 1 domain | ✅ Unlimited |
| **SSL Certificate** | ❌ | ❌ | ✅ Auto | ✅ Auto |
| **Custom Branding** | ❌ | ❌ | ✅ | ✅ |
| **White-label** | ❌ | ❌ | ❌ | ✅ |

### **Enforcement**

```typescript
async function checkDomainLimit(orgId: string): Promise<boolean> {
  const { data: org } = await supabase
    .from('organizations')
    .select('plan')
    .eq('id', orgId)
    .single();

  // Free/Starter: No custom domains
  if (org.plan === 'free' || org.plan === 'starter') {
    throw new Error('Custom domains require Professional or Enterprise plan');
  }

  // Professional: 1 domain limit
  if (org.plan === 'pro') {
    const { count } = await supabase
      .from('custom_domains')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    if (count >= 1) {
      throw new Error('Domain limit reached. Upgrade to Enterprise for unlimited domains.');
    }
  }

  // Enterprise: Unlimited
  return true;
}
```

---

## 🧪 Testing Strategy

### **Unit Tests**
- Domain validation
- DNS record parsing
- Token generation
- Plan limit enforcement

### **Integration Tests**
- Domain CRUD operations
- DNS verification flow
- SSL provisioning
- Domain routing

### **E2E Tests**
- Complete domain setup workflow
- DNS configuration UI
- Verification process
- Custom domain access

---

## 🔧 Implementation Checklist

### **Backend**
- [ ] Real DNS lookup service integration
- [ ] Let's Encrypt ACME client
- [ ] Certificate storage and management
- [ ] Auto-renewal cron job
- [ ] Domain routing middleware
- [ ] Plan limit enforcement

### **Frontend**
- [x] Domain management UI
- [x] DNS instructions display
- [x] Verification status tracking
- [ ] SSL certificate status
- [ ] Real-time verification updates

### **Infrastructure**
- [ ] Reverse proxy configuration (Hostinger)
- [ ] Wildcard SSL for *.privydesk.com
- [ ] Custom domain SSL storage
- [ ] DNS propagation monitoring
- [ ] Certificate renewal monitoring

### **Testing**
- [x] Basic UI tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] DNS verification tests
- [ ] SSL provisioning tests

---

## 📚 Related Documentation

- [Multi-Tenant Architecture](./MULTI_TENANT_ARCHITECTURE.md)
- [Branding & White-label](../guides/BRANDING_SETUP.md)
- [SSL Certificate Guide](../guides/SSL_SETUP.md)

---

**Last Updated:** February 1, 2026
