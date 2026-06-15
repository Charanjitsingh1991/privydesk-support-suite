function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing env var: ${name}. Create .env.test.local — see .env.test.local.example`);
  return val;
}

export const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://mgnuddfytlbtgprckzto.supabase.co';
export const ANON_KEY = required('SUPABASE_ANON_KEY');
export const SERVICE_ROLE_KEY = required('SUPABASE_SERVICE_ROLE_KEY');
