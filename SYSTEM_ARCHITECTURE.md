# PrivyDesk — System Architecture & Technical Review

**Prepared for:** Product/Engineering leadership
**Role of author:** Lead Software Architect / Technical Product Owner
**Status:** Pre-development architectural validation. **No code changed.**
**Verdict in one line:** Strong, broad feature surface and a sound tenancy *intent*, but **not production-ready for thousands of orgs** until a small number of critical security and migration-integrity issues are fixed.

---

## A. Executive Product Summary

PrivyDesk is a multi-tenant B2B helpdesk SaaS. An organization signs up, runs a 6-step onboarding wizard (company info → email verification via OTP → optional custom-domain verification → branding → plan selection → email config), and gets a branded support workspace. Agents and clients collaborate on **tickets** with threaded **messages**, internal notes, canned responses, SLAs, and analytics. The platform reaches well beyond MVP on paper: AI ticket analysis, omnichannel (WhatsApp/SMS/voice/social) scaffolding, a public REST API with API keys + webhooks, a knowledge base, community forum, surveys/CSAT, an embeddable chat widget, mobile/PWA support, GDPR tooling, SSO config, and an integrations marketplace.

**Architecture in brief:** A React/TypeScript SPA talks directly to Supabase (Postgres + GoTrue auth + Storage + Realtime) using the anon key, with multi-tenant isolation enforced by Postgres RLS. Privileged and third-party-facing work (public API, OTP email, domain verification, AI, email import) runs in Deno **edge functions**, some using the service-role key.

**Maturity assessment:** The *breadth* of the schema and UI suggests an ambitious, near-complete product. The *depth* is uneven: the core ticket/auth path is real and wired; many "phase 3–9" features exist as tables + client service stubs more than end-to-end flows. Critically, the data layer has **integrity and security defects** (below) that must be resolved before scaling.

> **Correction / framing note (v3):** An earlier draft of this review called PrivyDesk "a Lovable project" and said the data layer defects were "normal for a generated build." That was an overstatement, now retracted. This is a hand-built, extensively documented codebase (a full `Documentation/` architecture tree, a real security library, a test suite). Lovable *tooling* was used briefly during development, but **its footprint has since been removed** (`lovable-tagger`, `componentTagger()`, the empty `.lovable/` directory, the `.lovable.app` fallback, `LOVABLE_API_KEY`). Note: there was never a `.lovable/plan.md` file — earlier claims of one were a hallucination. The architecture is the team's own; the defects below are ordinary technical debt, not generator residue, and they're fixable.

**Hosting & connectivity (verified live, Jun 4, 2026):** The app is deployed on **Cloudflare** Pages. `privydesk.com`, `app.privydesk.com`, the `*.pages.dev` origin, and an arbitrary `*.privydesk.com` subdomain all return HTTP 200 (`Server: cloudflare`) — confirming the `subdomain-router` Worker proxies wildcard subdomains to the app. **The Supabase data plane was also tested live:** GoTrue `/auth/v1/health` → 200 (`v2.189.0`); REST `subscription_plans` (anon) → 200 with data; REST `organizations` (anon) → 200 `[]` (RLS blocks anon reads); `analyze-ticket` (no auth) → 200 (publicly callable, see §C). One SEO smell remains: `app.privydesk.com` sets `canonical: https://privydesk.com/`, pointing the app subdomain's canonical at the marketing root.

---

## B. Technical Architecture Review

### B.1 Frontend
- Clean React 18 + Vite + TS SPA. Routing centralized in `App.tsx`; guards via `ProtectedRoute`/`OnboardingRoute`. TanStack Query for server state with sensible defaults (retry/backoff, 5-min stale). shadcn/Radix for accessible UI.
- Two providers wrap the app: `AuthProvider` then `OrganizationProvider`. Good separation.
- **Concern:** business logic lives in many client-side "services" (`src/lib/services/*`) that call Supabase directly. With the anon key, *all* authority for those operations rests on RLS. If an RLS policy is wrong, the client is the attacker's console. RLS correctness is therefore the whole security model — and it currently has holes (§D).

### B.2 Backend (Supabase + Edge Functions)
- Postgres is the system of record; GoTrue for identity; Storage for logos/attachments; Realtime for presence/typing/messages.
- Edge functions split into: (a) **public API** (`api-v1`, API-key auth, service role, manual org scoping), (b) **auth helpers** (OTP, magic link, invites, welcome), (c) **operational** (domain verify, security scan, AI analyze, email import, widget script).
- `config.toml` disables JWT verification for `api-v1` and `analyze-ticket`. For `api-v1` that's intentional (API-key auth). For `analyze-ticket` it should be re-examined — a public, unauthenticated AI endpoint is a cost/abuse risk.

