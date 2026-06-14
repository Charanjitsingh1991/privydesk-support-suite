# PrivyDesk — Development Plan

**Purpose:** Sequenced, actionable plan to take PrivyDesk from its current state to a production-grade multi-tenant SaaS serving thousands of organizations.
**Principle:** Fix the foundation (data integrity + tenant security) **before** adding or polishing features. Every phase below has explicit exit criteria.

---

## Guiding Rules

- No new feature work crosses the critical path until **Phase 0 and Phase 1** are complete.
- Every schema change ships as **one ordered, idempotent migration**, verified against a fresh `supabase db reset`.
- Every table that holds tenant data: RLS on, `organization_id` present + indexed, policies written with the shared helper functions, and covered by the multi-tenant test harness.
- Definition of Done (see `CLAUDE.md` §11) applies to every PR.

---

## Phase 0 — Stabilize the Data Layer (BLOCKER) — ~1 sprint

Goal: a single, trustworthy, replayable schema.

1. **Reconcile migrations.** Decide canonical source: keep core (`20260126212319...`) + `rls_policies_all_phases.sql`; fold the rest into a clean, ordered set. Delete or merge `consolidated_phases_1_9.sql` vs the individual `phase*` files so there is exactly one definition per table.
2. **Eliminate the phantom `users` table.** Replace all 122 `users` / `users.role` references with `profiles`. Remove the non-existent `developer` role (or formally add it to the `user_role` enum if product wants it — pick one).
3. **Fix webhook table drift.** Standardize on `webhooks` / `webhook_deliveries`; update `api-v1` to match (it currently uses `webhook_configs`/`webhook_logs`).
4. **Verify replay.** `supabase db reset` from scratch must succeed with zero errors and produce the intended schema. Snapshot the resulting schema as the baseline.
5. Regenerate TS types (`npm run supabase:types`).
6. **Verify documented-but-maybe-missing objects.** Confirm whether `check_plan_limit`, `increment_ticket_usage` (trigger), `reset_monthly_usage`, and the storage/org isolation policies described in `Documentation/` are actually in an applied migration. If not, add them.

**Exit criteria:** Fresh DB reproduces deployed schema exactly; no conflicting/duplicate object definitions; types compile; documented usage/isolation functions provably exist in the DB.

### Phase 0b — Reconcile documentation to reality (parallel, cheap)
Not a blocker for code, but do it alongside Phase 0 so the docs stop misleading contributors:
- Rewrite `CUSTOM_DOMAIN_ARCHITECTURE.md` to the actual **Cloudflare** model; remove Hostinger reverse-proxy text and the Vercel IP `76.76.21.21`.
- Align `AUTHENTICATION.md` ("passwordless-only, production-ready") with the still-shipped email/password code, or remove the password code.
- ✅ Fixed `send-magic-link/index.ts` `.lovable.app` fallback → now `APP_URL` / `https://app.privydesk.com`. Still TODO: fix the `app.privydesk.com` canonical tag pointing to the marketing root.
- Mark unimplemented systems (custom-domain routing/`domainResolver.ts`, ACME SSL, subdomain Worker) clearly as "planned" in their docs.

---

## Phase 1 — Close Tenant-Isolation & Privilege Holes (BLOCKER) — ~1 sprint

Goal: tenant isolation and RBAC are provably enforced.

1. **Kill self-escalation.** Remove `role` and `organization_id` from any client-updatable path:
   - Add `WITH CHECK` to the `profiles` UPDATE policy restricting it to non-privileged columns (name, avatar, preferences).
   - Add a `BEFORE UPDATE` trigger on `profiles` rejecting changes to `role`/`organization_id` unless `auth.role() = 'service_role'` or the caller is an existing admin of that org.
2. **Move org bootstrap server-side.** Replace the client-side `profiles.update({role:'admin', organization_id})` in `Onboarding.tsx` with a SECURITY DEFINER RPC `create_organization_and_claim_owner(...)` that creates the org, assigns the first admin atomically, and seeds `subscription_usage`.
3. **Lock down permissive policies.** Audit every `WITH CHECK (true)` (audit logs, push notifications, survey responses, system tables). Restrict to service role or constrain by org/user.
4. **Harden the public API.** Introduce a data-access helper in `api-v1` that *always* injects `organization_id`; add per-endpoint contract tests asserting cross-tenant requests return 404/403.
5. **Build the multi-tenant RLS test harness.** Two orgs × every role. Assert: no cross-org read/write on tickets, messages, profiles, settings, webhooks, analytics, files.
6. Require auth (API key or JWT) on `analyze-ticket`; tighten CORS on state-changing edge functions.

