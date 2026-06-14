# PrivyDesk — PROD vs Repo: Live DB Introspection Report

> **Project ref:** `mgnuddfytlbtgprckzto`
> **Captured:** Jun 14, 2026
> **Method:** Supabase Management API SQL endpoint (`information_schema` + `pg_catalog`) + PostgREST REST probes
> **`supabase db dump` status:** Blocked — CLI v2.72.9 `--linked` mode requires Docker (unavailable on this host). Full DDL captured via Management API instead; see `prod_schema_snapshot.sql`.
> **Read-only:** No DDL or DML was executed against the live database.

---

## 1. Webhook tables — which exist?

**Live DB answer: ALL FOUR tables exist.**

| Table | Type | Exists live? |
|---|---|---|
| `webhooks` | BASE TABLE | ✅ YES |
| `webhook_deliveries` | BASE TABLE | ✅ YES |
| `webhook_configs` | BASE TABLE | ✅ YES |
| `webhook_logs` | BASE TABLE | ✅ YES |

**Implication for §6.2 (SOURCE_OF_TRUTH):**
The repo described two competing sets of webhook table names:
- Schema migrations define `webhooks` / `webhook_deliveries`
- `supabase/functions/api-v1/index.ts` (lines ~519, 556, 582, 593) reads/writes `webhook_configs` / `webhook_logs`

**Both sets were applied to production.** The live DB has all four tables. This means:
- The *schema migrations* applied `webhooks` + `webhook_deliveries`
- Later phase migrations also applied `webhook_configs` + `webhook_logs`
- `api-v1` uses `webhook_configs` / `webhook_logs` — those tables exist, so the function is NOT broken by missing tables
- However, data may be split across two sets of webhook tables depending on which code path ran

**Recommended action (Phase 2, Step 2.1):** Decide canonical tables, migrate data if needed, remove the duplicate set, update `api-v1` to the canonical names.

---

## 2. `users` table or only `profiles`?

**Live DB answer: `users` is a VIEW over `profiles`. `profiles` is the only base table.**

```sql
-- VIEW definition (live):
CREATE VIEW public.users AS
  SELECT id, organization_id, email, full_name, role, avatar_url,
         is_active, last_login_at, email_verified, preferences, created_at, updated_at
  FROM public.profiles;
```

**What this means:**
- The `profiles` base table is the authoritative source (as intended in the base migration).
- A `users` VIEW was created by a phase migration — most likely from one of the `20260130_phase*` files that reference a `users` table. Rather than creating a base table, the migration created a compatibility view aliasing `profiles`.
- From the REST API, `GET /rest/v1/users` returns live data (PostgREST exposes the view) — this is why it appeared as a real table in earlier probes.
- **The ~120+ phantom `users` references in migration files partially resolved themselves** via this view — queries like `SELECT * FROM users WHERE ...` work. However, `INSERT INTO users` and `DELETE FROM users` against the view will behave differently than against `profiles` directly.

**Implication:** The `users` view provides backward compatibility but is a leaky abstraction. Any code inserting/updating users must target `profiles`, not `users`. Confirm no migration or edge function writes to `users` directly.

---

## 3. Does `user_role` enum contain `'developer'`?

**Live DB answer: NO. `developer` does NOT exist in the `user_role` enum.**

Live enum values (exact, from `pg_enum`):

```sql
-- user_role enum (live):
super_admin | admin | agent | client
```

No `developer` value. The repo's phase migration files (`20260130_phase2_api_keys.sql`, `20260130_phase2_webhooks.sql`) reference a `developer` role **17 times**, but these references never resulted in the enum value being added to the live DB.

**Implication:** Any migration or code path that tries to insert/compare a `developer` role will throw a Postgres `invalid input value for enum user_role: "developer"` error. The 17 references in the repo are dead code that will fail if replayed.

---

## 4. Do `check_plan_limit`, the `increment_ticket_usage` trigger, and `reset_monthly_usage` exist?

| Object | Type | Exists live? | Detail |
|---|---|---|---|
| `check_plan_limit` | FUNCTION | ✅ YES | `check_plan_limit(org_id uuid, limit_type text) → bool` |
| `increment_ticket_usage` | TRIGGER / FUNCTION | ❌ NO | Not in `pg_proc`, not in `information_schema.triggers` |
| `reset_monthly_usage` | FUNCTION | ❌ NO | Not in `pg_proc` |

**`check_plan_limit` — EXISTS:**
Confirmed via both RPC probe (HTTP 200 with correct params) and `pg_proc` query.
Source migration: `20260201_update_subscription_plans.sql:59`.
This function checks whether an org has hit its plan limit for a given limit type (`tickets`, `emails`, `storage`).

