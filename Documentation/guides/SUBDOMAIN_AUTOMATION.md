# Subdomain Automation Implementation

## 🎉 **Automatic Subdomain Routing is Now Live!**

With Vercel deployment, PrivyDesk now supports **automatic subdomain-based organization routing**. No manual subdomain creation needed!

---

## 🚀 **How It Works**

### **1. Subdomain Detection**

When a user visits any subdomain (e.g., `acme-corp.privydesk.com`):

1. **`useSubdomain` hook** extracts subdomain from URL
2. **`OrganizationContext`** automatically looks up organization by slug
3. **Organization data** is loaded from Supabase
4. **Branding is applied** (colors, logo, name)

### **2. Organization Context**

Every component can access organization data:

```typescript
import { useOrganization } from '@/contexts/OrganizationContext';

function MyComponent() {
  const { organization, loading, error, subdomain, isSubdomain } = useOrganization();
  
  if (loading) return <div>Loading organization...</div>;
  if (error) return <div>Organization not found</div>;
  if (!organization) return <div>No organization</div>;
  
  return (
    <div>
      <h1>{organization.name}</h1>
      <p>Slug: {organization.slug}</p>
      <p>Plan: {organization.plan}</p>
    </div>
  );
}
```

### **3. Automatic Branding**

When organization is loaded:
- ✅ Primary color applied to UI
- ✅ Logo displayed in banner
- ✅ Page title updated
- ✅ Organization name shown

---

## 📦 **Components Created**

### **1. `useSubdomain` Hook**

**File:** `src/hooks/useSubdomain.ts`

**Purpose:** Detects and extracts subdomain from URL

**Returns:**
```typescript
{
  subdomain: string | null;      // e.g., "acme-corp"
  isSubdomain: boolean;           // true if on subdomain
  hostname: string;               // full hostname
  baseDomain: string;             // e.g., "privydesk.com"
}
```

**Handles:**
- ✅ Production domains (`acme-corp.privydesk.com`)
- ✅ Localhost development
- ✅ Vercel preview deployments
- ✅ Excludes `www` subdomain

---

### **2. `OrganizationContext`**

**File:** `src/contexts/OrganizationContext.tsx`

**Purpose:** Manages organization state globally

**Features:**
- ✅ Automatic organization lookup by subdomain
- ✅ Loads organization data from Supabase
- ✅ Applies branding automatically
- ✅ Handles loading and error states
- ✅ Provides refresh function

**Usage:**
```typescript
import { useOrganization } from '@/contexts/OrganizationContext';

const { organization, loading, error } = useOrganization();
```

---

### **3. `SubdomainBanner`**

**File:** `src/components/SubdomainBanner.tsx`

**Purpose:** Displays organization branding at top of page

**Features:**
- ✅ Shows organization logo
- ✅ Displays organization name
- ✅ Shows subdomain URL
- ✅ Displays plan type
- ✅ Branded colors
- ✅ Loading skeleton
- ✅ Error handling

**Usage:**
```typescript
import { SubdomainBanner } from '@/components/SubdomainBanner';

<SubdomainBanner />
```

---

### **4. `SubdomainGuard`**

**File:** `src/components/SubdomainGuard.tsx`

**Purpose:** Protects routes that require organization context

**Features:**
- ✅ Ensures organization is loaded
- ✅ Shows error if organization not found
- ✅ Redirects to main site if needed
- ✅ Loading state
- ✅ Retry functionality

**Usage:**
```typescript
import { SubdomainGuard } from '@/components/SubdomainGuard';

<SubdomainGuard requireOrganization={true}>
  <YourProtectedComponent />
</SubdomainGuard>
```

---

### **5. `SubdomainRedirect`**

**File:** `src/components/SubdomainRedirect.tsx`

**Purpose:** Redirects users based on subdomain context

**Features:**
- ✅ Redirects subdomain homepage to login
- ✅ Preserves main site homepage
- ✅ Handles authentication state

---

## 🔧 **Integration**

### **App.tsx Updated**

