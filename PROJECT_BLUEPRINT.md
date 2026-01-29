# PRIVYDESK - Project Blueprint

## Overview

PRIVYDESK is a multi-tenant SaaS customer support/helpdesk application built with modern web technologies. It provides ticket management, live chat widgets, email archiving, team management, and AI-powered ticket analysis.

---

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM v6
- **State Management**: React Query (TanStack Query) for server state
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Edge Functions**: Deno (Supabase Edge Functions)
- **File Storage**: Supabase Storage
- **Realtime**: Supabase Realtime for live updates

### AI Integration
- Uses multiple AI providers (Groq, OpenRouter, OpenAI) for:
  - Ticket analysis and categorization
  - Sentiment detection
  - Response suggestions
  - Tag extraction

---

## Project Structure

```
├── src/
│   ├── components/           # React components
│   │   ├── auth/            # Authentication forms (Login, Signup, 2FA)
│   │   ├── dashboard/       # Dashboard components by role
│   │   ├── layout/          # Layout components (Sidebar, TopNav, DashboardLayout)
│   │   ├── tickets/         # Ticket management components
│   │   ├── messages/        # Chat/messaging components
│   │   ├── widget/          # Embeddable chat widget components
│   │   ├── emails/          # Email archive components
│   │   ├── analytics/       # Analytics and reporting components
│   │   ├── settings/        # Settings page components
│   │   ├── security/        # Security features components
│   │   ├── team/            # Team management components
│   │   ├── onboarding/      # Onboarding flow components
│   │   └── ui/              # shadcn/ui base components
│   │
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state management
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useSession.ts    # Session/user data hooks
│   │   ├── useTicketAI.ts   # AI analysis hook
│   │   ├── useAnalytics.ts  # Analytics data hook
│   │   └── ...
│   │
│   ├── pages/               # Page components (routes)
│   │   ├── Dashboard.tsx
│   │   ├── Tickets.tsx
│   │   ├── TicketDetail.tsx
│   │   ├── Settings.tsx
│   │   └── ...
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── database.ts      # Database entity types
│   │   └── ...
│   │
│   ├── lib/                 # Utility functions
│   │   ├── utils.ts         # General utilities
│   │   └── security/        # Security utilities (sanitization, validation)
│   │
│   └── integrations/
│       └── supabase/
│           ├── client.ts    # Supabase client instance
│           └── types.ts     # Auto-generated database types
│
├── supabase/
│   ├── functions/           # Edge Functions
│   │   ├── analyze-ticket/  # AI ticket analysis
│   │   ├── api-v1/          # REST API endpoint
│   │   ├── send-otp/        # OTP email sending
│   │   ├── verify-otp/      # OTP verification
│   │   ├── send-magic-link/ # Magic link auth
│   │   ├── send-team-invite/# Team invitation emails
│   │   ├── verify-domain/   # Domain verification
│   │   ├── widget-script/   # Widget embed script
│   │   └── ...
│   │
│   └── config.toml          # Supabase configuration
│
├── public/                  # Static assets
│   ├── manifest.json        # PWA manifest
│   └── icons/               # App icons
│
└── SUPABASE_MIGRATION.sql   # Complete database schema for migration
```

---

## Database Architecture

### Multi-Tenancy Model
All data is scoped by `organization_id`. Row Level Security (RLS) policies ensure users can only access data within their organization.

### Core Tables

#### 1. `organizations`
The root entity for multi-tenancy.
```sql
- id (UUID, PK)
- name (TEXT)
- slug (TEXT, unique)
- custom_domain (TEXT, nullable)
- domain_verified (BOOLEAN)
- primary_color (TEXT) -- branding
- logo_url (TEXT)
- plan (ENUM: free, starter, pro, enterprise)
- status (ENUM: active, suspended, cancelled)
- branding (JSONB)
- security_settings (JSONB)
- email_config (JSONB)
```

