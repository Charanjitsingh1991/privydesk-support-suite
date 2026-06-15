export interface UserFixture {
  uid: string;
  email: string;
  password: string;
  jwt: string;
  role: 'admin' | 'agent' | 'client';
}

export interface OrgFixture {
  id: string;
  slug: string;
  admin: UserFixture;
  agent: UserFixture;
  client: UserFixture;
  ticketId: string;
  messagePublicId: string;
  messageInternalId: string;
  storageFile: string;
}

export interface FixtureState {
  orgA: OrgFixture;
  orgB: OrgFixture;
  ts: number;
}
