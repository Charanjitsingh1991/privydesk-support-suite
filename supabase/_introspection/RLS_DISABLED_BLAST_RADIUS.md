# RLS-Disabled Tables — Blast Radius Assessment

> **Purpose:** Read-only investigation of the three tables identified in `PROD_VS_REPO.md` with `rowsecurity = false`.
> **Project ref:** `mgnuddfytlbtgprckzto`
> **Assessed:** Jun 14, 2026
> **Method:** Anon REST API probes (no auth header beyond the public anon key) + Management API grant/column queries.
> **No changes made** — this is a read-only assessment. No RLS, policies, or data were modified.

---

## TL;DR — Severity Summary

| Table | Anon-readable? | Live rows returned? | Severity |
|---|---|---|---|
| `otp_codes` | ✅ YES — full rows | ✅ YES — 1 live row (email + plaintext OTP code) | 🔴 **P0 CRITICAL** |
| `rate_limits` | ✅ YES — full rows | ✅ YES — 3 live rows (emails + action state) | 🔴 **P0 HIGH** |
| `attachments` | ✅ YES — full rows | ⬜ 0 rows (table is empty) | 🟠 **P1 HIGH** (time-bomb) |

**Bottom line:** `otp_codes` is a live auth-bypass vector right now. Anyone on the internet — no account needed — can retrieve valid OTP codes for any user and log in as them. `rate_limits` exposes PII and allows brute-force protection bypass. `attachments` is currently safe by accident (empty table) but structurally identically broken.

---

## 1. `otp_codes`

### Anon REST probe (exact test)

```
GET https://mgnuddfytlbtgprckzto.supabase.co/rest/v1/otp_codes?limit=5&select=*
Headers: apikey: <anon key>   (no Authorization, no session)
```

**Result: HTTP 200 — live data returned**

```json
[{
  "id": "1a9c0d64-d074-4fcb-aa6b-181b0d131225",
  "email": "singhc21@gmail.com",
  "code": "681712",
  "type": "signup",
  "expires_at": "2026-02-18T19:27:16.681594+00:00",
  "used_at": null,
  "created_at": "2026-02-18T19:17:16.681594+00:00"
}]
```

**A real OTP code (`681712`) for a real email address was returned to an unauthenticated request.**
(This specific row is expired, but the mechanism is live for any new OTP issued.)

### Columns (what leaks)

| Column | Type | Sensitivity |
|---|---|---|
| `id` | uuid | Low |
| `email` | text NOT NULL | 🔴 PII — user email address |
| `code` | text NOT NULL | 🔴 **Plaintext OTP credential** |
| `type` | text | Medium — reveals auth flow (`signup`, `login`, etc.) |
| `expires_at` | timestamptz | Medium — attacker knows the window |
| `used_at` | timestamptz | Medium — reveals whether code has been consumed |
| `created_at` | timestamptz | Low |

### Grants (live from `information_schema.role_table_grants`)

| Grantee | SELECT | INSERT | UPDATE | DELETE | TRUNCATE |
|---|---|---|---|---|---|
| `anon` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `authenticated` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `service_role` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `postgres` | ✅ | ✅ | ✅ | ✅ | ✅ |

**`anon` has full CRUD + TRUNCATE.** No policies defined (`pg_policies` returns 0 rows for this table). RLS is off.

### Defined policies
**None.** `pg_policies` returns 0 rows for `otp_codes`.

### Attack scenarios

1. **Auth bypass (account takeover):**
   - Attacker knows a victim email address (e.g. from a prior breach or enumeration).
   - Victim requests a magic-link / OTP login.
   - Attacker immediately polls `GET /rest/v1/otp_codes?email=eq.<victim>&used_at=is.null` with the anon key.
   - Retrieves the plaintext code before the victim uses it.
   - Calls the `verify-otp` Edge Function with the stolen code → authenticated as victim.
   - **No brute-force needed. Single API call.**

2. **OTP invalidation / DoS:**
   - Attacker DELETEs pending OTP rows for a target → victim's login link/code no longer works.
   - Or: attacker UPDATEs `used_at` to a past timestamp → code appears consumed.

3. **User enumeration:**
   - `GET /rest/v1/otp_codes?select=email` returns all email addresses that have ever requested an OTP, even expired ones (if rows are not cleaned up by `cleanup_expired_otps()`).

### Live row count
**1 row** (expired but structurally identical to a live row).

---

## 2. `rate_limits`

### Anon REST probe (exact test)

```
GET https://mgnuddfytlbtgprckzto.supabase.co/rest/v1/rate_limits?limit=5&select=*
Headers: apikey: <anon key>
```

**Result: HTTP 200 — live data returned**

```json
[
  {"identifier":"singhc21@gmail.com","action":"magic_link","attempts":1,...},
  {"identifier":"singhc21@gmail.com","action":"otp_request","attempts":1,...},
  {"identifier":"...","action":"otp_verify","attempts":1,...}
]
```

**3 live rows returned, all containing email addresses and auth-flow metadata.**

### Columns (what leaks)

| Column | Type | Sensitivity |
|---|---|---|
| `id` | uuid | Low |
| `identifier` | text NOT NULL | 🔴 PII — user email address (or IP) |
| `action` | text NOT NULL | Medium — reveals auth actions in progress |
| `attempts` | integer | 🔴 Security state — how many times this has been tried |
| `first_attempt_at` | timestamptz | Medium |
| `last_attempt_at` | timestamptz | Medium |
| `blocked_until` | timestamptz | 🔴 Security state — whether user/IP is currently blocked |

