# PrivyDesk — Go-To-Market Strategy

> **Objective:** Win privacy-conscious **mid-market and enterprise** organizations away from Zendesk/Freshdesk/Intercom by selling trust, predictability, and data sovereignty — not feature count.
> **Companion docs:** `PRODUCT_STRATEGY.md` (what we build), `PROBLEM_VALIDATION.md` (what's provable today), `TEST_PLAN.md` (how we prove it).
> **Prerequisite (non-negotiable):** Do not run paid acquisition or make security claims publicly until the P0 security fix + isolation harness ship (`SOURCE_OF_TRUTH.md` §6). A privacy brand caught with a tenant-isolation hole is unrecoverable. Soft-launch design partners are fine now; loud launch is post-fix.

---

## 1. Positioning statement

> **For** regulated and privacy-conscious mid-market & enterprise support teams
> **who** are tired of unpredictable per-resolution AI bills and US-hosted data,
> **PrivyDesk is** a privacy-first helpdesk
> **that** delivers true, provable tenant isolation, EU/region data residency, and flat AI-included pricing,
> **unlike** Zendesk/Intercom, which stack per-resolution AI fees on per-seat pricing and host your data where they choose.

**Tagline candidates:** "Support, kept private." · "Your customers' data. Your jurisdiction. Your terms." · "The helpdesk that proves its isolation."

---

## 2. Ideal Customer Profile (ICP)

**Primary:** 50–1,000-employee orgs in **regulated or privacy-sensitive sectors** — healthcare, fintech/banking, legal, govtech, EU-based SaaS, insurance, education.
**Buying triggers:** GDPR/data-residency mandate, failed/blocked Zendesk procurement on data-processing grounds, surprise AI-resolution bill, M&A/compliance audit, replacing an open-source desk (Chatwoot) they've outgrown.
**Economic buyer:** VP Support / Head of CX. **Gatekeepers:** Security/IT (SSO, SOC2, DPA), Finance (predictable TCO), DPO/Legal (residency, subprocessors).
**Secondary / channel:** MSPs and agencies who need white-label multi-tenant desks for their clients (your architecture is natively built for this).
**Self-serve funnel (not the ICP, but feeds it):** privacy-minded startups on a free/low tier who graduate into paid as they hit compliance needs.

---

## 3. The core message house

**Roof (the promise):** The only enterprise-grade helpdesk that is privacy-first by architecture.

**Three pillars (each must be backed by a passing test in `TEST_PLAN.md`):**
1. **Provable isolation** — "We don't just claim tenant isolation; we publish the automated tests that prove it on every release."
2. **Predictable pricing** — "Flat per-seat. AI included. No per-resolution surprises. Here's your 3-year TCO vs Zendesk."
3. **Your data, your jurisdiction** — "Choose your data region. Full DPA, subprocessor transparency, one-click export. No lock-in."

**Proof points to build/publish:** live trust page (isolation test status, subprocessors, DPA), security whitepaper, TCO calculator, data-flow diagram, "live in under an hour" onboarding demo.

---

## 4. Competitive framing (use in sales, not on the homepage)

| Against | Their weakness | PrivyDesk line |
|---|---|---|
| **Zendesk** | $55–169/agent + per-resolution AI + Copilot $50/agent; US-centric | "Half the predictable cost, none of the AI-meter anxiety, and data where you need it." |
| **Intercom** | Premium price, Fin per-resolution AI | "Intercom bills you every time AI helps. We don't." |
| **Freshdesk** | Cheap but not privacy-positioned | "Comparable price, but built for compliance teams." |
| **Help Scout** | Simple, not enterprise multi-tenant/residency | "When you outgrow simple and need SSO, residency, and white-label." |
| **Chatwoot / OSS** | DIY, no enterprise polish/support | "The privacy of self-hosted, without running it yourself." |

> Keep comparisons factual and current (pricing moves — see `PROBLEM_VALIDATION.md` Sources). Never overclaim parity on omnichannel/integrations until tests pass.

---

## 5. Pricing strategy

Anchor on **predictability and privacy**, undercut incumbent *effective* cost (seat + AI fees):
- **Free** — small teams / funnel (existing free plan). Privacy basics, branded subdomain.
- **Starter (~$19–29/seat)** — SMB, core desk + analytics.
- **Professional (~$49–59/seat)** — SSO, RBAC, SLA, **AI included**, custom domain. Undercuts Zendesk Suite Professional ($115) decisively.
- **Enterprise (custom)** — data-residency selector, white-label, SCIM, audit/SIEM export, DPA, priority SLA, dedicated/region-pinned option.
- **Differentiator on the page itself:** an explicit line — *"No per-resolution AI fees. Ever."* — plus a TCO calculator comparing 3-year cost to Zendesk *including* AI resolutions.
- **MSP/reseller tier:** volume/multi-org pricing for agencies.

(Validate exact numbers against live competitor pricing at launch.)

---

## 6. Channels & motion

**Motion:** Hybrid — self-serve free/Starter funnel feeding a **sales-assisted mid-market/enterprise** motion (the privacy wedge monetizes where compliance has budget).

- **Content/SEO (highest ROI for this brand):** rank for "GDPR-compliant helpdesk," "Zendesk data residency alternative," "helpdesk without per-resolution AI pricing," "privacy-first customer support software." You already have a blog system + SEO infra — point it at these intents. Publish the security whitepaper and TCO comparisons as gated/ungated assets.
- **Compliance-led outbound:** target companies with public GDPR/residency requirements; lead with the trust page + DPA.
- **Partnerships:** EU cloud/hosting communities, privacy-tool directories (e.g. European-alternatives lists), MSP networks.
- **Product-led proof:** free tier + "live in under an hour" + public isolation-test status as a viral trust signal.
- **Comparison pages:** "PrivyDesk vs Zendesk/Intercom/Freshdesk/Help Scout" (factual, privacy + TCO framed).
- **Communities:** r/privacy, GDPR/DPO forums, regulated-industry CX groups.

---

## 7. Launch sequence (gated on product readiness)

**Phase A — Design partners (now, quiet):** 5–10 privacy-sensitive orgs; free in exchange for feedback + case studies. Use them to validate the isolation/residency story. No public security claims yet.

**Phase B — Credible launch (after P0 fix + harness + SSO):** publish trust page, security whitepaper, TCO calculator, comparison pages. Launch on relevant communities + EU privacy directories. Turn on content/SEO engine.

**Phase C — Scale (after Tier-1 enterprise features + status page):** paid acquisition on high-intent keywords, MSP channel, outbound to regulated mid-market, conference/industry presence.

---

## 8. Messaging guardrails (protect the trust brand)
- Every public claim must map to a passing test (`TEST_PLAN.md` §7). If it's aspirational, label it "roadmap" or don't say it.
- Replace "omnichannel" with "multichannel (web, email, live chat)" until real omnichannel ships.
- Replace "99.9% uptime SLA" with "built for high availability" until monitoring + status page exist.
- Lead with privacy/predictability/isolation; treat AI as "private AI you can enable," not a headline feature.
- Transparency is the brand: publish what's real, roadmap the rest. In a trust-led category, honesty *is* the marketing.

---

## 9. KPIs
- **Trust funnel:** trust-page views → demo requests → DPA reviews → closed.
- **TCO calculator** completions and "vs Zendesk" delta shown.
- **Activation:** % of signups with a live ticket within 1 hour ("time-to-value").
- **Pipeline by trigger:** residency mandate / AI-bill / OSS-graduation — learn which wedge converts best.
- **Logo quality:** regulated-sector logos > raw count (social proof compounds in compliance buying).

---

## 10. The 30-second pitch
> "Zendesk and Intercom now charge you every time their AI answers a ticket — and they store your customers' data wherever they like. PrivyDesk is the privacy-first helpdesk: flat pricing with AI included, your data in your chosen region, and tenant isolation we *prove* with automated tests published on our trust page. Enterprise-grade RBAC, SSO, and SLAs — without the enterprise data-anxiety. You can be live, branded, and supporting customers in under an hour."
