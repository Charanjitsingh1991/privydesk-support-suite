export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailArchive {
  id: string;
  organization_id: string;
  outlook_message_id: string | null;
  conversation_id: string | null;
  folder_path: string | null;
  
  // Content
  subject: string;
  body_preview: string | null;
  body_content: string | null;
  body_content_type: 'html' | 'plain';
  
  // Participants
  from_email: string;
  from_name: string | null;
  to_recipients: EmailRecipient[];
  cc_recipients: EmailRecipient[];
  bcc_recipients: EmailRecipient[];
  
  // Metadata
  importance: 'low' | 'normal' | 'high';
  is_read: boolean;
  has_attachments: boolean;
  categories: string[];
  
  // Linking
  linked_ticket_id: string | null;
  linked_client_id: string | null;
  auto_linked: boolean;
  
  // Timestamps
  received_datetime: string;
  sent_datetime: string | null;
  imported_at: string;
  created_at: string;
  updated_at: string;
}

export interface EmailAttachment {
  id: string;
  email_archive_id: string;
  file_name: string;
  content_type: string;
  file_size: number;
  file_url: string | null;
  download_status: 'pending' | 'completed' | 'failed';
  is_inline: boolean;
  content_id: string | null;
  created_at: string;
  downloaded_at: string | null;
}

export interface EmailImportJob {
  id: string;
  organization_id: string;
  created_by: string;
  pst_file_name: string | null;
  pst_file_size: number | null;
  pst_file_url: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_emails: number;
  processed_emails: number;
  failed_emails: number;
  total_attachments: number;
  processed_attachments: number;
  error_message: string | null;
  error_log: Array<{ email?: string; error: string; timestamp: string }>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailWithAttachments extends EmailArchive {
  attachments?: EmailAttachment[];
  linked_ticket?: {
    id: string;
    subject: string;
    status: string;
  } | null;
}

export interface EmailSearchFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  sender?: string;
  folder?: string;
  hasAttachments?: boolean;
  linkedToTicket?: boolean;
}

export type EmailSortOption = 'received' | 'sender' | 'subject' | 'relevance';
export type EmailSortDirection = 'asc' | 'desc';
