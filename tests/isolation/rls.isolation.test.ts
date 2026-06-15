/**
 * P0 Multi-Tenant RLS Isolation Harness
 *
 * Signs in REAL authenticated Supabase sessions for 6 fixture users across
 * 2 orgs and asserts the full TEST_PLAN.md §1.1–1.2 matrix.
 *
 * Auth note: this project issues ES256 user JWTs.
 *   - Edge-function calls: use anon key as bearer (handled in send-otp tests separately)
 *   - PostgREST / RLS assertions: use the user's own JWT  ← all assertions here
 *
 * Run: npm run test:isolation
 * Output: tests/isolation/report/isolation-report.{json,html}
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { seedFixtures, teardownFixtures } from './setup/seed.ts';
import { SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY } from './setup/env.ts';
import type { FixtureState } from './setup/types.ts';
import { generateReport, type AssertionResult } from './reporter.ts';

// ─── Shared state ───────────────────────────────────────────────────────────
let fx: FixtureState;
let failCount = 0;
const results: AssertionResult[] = [];
const startedAt = Date.now();

// ─── Client factories ────────────────────────────────────────────────────────
function asUser(jwt: string): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

function asAnon(): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function asSvc(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────
beforeAll(async () => {
  fx = await seedFixtures();
}, 120_000);

afterEach((ctx) => {
  const state = ctx.task.result?.state;
  const category = ctx.task.suite?.name ?? 'uncategorised';
  const name = ctx.task.name;
  const error = ctx.task.result?.errors?.[0]?.message;

  if (state === 'fail') {
    failCount++;
    results.push({ name, category, status: 'fail', error: error ?? 'assertion failed' });
  } else if (state === 'pass') {
    results.push({ name, category, status: 'pass' });
  } else {
    results.push({ name, category, status: 'skip' });
  }
});

afterAll(async () => {
  await generateReport({ failCount, startedAt, results });

  if (failCount === 0) {
    await teardownFixtures(fx);
    console.log('\n✅ All assertions passed. Fixtures cleaned up.');
  } else {
    console.error(
      `\n⚠  ${failCount} assertion(s) FAILED — this is a real isolation hole.\n` +
      `   Fixtures have NOT been cleaned up. Inspect, then run teardown manually.\n` +
      `   Fixture orgA.id=${fx?.orgA?.id}  orgB.id=${fx?.orgB?.id}`,
    );
  }
}, 120_000);

// ══════════════════════════════════════════════════════════════════════════════
// §1.1  CROSS-TENANT TABLE READS — must return ZERO rows
// ══════════════════════════════════════════════════════════════════════════════

const ORG_SCOPED_TABLES = [
  'organizations',
  'subscription_usage',
  'api_keys',
  'webhooks',
  'audit_logs',
  'automation_rules',
  'custom_roles',
  'branding_settings',
] as const;

describe('§1.1 Cross-tenant table reads — OrgA roles reading OrgB data', () => {
  for (const roleKey of ['admin', 'agent', 'client'] as const) {
    describe(`as orgA.${roleKey}`, () => {
      it('tickets: OrgB tickets → 0 rows', async () => {
        const { data } = await asUser(fx.orgA[roleKey].jwt)
          .from('tickets')
          .select('id')
          .eq('organization_id', fx.orgB.id);
        expect(data?.length ?? 0).toBe(0);
      });

      it('messages (public): OrgB ticket messages → 0 rows', async () => {
        const { data } = await asUser(fx.orgA[roleKey].jwt)
          .from('messages')
          .select('id, tickets!inner(organization_id)')
          .eq('tickets.organization_id', fx.orgB.id);
        expect(data?.length ?? 0).toBe(0);
      });

      it('messages (is_internal=true): OrgB internal messages → 0 rows', async () => {
        const { data } = await asUser(fx.orgA[roleKey].jwt)
          .from('messages')
          .select('id, is_internal, tickets!inner(organization_id)')
          .eq('tickets.organization_id', fx.orgB.id)
          .eq('is_internal', true);
        expect(data?.length ?? 0).toBe(0);
      });

      for (const table of ORG_SCOPED_TABLES) {
        it(`${table}: OrgB ${table} → 0 rows`, async () => {
          const filter = table === 'organizations' ? 'id' : 'organization_id';
          const orgBValue = fx.orgB.id;
          const { data } = await asUser(fx.orgA[roleKey].jwt)
            .from(table)
            .select('id')
            .eq(filter, orgBValue);
          expect(data?.length ?? 0).toBe(0);
        });
      }
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// §1.1  CROSS-TENANT WRITES — must be denied / 0 rows affected
// ══════════════════════════════════════════════════════════════════════════════

describe('§1.1 Cross-tenant writes — OrgA.admin against OrgB ticket', () => {
  it('UPDATE OrgB ticket subject → 0 rows affected', async () => {
    const { count } = await asUser(fx.orgA.admin.jwt)
      .from('tickets')
      .update({ subject: '[PWNED]' }, { count: 'exact' })
      .eq('id', fx.orgB.ticketId);
    expect(count ?? 0).toBe(0);
  });

  it('DELETE OrgB ticket → 0 rows affected', async () => {
    const { count } = await asUser(fx.orgA.admin.jwt)
      .from('tickets')
      .delete({ count: 'exact' })
      .eq('id', fx.orgB.ticketId);
    expect(count ?? 0).toBe(0);

    // Verify ticket still exists (service role)
    const { data } = await asSvc().from('tickets').select('id').eq('id', fx.orgB.ticketId).single();
    expect(data?.id).toBe(fx.orgB.ticketId);
  });

  it('INSERT message into OrgB ticket → denied', async () => {
    const { error } = await asUser(fx.orgA.admin.jwt)
      .from('messages')
      .insert({ ticket_id: fx.orgB.ticketId, user_id: fx.orgA.admin.uid, content: '[PWNED]', is_internal: false });
    expect(error).not.toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// §1.1  STORAGE ISOLATION — OrgA cannot list/access OrgB files
// ══════════════════════════════════════════════════════════════════════════════

describe('§1.1 Storage isolation — ticket-attachments bucket', () => {
  for (const roleKey of ['admin', 'agent', 'client'] as const) {
    it(`orgA.${roleKey} lists OrgB folder → 0 visible files`, async () => {
      const { data } = await asUser(fx.orgA[roleKey].jwt)
        .storage
        .from('ticket-attachments')
        .list(`${fx.orgB.id}/`);
      const items = (data ?? []).filter((f) => f.name !== '.emptyFolderPlaceholder');
      expect(items.length).toBe(0);
    });
  }

  it('anon lists OrgB storage folder → 0 visible files', async () => {
    const { data } = await asAnon()
      .storage
      .from('ticket-attachments')
      .list(`${fx.orgB.id}/`);
    const items = (data ?? []).filter((f) => f.name !== '.emptyFolderPlaceholder');
    expect(items.length).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// §RLS  otp_codes + rate_limits — ZERO direct client access
// ══════════════════════════════════════════════════════════════════════════════

describe('§RLS otp_codes / rate_limits — no direct client read', () => {
  it('anon reads otp_codes → 0 rows', async () => {
    const { data } = await asAnon().from('otp_codes').select('id');
    expect(data?.length ?? 0).toBe(0);
  });

  it('authenticated orgA.admin reads otp_codes → 0 rows', async () => {
    const { data } = await asUser(fx.orgA.admin.jwt).from('otp_codes').select('id');
    expect(data?.length ?? 0).toBe(0);
  });

  it('authenticated orgA.client reads otp_codes → 0 rows', async () => {
    const { data } = await asUser(fx.orgA.client.jwt).from('otp_codes').select('id');
    expect(data?.length ?? 0).toBe(0);
  });

  it('anon reads rate_limits → 0 rows', async () => {
    const { data } = await asAnon().from('rate_limits').select('id');
    expect(data?.length ?? 0).toBe(0);
  });

  it('authenticated orgA.admin reads rate_limits → 0 rows', async () => {
    const { data } = await asUser(fx.orgA.admin.jwt).from('rate_limits').select('id');
    expect(data?.length ?? 0).toBe(0);
  });

  it('authenticated orgA.client reads rate_limits → 0 rows', async () => {
    const { data } = await asUser(fx.orgA.client.jwt).from('rate_limits').select('id');
    expect(data?.length ?? 0).toBe(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// §1.2  PRIVILEGE ESCALATION — must be denied
// ══════════════════════════════════════════════════════════════════════════════

describe('§1.2 Privilege-escalation regression guards', () => {
  it('client self-promotes to super_admin → 42501 denied', async () => {
    const { error } = await asUser(fx.orgA.client.jwt)
      .from('profiles')
      .update({ role: 'super_admin' })
      .eq('id', fx.orgA.client.uid);
    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  });

  it('admin self-promotes to super_admin → 42501 denied', async () => {
    const { error } = await asUser(fx.orgA.admin.jwt)
      .from('profiles')
      .update({ role: 'super_admin' })
      .eq('id', fx.orgA.admin.uid);
    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  });

  it('agent self-promotes to admin → 42501 denied', async () => {
    const { error } = await asUser(fx.orgA.agent.jwt)
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', fx.orgA.agent.uid);
    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  });

  it('admin moves self to OrgB (organization_id hijack) → 42501 denied', async () => {
    const { error } = await asUser(fx.orgA.admin.jwt)
      .from('profiles')
      .update({ organization_id: fx.orgB.id })
      .eq('id', fx.orgA.admin.uid);
    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  });

  it('client moves self to OrgB (organization_id hijack) → 42501 denied', async () => {
    const { error } = await asUser(fx.orgA.client.jwt)
      .from('profiles')
      .update({ organization_id: fx.orgB.id })
      .eq('id', fx.orgA.client.uid);
    expect(error).not.toBeNull();
    expect(error!.code).toBe('42501');
  });

  it('admin calls create_organization_and_claim_owner again (already has org) → error', async () => {
    const { error } = await asUser(fx.orgA.admin.jwt).rpc('create_organization_and_claim_owner', {
      p_name: 'Duplicate Org Attempt',
      p_slug: `dup-${Date.now()}`,
      p_industry: 'Tech',
      p_company_size: '1-10',
      p_timezone: 'UTC',
      p_plan: 'starter',
      p_custom_domain: null,
      p_domain_verified: false,
      p_domain_verification_token: null,
      p_domain_verification_method: 'dns_txt',
      p_primary_color: '#000000',
      p_logo_url: null,
      p_branding: {},
      p_email_config: {},
      p_email_verified: false,
    });
    expect(error).not.toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// §1.2  SAFE COLUMN UPDATES — non-privileged columns must succeed
// ══════════════════════════════════════════════════════════════════════════════

describe('§1.2 Safe (non-privileged) column updates — must succeed', () => {
  it('orgA.admin updates own full_name → no error', async () => {
    const { error } = await asUser(fx.orgA.admin.jwt)
      .from('profiles')
      .update({ full_name: '[ISO] Admin Updated' })
      .eq('id', fx.orgA.admin.uid);
    expect(error).toBeNull();
  });

  it('orgA.client updates own full_name → no error', async () => {
    const { error } = await asUser(fx.orgA.client.jwt)
      .from('profiles')
      .update({ full_name: '[ISO] Client Updated' })
      .eq('id', fx.orgA.client.uid);
    expect(error).toBeNull();
  });

  it('orgA.agent updates own full_name → no error', async () => {
    const { error } = await asUser(fx.orgA.agent.jwt)
      .from('profiles')
      .update({ full_name: '[ISO] Agent Updated' })
      .eq('id', fx.orgA.agent.uid);
    expect(error).toBeNull();
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// §Positive controls — own-org reads MUST work (ensures we're not over-blocking)
// ══════════════════════════════════════════════════════════════════════════════

describe('§Positive controls — own-org access must succeed', () => {
  it('orgA.admin reads own org tickets → ≥1 row', async () => {
    const { data, error } = await asUser(fx.orgA.admin.jwt)
      .from('tickets')
      .select('id')
      .eq('organization_id', fx.orgA.id);
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(1);
  });

  it('orgA.agent reads own org tickets → ≥1 row', async () => {
    const { data, error } = await asUser(fx.orgA.agent.jwt)
      .from('tickets')
      .select('id')
      .eq('organization_id', fx.orgA.id);
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(1);
  });

  it('orgA.client reads own created tickets → no error', async () => {
    const { error } = await asUser(fx.orgA.client.jwt)
      .from('tickets')
      .select('id');
    expect(error).toBeNull();
  });

  it('orgA.admin reads own org profile → row present', async () => {
    const { data, error } = await asUser(fx.orgA.admin.jwt)
      .from('profiles')
      .select('id, role, organization_id')
      .eq('id', fx.orgA.admin.uid)
      .single();
    expect(error).toBeNull();
    expect(data!.role).toBe('admin');
    expect(data!.organization_id).toBe(fx.orgA.id);
  });

  it('orgA.admin updates orgA.agent role → allowed (intra-org RBAC)', async () => {
    const { error } = await asUser(fx.orgA.admin.jwt)
      .from('profiles')
      .update({ role: 'client' })
      .eq('id', fx.orgA.agent.uid);
    expect(error).toBeNull();
    // Restore via service role
    await asSvc().from('profiles').update({ role: 'agent' }).eq('id', fx.orgA.agent.uid);
  });

  it('orgA.admin reads OrgA organizations row → present', async () => {
    const { data, error } = await asUser(fx.orgA.admin.jwt)
      .from('organizations')
      .select('id')
      .eq('id', fx.orgA.id)
      .single();
    expect(error).toBeNull();
    expect(data!.id).toBe(fx.orgA.id);
  });

  it('orgA.admin lists OWN storage folder → fixture file visible', async () => {
    const { data, error } = await asUser(fx.orgA.admin.jwt)
      .storage
      .from('ticket-attachments')
      .list(`${fx.orgA.id}/`);
    expect(error).toBeNull();
    const items = (data ?? []).filter((f) => f.name !== '.emptyFolderPlaceholder');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('orgA.agent lists OWN storage folder → fixture file visible', async () => {
    const { data, error } = await asUser(fx.orgA.agent.jwt)
      .storage
      .from('ticket-attachments')
      .list(`${fx.orgA.id}/`);
    expect(error).toBeNull();
    const items = (data ?? []).filter((f) => f.name !== '.emptyFolderPlaceholder');
    expect(items.length).toBeGreaterThanOrEqual(1);
  });
});
