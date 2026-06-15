import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY } from './env.ts';
import type { OrgFixture, UserFixture, FixtureState } from './types.ts';

function svc(): SupabaseClient {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function userClient(jwt: string): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
}

async function createUser(email: string, password: string): Promise<string> {
  const db = svc();
  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser ${email}: ${error.message}`);
  return data.user.id;
}

async function signIn(email: string, password: string): Promise<string> {
  const db = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`signIn ${email}: ${error.message}`);
  if (!data.session) throw new Error(`signIn ${email}: no session returned`);
  return data.session.access_token;
}

async function createOrg(jwt: string, ts: number, prefix: 'a' | 'b'): Promise<string> {
  const db = userClient(jwt);
  const { data, error } = await db.rpc('create_organization_and_claim_owner', {
    p_name: `Isolation Test Org ${prefix.toUpperCase()} ${ts}`,
    p_slug: `iso-test-${prefix}-${ts}`,
    p_industry: 'Technology',
    p_company_size: '1-10',
    p_timezone: 'UTC',
    p_plan: 'starter',
    p_custom_domain: null,
    p_domain_verified: false,
    p_domain_verification_token: null,
    p_domain_verification_method: 'dns_txt',
    p_primary_color: '#6366f1',
    p_logo_url: null,
    p_branding: { social_links: {}, footer_text: '', company_address: '' },
    p_email_config: {},
    p_email_verified: false,
  });
  if (error) throw new Error(`createOrg ${prefix}: ${error.message}`);
  return data as string;
}

async function assignToOrg(uid: string, orgId: string, role: 'agent' | 'client'): Promise<void> {
  const db = svc();
  const { error } = await db
    .from('profiles')
    .update({ organization_id: orgId, role })
    .eq('id', uid);
  if (error) throw new Error(`assignToOrg uid=${uid}: ${error.message}`);
}

async function createTicket(orgId: string, createdBy: string, label: string): Promise<string> {
  const db = svc();
  const { data, error } = await db
    .from('tickets')
    .insert({
      organization_id: orgId,
      subject: `[ISO] Test Ticket ${label}`,
      description: 'Isolation harness fixture ticket — safe to delete',
      status: 'open',
      priority: 'low',
      created_by: createdBy,
    })
    .select('id')
    .single();
  if (error) throw new Error(`createTicket ${label}: ${error.message}`);
  return data.id;
}

async function createMessage(
  ticketId: string,
  userId: string,
  isInternal: boolean,
): Promise<string> {
  const db = svc();
  const { data, error } = await db
    .from('messages')
    .insert({
      ticket_id: ticketId,
      user_id: userId,
      content: `[ISO] ${isInternal ? 'Internal' : 'Public'} test message`,
      is_internal: isInternal,
    })
    .select('id')
    .single();
  if (error) throw new Error(`createMessage ticket=${ticketId} internal=${isInternal}: ${error.message}`);
  return data.id;
}

async function uploadDummyFile(orgId: string): Promise<string> {
  const db = svc();
  const path = `${orgId}/iso-test-isolation.txt`;
  const { error } = await db.storage
    .from('ticket-attachments')
    .upload(path, Buffer.from('[ISO] isolation test file'), { upsert: true, contentType: 'text/plain' });
  if (error && !error.message.toLowerCase().includes('already exists')) {
    throw new Error(`uploadDummyFile org=${orgId}: ${error.message}`);
  }
  return path;
}

export async function seedFixtures(): Promise<FixtureState> {
  const ts = Date.now();
  const suf = String(ts);

  console.log(`[seed] Starting fixture creation ts=${ts}`);

  const passwords = {
    adminA: 'IsoA-Adm!n9xZ',
    agentA: 'IsoA-Ag3nt!xZ',
    clientA: 'IsoA-Cl1ent!xZ',
    adminB: 'IsoB-Adm!n9xZ',
    agentB: 'IsoB-Ag3nt!xZ',
    clientB: 'IsoB-Cl1ent!xZ',
  };

  const emails = {
    adminA: `iso-adm-a-${suf}@example.com`,
    agentA: `iso-agt-a-${suf}@example.com`,
    clientA: `iso-clt-a-${suf}@example.com`,
    adminB: `iso-adm-b-${suf}@example.com`,
    agentB: `iso-agt-b-${suf}@example.com`,
    clientB: `iso-clt-b-${suf}@example.com`,
  };

  console.log('[seed] Creating 6 auth users...');
  const [uidAdminA, uidAgentA, uidClientA, uidAdminB, uidAgentB, uidClientB] = await Promise.all([
    createUser(emails.adminA, passwords.adminA),
    createUser(emails.agentA, passwords.agentA),
    createUser(emails.clientA, passwords.clientA),
    createUser(emails.adminB, passwords.adminB),
    createUser(emails.agentB, passwords.agentB),
    createUser(emails.clientB, passwords.clientB),
  ]);

  await new Promise<void>((r) => setTimeout(r, 800));

  console.log('[seed] Signing in all users...');
  const [jwtAdminA, jwtAgentA, jwtClientA, jwtAdminB, jwtAgentB, jwtClientB] = await Promise.all([
    signIn(emails.adminA, passwords.adminA),
    signIn(emails.agentA, passwords.agentA),
    signIn(emails.clientA, passwords.clientA),
    signIn(emails.adminB, passwords.adminB),
    signIn(emails.agentB, passwords.agentB),
    signIn(emails.clientB, passwords.clientB),
  ]);

  console.log('[seed] Creating orgs via RPC...');
  const orgAId = await createOrg(jwtAdminA, ts, 'a');
  const orgBId = await createOrg(jwtAdminB, ts, 'b');

  console.log(`[seed] OrgA=${orgAId} OrgB=${orgBId}`);

  console.log('[seed] Assigning agents/clients to orgs...');
  await Promise.all([
    assignToOrg(uidAgentA, orgAId, 'agent'),
    assignToOrg(uidClientA, orgAId, 'client'),
    assignToOrg(uidAgentB, orgBId, 'agent'),
    assignToOrg(uidClientB, orgBId, 'client'),
  ]);

  console.log('[seed] Creating tickets + messages...');
  const [ticketAId, ticketBId] = await Promise.all([
    createTicket(orgAId, uidAdminA, 'OrgA'),
    createTicket(orgBId, uidAdminB, 'OrgB'),
  ]);

  const [msgAPub, msgAInt, msgBPub, msgBInt] = await Promise.all([
    createMessage(ticketAId, uidAdminA, false),
    createMessage(ticketAId, uidAdminA, true),
    createMessage(ticketBId, uidAdminB, false),
    createMessage(ticketBId, uidAdminB, true),
  ]);

  console.log('[seed] Uploading storage fixtures...');
  const [storageA, storageB] = await Promise.all([
    uploadDummyFile(orgAId),
    uploadDummyFile(orgBId),
  ]);

  const adminA: UserFixture = { uid: uidAdminA, email: emails.adminA, password: passwords.adminA, jwt: jwtAdminA, role: 'admin' };
  const agentA: UserFixture = { uid: uidAgentA, email: emails.agentA, password: passwords.agentA, jwt: jwtAgentA, role: 'agent' };
  const clientA: UserFixture = { uid: uidClientA, email: emails.clientA, password: passwords.clientA, jwt: jwtClientA, role: 'client' };
  const adminB: UserFixture = { uid: uidAdminB, email: emails.adminB, password: passwords.adminB, jwt: jwtAdminB, role: 'admin' };
  const agentB: UserFixture = { uid: uidAgentB, email: emails.agentB, password: passwords.agentB, jwt: jwtAgentB, role: 'agent' };
  const clientB: UserFixture = { uid: uidClientB, email: emails.clientB, password: passwords.clientB, jwt: jwtClientB, role: 'client' };

  console.log('[seed] Fixture creation complete.');

  return {
    orgA: {
      id: orgAId,
      slug: `iso-test-a-${ts}`,
      admin: adminA, agent: agentA, client: clientA,
      ticketId: ticketAId,
      messagePublicId: msgAPub,
      messageInternalId: msgAInt,
      storageFile: storageA,
    },
    orgB: {
      id: orgBId,
      slug: `iso-test-b-${ts}`,
      admin: adminB, agent: agentB, client: clientB,
      ticketId: ticketBId,
      messagePublicId: msgBPub,
      messageInternalId: msgBInt,
      storageFile: storageB,
    },
    ts,
  };
}

const CHILD_TABLES = [
  'messages',
  'sla_configurations',
  'sla_policies',
  'business_hours',
  'widget_config',
  'branding_settings',
  'audit_logs',
  'security_events',
  'subscription_usage',
  'automation_rules',
  'custom_roles',
  'api_keys',
  'webhooks',
  'webhook_configs',
  'webhook_logs',
  'attachments',
] as const;

export async function teardownFixtures(state: FixtureState): Promise<void> {
  const db = svc();
  const { orgA, orgB } = state;
  const orgIds = [orgA.id, orgB.id];
  const uids = [
    orgA.admin.uid, orgA.agent.uid, orgA.client.uid,
    orgB.admin.uid, orgB.agent.uid, orgB.client.uid,
  ];

  console.log('[teardown] Deleting messages for fixture tickets...');
  await db.from('messages').delete().in('ticket_id', [orgA.ticketId, orgB.ticketId]);

  console.log('[teardown] Deleting tickets...');
  await db.from('tickets').delete().in('organization_id', orgIds);

  console.log('[teardown] Deleting org-scoped child tables...');
  for (const t of CHILD_TABLES) {
    if (t === 'messages') continue;
    const { error } = await db.from(t as string).delete().in('organization_id', orgIds);
    if (error && !error.message.includes('does not exist') && !error.message.includes('column')) {
      console.warn(`[teardown] ${t}: ${error.message}`);
    }
  }

  console.log('[teardown] Removing storage files...');
  await db.storage.from('ticket-attachments').remove([orgA.storageFile, orgB.storageFile]);

  console.log('[teardown] Nullifying profiles...');
  await db.from('profiles').update({ organization_id: null, role: 'client' }).in('id', uids);

  console.log('[teardown] Deleting organizations...');
  await db.from('organizations').delete().in('id', orgIds);

  console.log('[teardown] Deleting profiles...');
  await db.from('profiles').delete().in('id', uids);

  console.log('[teardown] Deleting auth users...');
  for (const uid of uids) {
    const { error } = await db.auth.admin.deleteUser(uid);
    if (error) console.warn(`[teardown] auth.deleteUser ${uid}: ${error.message}`);
  }

  console.log('[teardown] Cleanup complete.');
}
