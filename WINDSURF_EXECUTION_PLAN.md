# PrivyDesk — Windsurf Execution Plan (Step-by-Step + Copy-Paste Prompts)

> **How to use this:** Work top to bottom. Each step has (a) what/why, (b) a **prompt to paste into Windsurf** (Claude model), (c) how to verify, (d) the git/deploy action. Don't skip a step's verification before moving on.
>
> **Decisions locked for this plan:**
> - **DB rollout:** NO dry-run DB (user opted out of both cloud staging and local Docker). Each migration is **forward-only with rollback SQL written before applying**, applied to production (`mgnuddfytlbtgprckzto`) **one at a time, in a low-traffic window, verified with a disposable test org immediately after**. This is the accepted-risk path — the privilege-escalation fix touches onboarding, so the post-apply test-org check is mandatory, not optional.
> - **Migrations:** reconcile to the **live DB** with forward-only corrective migrations (do **not** rebuild from scratch).
> - **Git:** feature branch → PR → merge to `main`. Cloudflare Pages auto-deploys `main`.
> - **Guardrail:** never run `supabase db push` / `db reset` against the PRODUCTION link. Production gets migrations only via the deliberate, rollback-ready apply in Phase 4. The local DB is where `db reset`/iteration happens.
>
> **Golden rules:**
> 1. Never push secrets. `.env*` must stay gitignored.
> 2. Nothing touches production DB until it's green on staging.
> 3. No marketing/security claim goes live until its test passes (`TEST_PLAN.md` §7).
> 4. Reference docs in prompts: `SOURCE_OF_TRUTH.md`, `TEST_PLAN.md`, `SYSTEM_ARCHITECTURE.md`, `DEVELOPMENT_PLAN.md`.

---

## PHASE 0 — Safety net & environment (do this FIRST, before any code change)

### Step 0.0 — 🔴 SECRET EXPOSURE REMEDIATION (do this before everything else)
**Why:** `.env` and `.env.production` are **tracked and pushed to GitHub**, and `.gitignore` had no env rules. The Supabase value is the public **anon** key (low risk), but `.env:7` contains a real **`VITE_HOSTINGER_API_KEY`** — a live secret on a public-ish remote. Decisions made: **revoke the Hostinger key at source + remove it entirely** (Hostinger is unused — stale artifact per `SOURCE_OF_TRUTH.md` §10); **untrack env files going forward, no history scrub** (the only real secret is being revoked).

**Manual first (you — Windsurf cannot do this):** Log into the Hostinger dashboard and **revoke/delete** the API key `8gCIfK6Av…12ccc601` now. This is what actually closes the exposure; git cleanup only stops future tracking.

