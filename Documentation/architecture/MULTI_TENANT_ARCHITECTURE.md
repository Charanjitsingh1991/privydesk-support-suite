# PrivyDesk Multi-Tenant Architecture

## Overview

PrivyDesk uses a **single-database, multi-tenant architecture** where all organizations share one Supabase PostgreSQL database, but data is completely isolated using Row-Level Security (RLS) policies.

---

## 🏗️ Database Architecture

### Single Database for All Organizations

```
┌─────────────────────────────────────────────────┐
│         SINGLE SUPABASE DATABASE                │
├─────────────────────────────────────────────────┤
│  Organizations Table                            │
│  ├─ Acme Corp (id: uuid-1, plan: 'pro')       │
│  ├─ Tech Startup (id: uuid-2, plan: 'free')   │
│  └─ Enterprise Co (id: uuid-3, plan: 'ent')   │
├─────────────────────────────────────────────────┤
│  Tickets Table                                  │
│  ├─ Ticket #1 (org_id: uuid-1) ← Acme Corp    │
│  ├─ Ticket #2 (org_id: uuid-1) ← Acme Corp    │
│  ├─ Ticket #3 (org_id: uuid-2) ← Tech Startup │
│  └─ Ticket #4 (org_id: uuid-3) ← Enterprise   │
├─────────────────────────────────────────────────┤
│  Users/Profiles Table                           │
│  ├─ John (org_id: uuid-1) ← Acme Corp         │
│  ├─ Jane (org_id: uuid-2) ← Tech Startup      │
│  └─ Bob (org_id: uuid-3) ← Enterprise Co      │
└─────────────────────────────────────────────────┘
```

### Key Principles

1. **One Database** - All organizations in single PostgreSQL instance
2. **Organization ID** - Every table has `organization_id` foreign key
3. **RLS Policies** - Automatic data filtering at database level
4. **Complete Isolation** - Organizations cannot see each other's data

---

## 🔒 Data Isolation with Row-Level Security (RLS)

### How RLS Works

Every query automatically filters by the user's organization:

```sql
-- User queries tickets
SELECT * FROM tickets;

-- RLS automatically adds WHERE clause
SELECT * FROM tickets 
WHERE organization_id = (
  SELECT organization_id FROM profiles 
  WHERE id = auth.uid()
);
```

### Example RLS Policies

**Tickets Table:**
```sql
-- Users can only see tickets from their organization
CREATE POLICY "Users see own org tickets"
ON tickets FOR SELECT
USING (organization_id = (
  SELECT organization_id FROM profiles 
  WHERE id = auth.uid()
));

-- Users can only insert tickets for their organization
CREATE POLICY "Users create tickets in own org"
ON tickets FOR INSERT
WITH CHECK (organization_id = (
  SELECT organization_id FROM profiles 
  WHERE id = auth.uid()
));

-- Users can only update tickets in their organization
CREATE POLICY "Users update own org tickets"
ON tickets FOR UPDATE
USING (organization_id = (
  SELECT organization_id FROM profiles 
  WHERE id = auth.uid()
));
```

**Messages Table:**
```sql
-- Users can only see messages from tickets in their org
CREATE POLICY "Users see own org messages"
ON messages FOR SELECT
USING (
  ticket_id IN (
    SELECT id FROM tickets 
    WHERE organization_id = (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid()
    )
  )
);
```

---

## 💾 Storage Architecture

### Supabase Storage Buckets

All files stored in Supabase Storage with organization-based folder structure:

```
┌─────────────────────────────────────────────────┐
│         SUPABASE STORAGE                        │
├─────────────────────────────────────────────────┤
│  Bucket: attachments                            │
│  ├─ {org-uuid-1}/                              │
│  │   ├─ tickets/                               │
│  │   │   ├─ ticket-123-file.pdf               │
│  │   │   └─ ticket-456-image.png              │
│  │   └─ avatars/                               │
│  │       └─ user-789-avatar.jpg                │
│  ├─ {org-uuid-2}/                              │
│  │   └─ tickets/                               │
│  │       └─ ticket-abc-doc.docx                │
│  └─ {org-uuid-3}/                              │
│      └─ tickets/                               │
│          └─ ticket-xyz-report.xlsx             │
├─────────────────────────────────────────────────┤
│  Bucket: email-imports                          │
│  ├─ {org-uuid-1}/                              │
│  │   └─ import-2026-01-15.pst (TEMPORARY)     │
│  ├─ {org-uuid-2}/                              │
│  │   └─ import-2026-01-20.pst (TEMPORARY)     │
│  └─ {org-uuid-3}/                              │
│      └─ import-2026-02-01.pst (TEMPORARY)     │
└─────────────────────────────────────────────────┘
```

