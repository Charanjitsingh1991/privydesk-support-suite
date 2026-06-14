# PrivyDesk — Master Test Plan

> **Purpose:** A complete, prioritized test strategy covering every scenario PrivyDesk must pass before it can credibly sell to mid-market/enterprise and privacy-sensitive buyers — and a verification of whether each marketed claim is *actually* solving the problem.
> **Executable via Windsurf (Claude):** each suite below is written so you can hand it to the AI agent to scaffold/run. Existing stack: Vitest (unit/integration), Playwright (e2e), Deno test (edge functions).
> **Companion docs:** `PROBLEM_VALIDATION.md` (claims↔code), `SOURCE_OF_TRUTH.md` (§6 critical issues), `SYSTEM_ARCHITECTURE.md`.

---

## 0. Test philosophy & priority

Test in order of *risk to the brand*, not code coverage. For a privacy-first product, an isolation failure is existential; a UI glitch is not.

| Priority | Suite | Why first |
|---|---|---|
| **P0** | Tenant isolation & privilege | A single cross-tenant leak ends the company's credibility |
| **P0** | Migration/schema integrity | Everything else is unverifiable on an unknown schema |
| **P1** | Auth & session | Account takeover / dual-flow ambiguity |
| **P1** | Ticket lifecycle (core loop) | The product's reason to exist |
| **P1** | Public API (`api-v1`) | Service-role = no RLS net |
| **P2** | Realtime/chat, analytics, webhooks, email, usage limits | Feature correctness |
| **P2** | Claim-validation suite | Proves marketing = reality |
| **P3** | Load/scale, accessibility, PWA | Readiness for thousands of orgs |

**Definition of "done" for any feature:** passes its functional tests **and** the P0 isolation suite still passes with the feature enabled.

---

## 1. P0 — Tenant isolation & RBAC harness  (THE most important suite)

**Setup fixture:** two orgs (A, B), each with one `super_admin`(global), `admin`, `agent`, `client`; seed tickets/messages/settings in both. Run every assertion **as each role of org A against org B's data**, using real authenticated Supabase sessions (not service role).

### 1.1 Isolation assertions (must ALL return zero rows / denied)
- Org A admin reads `tickets` where `organization_id = B` → **0 rows**.
- Org A agent reads B's `messages` (incl. `is_internal`) → **0 rows**.
- Org A client reads tickets they didn't create in A → **0 rows** (client scope).
- Org A admin updates/deletes a B ticket → **denied**.
- Org A admin reads B's `organizations`, `subscription_usage`, `api_keys`, `webhooks`, `audit_logs`, `automation_rules`, `custom_roles`, `branding_settings` → **0 rows / denied** for each.
- Storage: org A user reads B's files under `attachments/{B-org-id}/...` → **denied**.

### 1.2 Privilege-escalation assertions (the §6.1 regression tests — write these FIRST, they should FAIL today)
- Authenticated client runs `profiles.update({ role: 'super_admin' }).eq('id', self)` → **must be denied** (today it succeeds — this test proves the bug, then guards the fix).
- Authenticated user runs `profiles.update({ organization_id: <org B id> }).eq('id', self)` → **must be denied**.
- After fix: org bootstrap goes through `create_organization_and_claim_owner()` RPC; assert first user becomes admin of the new org and **cannot** pick an existing org.
- Assert non-privileged columns (name, avatar, preferences) **still** update fine.

### 1.3 Make it a customer-facing artifact
- Emit a machine-readable report (JSON + HTML) "isolation: PASS, N assertions, timestamp, commit". Publish on the trust page (see `PRODUCT_STRATEGY.md` Pillar 1). Run in CI on every PR; **block merge on any isolation failure.**

**Windsurf prompt seed:** *"Create `tests/isolation/` with a Vitest suite that signs in real Supabase sessions for 8 fixture users across 2 orgs and asserts the matrix in TEST_PLAN.md §1.1–1.2. Provide a seed script and a teardown."*

---

## 2. P0 — Migration & schema integrity

