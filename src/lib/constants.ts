// Application Constants and Configuration

export const APP_CONFIG = {
  name: 'PRIVYDESK',
  version: '1.0.0',
  description: 'Professional Multi-Tenant SaaS Helpdesk Platform',
  author: 'PRIVYDESK Team',
} as const;

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
} as const;

export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_CUSTOMER: 'waiting_customer',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  AGENT: 'agent',
  CLIENT: 'client',
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export const ORGANIZATION_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
} as const;

export const WIDGET_POSITION = {
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
} as const;

export const CONVERSATION_STATUS = {
  ACTIVE: 'active',
  ENDED: 'ended',
  MISSED: 'missed',
} as const;

export const MESSAGE_SENDER_TYPE = {
  VISITOR: 'visitor',
  AGENT: 'agent',
  SYSTEM: 'system',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  TICKETS: '/dashboard/tickets',
  NEW_TICKET: '/dashboard/tickets/new',
  TICKET_DETAIL: (id: string) => `/dashboard/tickets/${id}`,
  LIVE_CHAT: '/dashboard/live-chat',
  CHAT_WIDGET: '/dashboard/chat-widget',
  FILES: '/dashboard/files',
  EMAILS: '/dashboard/emails',
  ANALYTICS: '/dashboard/analytics',
  TEAM: '/dashboard/team',
  CLIENTS: '/dashboard/clients',
  SETTINGS: '/dashboard/settings',
  SECURITY_SETTINGS: '/dashboard/settings/security',
  PRIVACY_SETTINGS: '/dashboard/settings/privacy',
  EMAIL_MIGRATION: '/dashboard/settings/email-migration',
  ONBOARDING: '/onboarding',
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 100,
  TICKET_SUBJECT_MAX_LENGTH: 200,
  TICKET_DESCRIPTION_MAX_LENGTH: 10000,
  MESSAGE_MAX_LENGTH: 5000,
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  TICKETS_PER_PAGE: 20,
  MESSAGES_PER_PAGE: 50,
  CLIENTS_PER_PAGE: 20,
} as const;

export const CACHE_KEYS = {
  TICKETS: 'tickets',
  TICKET: (id: string) => `ticket-${id}`,
  TICKET_MESSAGES: (id: string) => `ticket-messages-${id}`,
  CONVERSATIONS: 'conversations',
  CONVERSATION: (id: string) => `conversation-${id}`,
  ORGANIZATION: 'organization',
  PROFILE: 'profile',
  TEAM_MEMBERS: 'team-members',
  CLIENTS: 'clients',
  ANALYTICS: 'analytics',
  WIDGET_CONFIG: 'widget-config',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  DUPLICATE_ERROR: 'This record already exists.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  TICKET_CREATED: 'Ticket created successfully',
  TICKET_UPDATED: 'Ticket updated successfully',
  TICKET_DELETED: 'Ticket deleted successfully',
  MESSAGE_SENT: 'Message sent successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  INVITATION_SENT: 'Invitation sent successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
} as const;

export const DATE_FORMATS = {
  FULL: 'PPpp', // Jan 1, 2024, 12:00 PM
  DATE_ONLY: 'PP', // Jan 1, 2024
  TIME_ONLY: 'p', // 12:00 PM
  SHORT: 'P', // 01/01/2024
  RELATIVE: 'relative', // 2 hours ago
} as const;

export const THEME = {
  DEFAULT: 'system',
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const STORAGE_KEYS = {
  THEME: 'privydesk-theme',
  SIDEBAR_COLLAPSED: 'privydesk-sidebar-collapsed',
  RECENT_TICKETS: 'privydesk-recent-tickets',
  DRAFT_MESSAGE: (ticketId: string) => `privydesk-draft-${ticketId}`,
} as const;

export const PERFORMANCE_THRESHOLDS = {
  SLOW_QUERY: 1000, // 1 second
  SLOW_RENDER: 500, // 500ms
  SLOW_INTERACTION: 100, // 100ms
} as const;

export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes
  API_REQUESTS_PER_MINUTE: 60,
  EMAIL_SENDS_PER_HOUR: 100,
} as const;

// Type exports for better TypeScript support
export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];
export type TicketPriority = typeof TICKET_PRIORITY[keyof typeof TICKET_PRIORITY];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[keyof typeof SUBSCRIPTION_PLANS];
export type OrganizationStatus = typeof ORGANIZATION_STATUS[keyof typeof ORGANIZATION_STATUS];
