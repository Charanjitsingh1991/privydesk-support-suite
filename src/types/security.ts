export interface SecurityEvent {
  id: string;
  organization_id: string | null;
  event_type: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface AllowedDomain {
  id: string;
  organization_id: string;
  domain: string;
  added_by: string | null;
  created_at: string;
}

export interface PendingClient {
  id: string;
  organization_id: string;
  email: string;
  full_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token_hash: string;
  device_fingerprint: string | null;
  ip_address: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
  geo_location: {
    country?: string;
    city?: string;
    region?: string;
  };
  is_current: boolean;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

export interface BlockedIP {
  id: string;
  organization_id: string | null;
  ip_address: string;
  reason: string | null;
  blocked_by: string | null;
  blocked_at: string;
  expires_at: string | null;
  is_global: boolean;
}

export interface FlaggedContent {
  id: string;
  organization_id: string;
  content_type: 'message' | 'attachment' | 'link' | 'email';
  content_id: string | null;
  flagged_content: string | null;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  auto_flagged: boolean;
  flagged_by: string | null;
  reviewed: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  action_taken: string | null;
  created_at: string;
}

export interface SecuritySettings {
  block_generic_email_providers: boolean;
  require_domain_approval: boolean;
  max_concurrent_sessions: number;
  session_timeout_minutes: number;
  session_max_age_days: number;
  ip_binding_enabled: boolean;
  notify_new_device_login: boolean;
  scan_external_links: boolean;
  block_dangerous_attachments: boolean;
  // Password policies
  password_min_length?: number;
  password_require_uppercase?: boolean;
  password_require_lowercase?: boolean;
  password_require_numbers?: boolean;
  password_require_symbols?: boolean;
  password_expiry_days?: number;
  password_history_count?: number;
  // 2FA policies
  require_2fa_for_admins?: boolean;
  require_2fa_for_agents?: boolean;
  // Account lockout
  max_login_attempts?: number;
  lockout_duration_minutes?: number;
}

export interface LinkScanResult {
  url: string;
  safe: boolean;
  reason?: string;
  external: boolean;
  trustedDomain: boolean;
}

export interface AttachmentScanResult {
  fileName: string;
  safe: boolean;
  reason?: string;
  blocked: boolean;
}

export const DANGEROUS_FILE_EXTENSIONS = [
  '.exe', '.bat', '.sh', '.cmd', '.com', '.scr', '.vbs', '.vbe',
  '.js', '.jse', '.ws', '.wsf', '.msc', '.msi', '.msp', '.pif',
  '.reg', '.ps1', '.psm1', '.dll', '.sys', '.drv', '.ocx'
];

export const SAFE_FILE_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.rtf', '.csv', '.json', '.xml',
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.ico',
  '.mp3', '.mp4', '.wav', '.webm', '.ogg', '.mov', '.avi',
  '.zip', '.rar', '.7z', '.tar', '.gz'
];

export const GENERIC_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'mail.com', 'protonmail.com',
  'live.com', 'msn.com', 'ymail.com', 'zoho.com'
];
