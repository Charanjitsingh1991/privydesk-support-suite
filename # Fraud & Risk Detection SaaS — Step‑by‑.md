# Fraud & Risk Detection SaaS — Step‑by‑Step Blueprint + Cursor AI Prompts (No Code)

**How to use this:** Copy the **Master Prompt** at the end into Cursor AI. Then use the **Phase Prompts** in order. This blueprint explains *what to build* and *how it should behave*—without code—so the AI stays on the right track.

---

## 0) Product Vision

A multi‑tenant SaaS that evaluates logins/orders in real time and returns a **risk score (0–100)**, a **decision** (allow/review/deny), and **reason codes**. It enriches events with **IP intelligence** (e.g., VPN/proxy, geolocation, ASN), optional **device/behavioral signals**, and supports **alerts, dashboards, webhooks, billing**, and **e‑commerce plugins**.

**Primary users:** E‑commerce stores, fintech apps, B2B SaaS.

**Outcomes:** Fewer chargebacks, fewer fake accounts, less ad fraud, better compliance.

---

## 1) High‑Level Architecture (Conceptual)

* **Public API** for risk checks and event queries (versioned, REST).
* **Risk Engine** that aggregates signals and computes scores + decisions.
* **IP Intelligence Adapter** to query IPinfo (or equivalent) with caching and timeouts.
* **Async Workers** for velocity analysis, deduplication, and delayed/secondary scoring.
* **Storage Layer** for tenants, rules, events, usage, and cache.
* **Dashboard (Web App)** for events, rules, usage, billing, and settings.
* **Billing** (subscriptions + metered usage) with plan limits and overage.
* **Webhooks/Notifications** for real‑time decisions and updates.
* **Observability** (logs, metrics, tracing), **Security** (authZ/authN, audit), **CI/CD**, **Infrastructure** (containers, cloud deploy).

**Acceptance:** Components interact reliably, are fault‑tolerant, and respect tenant isolation.

---

## 2) Multi‑Tenancy & Access Control

* Tenants have plans (Free/Starter/Pro/Enterprise) with per‑minute and monthly limits.
* Roles: **Owner** (full), **Admin** (manage settings/rules), **Analyst** (read events/reports), **Developer** (manage API keys/webhooks).
* API keys are unique per tenant, rotate‑able, and hashed at rest.
* Dashboard sessions use secure cookies; all admin actions are auditable.

**Acceptance:** Every data query is tenant‑scoped; unauthorized access is impossible by design.

---

## 3) Event & Scoring Flow (Runtime Behavior)

1. Client sends a **risk check** with IP and optional context (billing country, user id, email hash, order value, currency, user agent).
2. System **rate‑limits** based on plan; rejects if exceeded (clear error and retry headers).
3. **Cache‑first IP lookup**; on miss, query IPinfo with short timeouts, minimal retries.
4. **Score computation** from signals and tenant rules; generate **reason codes**.
5. Persist the event and return `{score, decision, reasons, request_id, timestamp}`.
6. **Async enrichment:** velocity checks, device linkages, blacklist/allowlist updates; emit **webhooks** if score/decision changes.

**Acceptance:** Typical cache‑hit response within sub‑second; consistent reason codes; idempotent behavior with request IDs.

---

## 4) Signals & Rules (No Code, Exact Behavior)

* **Privacy signals:** If IP flags VPN/proxy/TOR → add configurable risk weight.
* **Geo mismatch:** If IP country ≠ billing country → add weight.
* **ASN type:** If datacenter/hosting/cloud → add weight.
* **First‑seen:** If IP never seen for this user/tenant → add weight.
* **Velocity:** If multiple events in short window → add weight.
* **Disposable email:** If email hash maps to disposable domain (via dataset) → add weight.
* **Lists:** Global/tenant **blocklist** → force deny; **allowlist** → lower risk or force allow.

**Thresholds (per tenant):** `0–39=allow`, `40–69=review`, `70+=deny` (editable).
**Reason codes:** machine readable (e.g., `privacy_signal`, `geo_mismatch`, `hosting_asn`, `velocity`).

**Acceptance:** All weights/thresholds are tenant‑configurable and versioned. Every decision cites the reasons that contributed.

---

## 5) Public API (Contract, No Code)

* **POST /v1/check** → input: IP, optional billing country, user id, email hash, amount, currency, user agent. Output: score, decision, reasons, ip country, timestamp, request id.
* **GET /v1/events** → filter by time range, min score, decision; paginated.
* **POST /v1/rules** → upsert tenant rules (weights, thresholds, lists).
* **GET /v1/usage** → current month usage and limits.
* **/billing/webhook** → receive provider events (plan change, payment status).