#### 2. `profiles`
User profiles linked to Supabase Auth.
```sql
- id (UUID, PK) -- matches auth.users.id
- organization_id (UUID, FK)
- email (TEXT)
- full_name (TEXT)
- role (ENUM: super_admin, admin, agent, client)
- avatar_url (TEXT)
- is_active (BOOLEAN)
- email_verified (BOOLEAN)
- preferences (JSONB)
```

#### 3. `tickets`
Support tickets.
```sql
- id (UUID, PK)
- organization_id (UUID, FK)
- subject (TEXT)
- description (TEXT)
- status (ENUM: open, in_progress, waiting_customer, resolved, closed)
- priority (ENUM: low, medium, high, urgent)
- created_by (UUID, FK -> profiles)
- assigned_to (UUID, FK -> profiles, nullable)
- category (TEXT)
- tags (TEXT[])
- due_date (TIMESTAMPTZ)
- first_response_at (TIMESTAMPTZ)
- resolved_at (TIMESTAMPTZ)
- metadata (JSONB) -- AI analysis results stored here
```

#### 4. `messages`
Messages within tickets.
```sql
- id (UUID, PK)
- ticket_id (UUID, FK)
- user_id (UUID, FK -> profiles)
- content (TEXT)
- is_internal (BOOLEAN) -- internal notes vs customer-visible
- attachments (JSONB[])
- read_by (UUID[])
```

#### 5. `widget_config`
Chat widget configuration per organization.
```sql
- id (UUID, PK)
- organization_id (UUID, FK, unique)
- is_enabled (BOOLEAN)
- primary_color (TEXT)
- welcome_message (TEXT)
- offline_message (TEXT)
- trigger_text (TEXT)
- position (TEXT: bottom-right, bottom-left)
- pre_chat_form_enabled (BOOLEAN)
- file_upload_enabled (BOOLEAN)
- business_hours (JSONB)
```

#### 6. `widget_conversations`
Live chat conversations from widget.
```sql
- id (UUID, PK)
- organization_id (UUID, FK)
- visitor_id (TEXT) -- anonymous visitor identifier
- status (TEXT: active, ended, missed)
- assigned_agent_id (UUID, FK -> profiles)
- topic (TEXT)
- page_url (TEXT)
```

#### 7. `widget_messages`
Messages in widget conversations.
```sql
- id (UUID, PK)
- conversation_id (UUID, FK)
- sender_type (TEXT: visitor, agent, system)
- sender_id (UUID, nullable)
- content (TEXT)
- is_read (BOOLEAN)
```

### Supporting Tables
- `user_invitations` - Team invite tokens
- `api_keys` - API key management
- `api_request_logs` - API usage logging
- `webhook_configs` - Webhook configurations
- `webhook_logs` - Webhook delivery logs
- `email_archive` - Imported emails
- `email_attachments` - Email attachment metadata
- `email_import_jobs` - Email import job tracking
- `otp_codes` - OTP verification codes
- `rate_limits` - Rate limiting tracking
- `user_sessions` - Active session management
- `security_events` - Security audit log
- `blocked_ips` - IP blocking
- `flagged_content` - Content moderation
- `allowed_domains` - Allowed email domains for signup
- `pending_clients` - Pending client approvals
- `sla_configurations` - SLA settings by priority
- `csat_responses` - Customer satisfaction surveys
- `analytics_daily_stats` - Aggregated daily statistics
- `agent_availability` - Agent online status
- `subscription_plans` - Plan definitions
- `subscription_usage` - Usage tracking per org

---

## User Roles & Permissions

### Role Hierarchy
1. **super_admin** - Platform-level admin (cross-organization access)
2. **admin** - Organization admin (full org access)
3. **agent** - Support agent (can handle tickets)
4. **client** - End customer (can create/view own tickets)