### B.5 Hosting / routing (Cloudflare) — documented vs. real
- **Live:** Cloudflare-fronted SPA at `privydesk.com` / `app.privydesk.com`; `public/_redirects` (`/* /index.html 200`) gives SPA fallback on Cloudflare **Pages**.
- **Doc contradiction to fix:** `DEPLOYMENT.md` describes Cloudflare Pages + a `subdomain-router` Worker for `*.privydesk.com`, while `CUSTOM_DOMAIN_ARCHITECTURE.md` describes a **Hostinger reverse proxy** and an A-record IP `76.76.21.21` (that IP is Vercel's anycast address). These three stories can't all be true; the live deployment is Cloudflare. The custom-domain doc reads as partly copied from a Vercel/Hostinger template and needs rewriting to the actual Cloudflare model.
- **Not yet implemented:** per-org subdomains and custom domains are UI + design only. The `src/middleware/domainResolver.ts` referenced in the docs does not exist in the source tree; ACME/Let's Encrypt SSL provisioning, certificate renewal cron, and the wildcard Worker are unchecked in the doc's own implementation checklist. If `_redirects` is served via a **Worker** rather than Pages, deep-link SPA fallback may also need handling in the Worker.

### B.3 Trust boundaries
- Browser → Supabase (anon key): governed by RLS. **Primary risk surface.**
- Browser → edge functions: CORS `*`; OTP/verify functions must self-rate-limit (they do via `check_rate_limit`).
- External → `api-v1`: API-key + scope checks, service-role DB access, **manual** tenant scoping.
- The architecture is reasonable for the stage; the weakness is **enforcement consistency**, not topology.

### B.4 Realtime & chat widget
- Presence, typing indicators, and live messages via Supabase Realtime (`usePresence`, `useTypingIndicator`, `useRealtimeMessages`). `public/widget.js` + `widget-script`/`WidgetEmbed` provide an embeddable widget and a public `/widget/:orgId` route — validate that the widget path cannot read another org's tickets.

---

## C. Database Review

### C.1 Core schema — solid
The base migration (`20260126212319...`) is well-formed: enums for plan/role/status/priority, `organization_id` FKs with `ON DELETE CASCADE`, helpful indexes (`tickets(organization_id|status|priority|created_at|assigned_to)`, `messages(ticket_id|created_at)`), `updated_at` triggers, and an `on_auth_user_created` trigger that provisions a `profiles` row. RLS is enabled on all core tables and uses SECURITY DEFINER helper functions to avoid recursive policy lookups. This is the right pattern.

### C.2 Migration integrity — **critical debt**
The `migrations/` directory is **not consistent or replayable**:

1. **Competing definitions.** `20260130_consolidated_phases_1_9.sql` overlaps individual `20260130_phase1..9_*.sql` files. Applying the full set conflicts.
2. **`users` table that doesn't exist.** 122 references across 16 phase files target `users` / `users.role` and a non-existent `developer` role. The real table is `profiles` with roles `super_admin/admin/agent/client`. The dedicated `rls_policies_all_phases.sql` uses `profiles` correctly — so the repo simultaneously assumes two different schemas.
3. **Webhook table drift.** `api-v1` reads/writes `webhook_configs`/`webhook_logs`; schema defines `webhooks`/`webhook_deliveries`. Webhook delivery is effectively broken.
4. **Inconsistent RLS style.** Phase files inline `organization_id IN (SELECT organization_id FROM ... WHERE id = auth.uid())` instead of the existing `get_user_organization_id()` helper — slower and harder to audit.

**Impact:** a fresh `supabase db reset` will not cleanly reproduce the intended database; you cannot trust that what's deployed matches the repo. This is the **#1 thing to fix** — everything else (correct RLS, API correctness) depends on a known-good schema.

### C.3 Data-model observations
- `messages.attachments JSONB[]` and `read_by UUID[]` are pragmatic but unindexed; read-receipts at scale may need a join table.
- No soft-delete / archival columns on `tickets`; GDPR + retention features imply you'll need them.
- `subscription_usage` is a single per-org row with monthly counters and `last_reset_at` — fine, but there's no visible scheduled job resetting it (see Scalability).

---

## D. Security Review

### D.1 🔴 CRITICAL — Self-service privilege escalation & tenant hijack
The `profiles` UPDATE policy is:
```sql
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (id = auth.uid());
```
There is **no `WITH CHECK`** and **no column restriction**. Onboarding then performs, from the browser, `profiles.update({ role: 'admin', organization_id: org.id })`. Consequences:
- Any authenticated user can set their own `role` to `super_admin`.
- Any user can set their `organization_id` to **any other org's id**, instantly gaining that tenant's RLS-granted read/write to tickets, messages, settings, etc.

This single defect collapses both the RBAC model and tenant isolation. **Must fix before any external users.**
**Fix:** Remove role/org-id from client-updatable columns. Perform org creation + first-admin assignment in a SECURITY DEFINER RPC (e.g. `create_organization_and_claim_owner()`), or a `BEFORE UPDATE` trigger that rejects changes to `role`/`organization_id` unless performed by service role or an existing admin. Add `WITH CHECK` to every UPDATE policy.

### D.2 🔴 CRITICAL — Schema/RLS mismatch ⇒ unenforced policies
Because phase RLS policies reference a non-existent `users` table, any of those policies that did apply against a different assumed schema would not protect the real `profiles`-based tables as intended. Until migrations are consolidated and verified, **the deployed RLS state is unknown**. Treat tenant isolation as unverified until §C.2 is resolved and policies are tested with a multi-tenant test harness.

### D.3 🟠 HIGH — Public API relies on hand-written org scoping
`api-v1` uses the service-role key (bypasses RLS) and depends on each query including `.eq("organization_id", organization_id)`. Most do, but this is fragile: one missed filter = cross-tenant data leak. Recommend a thin data-access layer that *always* injects the org filter, plus contract tests per endpoint.

### D.4 🟠 HIGH — Permissive INSERT policies
Several policies use `WITH CHECK (true)` (audit logs, push notifications, survey responses, some system tables). For client-reachable tables this allows arbitrary inserts (e.g. forged audit logs, notification spam). Restrict to service-role or constrain by org/user.

### D.5 🟡 MEDIUM
- CORS `*` on all edge functions; tighten allowed origins for state-changing endpoints.
- `analyze-ticket` has `verify_jwt = false` — unauthenticated AI = abuse/cost risk; require API key or JWT.
- Single global SMTP for all tenants; per-org `email_config` (incl. `resend_api_key`, SMTP creds) is stored in `organizations.email_config` JSONB — ensure those secrets are encrypted at rest and never returned to non-admins via the org SELECT policy.
- **Auth doc-vs-code drift.** `AUTHENTICATION.md` declares the system passwordless-only and "Production Ready," but the shipped code still includes full email/password auth (`signInWithPassword`) alongside the OTP/magic-link flow. Consolidate to one canonical flow and remove the other from the router; right now there are two live account-access paths, which widens attack surface and creates account-takeover ambiguity.
- TOTP 2FA exists client-side (`lib/security/totp.ts`, `TwoFactorSetup`) — verify the secret is server-validated, not just client-checked.

### D.6 Positives
DOMPurify sanitization, zxcvbn password strength, link/attachment validators, SECURITY DEFINER helper functions, API rate limiting, and request logging are all present and show genuine security awareness. The bones are good; the gaps are specific and fixable.

---

## E. Scalability Review

**Target: thousands of organizations.**

- **RLS helper functions** are `STABLE`/SECURITY DEFINER and called per row in policies; at high row counts the subquery-style phase policies will hurt. Standardize on the indexed helper functions and ensure `profiles(id)` lookups are trivial (they are, PK).
- **Indexing** on core tables is good; phase tables need an audit for `organization_id` + common filter indexes once consolidated.
- **Usage/limit enforcement** is *documented* (`MULTI_TENANT_ARCHITECTURE.md` shows `check_plan_limit`, an `increment_ticket_usage` AFTER-INSERT trigger, and a `reset_monthly_usage` function) but those appear as doc snippets — **confirm they exist in an applied migration**, because the consolidated/phase migrations I reviewed don't clearly include them. At scale you need both verified-deployed: (a) a scheduled monthly reset (pg_cron / Supabase scheduled function), and (b) hard enforcement in a trigger or edge function, not just the UI-side `check_plan_limit` call shown in the docs (a client-side check is trivially bypassed given the RLS gaps in §D).
- **Webhook delivery** is synchronous, fire-and-forget inside the request path in `api-v1`. At volume this needs a queue + worker with retry/backoff and dead-lettering, not inline `fetch`.
- **Realtime**: presence/typing per ticket is fine for small teams; validate channel fan-out cost for large orgs.
- **Edge function cold starts / SMTP**: a single SMTP connection per OTP send is acceptable low-volume but will bottleneck; move to a transactional email provider (Resend/SES) with pooling.
- **Analytics**: `get_ticket_analytics` / `get_agent_performance` RPCs over the live tickets table will degrade; plan materialized views or a rollup table for large tenants.
- **No multi-region / read-replica strategy** is defined; acceptable for launch, plan for it in roadmap.

**Verdict:** Architecture scales to *hundreds* of small orgs as-is; *thousands* requires the queueing, usage-enforcement, and analytics-rollup work above, plus the migration cleanup so performance characteristics are actually knowable.

---

## F. MVP vs Future Roadmap Analysis

**Genuinely MVP-ready (core loop works):**
- Auth (email/password + OTP), onboarding wizard, organization provisioning
- Tickets + messages lifecycle, assignment, status/priority, internal notes
- Team management + invitations, role-based dashboards (super-admin/agent/client)
- Branding, custom-domain verification, file storage, email archive UI
- Analytics dashboard, canned responses, SLA tracking UI, chat widget embed

**Built but shallow / needs hardening before counting as shipped:**
- Public REST API + webhooks (broken table naming; needs delivery infra)
- AI features (`analyze-ticket`, suggesters, auto-tagger) — verify model wiring + auth
- Per-tenant email sending (stored config not used; PST import stubbed)
- 2FA/TOTP (confirm server-side verification)

**Future / scaffolding only (tables + client stubs, not end-to-end):**
- Omnichannel: WhatsApp, SMS, voice, social
- Knowledge base, community forum, surveys/CSAT pipelines
- SSO, custom roles, data-retention automation, compliance certs
- Integrations marketplace, Zapier, CRM/e-commerce sync, mobile native/offline sync

**Recommendation:** Define a **hard MVP scope** = auth + tenancy + tickets + team + billing limits + analytics, *with the security/migration fixes done*. Demote phases 6–9 to clearly-labeled "beta/roadmap" and stop carrying their half-built RLS into the critical path.

---

## G. Recommended Improvements (prioritized)

**P0 — block launch until done**
1. Fix the `profiles` UPDATE privilege-escalation/tenant-hijack hole (SECURITY DEFINER RPC + column-restricted policies + `WITH CHECK`).
2. Consolidate migrations into one ordered, idempotent, conflict-free set; eliminate `users`/`developer` references; reconcile webhook tables; verify against a fresh `supabase db reset`.
3. Build a multi-tenant RLS test harness (two orgs, every role) and prove isolation on every table.

**P1 — before meaningful traffic**
4. Harden `api-v1` with a mandatory org-scoping data layer + per-endpoint contract tests.
5. Replace inline webhook delivery with a queue + retrying worker.
6. Lock down permissive `WITH CHECK (true)` policies and CORS; require auth on `analyze-ticket`.
7. Implement usage-limit enforcement + scheduled monthly reset.
8. Move email to a transactional provider; wire (and encrypt) per-tenant email config.

**P2 — scale & maintainability**
9. Standardize RLS on helper functions; index audit of all phase tables.
10. Analytics rollups/materialized views.
11. Consolidate auth to a single canonical flow; verify TOTP server-side.
12. Soft-delete/retention columns to support GDPR features properly.
13. Clearly gate phases 6–9 behind feature flags until built end-to-end.
14. **Reconcile docs to reality:** rewrite `CUSTOM_DOMAIN_ARCHITECTURE.md` to the actual Cloudflare model (drop Hostinger/Vercel-IP references), align `AUTHENTICATION.md`'s "passwordless-only / production-ready" claim with the still-shipped password flow, and verify the usage-limit triggers/cron are actually migrated. (✅ the `send-magic-link` `.lovable.app` fallback URL is now fixed.) Fix the `app.privydesk.com` canonical tag.

---

## Architecture Diagram (logical)

```
   ┌── Cloudflare (Pages + CDN, *.privydesk.com subdomain-router Worker LIVE) ──┐
   │                     ┌─────────────────────────────┐         │
   Browser (SPA)         │  React + Vite + TanStack Q   │         │
   anon key  ───────────►│  AuthProvider / OrgProvider  │         │
                         └───────────┬─────────────────┘         │
   └──────────────────────────────────────────────────────────────┘
                                     │ supabase-js (anon)         External clients
                                     ▼                                   │ API key
        ┌────────────────────────────────────────────┐                  ▼
        │                 SUPABASE                     │        ┌───────────────────┐
        │  GoTrue Auth │ Postgres (RLS) │ Storage │ RT │◄──────►│ Edge: api-v1       │
        │                                              │ service│ (service role,     │
        │  profiles · organizations · tickets ·        │  role  │  manual org scope) │
        │  messages · subscription_* · 70+ phase tbls  │        └───────────────────┘
        └───────┬──────────────────────────────────────┘
                │ invoked by SPA / cron
                ▼
   Edge functions: send-otp · verify-otp · send-magic-link · send-team-invite ·
   send-welcome-email · verify-domain · analyze-ticket · security-scan ·
   process-email-import (stub) · widget-script
                │ SMTP (single global mailer)
                ▼
            Email provider
```

> ⚠️ Security note baked into the diagram: today the **anon-key path can mutate `profiles.role`/`organization_id`**, which is why the "RLS" boundary above is currently porous. Closing that is P0.