**Exit criteria:** Harness proves zero cross-tenant access and zero self-escalation across all tables; API contract tests green.

---

## Phase 2 — Production Hardening of the Core Loop — ~1–2 sprints

Goal: the MVP feature set is robust and operable.

1. **Webhooks at scale:** replace inline fire-and-forget `fetch` with a queue + retrying worker (pg_cron/scheduled function or external queue), with backoff + dead-letter + delivery logs.
2. **Email:** migrate from single global SMTP to a transactional provider (Resend/SES) with pooling; wire per-tenant `email_config`; encrypt stored provider secrets; ensure they never leak via org SELECT to non-admins.
3. **Usage & billing limits:** enforce plan limits at write time (trigger/edge function), add scheduled monthly `subscription_usage` reset; surface limit errors in UI.
4. **Auth consolidation:** choose one canonical flow (recommend passwordless OTP/magic-link or password — not both); verify TOTP 2FA is validated server-side.
5. **Observability:** structured logging on edge functions, error tracking, request/latency metrics, and alerting on webhook/email failures.
6. **CI gates:** lint (zero warnings) + unit + e2e + the RLS harness must pass on every PR (extend `.github/workflows/test.yml`).

**Exit criteria:** Core loop (signup→onboard→ticket→resolve, with limits + email + webhooks) passes e2e under load smoke test; no P0/P1 security items open.

---

## Phase 3 — Scale Readiness — ~2 sprints

Goal: comfortable at thousands of orgs.

1. **Index & query audit** on all (now-consolidated) phase tables; standardize RLS on helper functions; remove subquery-style policies.
2. **Analytics rollups:** materialized views or rollup tables for `get_ticket_analytics` / `get_agent_performance`; scheduled refresh.
3. **Realtime fan-out review** for large orgs (presence/typing channel costs).
4. **Load testing:** simulate N orgs × M tickets; capture p95 latency on dashboard, ticket list, API.
5. **Data lifecycle:** add soft-delete/retention columns; implement the GDPR export/delete flows end-to-end against real schema.

**Exit criteria:** Documented load-test results meeting target p95s; GDPR delete/export verified.

---

## Phase 4 — Feature Maturation (gated, post-foundation) — ongoing

Promote scaffolding to shipped, **one feature at a time**, each behind a feature flag and each passing the RLS harness + contract tests before GA:

- AI features (sentiment, auto-tag, response suggestions) — confirm model wiring, cost controls, auth.
- Knowledge base + community forum (public-read policies need careful review).
- Surveys/CSAT pipelines.
- Omnichannel (WhatsApp/SMS/voice/social) — significant external-integration + compliance work; treat as separate epics.
- SSO, custom roles, integrations marketplace, Zapier, CRM/e-commerce sync.
- Mobile native / offline sync.

**Rule:** a phase-6–9 feature is not "done" until it is end-to-end, RLS-tested, and flag-gated. Until then it is labeled beta in the UI and excluded from the critical path.

---

## Sequencing Summary

| Phase | Theme | Blocker? | Rough size |
|---|---|---|---|
| 0 | Migration/schema integrity | ✅ | 1 sprint |
| 1 | Tenant isolation + RBAC | ✅ | 1 sprint |
| 2 | Core-loop hardening (webhooks, email, limits, auth, observability) | — | 1–2 sprints |
| 3 | Scale readiness (indexes, rollups, load test, data lifecycle) | — | 2 sprints |
| 4 | Feature maturation (gated) | — | ongoing |

---

## Immediate Next 5 Actions

1. Freeze new feature merges to the critical path.
2. Stand up a throwaway Supabase project; attempt `db reset` with current migrations to document exactly what breaks (validates Phase 0 scope).
3. Write the failing RLS test that demonstrates self-escalation (`profiles.update({role:'super_admin'})`) — make the vulnerability concrete and regression-proof.
4. Draft the `create_organization_and_claim_owner` RPC + restrictive `profiles` policies.
5. Open the migration-consolidation PR.

> Do not begin Phase 4 polish until Phases 0–1 are merged and the RLS harness is green. The product's credibility with the first enterprise tenant depends entirely on tenant isolation being real.
