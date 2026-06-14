# PrivyDesk — Product Strategy & Differentiation

> **Goal:** Make PrivyDesk the helpdesk that **privacy-conscious mid-market and enterprise** organizations choose over Zendesk/Freshdesk/Intercom — by owning a position the incumbents structurally can't.
> **Companion docs:** `PROBLEM_VALIDATION.md` (what's real vs claimed), `SOURCE_OF_TRUTH.md`, `SYSTEM_ARCHITECTURE.md`, `TEST_PLAN.md`, `GO_TO_MARKET.md`.
> **Hard dependency:** None of this matters until the two P0 security/migration blockers (`SOURCE_OF_TRUTH.md` §6) are closed. Differentiation built on a broken isolation model is a liability, not a moat.

---

## 1. Positioning — the one sentence

> **PrivyDesk is the privacy-first, EU-residency-ready helpdesk with true tenant isolation and predictable pricing — no per-resolution AI tax, no data leaving your jurisdiction.**

The name already carries it: **Privy = private**. Lean all the way in. Don't try to out-feature Zendesk; out-*trust* them.

---

## 2. Why this position is winnable (the structural opening)

Three things are simultaneously true in June 2026:

1. **Incumbents are getting more expensive and less predictable.** Zendesk/Intercom/Freshdesk layered **per-resolution AI fees** (~$1–2 each) on top of per-seat pricing. Buyers can no longer forecast their bill. (See `PROBLEM_VALIDATION.md` §D.)
2. **Privacy/residency is moving from "nice to have" to "procurement requirement"** — EU AI Act, GDPR enforcement, data-residency mandates in healthcare/finance/public sector. US-hosted SaaS is increasingly a blocker in EU/regulated deals.
3. **The privacy-first segment is under-served by polished products.** The privacy options (Crisp, Chatwoot, EspoCRM) are SMB/open-source and lack enterprise RBAC, analytics depth, and white-label multi-tenancy. The polished products (Zendesk, etc.) aren't privacy-first.

**PrivyDesk can be the first product that is both polished/enterprise-grade AND privacy-first.** That's the moat.

---

## 3. The differentiation pillars (build the brand on these four)

### Pillar 1 — Provable tenant isolation (turn the wound into the weapon)
The §6.1 hole is today's biggest liability. Fixed and *productized*, it becomes the headline.
- Close the privilege-escalation hole (SECURITY DEFINER RPC + restrictive policies).
- Build the multi-tenant RLS test harness — then **publish it**. "We prove isolation with an automated test suite that runs on every deploy; here's the report." No incumbent shows customers their isolation tests.
- Offer **per-tenant data-residency** (EU/US/region pinning) on Enterprise — Supabase region selection + roadmap to per-tenant projects for the highest tier.
- Ship a **trust page**: live isolation-test status, subprocessor list, DPA, data-flow diagram.

### Pillar 2 — Predictable, anti-"AI-tax" pricing
- Flat per-seat with **AI included** (within fair-use), not per-resolution. Make "no surprise AI bills" an explicit promise on the pricing page.
- This is a direct, legible contrast to Zendesk/Intercom and resonates with finance/procurement (your enterprise buyer's gatekeepers).

### Pillar 3 — Private AI (AI you can actually turn on in a regulated org)
- Position AI as **privacy-preserving**: configurable provider, EU-hosted model option, no training on customer data, per-org toggle, full audit trail of AI actions.
- This converts "AI-powered" (table stakes) into "AI a hospital/bank can legally enable" (differentiated). Fix the unauthenticated `analyze-ticket` endpoint first (`PROBLEM_VALIDATION.md` §A.1).

### Pillar 4 — White-label multi-tenancy as a product, not a setting
- You already have branded subdomains + per-org branding. Push to full white-label (custom domain + SSL automation, branded emails, branded widget, remove "Powered by") as an Enterprise/agency play — this also unlocks a **reseller/MSP channel** the incumbents under-serve.

---

## 4. What to build, in priority order

### Tier 0 — Credibility (do before selling to anyone)
These make existing claims *true*. From `SYSTEM_ARCHITECTURE.md`/`SOURCE_OF_TRUTH.md`:
1. Fix `profiles` privilege escalation + tenant hijack (§6.1).
2. Consolidate migrations; kill `users`/`developer` refs; fix webhook tables (§6.2).
3. Multi-tenant RLS test harness (and make its output a customer-facing artifact).
4. `api-v1` always-inject-org-id data layer + contract tests.
5. Authenticate `analyze-ticket`; encrypt per-tenant secrets; tamper-evident audit logs.

### Tier 1 — Enterprise table stakes (required to be *considered* by mid-market/enterprise)
6. **SSO/SAML + SCIM provisioning** (you have `sso_configurations` scaffolding — make it real). This is the #1 hard gate in enterprise procurement.
7. **Granular RBAC / custom roles** end-to-end (you have `custom_roles` tables).
8. **SLA management** that actually enforces/escalates (UI exists; wire the engine + business hours).
9. **Audit & compliance exports** (immutable logs, SIEM export, access reports).
10. **Usage-limit enforcement + monthly reset** (missing per `PROBLEM_VALIDATION.md`) — needed for plan integrity.
11. **Status page + uptime monitoring** so the SLA claim is honest.

### Tier 2 — Differentiators (where you win, not just qualify)
12. **Data-residency selector** (per-tenant region) — Pillar 1.
13. **Private-AI configuration** (provider/region/no-train toggles + AI audit) — Pillar 3.
14. **Full white-label + custom-domain SSL automation** — Pillar 4.
15. **DPA/subprocessor/trust center** in-product.
16. **Reseller/MSP mode** (manage multiple client orgs from one console) — leverages your multi-tenancy natively.

### Tier 3 — Breadth (only after the above; gate behind flags)
17. Real omnichannel (WhatsApp/SMS via Twilio, social) — currently scaffolding.
18. Integrations that matter to the ICP (Slack, MS Teams, Jira, Salesforce) over a generic marketplace.
19. Knowledge base + deflection analytics (you have KB tables).
20. Mobile/offline polish.

> **Rule:** never advertise a Tier-3 item as shipped until it passes the `TEST_PLAN.md` end-to-end + isolation suite.

---

## 5. What makes it *best* (not just different)

Differentiation gets you considered; these get you chosen:
- **Time-to-value:** the onboarding wizard is a genuine asset — a branded, working desk in minutes. Most enterprise tools take weeks. Measure and market "live in under an hour."
- **Transparency as a feature:** publish the isolation tests, the subprocessor list, the pricing math. Trust compounds in regulated buying.
- **No lock-in:** one-click data export, open API (`api-v1`), documented schema. "Your data, your jurisdiction, exportable anytime" is a sales weapon against sticky incumbents.
- **Predictable TCO:** a pricing calculator that shows 3-year cost vs Zendesk *including* AI-resolution fees. Finance buyers love this.

---

## 6. What to explicitly NOT do
- Don't chase feature parity with Zendesk across the board — you'll lose on breadth and dilute the wedge.
- Don't claim omnichannel/SLA/integrations until they pass tests (churn + reputational risk in a trust-led brand is fatal).
- Don't add per-resolution AI billing — it contradicts the core promise.
- Don't go pure-SMB self-serve only; the privacy wedge monetizes best in mid-market/enterprise where compliance has budget. (Offer a self-serve tier as a funnel, but the ICP is regulated mid-market+.)

---

## 7. 90-day product roadmap (suggested)
- **Days 0–30:** Tier 0 (security/migration/harness). Outcome: claims become true; isolation provable.
- **Days 30–60:** SSO/SAML + SCIM, RBAC end-to-end, usage enforcement, status page. Outcome: passes enterprise procurement gates.
- **Days 60–90:** Data-residency selector + private-AI config + trust center; one flagship integration (Slack or Teams). Outcome: differentiated, demoable privacy story.

Validate each milestone against `TEST_PLAN.md` before it's "done."