### Grants

Identical to `otp_codes`: **`anon` has SELECT + INSERT + UPDATE + DELETE + TRUNCATE.** No policies. RLS off.

### Defined policies
**None.**

### Attack scenarios

1. **Rate-limit bypass:**
   - Attacker is being throttled on `otp_request` or `magic_link`.
   - `DELETE /rest/v1/rate_limits?identifier=eq.<attacker email>` via anon key → wipes their own rate limit entry.
   - They can now make unlimited authentication attempts again.
   - Combined with `otp_codes` read: unlimited OTP theft attempts with no throttle.

2. **Targeted DoS:**
   - Attacker INSERT a `rate_limits` row with `identifier=<victim email>`, `blocked_until=<far future>`.
   - Victim is effectively locked out of all rate-limited auth actions.

3. **User/activity enumeration:**
   - `GET /rest/v1/rate_limits?select=identifier,action` returns all emails that have triggered rate-limited actions, plus what they were doing.

### Live row count
**3 rows.**

---

## 3. `attachments`

### Anon REST probe (exact test)

```
GET https://mgnuddfytlbtgprckzto.supabase.co/rest/v1/attachments?limit=5&select=*
Headers: apikey: <anon key>
```

**Result: HTTP 200 — empty array `[]` returned.**

Table is accessible (not blocked by any Postgres-level control) but currently contains no rows.

### Columns (what would leak once populated)

| Column | Type | Sensitivity |
|---|---|---|
| `id` | uuid | Low |
| `ticket_id` | uuid | Medium — cross-tenant ticket ID exposure |
| `message_id` | uuid | Medium |
| `file_name` | text NOT NULL | Medium — reveals file names of support attachments |
| `file_size` | bigint NOT NULL | Low |
| `file_type` | text NOT NULL | Low |
| `storage_path` | text NOT NULL | 🔴 **Storage path** — can be used to construct direct Supabase Storage URLs |
| `uploaded_by` | uuid | Medium — user UUID |
| `created_at` | timestamptz | Low |

### Grants

Identical to the other two tables: **`anon` has full CRUD + TRUNCATE.** No policies. RLS off.

### Defined policies
**None.**

### Why it's still P1 despite 0 current rows

- The moment a support agent or client uploads an attachment in any org, `storage_path` is readable by anyone.
- Supabase Storage buckets default to private, but `storage_path` exposure allows an attacker to guess or directly construct signed-URL requests if the bucket's policies are misconfigured.
- Any cross-tenant file leak becomes possible: anon can query `?ticket_id=eq.<any uuid>` and retrieve attachment metadata for tickets in any organization.
- Anon can also INSERT fake attachment records (pointing to malicious storage paths) or DELETE real ones.

### Live row count
**0 rows.** Currently safe by accident.

---

## Composite attack (worst case, live today)

An attacker with no account can, right now, in sequence:

1. **Identify a target user** — query `GET /rest/v1/otp_codes?select=email` to enumerate registered emails.
2. **Trigger a login** for the target email via the UI (the attacker just needs to know the email).
3. **Immediately poll** `GET /rest/v1/otp_codes?email=eq.<target>&used_at=is.null` to retrieve the live OTP code.
4. **Call `verify-otp`** Edge Function with the stolen code → authenticated session as the victim.
5. **Wipe the evidence** by DELETE-ing the `otp_codes` row and the `rate_limits` entry.

**This is a complete, no-brute-force account takeover of any user in the system.**

---

## Recommended fixes (do NOT apply yet — assessment only)

> These are flagged for Phase 1 / the RLS remediation migration. Do not apply until reviewed.

### `otp_codes` (P0 — fix immediately)
```sql
-- Step 1: Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Step 2: Revoke table-level grants from anon/authenticated
-- (the Edge Functions use service_role key, so they don't need grants)
REVOKE ALL ON public.otp_codes FROM anon, authenticated;

-- Step 3: No SELECT policy for anon/authenticated at all.
-- Only service_role (which bypasses RLS) should access this table.
```

### `rate_limits` (P0 — fix with otp_codes)
```sql
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM anon, authenticated;
-- Only service_role and the check_rate_limit() SECURITY DEFINER function should touch this.
```

### `attachments` (P1 — fix before first attachment upload)
```sql
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.attachments FROM anon;

-- Authenticated users: can only see attachments on tickets in their org
CREATE POLICY "org members can read attachments"
  ON public.attachments FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM public.tickets WHERE organization_id = get_user_organization_id()
    )
  );
-- INSERT/UPDATE/DELETE: similarly scoped to org membership + role.
```

---

## Fix priority

| Priority | Table | Action | Reason |
|---|---|---|---|
| 🔴 **P0 now** | `otp_codes` | Enable RLS + REVOKE anon grants | Live auth-bypass today |
| 🔴 **P0 now** | `rate_limits` | Enable RLS + REVOKE anon grants | Rate-limit bypass + PII leak |
| 🟠 **P1 before first attach** | `attachments` | Enable RLS + scoped policies | Time-bomb; safe now but structurally broken |
