# Final Subdomain Solution (Keeping Email Working)

## 🎯 **The Reality**

**Problem:** Hostinger email is tied to hosting infrastructure, not just DNS records.

**Result:** ANY nameserver change (Vercel, Cloudflare, etc.) = Email breaks ❌

**Options:**
1. ❌ Wildcard with nameserver change → Email breaks
2. ✅ Manual subdomains with CNAME → Email works
3. ✅ Automate manual process via Vercel API → Email works + Automation

---

## ✅ **Best Solution: Automate via Vercel API**

Instead of manually adding subdomains in Vercel dashboard, **automate it via Vercel API** when creating organizations.

### **How It Works:**

```
1. User creates organization in your app
2. Your backend calls Vercel API
3. Vercel API adds subdomain automatically
4. Your backend adds CNAME in Hostinger API (if available)
5. Subdomain works in 1-2 minutes
```

**Result:**
- ✅ Automated (no manual dashboard work)
- ✅ Email keeps working (nameservers stay on Hostinger)
- ✅ Each subdomain added programmatically
- ⚠️ Still requires CNAME per subdomain in Hostinger

---

## 📋 **Implementation: Vercel API Integration**

### **Step 1: Get Vercel API Token**

1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
2. Create new token
3. Name it: "PrivyDesk Subdomain Automation"
4. Copy the token
5. Add to `.env`:
   ```
   VERCEL_API_TOKEN=your_token_here
   VERCEL_PROJECT_ID=your_project_id
   VERCEL_TEAM_ID=your_team_id (if using team)
   ```

### **Step 2: Create Subdomain Service**

```typescript
// src/lib/services/vercelSubdomainService.ts

interface VercelDomainResponse {
  name: string;
  verified: boolean;
  verification?: any[];
}

export class VercelSubdomainService {
  private apiToken: string;
  private projectId: string;
  private teamId?: string;

  constructor() {
    this.apiToken = import.meta.env.VITE_VERCEL_API_TOKEN;
    this.projectId = import.meta.env.VITE_VERCEL_PROJECT_ID;
    this.teamId = import.meta.env.VITE_VERCEL_TEAM_ID;
  }

  /**
   * Add subdomain to Vercel project
   */
  async addSubdomain(subdomain: string, baseDomain: string): Promise<VercelDomainResponse> {
    const domain = `${subdomain}.${baseDomain}`;
    
    const url = this.teamId
      ? `https://api.vercel.com/v10/projects/${this.projectId}/domains?teamId=${this.teamId}`
      : `https://api.vercel.com/v10/projects/${this.projectId}/domains`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: domain,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add domain: ${error.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  /**
   * Check if subdomain exists in Vercel
   */
  async checkSubdomain(subdomain: string, baseDomain: string): Promise<boolean> {
    const domain = `${subdomain}.${baseDomain}`;
    
    const url = this.teamId
      ? `https://api.vercel.com/v9/projects/${this.projectId}/domains/${domain}?teamId=${this.teamId}`
      : `https://api.vercel.com/v9/projects/${this.projectId}/domains/${domain}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    });

    return response.ok;
  }

  /**
   * Remove subdomain from Vercel
   */
  async removeSubdomain(subdomain: string, baseDomain: string): Promise<void> {
    const domain = `${subdomain}.${baseDomain}`;
    
    const url = this.teamId
      ? `https://api.vercel.com/v9/projects/${this.projectId}/domains/${domain}?teamId=${this.teamId}`
      : `https://api.vercel.com/v9/projects/${this.projectId}/domains/${domain}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to remove domain: ${error.error?.message || 'Unknown error'}`);
    }
  }
}
```

### **Step 3: Integrate with Organization Creation**

```typescript
// In your organization creation handler

import { VercelSubdomainService } from '@/lib/services/vercelSubdomainService';