**Acceptance:** Versioned, documented, consistent error model, auth via header API key.

---

## 6) Data Model (Conceptual)

* **tenants:** id, name, plan, api key hash, settings (webhook url/secrets), created_at.
* **events:** id, tenant_id, ip, payload, ip_meta, score, decision, reasons, created_at.
* **rules:** tenant_id, rule_json (weights, thresholds, lists), version, created_at.
* **ip_cache:** ip, meta_json, fetched_at, ttl_seconds.
* **usage_daily:** tenant_id, date, checks, overage.
* **audit_logs:** who, what, when, before/after snapshots.

**Acceptance:** Indices support time‑range queries; storage keeps hot data for 90 days by default (configurable retention).

---

## 7) Rate Limits & Quotas

* Per‑tenant per‑minute ceiling (short bursts allowed), with explicit 429 responses.
* Monthly **usage metering** (checks count), with configurable overage pricing.
* Admin view shows live usage and projected month‑end.

**Acceptance:** Limits enforced consistently; headers expose remaining quota.

---

## 8) Webhooks & Notifications

* Event types: `risk.decision.created`, `risk.score.updated`, `billing.plan.changed`.
* Signature: HMAC over raw body with tenant secret; timestamped to prevent replay.
* Retries with exponential backoff; dashboard shows delivery logs and replay.

**Acceptance:** Receiving systems can verify authenticity; failed deliveries are visible and recoverable.

---

## 9) Dashboard UX (Exact Pages & States)

* **Login**: email/password (MVP) + reset; optional 2FA later.
* **Overview**: KPIs (allow/review/deny counts), trend charts, recent risky events.
* **Events**: filterable/paginated table; drill‑down shows request, IP meta, reasons, lineage.
* **Rules**: edit thresholds/weights/lists safely with validation and preview impact.
* **Usage**: daily counts, plan limits, projected overage; export CSV.
* **Billing**: plan selector, invoices, payment method, customer portal link.
* **Settings**: API keys (create/rotate), webhook secret/URL, users & roles, audit logs.

**Acceptance:** Mobile‑friendly, fast interactions, empty‑state messaging, error toasts, and loading skeletons.

---

## 10) Billing & Plans

* Plans define per‑minute rate limits, monthly checks, features (rules editor, webhooks).
* Stripe (or similar) for subscriptions, invoices, taxes, dunning.
* Automatic plan enforcement; overage charged at month end; proration on upgrade.

**Acceptance:** Accurate metering; instant access changes after plan updates.

---

## 11) E‑commerce Integrations (Behavior Spec)

* **Shopify:** app exposes a setting for API key and decision policy; calls risk API during checkout; blocks or tags orders based on decision.
* **WooCommerce:** plugin hooks checkout; shows admin score badge; optional hard block on deny.

**Acceptance:** Minimal merchant setup; clear logs for decisions applied in checkout.

---

## 12) Security & Privacy

* TLS everywhere; CSP and secure cookies; brute‑force protection.
* Hash API keys at rest; rotate keys; short‑lived dashboard sessions.
* Pseudonymize PII (email → hash); data minimization; retention controls.
* RBAC enforced server‑side; consistent audit logs.

**Acceptance:** External security headers check passes; sensitive events are recorded.

---

## 13) Observability & Reliability

* Metrics: request latency, cache hit ratio, error rates, webhook success rate, queue depth.
* Tracing across API → risk engine → IP adapter → DB.
* Alerts for saturation (rate‑limit spikes), IP provider failures, billing webhook failures.

**Acceptance:** SLOs set (e.g., 99.9% monthly, p95 latency targets), dashboards published.

---

## 14) CI/CD & Developer Experience

* Automated tests on each change; protected main branch.
* Environment promotion: dev → staging → prod with approvals.
* Seed data for demo tenants; fixture to simulate risky traffic.

**Acceptance:** One‑command local start; clean developer onboarding docs.

---

## 15) Deployment & Infrastructure (Outcomes)

* Containerized services with health checks and autoscaling policies.
* Stateless API; backing services (DB, cache) configured for backups and failover.
* Blue/green or rolling deploys to minimize downtime.

**Acceptance:** Runbooks exist for common incidents; backup & restore tested.

---

## 16) Testing Plan (Scope & Criteria)