### Storage Policies

```sql
-- Users can only access files from their organization
CREATE POLICY "Users access own org files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'attachments' AND
  (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM profiles 
    WHERE id = auth.uid()
  )
);
```

### Storage Limits by Plan

| Plan | Storage Limit | Usage |
|------|---------------|-------|
| **Free** | 1 GB | Ticket attachments, avatars |
| **Starter** | 5 GB | Ticket attachments, avatars, basic imports |
| **Professional** | 50 GB | All attachments, email imports, archives |
| **Enterprise** | Unlimited | Everything + dedicated storage |

---

## 📧 PST Email Import Storage Strategy

### Problem: PST Files are HUGE (5-20 GB each)

### Solution: Temporary Storage + Extraction

```
┌─────────────────────────────────────────────────┐
│  PST IMPORT PROCESS                             │
├─────────────────────────────────────────────────┤
│  1. User uploads PST file (10 GB)              │
│     ↓                                           │
│  2. Stored temporarily in Supabase Storage     │
│     Location: email-imports/{org-id}/file.pst  │
│     ↓                                           │
│  3. Backend parses PST file                    │
│     - Extract emails (subject, body, date)     │
│     - Extract attachments                      │
│     ↓                                           │
│  4. Save to database                           │
│     - Emails → email_archive table (text)      │
│     - Attachments → email-attachments bucket   │
│     ↓                                           │
│  5. DELETE original PST file                   │
│     Result: 10 GB → ~500 MB stored             │
└─────────────────────────────────────────────────┘
```

### Storage Efficiency

**Example:**
- **Original PST**: 10 GB
- **Extracted emails**: 50,000 emails × 5 KB avg = 250 MB
- **Extracted attachments**: 500 attachments × 500 KB avg = 250 MB
- **Total stored**: ~500 MB (95% reduction!)

### Database Schema for Email Archive

```sql
CREATE TABLE email_archive (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  import_job_id UUID NOT NULL,
  subject TEXT,
  body TEXT,
  from_email TEXT,
  to_emails TEXT[],
  cc_emails TEXT[],
  sent_at TIMESTAMPTZ,
  has_attachments BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE email_attachments (
  id UUID PRIMARY KEY,
  email_id UUID REFERENCES email_archive(id),
  filename TEXT,
  file_size BIGINT,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 📊 Usage Tracking

### Subscription Usage Table

```sql
CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY,
  organization_id UUID UNIQUE NOT NULL,
  tickets_used_this_month INTEGER DEFAULT 0,
  emails_sent_this_month INTEGER DEFAULT 0,
  storage_used_mb NUMERIC DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Automatic Usage Tracking

**Trigger on Ticket Creation:**
```sql
CREATE OR REPLACE FUNCTION increment_ticket_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE subscription_usage
  SET tickets_used_this_month = tickets_used_this_month + 1,
      updated_at = now()
  WHERE organization_id = NEW.organization_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_usage_trigger
AFTER INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION increment_ticket_usage();
```

### Monthly Reset (Cron Job)

```sql
-- Reset usage counters on 1st of each month
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE subscription_usage
  SET tickets_used_this_month = 0,
      emails_sent_this_month = 0,
      last_reset_at = now();
END;
$$ LANGUAGE plpgsql;
```

---

## 🚦 Plan Limit Enforcement

### Check Limits Before Actions

```typescript
// Before creating a ticket
const canCreateTicket = await supabase.rpc('check_plan_limit', {
  org_id: organizationId,
  limit_type: 'max_tickets_monthly'
});

if (!canCreateTicket) {
  throw new Error('Monthly ticket limit reached. Upgrade your plan.');
}
```

### Database Function

