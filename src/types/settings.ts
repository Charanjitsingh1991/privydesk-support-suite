export interface OrganizationSettings {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  company_size: string | null;
  timezone: string | null;
  custom_domain: string | null;
  domain_verified: boolean;
  primary_color: string | null;
  logo_url: string | null;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  branding: BrandingSettings | null;
  email_config: EmailConfig | null;
  security_settings: SecuritySettingsConfig | null;
  metadata: Record<string, unknown> | null;
}

export interface BrandingSettings {
  secondary_color?: string;
  accent_color?: string;
  text_color?: string;
  background_color?: string;
  favicon_url?: string;
  email_header_position?: 'left' | 'center' | 'right';
  email_footer_text?: string;
  email_signature?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  company_address?: string;
}

export interface EmailConfig {
  provider: 'shared' | 'resend' | 'smtp';
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  resend_api_key?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_encryption?: 'ssl' | 'tls' | 'none';
}

export interface SecuritySettingsConfig {
  block_generic_email_providers: boolean;
  require_domain_approval: boolean;
  max_concurrent_sessions: number;
  session_timeout_minutes: number;
  session_max_age_days: number;
  ip_binding_enabled: boolean;
  notify_new_device_login: boolean;
  scan_external_links: boolean;
  block_dangerous_attachments: boolean;
  require_2fa_admins?: boolean;
  require_2fa_all?: boolean;
  ip_allowlist?: string[];
  password_min_length?: number;
  password_require_uppercase?: boolean;
  password_require_numbers?: boolean;
  password_require_symbols?: boolean;
  password_expiry_days?: number;
}

export interface BusinessHours {
  [day: string]: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface NotificationSettings {
  admin_new_ticket: boolean;
  admin_high_priority: boolean;
  admin_negative_sentiment: boolean;
  admin_daily_summary: boolean;
  admin_weekly_report: boolean;
  agent_ticket_assigned: boolean;
  agent_new_message: boolean;
  agent_ticket_overdue: boolean;
  agent_mentioned: boolean;
  client_status_changed: boolean;
  client_new_reply: boolean;
  client_ticket_resolved: boolean;
  push_notifications_enabled: boolean;
  digest_frequency: 'instant' | '15min' | 'hourly' | 'twice_daily';
}

export interface RolePermissions {
  can_create_tickets: boolean;
  can_view_all_tickets: boolean;
  can_assign_tickets: boolean;
  can_delete_tickets: boolean;
  can_manage_users: boolean;
  can_change_settings: boolean;
  can_view_analytics: boolean;
  can_manage_integrations: boolean;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  config?: Record<string, unknown>;
}

export interface WebhookConfig {
  id?: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
}

export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'E-commerce',
  'Manufacturing',
  'Real Estate',
  'Legal',
  'Consulting',
  'Non-profit',
  'Other',
] as const;

export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const;

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Phoenix', label: 'Arizona' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'Pacific/Honolulu', label: 'Hawaii' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Beijing/Shanghai' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'UTC', label: 'UTC' },
] as const;

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { enabled: true, start: '09:00', end: '17:00' },
  tuesday: { enabled: true, start: '09:00', end: '17:00' },
  wednesday: { enabled: true, start: '09:00', end: '17:00' },
  thursday: { enabled: true, start: '09:00', end: '17:00' },
  friday: { enabled: true, start: '09:00', end: '17:00' },
  saturday: { enabled: false, start: '09:00', end: '17:00' },
  sunday: { enabled: false, start: '09:00', end: '17:00' },
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  admin_new_ticket: true,
  admin_high_priority: true,
  admin_negative_sentiment: true,
  admin_daily_summary: false,
  admin_weekly_report: true,
  agent_ticket_assigned: true,
  agent_new_message: true,
  agent_ticket_overdue: true,
  agent_mentioned: true,
  client_status_changed: true,
  client_new_reply: true,
  client_ticket_resolved: true,
  push_notifications_enabled: false,
  digest_frequency: 'instant',
};