* **Unit:** rules evaluation, plan enforcement, list application.
* **Integration:** risk flow with cached vs non‑cached IP meta; webhook signing/verify.
* **E2E:** dashboard flows (login, edit rules, view events); e‑commerce plugin happy/deny paths.
* **Load:** sustained traffic at target TPS; validate latency and error budgets.
* **Security:** authZ/authN, rate‑limit bypass attempts, webhook replay.

**Acceptance:** Tests cover core paths; performance meets SLOs; security tests documented.

---

## 17) Delivery Roadmap (Milestones)

* **M1 — MVP (2–3 weeks):** Public API (/check, /events), IP adapter with cache, base rules, tenant plans, usage meter, dashboard (events/overview), API keys, basic billing, observability skeleton.
* **M2 — Beta (2–3 weeks):** Rules editor, webhooks with retry + logs, velocity analysis, usage/billing polish, Shopify & WooCommerce MVP, audit logs, improved UX.
* **M3 — GA (2–4 weeks):** Advanced analytics, allow/deny lists UI, enterprise limits & SSO option, data retention controls, docs, pricing pages, launch playbook.

**Acceptance:** Each milestone shippable; dog‑food with pilot merchants.

---

# Cursor AI — Master Prompt (Paste As Is)

You are an expert SaaS architect and product engineer. Build a **multi‑tenant Fraud & Risk Detection SaaS** exactly per the blueprint below. Do **not** include code in explanations; generate working implementation files internally. Deliver:

1. Public API (versioned) for risk checks, events, rules, and usage with consistent auth and errors.
2. Risk Engine that merges IP intelligence, geo checks, privacy flags, velocity, and lists to output a 0–100 score, decision, and reason codes; tenant‑configurable thresholds/weights.
3. IP intelligence integration using a provider like ipinfo; cache results, enforce short timeouts, and degrade gracefully.
4. Async workers for velocity analysis and webhook dispatch with retries and delivery logs.
5. Data model and storage matching the blueprint (tenants, events, rules, cache, usage, audit).
6. Dashboard with pages: Login, Overview, Events, Rules, Usage, Billing, Settings; responsive, fast, and accessible.
7. Billing with plans, usage metering, overage, and a customer portal link; enforce plan limits.
8. Webhooks with signed payloads and replay protection; admin UI for logs and replays.
9. Observability (metrics, logs, traces), security controls (RBAC, audit logs, key rotation), CI/CD, and containerized deployment with health checks.
   Adhere to the **acceptance criteria** and **behavior specs** in this document.

---

# Cursor AI — Phase Prompts (Run In Order)

**Phase 1 — Foundations & Contracts**
Create the monorepo layout, env templates, service boundaries, and documented API contracts (/v1/check, /v1/events, /v1/rules, /v1/usage, /billing/webhook). Provide acceptance tests definitions, error model, auth headers, and sample success/error bodies (described, not coded). Ensure tenant scoping and plan limits are specified.

**Phase 2 — Risk Engine & IP Intelligence**
Implement runtime behavior: cache‑first IP lookup, timeouts, retries; privacy/geo/ASN signals; rules evaluation; reason codes; thresholds; allow/deny lists. Define how async velocity updates can adjust scores and trigger webhooks. Document edge cases and fallback paths.

**Phase 3 — Storage & Metering**
Define entities, indexes, retention policies, and usage metering rules. Specify daily rollups and overage calculation. Ensure audit logs exist for admin actions and key events.

**Phase 4 — Dashboard UX**
Deliver page flows, filters, drill‑downs, empty states, loading/error handling, role‑based visibility, and settings forms for keys, webhooks, rules, and users. Confirm accessibility and mobile behavior.

**Phase 5 — Webhooks & Integrations**
Deliver signed webhooks with retry + UI logs. Specify Shopify/WooCommerce plugin behaviors during checkout and in admin. Include decision tagging and optional hard blocks.

**Phase 6 — Billing & Plans**
Set plan features, rate limits, monthly quotas, proration, overage, invoices, customer portal linkage, and downgrade rules. Verify metering accuracy and plan enforcement.

**Phase 7 — Reliability, Security, CI/CD**
Ship health checks, runbooks, backup/restore, alerting thresholds, RBAC tests, and pipeline gates. Confirm SLOs and error budgets are met in load tests.

---

**Deliverable:** A production‑ready, scalable SaaS that follows this blueprint exactly, with clear documentation, acceptance criteria met for each phase, and integrations that work out‑of‑the‑box for target merchants—without exposing code in this brief.