```typescript
import { OrganizationProvider } from '@/contexts/OrganizationContext';

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizationProvider>  {/* Added */}
          <TooltipProvider>
            {/* ... rest of app */}
          </TooltipProvider>
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
```

---

## 🎯 **User Flow**

### **Scenario 1: New Organization Signup**

1. User signs up on main site: `privydesk.com`
2. User completes onboarding, creates organization: "Acme Corp"
3. System generates slug: `acme-corp`
4. System saves to database
5. **User can immediately access:** `https://acme-corp.privydesk.com`
6. **No manual subdomain creation needed!**

### **Scenario 2: Accessing Organization Portal**

1. User visits: `https://acme-corp.privydesk.com`
2. App detects subdomain: `acme-corp`
3. App queries database for organization with slug `acme-corp`
4. Organization found and loaded
5. Branding applied (colors, logo)
6. User sees branded login page
7. After login, user sees branded dashboard

### **Scenario 3: Organization Not Found**

1. User visits: `https://invalid-org.privydesk.com`
2. App detects subdomain: `invalid-org`
3. App queries database - no match
4. Error message displayed
5. Option to return to main site

---

## 🎨 **Branding Application**

When organization is loaded, the following branding is applied:

### **1. Colors**

```typescript
// Primary color applied to CSS variable
document.documentElement.style.setProperty(
  '--organization-primary',
  organization.primary_color
);
```

### **2. Logo**

```typescript
// Logo displayed in SubdomainBanner
<img src={organization.logo_url} alt={organization.name} />
```

### **3. Page Title**

```typescript
// Page title updated
document.title = `${organization.name} - PrivyDesk`;
```

### **4. Custom Styling**

Components can use organization colors:

```typescript
<div style={{ backgroundColor: organization.primary_color }}>
  {/* Content */}
</div>
```

---

## 🔒 **Security**

### **Organization Isolation**

- ✅ Each subdomain loads only its organization's data
- ✅ RLS policies enforce data isolation
- ✅ Users can only access their organization's resources
- ✅ Cross-organization access prevented

### **Status Checking**

```typescript
// Only active organizations are loaded
.eq('status', 'active')
```

Suspended or cancelled organizations won't load.

---

## 🧪 **Testing**

### **Test Subdomain Detection**

```typescript
// Visit different URLs and check detection
console.log(useSubdomain());

// privydesk.com
// { subdomain: null, isSubdomain: false }

// acme-corp.privydesk.com
// { subdomain: "acme-corp", isSubdomain: true }

// www.privydesk.com
// { subdomain: null, isSubdomain: false }
```

### **Test Organization Loading**

1. Create test organization in database:
   ```sql
   INSERT INTO organizations (name, slug, status)
   VALUES ('Test Org', 'test-org', 'active');
   ```

2. Visit: `https://test-org.privydesk.com`

3. Verify:
   - ✅ Organization loads
   - ✅ Banner displays
   - ✅ Branding applied
   - ✅ Page title updated

### **Test Error Handling**

1. Visit: `https://nonexistent.privydesk.com`
2. Verify error message displays
3. Verify "Go to Main Site" button works

---

## 📊 **Database Schema**

### **Organizations Table**

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,  -- Used for subdomain
  custom_domain TEXT,
  domain_verified BOOLEAN DEFAULT false,
  primary_color TEXT DEFAULT '#6366f1',
  logo_url TEXT,
  plan plan_type DEFAULT 'free',
  status org_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast subdomain lookup
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);
```

---

## 🚀 **Next Steps**

### **1. Add SubdomainBanner to Layouts**

```typescript
import { SubdomainBanner } from '@/components/SubdomainBanner';