- **Fresh-reset test:** automate `supabase db reset` against a throwaway project; assert exit 0 and no conflicting-object errors. (Today this is expected to FAIL — competing `consolidated` vs `phase*` files, `users`/`developer` refs. Capture the exact failures as the Phase-0 work list.)
- **Schema snapshot test:** dump `information_schema` after reset; diff against a committed golden snapshot. Fail on drift.
- **Object-existence assertions:** `webhooks`/`webhook_deliveries` exist (not `webhook_configs`/`webhook_logs`); `user_role` enum = exactly {super_admin, admin, agent, client}; no references to table `users`; helper fns `get_user_organization_id`/`get_user_role`/`is_super_admin` exist.
- **Documented-but-maybe-missing:** assert `check_plan_limit` exists; assert `increment_ticket_usage` trigger and `reset_monthly_usage` exist (today: expected FAIL — they're absent).
- **RLS coverage test:** for every table in `public`, assert `rowsecurity = true` and at least one SELECT + one write policy exists.

---

## 3. P1 — Authentication & session

- OTP: send→verify happy path; expired code (>10 min) rejected; wrong code rejected; rate limit (3/hr) enforced (`send-otp`/`verify-otp` Deno tests exist — extend).
- Magic link: link generates with correct base URL (`APP_URL`/`app.privydesk.com`, **never** `.lovable.app` — regression test); single-use; expiry.
- Dual-flow decision test: once one canonical flow is chosen, assert the other path is removed/disabled (no `signInWithPassword` reachable if passwordless-only).
- Session: persistence across reload; sign-out clears session; refresh-token rotation; access after expiry denied.
- Profile bootstrap: new `auth.users` → `profiles` row with `role='client'`, no org (`handle_new_user` trigger).
- 2FA/TOTP: enrollment, valid/invalid code, and **server-side enforcement** (assert a session without TOTP cannot reach protected resources when 2FA required).

---

## 4. P1 — Ticket lifecycle (core loop)

- Create ticket (client + agent + via API); status transitions open→in_progress→waiting_customer→resolved→closed; priority changes.
- Assignment, reassignment, `assigned_to` SET NULL on agent delete.
- Messages: public vs `is_internal` (client must NOT see internal — tie to isolation suite); attachments; read receipts.
- Canned responses variable substitution; templates; tags.
- SLA: first_response_at / resolved_at capture; breach detection + escalation (once engine wired).
- Edge cases: empty/oversized fields, XSS in subject/body (assert DOMPurify sanitizes — `input-sanitizer`), unicode, concurrent edits (`ticket_edit_locks`).

---

## 5. P1 — Public API (`api-v1`)

- AuthN: missing key → 401; invalid key → 401; valid key → 200; `x-api-key` and `Bearer` both work.
- AuthZ scopes: each endpoint enforces `read:*`/`write:*`/`delete:*`; missing scope → 403.
- **Cross-tenant contract test (critical):** key scoped to org A requesting `/tickets/:id` where ticket ∈ org B → 404/empty for **every** resource (tickets, messages, users, organization, analytics). Add this for each handler; treat a missing org filter as a release blocker.
- Rate limiting headers + 429 path; pagination caps (limit ≤100); request logging row written.
- Webhooks: assert delivery actually works (today FAILS — `webhook_configs` vs `webhooks` mismatch); signature (HMAC) correct; retry/backoff once queue added.

---

## 6. P2 — Feature correctness

- **Realtime/chat:** presence join/leave, typing, message broadcast; widget `/widget/:orgId` cannot read another org's data.
- **Analytics:** RPC outputs match seeded data; date-range filters; CSAT/SLA widgets.
- **Email:** OTP/invite/welcome send via SMTP; per-tenant `email_config` honored (once wired); secrets not leaked to non-admins.
- **Usage limits:** create tickets up to plan cap → blocked at limit (once enforced); monthly reset; storage accounting.
- **Onboarding wizard:** all 6 steps, persistence on refresh (`useOnboardingState`), slug generation, domain verify, branding, plan select.

---

## 7. P2 — Claim-validation suite (does marketing = reality?)

One test per marketed claim in `PROBLEM_VALIDATION.md`. Each test either proves the claim or is marked `@aspirational` and **the claim must be removed from the site until the test passes.** Tie this suite to a CI gate that scans `src/pages/Index.tsx` marketing strings against the passing set.
- "Enterprise security" → §1 + §3 + audit-immutability + 2FA-enforcement pass.
- "99.9% uptime SLA" → status-page + monitoring exist (else claim blocked).
- "Omnichannel" → real WhatsApp/SMS test passes (else reframe to "multichannel").
- "Seamless integrations" → ≥1 live integration round-trip test.

---

## 8. P3 — Scale, performance, resilience
- Load: N orgs × M tickets (e.g. 1k orgs × 10k tickets); p95 latency budgets for dashboard, ticket list, API list (set targets, e.g. <500ms p95).
- RLS performance: confirm helper-function policies use indexes; no per-row N+1.
- Analytics under load: rollup/materialized-view path.
- Webhook queue: throughput + dead-letter under burst.
- Resilience: Supabase failover behavior, edge cold-start, rate-limit fairness across tenants.
- A11y (axe is in deps): WCAG AA on key flows; PWA install/offline (`useInstallPrompt`, `OfflineBanner`).

---

## 9. CI/CD gates (wire into `.github/workflows/test.yml`)
1. `npm run lint` (zero warnings) — exists.
2. `npm run test` (unit/integration) — exists.
3. **Isolation harness (§1)** — NEW, blocking.
4. **Schema reset+snapshot (§2)** — NEW, blocking.
5. Playwright e2e (core loop §4) — exists/extend.
6. API contract tests (§5) — NEW, blocking.
7. Claim-validation (§7) — NEW, blocking before any marketing deploy.

**No deploy if any blocking gate fails.**

---

## 10. How to run it through Windsurf (suggested sequence)
1. *"Implement TEST_PLAN.md §1.2 first as failing tests"* → confirms the §6.1 vulnerability concretely.
2. *"Implement the §6.1 fix (RPC + policies + trigger) until §1.2 passes."*
3. *"Implement §2 fresh-reset test; iterate migrations until it's green"* (drives Phase 0).
4. *"Fill §1.1 isolation matrix; wire all blocking CI gates."*
5. Then §3–§7 feature suites; §8 load last.

Track progress against `DEVELOPMENT_PLAN.md` phases. Each phase's exit criteria = its tests green.