```sql
CREATE OR REPLACE FUNCTION check_plan_limit(
  org_id UUID,
  limit_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  org_plan TEXT;
  plan_limit INTEGER;
  current_usage INTEGER;
BEGIN
  -- Get organization's plan
  SELECT plan INTO org_plan FROM organizations WHERE id = org_id;
  
  -- Get plan limit (-1 = unlimited)
  SELECT (limits->>limit_type)::INTEGER INTO plan_limit
  FROM subscription_plans WHERE slug = org_plan;
  
  IF plan_limit = -1 THEN RETURN TRUE; END IF;
  
  -- Check current usage
  CASE limit_type
    WHEN 'max_tickets_monthly' THEN
      SELECT tickets_used_this_month INTO current_usage
      FROM subscription_usage WHERE organization_id = org_id;
    WHEN 'max_users' THEN
      SELECT COUNT(*) INTO current_usage
      FROM profiles WHERE organization_id = org_id AND is_active = true;
    -- ... other cases
  END CASE;
  
  RETURN current_usage < plan_limit;
END;
$$ LANGUAGE plpgsql;
```

---

## 💰 Plan Limits

| Feature | Free | Starter | Professional | Enterprise |
|---------|------|---------|--------------|------------|
| **Team Members** | 3 | 5 | 20 | Unlimited |
| **Tickets/Month** | 100 | 1,000 | 10,000 | Unlimited |
| **Storage** | 1 GB | 5 GB | 50 GB | Unlimited |
| **Emails/Month** | 200 | 2,000 | 10,000 | Unlimited |
| **KB Articles** | 10 | 50 | Unlimited | Unlimited |

---

## 🔐 Security Benefits

### Why Single Database is Secure

1. **RLS Enforcement** - PostgreSQL enforces policies at database level
2. **No Application Logic** - Can't bypass security in code
3. **Automatic Filtering** - Every query filtered by organization
4. **Audit Trail** - All access logged by Supabase
5. **Battle-Tested** - Used by thousands of SaaS apps

### Security Checklist

- ✅ RLS enabled on all tables
- ✅ Policies tested for each user role
- ✅ No direct database access from frontend
- ✅ API calls authenticated via Supabase Auth
- ✅ Storage policies enforce organization isolation
- ✅ Audit logs track all data access

---

## 💡 Benefits of Multi-Tenant Architecture

### Cost Efficiency
- **One database** = Lower infrastructure costs
- **Shared resources** = Better resource utilization
- **Supabase Pro**: $25/month for ALL organizations

### Scalability
- **Horizontal scaling** - Supabase handles automatically
- **No per-org overhead** - Add customers without new databases
- **Connection pooling** - Efficient database connections

### Maintenance
- **Single schema** - One migration for all customers
- **Centralized backups** - One backup covers everyone
- **Easy monitoring** - One dashboard for all metrics

### Performance
- **Shared cache** - Common queries cached once
- **Index optimization** - Benefits all organizations
- **Query optimization** - Improvements help everyone

---

## 📈 Scaling Strategy

### Current: Supabase Pro ($25/month)
- 100 GB storage included
- 500 GB bandwidth
- Unlimited API requests
- Daily backups

### Growth Path

**0-100 organizations:**
- Single Supabase Pro instance
- Cost: $25/month

**100-1,000 organizations:**
- Upgrade to Supabase Team ($599/month)
- Dedicated resources
- Priority support

**1,000+ organizations:**
- Supabase Enterprise (custom pricing)
- Dedicated infrastructure
- Custom SLA
- Multi-region deployment

---

## 🎯 Best Practices

### Always Include organization_id
```typescript
// ✅ Good
const tickets = await supabase
  .from('tickets')
  .select('*')
  .eq('organization_id', orgId);

// ❌ Bad (RLS will filter, but explicit is better)
const tickets = await supabase
  .from('tickets')
  .select('*');
```

### Test RLS Policies
```sql
-- Test as different users
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'user-uuid';

-- Try to access other org's data (should fail)
SELECT * FROM tickets WHERE organization_id = 'other-org-uuid';
```

### Monitor Usage
```typescript
// Check if approaching limits
const usage = await supabase
  .from('subscription_usage')
  .select('*')
  .eq('organization_id', orgId)
  .single();

if (usage.tickets_used_this_month > planLimit * 0.8) {
  // Warn user: 80% of limit reached
}
```

---

## 🔗 Related Documentation

- [Database Schema](./PROJECT_BLUEPRINT.md)
- [Authentication](./AUTHENTICATION.md)
- [API Documentation](../api/COMPLETE_API_DOCUMENTATION.md)
- [Supabase Setup](../guides/SUPABASE_SETUP.md)

---

**Last Updated:** February 1, 2026