**Prompt to Windsurf (after you've revoked the key):**
```
Secret-hygiene cleanup on branch `chore/safety-baseline`:
1. `.gitignore` has been updated to ignore .env, .env.*, .env.local, .env*.local (keeping !.env.example). Confirm it's correct.
2. Delete the two Hostinger lines (VITE_HOSTINGER_API_URL and VITE_HOSTINGER_API_KEY) from `.env` — Hostinger is unused (SOURCE_OF_TRUTH §10). Also remove any VITE_HOSTINGER_* keys from `.env.example`.
3. Untrack the secret files WITHOUT deleting them locally: `git rm --cached .env .env.production`.
4. Verify with `git status` that .env and .env.production are now untracked and ignored, and that no other secret files are tracked. Show me the result.
5. Commit ONLY the .gitignore change and the .env.example cleanup with message "chore: stop tracking env files, remove unused Hostinger secret". Do NOT commit .env or .env.production. Do NOT force-push or rewrite history.
Note: the old Hostinger key remains in past git history but is harmless now that it's revoked — we are intentionally NOT scrubbing history.
```
**Verify:** `git status` shows `.env`/`.env.production` untracked + ignored; Hostinger key revoked in dashboard; commit contains only `.gitignore` + `.env.example`. Then open a PR for this branch (it's a clean, low-risk first merge that also fixes the baseline).

### Step 0.0b — Verify Cloudflare has the Supabase env vars BEFORE untracking goes live
**Why:** the build command is `vite build` (production), which historically loaded `.env.production` from the repo. Once that file is untracked and the merge hits `main`, the Cloudflare build must get the Supabase values from **Cloudflare's own dashboard env vars** instead — or the production bundle ships with no Supabase connection.

**Status: ✅ VERIFIED (dashboard screenshot).** Cloudflare Pages project `privydesk-support-suite` → Settings → Variables and Secrets contains all three required build vars:
- `VITE_SUPABASE_URL` = `https://mgnuddfytlbtgprckzto.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` = anon key
- `VITE_SUPABASE_PROJECT_ID` = `mgnuddfytlbtgprckzto`
(plus `NODE_VERSION=18`, `VITE_APP_VERSION`, `VITE_ENABLE_ANALYTICS`, `VITE_ENABLE_ERROR_TRACKING`). The build environment is self-sufficient.

**Remaining checkbox before merge:**
- [ ] Confirm the three Supabase vars are present in the **Production** scope (required for `main` → `privydesk.com`/`app.privydesk.com`). If a Production/Preview toggle exists, also add them to **Preview** if PR/preview deploys must reach Supabase (needed if Phase 3 CI uses preview deploys; otherwise optional).
- [ ] Confirm the **Hostinger API key is revoked** in the Hostinger dashboard (Step 0.0 close-out — independent of git).

**Dashboard path (manual):** Cloudflare → Compute → Workers & Pages → `privydesk-support-suite` → Settings → Variables and Secrets.

**Post-merge verification prompt to Windsurf (run after the rebuild finishes):**
```
The env-untracking commit has merged to main and Cloudflare rebuilt. Re-fetch the live production JS bundle (https://app.privydesk.com, find the /assets/index-*.js) and grep it for `mgnuddfytlbtgprckzto` and `supabase.co`. If present, this is definitive proof the Cloudflare dashboard env vars (not the now-removed repo .env.production) are feeding the build, and the untracking is confirmed safe. Report found/not-found.
```

### Step 0.0c — Push branch + open PR (hold the merge)
**Why:** pushing the *branch* is safe (not `main`); **merging is the deploy** and the moment `.env.production` leaves `origin/main`'s tip.

**Prompt to Windsurf:**
```
Push branch `chore/safety-baseline` to origin and open a PR against main titled "chore: stop tracking env files + remove unused Hostinger secret". In the PR description, note: (1) untracks .env/.env.production, (2) removes unused Hostinger key, (3) Cloudflare dashboard already has the Supabase build vars (Step 0.0b verified), (4) merging this will remove .env.production from origin/main's tip and trigger a Cloudflare rebuild. Do NOT merge — hold until the two Step 0.0b checkboxes are confirmed.
```
**Verify (before you click merge):** both Step 0.0b checkboxes ticked → merge → watch the Cloudflare deploy go green → run the post-merge bundle check above.

### Step 0.1 — Confirm clean git state + branch protection
**Why:** auto-deploy from `main` means an accidental push goes live. Protect it.

**Prompt to Windsurf:**
```
Show me `git status`, the current branch, and the remote. Confirm `.env`, `.env.production`, and any secrets are gitignored (grep .gitignore). Then create and check out a new branch `chore/safety-baseline`. Do NOT commit anything yet — just report the repo state and whether any secret files are tracked.
```
**Verify:** working tree clean; `.env*` NOT tracked. On GitHub, enable branch protection on `main` (require PR before merge) — do this in the GitHub UI.

### Step 0.2 — (SKIPPED) No dry-run DB
**User opted out of both cloud staging and local Docker.** There is no throwaway database. This means:
- Migrations are validated by **careful code review + written rollback SQL**, then applied to production one at a time with immediate verification (Phase 4).
- The privilege-escalation fix's tests (Phase 1) will run against **production using disposable test orgs that are deleted right after** — there is no other DB to run them on.
- **Mandatory compensating control:** every DB migration must have its rollback SQL written and reviewed *before* it is applied, and a disposable-test-org verification *immediately after*. No exceptions, because onboarding is in the blast radius.

> Wherever later steps say "staging" or "local DB," read it as **"production, via a disposable test org, with rollback ready."** Production is touched only in Phase 4, never via `db push`/`db reset`.

### Step 0.3 — Snapshot the LIVE production schema (source of truth for reconciliation)
**Why:** we reconcile to what's actually deployed, not to the messy migration files.

**Prompt to Windsurf:**
```
Link the Supabase CLI to the PRODUCTION project (project-ref mgnuddfytlbtgprckzto) in READ-ONLY fashion. Pull the current deployed schema using `supabase db dump --schema public` (schema only, no data) into `supabase/_introspection/prod_schema_snapshot.sql`. Then produce a short report `supabase/_introspection/PROD_VS_REPO.md` comparing the live schema to the migration files in supabase/migrations, specifically: (1) does the live DB have `webhooks`/`webhook_deliveries` or `webhook_configs`/`webhook_logs` (or both)? (2) is there a `users` table or only `profiles`? (3) does the `user_role` enum contain `developer`? (4) do `check_plan_limit`, `increment_ticket_usage` trigger, `reset_monthly_usage` exist? (5) what is the exact current `profiles` UPDATE policy? Cite the live DB, not the repo. Do not modify the production database.
```
**Verify:** snapshot + comparison report exist. **This report drives every migration decision below.** Commit these introspection files on the branch (they're not secrets).

---

## PHASE 1 — P0 #1: Close the privilege-escalation / tenant-hijack hole

> This is the single most important fix. We write the failing test FIRST, then fix until green. All on staging.

### Step 1.1 — Write the failing security tests (prove the bug)
**Prompt to Windsurf:**
```
Read SOURCE_OF_TRUTH.md §6.1 and TEST_PLAN.md §1.2. Create a Vitest suite at `tests/isolation/privilege-escalation.test.ts` that runs against the STAGING Supabase project using real authenticated sessions (anon key + signInWithPassword or OTP test users). Seed two orgs (A, B) and test users. Assert:
1. An authenticated client running `supabase.from('profiles').update({ role: 'super_admin' }).eq('id', self)` is DENIED (no row changed).
2. An authenticated user running `supabase.from('profiles').update({ organization_id: <orgB id> }).eq('id', self)` is DENIED.
3. A non-privileged update (full_name) SUCCEEDS.
Include a seed script `tests/isolation/seed.ts` and teardown. Run the suite and show me the output. These tests are EXPECTED TO FAIL on assertions 1 and 2 right now — that proves the vulnerability. Do not fix the policy yet.
```
**Verify:** tests 1 & 2 fail (bug reproduced), test 3 passes.

### Step 1.2 — Implement the fix (forward-only migration + server-side bootstrap)
**Prompt to Windsurf:**
```
Now implement the fix as a NEW forward-only migration `supabase/migrations/<timestamp>_fix_profiles_privilege_escalation.sql` (use a timestamp AFTER the latest existing migration). Requirements:
1. Replace the `profiles` UPDATE policy so users can update ONLY non-privileged columns of their own row. Add a `WITH CHECK`. Use a BEFORE UPDATE trigger that raises an exception if `role` or `organization_id` changes unless the session is service_role OR the caller is an existing admin/super_admin of the relevant org.
2. Create a SECURITY DEFINER function `create_organization_and_claim_owner(...)` that atomically: inserts the organization, sets the caller's profile organization_id + role='admin', and seeds subscription_usage. It must reject the call if the caller already has an organization, and must NOT let the caller choose an existing org id.
3. Update `src/pages/Onboarding.tsx` to call this RPC via `supabase.rpc('create_organization_and_claim_owner', {...})` instead of the client-side `profiles.update({ role:'admin', organization_id })` at lines 73-80.
Apply the migration to STAGING only. Re-run `tests/isolation/privilege-escalation.test.ts`. All three assertions must now pass. Show me the diff and the test output.
```
**Verify:** all 3 tests pass on staging; onboarding still creates an org + admin correctly (run it manually on the staging app via `npm run dev` pointed at staging).

### Step 1.3 — Commit + PR (staging-verified)
**Prompt to Windsurf:**
```
Commit the failing-then-passing tests, the migration, and the Onboarding.tsx change on branch `fix/p0-privilege-escalation`. Write a clear commit message and PR description summarizing the vulnerability, the fix, and the test evidence. Push the branch and open a PR against main. Do NOT merge yet — production DB migration must be coordinated (see Phase 4).
```

---

## PHASE 2 — P0 #2: Reconcile migrations to the live DB (forward-only)

> Using `PROD_VS_REPO.md` from Step 0.3. We do NOT rebuild; we write corrective migrations matching reality.

### Step 2.1 — Fix webhook table drift
**Prompt to Windsurf:**
```
Based on supabase/_introspection/PROD_VS_REPO.md, the live DB and `api-v1` disagree on webhook table names (schema: webhooks/webhook_deliveries; code: webhook_configs/webhook_logs — see api-v1/index.ts lines ~519,556,582,593,602,611). Decide the canonical names from what the LIVE DB actually has, then make code and schema agree with a forward-only migration if needed (e.g. create/rename to the canonical tables) AND update `supabase/functions/api-v1/index.ts` to use the canonical names. Add a test (TEST_PLAN.md §5) that a webhook delivery row is actually written. Apply to staging, run the test, show results. Do not touch production.
```

### Step 2.2 — Neutralize phantom `users` / `developer` references
**Prompt to Windsurf:**
```
The phase migration files reference a non-existent `users` table and `developer` role (SOURCE_OF_TRUTH.md §6.2; ~120+ refs across 16 files; `developer` in 20260130_phase2_api_keys.sql and _phase2_webhooks.sql). The live DB uses `profiles` with roles super_admin/admin/agent/client. Goal: make the migrations replayable and consistent with the live DB WITHOUT rebuilding. For any migration object that did NOT actually apply to prod (per PROD_VS_REPO.md), rewrite its `users`→`profiles` and remove `developer` from role lists, standardizing RLS on the get_user_organization_id()/get_user_role() helpers. For objects that DID apply, write forward-only corrective migrations. Resolve the duplicate `consolidated_phases_1_9.sql` vs individual `phase*` files by keeping exactly one definition per object. Document every decision in `supabase/_introspection/MIGRATION_RECONCILIATION.md`. Apply to staging and confirm `supabase db reset` on a FRESH staging-like project succeeds with exit 0.
```

### Step 2.3 — Schema integrity + RLS coverage tests
**Prompt to Windsurf:**
```
Implement TEST_PLAN.md §2: a test that runs `supabase db reset` on a throwaway/staging DB and asserts exit 0 with no conflicting-object errors; a schema-snapshot diff test against a committed golden snapshot; object-existence assertions (webhooks/webhook_deliveries exist; no `users` table; user_role enum = exactly {super_admin,admin,agent,client}; helper functions exist); and an RLS-coverage test asserting every public table has rowsecurity=true plus >=1 SELECT and >=1 write policy. Make these blocking. Run and show output.
```
**Verify:** fresh reset is green; integrity tests pass. Commit on `fix/p0-migration-reconciliation`, open PR.

---

## PHASE 3 — Full tenant-isolation harness + API hardening + CI gates

### Step 3.1 — Complete the isolation matrix
**Prompt to Windsurf:**
```
Extend tests/isolation/ to cover the full TEST_PLAN.md §1.1 matrix: 2 orgs × roles {super_admin, admin, agent, client}, asserting zero cross-tenant access on tickets, messages (incl is_internal), organizations, subscription_usage, api_keys, webhooks, audit_logs, automation_rules, custom_roles, branding_settings, and storage objects. Emit a machine-readable report (JSON + HTML): "isolation: PASS/FAIL, N assertions, commit, timestamp" into `tests/isolation/report/`. Run against staging; everything must pass.
```

### Step 3.2 — Harden `api-v1` (org-scoping data layer + contract tests)
**Prompt to Windsurf:**
```
Per SOURCE_OF_TRUTH.md §6.3: refactor supabase/functions/api-v1/index.ts so NO handler calls supabase.from(...) directly. Introduce a single data-access helper that always injects `.eq('organization_id', organization_id)`. Add per-endpoint contract tests (TEST_PLAN.md §5): an API key scoped to org A requesting any resource belonging to org B returns 404/empty — for tickets, messages, users, organization, analytics. Also require auth on `analyze-ticket` (or add API-key/rate-limit) — update supabase/config.toml accordingly. Run tests on staging.
```

### Step 3.3 — Wire CI gates
**Prompt to Windsurf:**
```
Update .github/workflows/test.yml to add blocking jobs in this order: lint (zero warnings), unit/integration (vitest), isolation harness (§1), schema reset+snapshot (§2), api-v1 contract tests (§5). Configure the workflow to use STAGING Supabase secrets via GitHub Actions secrets (not committed). Fail the build (and block merge) if any job fails. Show me the final workflow file.
```
**Verify:** CI runs green on the open PRs. Commit on `chore/ci-isolation-gates`, PR.

---

## PHASE 4 — Production rollout (only after Phases 1–3 are green on staging)

### Step 4.1 — Dry-run the production migration
**Prompt to Windsurf:**
```
Prepare the production migration rollout. List, in order, every forward-only migration created in Phases 1-2 that must be applied to production (mgnuddfytlbtgprckzto). For each, state exactly what it changes and the rollback. Produce `supabase/_introspection/PROD_ROLLOUT_PLAN.md` with: pre-checks, the apply order, expected downtime (should be near-zero), verification queries, and rollback steps. Do NOT apply anything yet.
```
**Verify:** you read and approve the rollout plan.

### Step 4.2 — Apply to production in a maintenance window
**Manual + Windsurf, coordinated. Prompt:**
```
Apply the approved production migrations to mgnuddfytlbtgprckzto following PROD_ROLLOUT_PLAN.md, one at a time, running the verification query after each. After all applied: run the privilege-escalation tests (§1.2) and the isolation report (§3.1) pointed at PRODUCTION using disposable test orgs, then delete those test orgs. Confirm a real onboarding still works (create a throwaway org via the app, verify admin role assigned via RPC, then remove it). Report results.
```
**Verify:** prod tests pass; onboarding works; no real tenant data disturbed.

### Step 4.3 — Merge PRs → auto-deploy to Cloudflare
**Prompt to Windsurf:**
```
Now that production DB matches the code, merge the PRs to main in dependency order: migration-reconciliation first, then privilege-escalation fix, then api-v1 hardening, then CI gates. After each merge, confirm the Cloudflare Pages build for `main` succeeds (check the deployment status) before merging the next. After all merged, verify https://app.privydesk.com loads and a test login + onboarding works end-to-end. Report the live deployment status.
```
**Verify:** Cloudflare deploy green; live app works; isolation now provable.

---

## PHASE 5 — Make claims true / cleanup (P1, after P0 is live)

Run these as separate branch→PR cycles, each gated by its test (`TEST_PLAN.md` §7):

1. **Reconcile config.toml project_id** (`bfhifrxycjlzjsffpxgc` → `mgnuddfytlbtgprckzto`).
   Prompt: *"Fix supabase/config.toml project_id to mgnuddfytlbtgprckzto to match .env/package.json/scripts. Confirm nothing else depends on the old id."*
2. **Usage enforcement + monthly reset** (`increment_ticket_usage` trigger + `reset_monthly_usage` via pg_cron/scheduled fn).
3. **Tamper-evident audit logs** (remove `WITH CHECK (true)`; restrict to service role).
4. **Server-side 2FA enforcement** verification.
5. **SSO/SAML + SCIM** (Tier 1 enterprise gate — `PRODUCT_STRATEGY.md`).
6. **Status page + uptime monitoring** (so the "99.9% SLA" claim is honest, or soften copy — `PROBLEM_VALIDATION.md` §A.3).
7. **Right-size marketing copy** in `src/pages/Index.tsx`: "omnichannel"→"multichannel," soften SLA wording, until tests back the claims.
8. **Commit the Cloudflare `subdomain-router` Worker source + wrangler.toml** so routing is reproducible (currently dashboard-only).
9. **Delete/label stale artifacts** (`.htaccess`, `get-domain-ip.js`, Hostinger keys in `.env.example`, `CUSTOM_DOMAIN_ARCHITECTURE.md`).

---

## PHASE 6 — Full UI redesign ("Privacy Premium" dark theme)  [VISUAL ONLY]

> **Do this LAST**, after the P0 security fixes are merged. It's pure visual, lowest-risk, but it touches `Index.tsx`, `vite.config.ts`, and dashboard layout — files the security work also touches — so sequencing it after avoids merge conflicts that could silently revert a security fix. Branch: `feat/redesign-privacy-premium`. Do NOT merge until P0 PRs are merged and reviewed.

> **CONTENT IS FROZEN.** This is a design/layout/motion/theme change ONLY. Every user-facing string stays PrivyDesk's current copy. The SENTINEL AI reference is a *visual* reference only — never copy its security-company text. Reuse the exact existing strings in the repo (e.g. `src/pages/Index.tsx` features: "AI-Powered Ticketing", "Real-Time Live Chat", "Multi-Tenant Architecture", "Advanced Analytics", "Enterprise Security", current hero copy, pricing values, trust lines). No new copy, no removed copy, no reordered claims unless purely a layout consequence.

**Palette — "Privacy Premium" (dark, HSL):** background `222 22% 8%`, foreground `210 20% 96%`, primary(teal) `173 80% 45%`, accent(violet) `258 90% 66%`, secondary `222 18% 14%`, muted `222 16% 16%`, muted-foreground `215 16% 60%`, border/input `222 16% 18%`, ring `173 80% 45%`, nav-button `222 18% 14%`, hero-bg `224 30% 5%`. Signature gradient = teal→violet.

**Intensity gradient:** marketing/auth = full 3D hero + parallax + staggered reveals; dashboard = same tokens/fonts/subtle motion but NO 3D and no heavy animation over tables/forms. Always respect `prefers-reduced-motion`. Lazy-load the 3D hero (R3F/Three.js, NOT Spline) with a static gradient fallback; never load it on `/dashboard/*`.

**Prompt to Windsurf:** see the full redesign prompt provided in chat (stack, fonts, tokens, animations, hero, navbar, button variants, dashboard reskin, hard constraints, page-group-by-group commit workflow). Key hard constraints: content frozen, no Spline, no functionality breakage, code-split 3D off dashboard routes, build+lint clean, branch not main, PR-not-merge.

---

## Quick reference — the order in one screen

```
PHASE 0  Safety + staging + introspect live DB        (no prod changes)
PHASE 1  Fix privilege escalation (test-first)        (staging)
PHASE 2  Reconcile migrations to live DB              (staging)
PHASE 3  Full isolation harness + api-v1 + CI gates   (staging)
PHASE 4  Apply to PROD → merge PRs → Cloudflare live   (production)
PHASE 5  Make claims true + cleanup                    (ongoing, gated)
```

**Stop conditions (do not proceed if):**
- Any isolation/escalation test is failing → fix before moving on.
- A `db reset` is not green → migrations not ready for prod.
- Secrets appear in a tracked file → remove, rotate, recommit.
- A marketing claim has no passing test → don't ship the claim.

---

## Notes on tools & access
- **Supabase CLI** is already a devDependency; PowerShell scripts exist under `scripts/`. Windsurf can run these.
- **GitHub Actions secrets** (staging Supabase URL/anon/service-role) must be added in the GitHub repo settings, not committed.
- **Cloudflare** auto-deploys `main` from GitHub (`Charanjitsingh1991/privydesk-support-suite`); no manual deploy needed — merging is deploying. Keep that in mind: **merge = live.**
- Each prompt is scoped to one concern so Windsurf stays focused and diffs stay reviewable.
