export type PlanType = 'free' | 'starter' | 'pro' | 'enterprise';
export type OrgStatus = 'active' | 'suspended' | 'cancelled';
export type UserRole = 'super_admin' | 'admin' | 'agent' | 'client';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  domain_verified: boolean;
  primary_color: string;
  logo_url: string | null;
  plan: PlanType;
  status: OrgStatus;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface Profile {
  id: string;
  organization_id: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  preferences: Record<string, unknown>;
}

export interface Ticket {
  id: string;
  organization_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_by: string;
  assigned_to: string | null;
  category: string | null;
  tags: string[];
  due_date: string | null;
  resolved_at: string | null;
  first_response_at: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface Message {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  attachments: unknown[];
  created_at: string;
  updated_at: string;
  read_by: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  limits: {
    max_users: number;
    max_tickets_monthly: number;
    max_storage_gb: number;
    max_emails_monthly: number;
  };
  is_active: boolean;
  created_at: string;
}

export interface SubscriptionUsage {
  id: string;
  organization_id: string;
  tickets_used_this_month: number;
  emails_sent_this_month: number;
  storage_used_mb: number;
  last_reset_at: string;
  created_at: string;
  updated_at: string;
}