**`increment_ticket_usage` — DOES NOT EXIST:**
Not present as a function (`pg_proc`) or trigger (`information_schema.triggers`). It is not referenced in any migration file either — it was described in `SOURCE_OF_TRUTH.md §6.4` as missing, and the live DB confirms this. Ticket usage counters in `subscription_usage` are **not automatically incremented** on ticket creation.

**`reset_monthly_usage` — DOES NOT EXIST:**
Not present as a function, trigger, or `pg_cron` job. Monthly usage counters **never reset automatically**. The `subscription_usage.last_reset_at` column exists but is never updated by any automated process.

**Combined impact:** `check_plan_limit()` can evaluate whether a limit is exceeded, but since usage counters are never incremented or reset, the function always reads stale/zero values. Usage enforcement is effectively a no-op end-to-end.

---

## 5. Exact current `profiles` UPDATE policy (live)

```sql
-- From pg_policies (live):
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  AS PERMISSIVE FOR UPDATE
  USING (id = auth.uid());
  -- WITH CHECK: (none)
```

**This is the exact privilege-escalation vulnerability described in SOURCE_OF_TRUTH §6.1.**

- **No `WITH CHECK` clause** — Postgres applies the `USING` expression as the post-update check when `WITH CHECK` is absent. This means a user can UPDATE any column of their own row and the post-update state is only checked against `id = auth.uid()` — which will always be true since the user can't change their own `id`.
- **No column restriction** — there is nothing preventing a user from setting `role = 'super_admin'` or `organization_id = '<any other org uuid>'`.
- **Confirmed live** — this policy text is directly from `pg_policies`, not inferred from the migration file.

**Full profiles policy set (live, 3 policies):**

| Policy | CMD | USING | WITH CHECK |
|---|---|---|---|
| Users can insert their own profile | INSERT | *(none)* | `(id = auth.uid())` |
| Users can update their own profile | UPDATE | `(id = auth.uid())` | *(none — BUG)* |
| Users can view profiles in their organization | SELECT | `(organization_id = get_user_organization_id()) OR is_super_admin() OR (id = auth.uid())` | *(none)* |

---

## Additional findings from introspection

### Tables without RLS (3)

These three tables have `rowsecurity = false` in `pg_tables`:

| Table | Risk |
|---|---|
| `attachments` | 🟠 Medium — attachment records readable/writable by any authenticated user |
| `otp_codes` | 🔴 High — OTP codes readable by any authenticated user (auth bypass risk) |
| `rate_limits` | 🟡 Low — rate limit counters readable/writable (rate-limit bypass risk) |

`otp_codes` without RLS is particularly concerning — any authenticated user can query all pending OTP codes across all users.

### Total live schema size

| Object type | Count |
|---|---|
| Base tables | 82 |
| Views | 1 (`users`) |
| Functions | 26 |
| Triggers (public schema) | 10 |
| Triggers (auth schema) | 1 (`on_auth_user_created`) |
| RLS policies | 162 |
| Enums | 5 (`user_role`, `org_status`, `plan_type`, `ticket_status`, `ticket_priority`) |

### `handle_new_user` trigger

Exists as `on_auth_user_created` AFTER INSERT ON `auth.users`. Confirmed live — new users get a `profiles` row created automatically.

---

## Summary table for WINDSURF_EXECUTION_PLAN Phase 2

| Question | Repo assumption | Live DB reality | Action needed |
|---|---|---|---|
| Webhook tables | `webhooks`/`webhook_deliveries` OR `webhook_configs`/`webhook_logs` | **All four exist** | Decide canonical set, drop duplicates, align `api-v1` |
| `users` table | Phantom in migrations, shouldn't exist | **VIEW over `profiles`** | Safe to keep as compat shim; ensure no INSERT/UPDATE targets it |
| `developer` role | Referenced 17× in 2 migration files | **Does NOT exist in enum** | Remove all 17 references in phase migrations |
| `check_plan_limit` | Defined in `20260201` migration | **EXISTS** ✅ | No action; wire up the missing increment/reset |
| `increment_ticket_usage` | Described as missing (§6.4) | **DOES NOT EXIST** | Create trigger on `tickets` INSERT |
| `reset_monthly_usage` | Described as missing (§6.4) | **DOES NOT EXIST** | Create scheduled function (pg_cron or Edge Function) |
| `profiles` UPDATE policy | `USING (id = auth.uid())`, no WITH CHECK | **Confirmed identical** | Fix per §6.1 — add WITH CHECK + column guard trigger |
| RLS coverage | Should be enabled on all tables | **3 tables missing RLS** (`attachments`, `otp_codes`, `rate_limits`) | Add RLS + policies; `otp_codes` is P0 |