async function createOrganization(name: string, slug: string) {
  // 1. Create organization in database
  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name,
      slug,
      status: 'active',
    })
    .select()
    .single();

  if (error) throw error;

  // 2. Add subdomain to Vercel automatically
  try {
    const vercelService = new VercelSubdomainService();
    await vercelService.addSubdomain(slug, 'privydesk.com');
    
    console.log(`✅ Subdomain ${slug}.privydesk.com added to Vercel`);
  } catch (error) {
    console.error('Failed to add subdomain to Vercel:', error);
    // Don't fail organization creation if Vercel API fails
    // Admin can add manually later
  }

  // 3. Show instructions to add CNAME in Hostinger
  return {
    organization: org,
    dnsInstructions: {
      type: 'CNAME',
      name: slug,
      value: 'cname.vercel-dns.com',
      ttl: 3600,
    },
  };
}
```

### **Step 4: Add CNAME in Hostinger (Manual or API)**

**Option A: Manual (Current)**
- Show instructions to user
- User adds CNAME in Hostinger hPanel

**Option B: Automated (If Hostinger API available)**
- Call Hostinger API to add CNAME
- Fully automated

---

## 🎯 **Result**

**With Vercel API automation:**

1. User creates organization "Acme Corp" with slug "acme-corp"
2. Your app:
   - ✅ Creates org in database (1 second)
   - ✅ Calls Vercel API to add `acme-corp.privydesk.com` (2 seconds)
   - ⚠️ Shows CNAME instructions for Hostinger (30 seconds manual)
3. User adds CNAME in Hostinger (one-time per org)
4. Subdomain works in 1-2 minutes

**Time:** ~3 minutes per organization (vs 15-45 minutes manual)

**Email:** ✅ Still works (nameservers unchanged)

---

## 📊 **Comparison**

| Method | Time | Email | Automation | Setup |
|--------|------|-------|------------|-------|
| **Wildcard (Nameserver)** | Instant | ❌ Breaks | ✅ Full | Complex |
| **Manual Dashboard** | 15-45 min | ✅ Works | ❌ None | None |
| **Vercel API** | 3 min | ✅ Works | ✅ Partial | Medium |

---

## 💡 **Alternative: Accept Manual Process**

If Vercel API automation is too complex:

**Simple workflow:**
1. User creates organization in your app
2. App shows instructions:
   ```
   To activate subdomain:
   1. Go to Vercel Dashboard
   2. Add domain: acme-corp.privydesk.com
   3. Go to Hostinger
   4. Add CNAME: acme-corp → cname.vercel-dns.com
   5. Wait 5 minutes
   ```
3. User follows instructions
4. Subdomain works

**Pros:**
- ✅ Simple to implement
- ✅ Email definitely works
- ✅ No API complexity

**Cons:**
- ⚠️ Manual work per organization
- ⚠️ Not truly automated

---

## 🎯 **My Recommendation**

**For MVP/Early Stage:**
- Accept manual process
- Show clear instructions
- 3-5 minutes per organization is acceptable

**For Scale (10+ organizations):**
- Implement Vercel API automation
- Reduces time to ~1 minute per org
- Better user experience

**For True Automation (100+ organizations):**
- Move to standalone email service (Google Workspace, Zoho)
- Use Vercel nameservers
- Full wildcard automation
- Cost: $1-6/user/month for email

---

## 📋 **Decision Matrix**

**Choose Manual if:**
- ✅ < 10 organizations expected
- ✅ Want simplest solution
- ✅ 3-5 min per org is acceptable

**Choose Vercel API if:**
- ✅ 10-100 organizations expected
- ✅ Want better UX
- ✅ Can implement API integration

**Choose Standalone Email if:**
- ✅ 100+ organizations expected
- ✅ Need true automation
- ✅ Can afford $1-6/user/month

---

## 🔗 **Resources**

- [Vercel API Documentation](https://vercel.com/docs/rest-api)
- [Vercel Domains API](https://vercel.com/docs/rest-api/endpoints/domains)
- [Hostinger API Documentation](https://api.hostinger.com/docs)

---

**Last Updated:** February 1, 2026
