export interface WidgetConfig {
  id: string;
  organization_id: string;
  is_enabled: boolean;
  primary_color: string;
  position: 'bottom-right' | 'bottom-left';
  welcome_message: string;
  trigger_text: string;
  offline_message: string;
  business_hours: {
    enabled: boolean;
    timezone: string;
    hours: Record<string, { start: string; end: string; enabled: boolean }>;
  };
  pre_chat_form_enabled: boolean;
  file_upload_enabled: boolean;
  emoji_picker_enabled: boolean;
  notification_sound: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
}

export interface WidgetVisitor {
  id: string;
  organization_id: string;
  session_id: string;
  name: string | null;
  email: string | null;
  metadata: Record<string, unknown>;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetConversation {
  id: string;
  organization_id: string;
  visitor_id: string;
  assigned_agent_id: string | null;
  status: 'pending' | 'active' | 'resolved' | 'closed';
  topic: string | null;
  page_url: string | null;
  referrer: string | null;
  user_agent: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WidgetMessage {
  id: string;
  conversation_id: string;
  sender_type: 'visitor' | 'agent' | 'system';
  sender_id: string | null;
  content: string;
  attachments: unknown[];
  is_read: boolean;
  created_at: string;
}

export interface AgentAvailability {
  id: string;
  agent_id: string;
  organization_id: string;
  status: 'online' | 'busy' | 'offline';
  max_concurrent_chats: number;
  current_chats: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface PreChatFormData {
  name: string;
  email: string;
  topic: string;
  message?: string;
}
