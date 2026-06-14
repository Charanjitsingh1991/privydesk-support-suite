# PrivyDesk — Problem/Solution Validation

> **Question this answers:** "We claim PrivyDesk solves X. Does the actual code deliver X?" — and "How does that hold up against Zendesk / Freshdesk / Intercom / Help Scout?"
> **Method:** Every claim is taken from the live marketing site (`src/pages/Index.tsx`) or product docs, then mapped to verified code evidence (file:line) and graded. Competitor data is current as of June 2026 (see Sources).
> **Companion docs:** `SOURCE_OF_TRUTH.md` (what's real), `SYSTEM_ARCHITECTURE.md` (deep review), `PRODUCT_STRATEGY.md` (what to build), `GO_TO_MARKET.md` (how to sell).

---

## Grading key
- ✅ **Delivered** — code implements it end-to-end.
- 🟡 **Partial** — exists but shallow, unwired, or UI-only.
- 🔴 **Claim at risk** — marketed but not truly delivered, or contradicted by a known defect.
- ⛔ **Do not claim yet** — would be misleading to advertise today.

---

## A. Claim-by-claim audit

### 1. "AI-Powered Ticketing" (`Index.tsx:47`, hero `:317`)
**Grade: 🟡 Partial.**
Evidence: edge function `supabase/functions/analyze-ticket/index.ts` exists; client components `AIAutoTagger`, `AIResponseSuggester`, `AISentimentBadge`, `AITagExtractor`, `AIInsightsPanel` exist (`src/components/tickets/`); `useTicketAI.ts` hook present.
Caveats: `analyze-ticket` is unauthenticated (`config.toml` `verify_jwt = false`) — a cost/abuse risk and not enterprise-safe. AI features read as wired-but-unhardened; confirm model provider, key handling, and rate limiting before claiming "AI-powered" to enterprise buyers.
Competitor reality: Zendesk, Intercom (Fin), Freshdesk all moved to **outcome-based AI pricing** (~$1–2/resolution). "AI-powered" is now table stakes, not a differentiator — the differentiator is *trustworthy, private* AI (see Strategy).

### 2. "Enterprise Security: Row-level security, 2FA, encryption at rest, comprehensive audit logs" (`Index.tsx:75-76`)
**Grade: 🔴 Claim at risk — this is the most important one to fix.**
- **Row-level security:** RLS *is* enabled and uses correct SECURITY DEFINER helpers (`20260126212319_...sql:118-150`). **BUT** the `profiles` UPDATE policy `USING (id = auth.uid())` with no `WITH CHECK`/column guard (`:166-168`) lets any authenticated user set their own `role` and `organization_id` (`Onboarding.tsx:73-80`). So "row-level security" as an *enterprise isolation guarantee* is **currently false** — a logged-in user can cross tenants. Advertising "enterprise security" while this is open is a material risk (and a breach-disclosure liability with real customers).
- **2FA:** TOTP code exists (`src/lib/security/totp.ts`, `TwoFactorSetup.tsx`) — 🟡 verify server-side enforcement, not just client check.
- **Encryption at rest:** Supabase/Postgres provides this at the platform layer — ✅ true, but it's the vendor's, not a PrivyDesk feature. Per-tenant secrets in `organizations.email_config` (SMTP/Resend keys) need app-level encryption — 🟡 unconfirmed.
- **Audit logs:** `audit_logs` table + `useAuditLogs.ts` exist, but the INSERT policy is `WITH CHECK (true)` (`rls_policies_all_phases.sql:19-21`) — forgeable by any client. 🟡 Real but not tamper-evident.
**Verdict:** the security story is the brand's wedge *and* currently its biggest gap. Fix §6.1 before this claim is defensible.

### 3. "99.9% Uptime SLA" (`Index.tsx:157,193`)
**Grade: ⛔ Do not claim yet.**
No evidence of SLA infrastructure: no uptime monitoring, no status page, no error budgets, no multi-region/failover. Webhook delivery is synchronous fire-and-forget inside the request path (`api-v1/index.ts`), and there's no queue/retry. A 99.9% SLA is a contractual commitment (≤43 min downtime/month) you cannot currently measure or honor. Either stand up the infra (monitoring + status page + incident process) or soften the wording to "built for high availability."

### 4. "Real-Time Live Chat" (`Index.tsx:54`)
**Grade: ✅ Delivered (small-scale).**
Evidence: `usePresence.ts`, `useTypingIndicator.ts`, `useRealtimeMessages.ts`, `LiveChatInbox.tsx`, `public/widget.js`, `widget-script` edge fn, `/widget/:orgId` route. Supabase Realtime backs it. Caveat: validate channel fan-out cost and the public widget path's tenant scoping at scale.

### 5. "Omnichannel support" (`Index.tsx:209,219`)
**Grade: 🔴 Claim at risk.**
Tables + service stubs exist for WhatsApp/SMS/voice/social (`omnichannelService.ts`, phase-7 migration), but these are scaffolding, not working integrations (no Twilio/Meta wiring verified). Today PrivyDesk is **web + email + chat-widget**, not true omnichannel. Claiming omnichannel against Zendesk (which genuinely has it) invites churn when buyers test it. Reframe as "multichannel (web, email, live chat) with omnichannel on the roadmap."

### 6. "Real-time analytics / dashboards" (`Index.tsx:69`)
**Grade: ✅ Delivered.**
`useAnalytics.ts`, `get_ticket_analytics` / `get_agent_performance` RPCs, full `src/components/analytics/*` suite (CSAT, SLA tracker, heatmaps, response-time distribution). Caveat: RPCs over the live tickets table will need rollups/materialized views at scale (perf, not correctness).

### 7. "Seamless integrations" / marketplace / Zapier / CRM (`Index.tsx:209`)
**Grade: 🔴 Claim at risk.** Tables + `integrationService.ts`/`marketplaceService.ts` exist; no verified live integrations. Roadmap, not shipped.

### 8. "Custom domain / branded subdomain per org"
**Grade: 🟡 Partial.** Subdomain *resolution* works client-side (`useSubdomain.ts`, `OrganizationContext.tsx:55-60`) and the Cloudflare wildcard Worker routes `*.privydesk.com` (verified live). But custom-domain DNS/SSL automation is UI-only — `domainResolver.ts` doesn't exist, ACME/Let's Encrypt unimplemented (per `CUSTOM_DOMAIN_ARCHITECTURE.md` checklist). Branded subdomains: ✅. Customer's own domain: ⛔ not yet.

### 9. "Multi-tenant SaaS" (hero `:317`)
**Grade: ✅ Architecturally true, 🔴 not yet provably isolated.** One-DB/RLS model is sound and the right choice. But isolation is **unverified** until the multi-tenant test harness exists and the §6.1 hole is closed. True today: the design. Not true today: the guarantee.

---

## B. Summary scorecard

| Marketed claim | Grade | Gap to close before enterprise sales |
|---|---|---|
| AI-powered ticketing | 🟡 | Harden + authenticate AI; define data-privacy story |
| Enterprise security (RLS/2FA/encryption/audit) | 🔴 | Fix `profiles` escalation; tamper-proof audit; server-side 2FA |
| 99.9% uptime SLA | ⛔ | Monitoring, status page, HA, incident process — or drop the number |
| Real-time live chat | ✅ | Scale-test channels |
| Omnichannel | 🔴 | Reframe as multichannel; build real WhatsApp/SMS or stop claiming |
| Real-time analytics | ✅ | Rollups for scale |
| Seamless integrations | 🔴 | Ship ≥2 real integrations or reframe |
| Custom domain per org | 🟡 | Branded subdomain ✅; customer domain + SSL automation pending |
| Multi-tenant isolation | 🔴→✅ after P0 | Close §6.1 + prove with RLS harness |

**Honest one-liner:** PrivyDesk *today* is a solid **multichannel (web/email/chat) helpdesk with strong analytics and the right multi-tenant architecture**, carrying **AI, omnichannel, integrations, and SLA claims that the code does not yet fully back**. The fastest path to credibility is not more features — it's closing the security gap and right-sizing the claims so every promise is provable.

---

## C. Does it actually solve the problem it claims to?

**The core problem** (a branded, multi-tenant support desk where each org's data is isolated, tickets flow web→email→chat, and admins get analytics): **Yes, the core loop works.** Signup → onboard → branded workspace → tickets/messages → analytics is real and wired.

**The expanded promise** (AI automation, omnichannel, enterprise-grade security/SLA, integrations marketplace): **Not yet.** These are where the product is narrative ahead of implementation.

**The dangerous gap:** the one claim that is both central to the brand ("Privy" = privacy/security) and currently *contradicted by code* is enterprise security/tenant isolation (§6.1). For the target buyer (mid-market/enterprise + privacy-sensitive), that's not a "nice to have later" — it's the whole proposition. **Closing it is what turns the marketing from aspirational to true.**

---

## D. Competitive context (June 2026)

| Vendor | Entry → top (per agent/mo, annual) | AI pricing | Where PrivyDesk can win |
|---|---|---|---|
| **Zendesk** | $19 (Support) → $55/$115/$169 (Suite) | per-resolution (~$1–2) + Copilot $50/agent | Price, simplicity, privacy positioning, no per-resolution AI tax |
| **Freshdesk** | Free → $19/$55/$89 | Freddy add-on | Privacy/EU-residency, modern UX, transparent pricing |
| **Intercom** | $39 + $19/seat | Fin per-resolution | Cost (Intercom is premium), data ownership |
| **Help Scout** | $25 → $45 → $75 | included AI assists | Multi-tenant/branding depth, enterprise RBAC, EU-residency |
| **Privacy niche** (Crisp, Chatwoot, EspoCRM) | varies/OSS | limited | Polish + enterprise RBAC/analytics that OSS tools lack |

**The opening:** The incumbents are getting *more* expensive (per-resolution AI fees stack on per-seat), and the privacy-first segment is served mostly by open-source/SMB tools without enterprise polish. A **privacy-first, EU-residency-capable, predictably-priced, genuinely-isolated multi-tenant helpdesk with built-in analytics and no per-resolution AI tax** is a real, unoccupied position — *if* the security claims become true.

---

## Sources
- [Zendesk Pricing 2026 — Voiceflow](https://www.voiceflow.com/blog/zendesk-pricing)
- [Zendesk Pricing 2026 — costbench](https://costbench.com/software/help-desk/zendesk/)
- [Freshdesk Pricing 2026 — costbench](https://costbench.com/software/help-desk/freshdesk/)
- [Help Scout Pricing 2026 — G2](https://www.g2.com/products/help-scout/pricing)
- [Intercom pricing guide 2026 — Freshworks](https://www.freshworks.com/explore-cx/intercom-pricing/)
- [AI Agent Pricing Comparison 2026 — Fin AI](https://fin.ai/learn/ai-customer-service-agent-pricing-comparison)
- [Privacy-friendly European B2B tools — Plausible](https://plausible.io/blog/european-privacy-friendly-tools-for-business)
- [GDPR-Compliant Software 2026 — BuiltInEu](https://builtineu.eu/blog/gdpr-compliant-software-guide)