### RLS Policy Pattern
```sql
-- Example: Tickets table
-- Clients see only their own tickets
CREATE POLICY "Clients view own tickets" ON tickets
  FOR SELECT USING (
    auth.uid() = created_by AND 
    get_user_role() = 'client'
  );

-- Agents/Admins see all org tickets
CREATE POLICY "Staff view org tickets" ON tickets
  FOR SELECT USING (
    organization_id = get_user_organization_id() AND
    get_user_role() IN ('admin', 'agent')
  );
```

---

## Authentication Flow

### Standard Auth (Email/Password)
1. User signs up with email/password via `SignupForm`
2. Supabase Auth creates user in `auth.users`
3. Database trigger `handle_new_user()` creates profile in `profiles`
4. User logs in, `AuthContext` manages session state
5. `useSession` and `useUser` hooks provide user data to components

### OTP Flow
1. User requests OTP via `send-otp` edge function
2. OTP stored in `otp_codes` table with expiry
3. User enters code, verified via `verify-otp` edge function
4. On success, Supabase session created

### Magic Link Flow
1. User requests magic link via `send-magic-link` edge function
2. Link sent to email with verification token
3. User clicks link, redirected to `/auth/callback`
4. Session established

---

## Key Workflows

### 1. Ticket Creation & Assignment
```
Client creates ticket → 
  Ticket saved with status='open' →
  AI analysis triggered (if enabled) →
  Category/tags/sentiment extracted →
  Auto-assignment rules applied →
  Notifications sent to agents
```

### 2. Live Chat Widget
```
Visitor opens widget →
  Pre-chat form (if enabled) →
  Conversation created →
  Agent assigned (round-robin or manual) →
  Real-time messaging via Supabase Realtime →
  Conversation can be converted to ticket
```

### 3. Team Invitation
```
Admin invites user →
  Token generated, saved in user_invitations →
  Email sent via send-team-invite function →
  User clicks link →
  User signs up, accept_invitation() called →
  Profile updated with org_id and role
```

### 4. AI Ticket Analysis
```
Ticket created/updated →
  Frontend calls analyze-ticket edge function →
  Function calls AI Provider (Groq/OpenRouter/OpenAI) →
  Returns: category, tags, sentiment, suggested response →
  Results stored in ticket.metadata →
  Displayed in AIInsightsPanel component
```

---

## Edge Functions

### `analyze-ticket`
- **Purpose**: AI-powered ticket analysis
- **Input**: `{ ticketId, subject, description }`
- **Output**: `{ category, tags, sentiment, suggestedResponse, confidence }`
- **Auth**: Requires valid session

### `api-v1`
- **Purpose**: REST API for external integrations
- **Endpoints**: `/tickets`, `/messages`, `/users`, `/analytics`
- **Auth**: Bearer token (API key)
- **Rate Limiting**: By plan tier

### `send-otp`
- **Purpose**: Send OTP code via email
- **Input**: `{ email, type }`
- **Output**: `{ success, message }`

### `verify-otp`
- **Purpose**: Verify OTP code
- **Input**: `{ email, code, type }`
- **Output**: `{ success, valid }`

### `send-team-invite`
- **Purpose**: Send team invitation email
- **Input**: `{ email, name, role, organizationId, invitedBy }`
- **Output**: `{ success }`

### `verify-domain`
- **Purpose**: Verify custom domain ownership
- **Input**: `{ domain, method, token }`
- **Output**: `{ verified, error }`

---

## Environment Configuration

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

### Edge Function Secrets (Supabase Dashboard → Edge Functions → Secrets)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
SUPABASE_ANON_KEY=eyJ...your-anon-key

# SMTP for sending emails
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_NAME=PRIVYDESK
SMTP_FROM_EMAIL=noreply@yourdomain.com

# AI Provider Configuration
AI_PROVIDER=groq
GROQ_API_KEY=your-groq-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
OPENAI_API_KEY=your-openai-api-key
```

---

## Hosting Configuration (Hostinger)

### Build & Deploy
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Output directory: dist/
```

### Hostinger Setup
1. Upload contents of `dist/` to public_html
2. Configure URL rewriting for SPA:

**.htaccess** (for Apache):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Environment Variables
Create `.env.production` before building:
```env
VITE_SUPABASE_URL=https://your-external-supabase.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

---

## AI Integration Details

### Supported AI Providers
- **Groq**: Fast inference with Llama models
- **OpenRouter**: Access to multiple models
- **OpenAI**: GPT-3.5/GPT-4 models
- **Compatible with**: OpenAI API format
  - `google/gemini-2.5-pro` (complex reasoning)
  - `openai/gpt-5-mini` (fast, cost-effective)

### Implementation Pattern
```typescript
// Always call via edge function, never from frontend
const AI_PROVIDER = Deno.env.get("AI_PROVIDER") || "groq";
const apiKey = Deno.env.get(`${AI_PROVIDER.toUpperCase()}_API_KEY`);

const response = await fetch(getProviderUrl(AI_PROVIDER), {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [
      { role: "system", content: "You are a helpful assistant..." },
      { role: "user", content: userMessage }
    ],
  }),
});
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Auth state management |
| `src/hooks/useSession.ts` | Session/user data hooks |
| `src/components/layout/DashboardLayout.tsx` | Main app layout |
| `src/components/layout/Sidebar.tsx` | Navigation sidebar |
| `src/pages/Dashboard.tsx` | Role-based dashboard |
| `src/pages/Tickets.tsx` | Ticket list page |
| `src/pages/TicketDetail.tsx` | Single ticket view |
| `src/components/tickets/CreateTicketModal.tsx` | Ticket creation |
| `src/components/widget/ChatWidget.tsx` | Embeddable widget |
| `src/hooks/useTicketAI.ts` | AI analysis hook |
| `supabase/functions/analyze-ticket/index.ts` | AI analysis function |
| `supabase/functions/api-v1/index.ts` | REST API |
| `SUPABASE_MIGRATION.sql` | Complete DB schema |

---

## Common Operations

### Adding a New Feature
1. Create component in appropriate `src/components/` subfolder
2. Add route in `src/App.tsx` if it's a page
3. Create/update hooks in `src/hooks/` for data fetching
4. If new table needed, add migration via `SUPABASE_MIGRATION.sql`
5. Add RLS policies for the new table
6. Update types in `src/types/`

### Adding an Edge Function
1. Create folder: `supabase/functions/function-name/`
2. Create `index.ts` with Deno serve handler
3. Add to `supabase/config.toml` if JWT verification needed
4. Deploy: `supabase functions deploy function-name`

### Updating Database Schema
1. Modify `SUPABASE_MIGRATION.sql`
2. Run new SQL in Supabase SQL Editor
3. Regenerate types: `supabase gen types typescript`

---

## Security Considerations

1. **RLS Enabled**: All tables have RLS policies
2. **Input Sanitization**: DOMPurify for HTML content
3. **Rate Limiting**: Implemented for auth and API
4. **API Key Hashing**: SHA-256 for API keys
5. **Session Management**: Token-based with expiry
6. **Content Flagging**: Automatic content moderation
7. **IP Blocking**: Support for blocking malicious IPs

---

## Testing

### Unit Tests
```bash
npm run test
```
- Located in `__tests__/` folders alongside components
- Uses Vitest + Testing Library

### E2E Tests
```bash
npm run test:e2e
```
- Located in `tests/e2e/`
- Uses Playwright

---

## Troubleshooting

### Common Issues

1. **"Cannot read property of undefined" on user data**
   - Check if user is authenticated
   - Ensure profile exists in `profiles` table

2. **RLS policy blocking access**
   - Verify `organization_id` matches user's org
   - Check role-based conditions

3. **Edge function 500 error**
   - Check function logs in Supabase Dashboard
   - Verify all secrets are configured

4. **Realtime not working**
   - Ensure table has `ALTER PUBLICATION supabase_realtime ADD TABLE`
   - Check RLS allows SELECT

---

*Last updated: January 2025*