function Layout() {
  return (
    <div>
      <SubdomainBanner />  {/* Add this */}
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

### **2. Protect Organization-Specific Routes**

```typescript
import { SubdomainGuard } from '@/components/SubdomainGuard';

<Route
  path="/dashboard"
  element={
    <SubdomainGuard requireOrganization={true}>
      <Dashboard />
    </SubdomainGuard>
  }
/>
```

### **3. Use Organization Data in Components**

```typescript
import { useOrganization } from '@/contexts/OrganizationContext';

function Dashboard() {
  const { organization } = useOrganization();
  
  return (
    <div>
      <h1>Welcome to {organization?.name}</h1>
      {/* Use organization data */}
    </div>
  );
}
```

---

## 🎉 **Benefits**

### **For Admins:**
- ✅ **Zero manual work** - No subdomain creation needed
- ✅ **Instant availability** - Subdomains work immediately
- ✅ **Automatic SSL** - Vercel handles certificates
- ✅ **Scalable** - Unlimited organizations

### **For Users:**
- ✅ **Professional URLs** - `acme-corp.privydesk.com`
- ✅ **Branded experience** - Custom colors and logos
- ✅ **Fast access** - Direct organization portal
- ✅ **Isolated environment** - Secure and private

### **For Developers:**
- ✅ **Simple API** - `useOrganization()` hook
- ✅ **Automatic context** - Organization data everywhere
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Well-tested** - Error handling included

---

## 🔄 **Migration from Manual Subdomains**

If you had manual subdomains before:

1. ✅ **No migration needed** - Existing subdomains keep working
2. ✅ **New orgs automatic** - Future organizations work instantly
3. ✅ **Gradual transition** - Mix of manual and automatic is fine

---

## 📚 **Code Examples**

### **Example 1: Branded Dashboard**

```typescript
import { useOrganization } from '@/contexts/OrganizationContext';

function Dashboard() {
  const { organization, loading } = useOrganization();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <header style={{ backgroundColor: organization?.primary_color }}>
        <img src={organization?.logo_url} alt={organization?.name} />
        <h1>{organization?.name} Dashboard</h1>
      </header>
      
      <main>
        {/* Dashboard content */}
      </main>
    </div>
  );
}
```

### **Example 2: Organization-Specific Data**

```typescript
import { useOrganization } from '@/contexts/OrganizationContext';
import { useQuery } from '@tanstack/react-query';

function Tickets() {
  const { organization } = useOrganization();
  
  const { data: tickets } = useQuery({
    queryKey: ['tickets', organization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('organization_id', organization?.id);
      return data;
    },
    enabled: !!organization,
  });
  
  return <TicketList tickets={tickets} />;
}
```

### **Example 3: Conditional Rendering**

```typescript
import { useOrganization } from '@/contexts/OrganizationContext';

function Header() {
  const { isSubdomain, organization } = useOrganization();
  
  return (
    <header>
      {isSubdomain ? (
        // Subdomain header - show organization branding
        <div>
          <img src={organization?.logo_url} />
          <span>{organization?.name}</span>
        </div>
      ) : (
        // Main site header - show PrivyDesk branding
        <div>
          <img src="/logo.png" />
          <span>PrivyDesk</span>
        </div>
      )}
    </header>
  );
}
```

---

## 🆘 **Troubleshooting**

### **Organization Not Loading**

**Problem:** Subdomain detected but organization not loading

**Solutions:**
1. Check organization exists in database
2. Verify slug matches subdomain exactly
3. Check organization status is 'active'
4. Check database RLS policies
5. Check browser console for errors

### **Branding Not Applying**

**Problem:** Organization loads but branding doesn't apply

**Solutions:**
1. Check `primary_color` field in database
2. Verify CSS variable is set
3. Check component is using organization colors
4. Clear browser cache

### **Subdomain Not Detected**

**Problem:** `isSubdomain` is false when it should be true

**Solutions:**
1. Check DNS is configured correctly
2. Verify wildcard CNAME is set
3. Wait for DNS propagation (up to 48 hours)
4. Check `useSubdomain` hook logic
5. Test with `console.log(window.location.hostname)`

---

## 📈 **Performance**

### **Optimization**

- ✅ Organization data cached in React context
- ✅ Single database query per page load
- ✅ No redundant API calls
- ✅ Efficient subdomain parsing

### **Monitoring**

```typescript
// Add performance tracking
console.time('organization-load');
await loadOrganization();
console.timeEnd('organization-load');
```

---

**Last Updated:** February 1, 2026

**Status:** ✅ **Production Ready**
