import type { UserRole } from './database';

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  organization_id: string | null;
}

export interface UserInvitation {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  invited_by: string;
  token: string;
  token_expires_at: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  custom_message: string | null;
  created_at: string;
  accepted_at: string | null;
}

export interface InviteUserFormData {
  email: string;
  full_name: string;
  role: UserRole;
  custom_message?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  agent: 'Agent',
  client: 'Client',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full platform access across all organizations',
  admin: 'Full access to organization settings and team management',
  agent: 'Can view and respond to assigned tickets',
  client: 'Can create and view own tickets only',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  agent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  client: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};
