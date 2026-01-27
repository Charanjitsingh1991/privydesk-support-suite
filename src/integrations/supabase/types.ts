export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_availability: {
        Row: {
          agent_id: string
          created_at: string
          current_chats: number
          id: string
          last_activity_at: string
          max_concurrent_chats: number
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          current_chats?: number
          id?: string
          last_activity_at?: string
          max_concurrent_chats?: number
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          current_chats?: number
          id?: string
          last_activity_at?: string
          max_concurrent_chats?: number
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_availability_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_availability_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      allowed_domains: {
        Row: {
          added_by: string | null
          created_at: string | null
          domain: string
          id: string
          organization_id: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          domain: string
          id?: string
          organization_id: string
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          domain?: string
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "allowed_domains_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allowed_domains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_daily_stats: {
        Row: {
          avg_resolution_time_minutes: number | null
          avg_response_time_minutes: number | null
          created_at: string
          csat_average: number | null
          csat_count: number
          id: string
          organization_id: string
          sla_compliance_rate: number | null
          stat_date: string
          tickets_closed: number
          tickets_created: number
          tickets_resolved: number
          updated_at: string
        }
        Insert: {
          avg_resolution_time_minutes?: number | null
          avg_response_time_minutes?: number | null
          created_at?: string
          csat_average?: number | null
          csat_count?: number
          id?: string
          organization_id: string
          sla_compliance_rate?: number | null
          stat_date: string
          tickets_closed?: number
          tickets_created?: number
          tickets_resolved?: number
          updated_at?: string
        }
        Update: {
          avg_resolution_time_minutes?: number | null
          avg_response_time_minutes?: number | null
          created_at?: string
          csat_average?: number | null
          csat_count?: number
          id?: string
          organization_id?: string
          sla_compliance_rate?: number | null
          stat_date?: string
          tickets_closed?: number
          tickets_created?: number
          tickets_resolved?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_daily_stats_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          permissions: string[]
          rate_limit: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          permissions?: string[]
          rate_limit?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          permissions?: string[]
          rate_limit?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_request_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          organization_id: string
          request_body: Json | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          organization_id: string
          request_body?: Json | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          organization_id?: string
          request_body?: Json | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_request_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_request_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_ips: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          expires_at: string | null
          id: string
          ip_address: string
          is_global: boolean | null
          organization_id: string | null
          reason: string | null
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          is_global?: boolean | null
          organization_id?: string | null
          reason?: string | null
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          is_global?: boolean | null
          organization_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_ips_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_ips_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      csat_responses: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          organization_id: string
          rating_agent: number | null
          rating_resolution: number
          rating_response_time: number | null
          submitted_at: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          organization_id: string
          rating_agent?: number | null
          rating_resolution: number
          rating_response_time?: number | null
          submitted_at?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          organization_id?: string
          rating_agent?: number | null
          rating_resolution?: number
          rating_response_time?: number | null
          submitted_at?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "csat_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "csat_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      email_archive: {
        Row: {
          auto_linked: boolean | null
          bcc_recipients: Json | null
          body_content: string | null
          body_content_type: string | null
          body_preview: string | null
          categories: Json | null
          cc_recipients: Json | null
          conversation_id: string | null
          created_at: string | null
          folder_path: string | null
          from_email: string
          from_name: string | null
          has_attachments: boolean | null
          id: string
          importance: string | null
          imported_at: string | null
          is_read: boolean | null
          linked_client_id: string | null
          linked_ticket_id: string | null
          organization_id: string
          outlook_message_id: string | null
          received_datetime: string
          search_vector: unknown
          sent_datetime: string | null
          subject: string
          to_recipients: Json | null
          updated_at: string | null
        }
        Insert: {
          auto_linked?: boolean | null
          bcc_recipients?: Json | null
          body_content?: string | null
          body_content_type?: string | null
          body_preview?: string | null
          categories?: Json | null
          cc_recipients?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          folder_path?: string | null
          from_email: string
          from_name?: string | null
          has_attachments?: boolean | null
          id?: string
          importance?: string | null
          imported_at?: string | null
          is_read?: boolean | null
          linked_client_id?: string | null
          linked_ticket_id?: string | null
          organization_id: string
          outlook_message_id?: string | null
          received_datetime: string
          search_vector?: unknown
          sent_datetime?: string | null
          subject: string
          to_recipients?: Json | null
          updated_at?: string | null
        }
        Update: {
          auto_linked?: boolean | null
          bcc_recipients?: Json | null
          body_content?: string | null
          body_content_type?: string | null
          body_preview?: string | null
          categories?: Json | null
          cc_recipients?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          folder_path?: string | null
          from_email?: string
          from_name?: string | null
          has_attachments?: boolean | null
          id?: string
          importance?: string | null
          imported_at?: string | null
          is_read?: boolean | null
          linked_client_id?: string | null
          linked_ticket_id?: string | null
          organization_id?: string
          outlook_message_id?: string | null
          received_datetime?: string
          search_vector?: unknown
          sent_datetime?: string | null
          subject?: string
          to_recipients?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_archive_linked_client_id_fkey"
            columns: ["linked_client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_archive_linked_ticket_id_fkey"
            columns: ["linked_ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_archive_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_attachments: {
        Row: {
          content_id: string | null
          content_type: string
          created_at: string | null
          download_status: string | null
          downloaded_at: string | null
          email_archive_id: string
          file_name: string
          file_size: number
          file_url: string | null
          id: string
          is_inline: boolean | null
        }
        Insert: {
          content_id?: string | null
          content_type: string
          created_at?: string | null
          download_status?: string | null
          downloaded_at?: string | null
          email_archive_id: string
          file_name: string
          file_size: number
          file_url?: string | null
          id?: string
          is_inline?: boolean | null
        }
        Update: {
          content_id?: string | null
          content_type?: string
          created_at?: string | null
          download_status?: string | null
          downloaded_at?: string | null
          email_archive_id?: string
          file_name?: string
          file_size?: number
          file_url?: string | null
          id?: string
          is_inline?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "email_attachments_email_archive_id_fkey"
            columns: ["email_archive_id"]
            isOneToOne: false
            referencedRelation: "email_archive"
            referencedColumns: ["id"]
          },
        ]
      }
      email_import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string
          error_log: Json | null
          error_message: string | null
          failed_emails: number | null
          id: string
          organization_id: string
          processed_attachments: number | null
          processed_emails: number | null
          pst_file_name: string | null
          pst_file_size: number | null
          pst_file_url: string | null
          started_at: string | null
          status: string | null
          total_attachments: number | null
          total_emails: number | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          error_log?: Json | null
          error_message?: string | null
          failed_emails?: number | null
          id?: string
          organization_id: string
          processed_attachments?: number | null
          processed_emails?: number | null
          pst_file_name?: string | null
          pst_file_size?: number | null
          pst_file_url?: string | null
          started_at?: string | null
          status?: string | null
          total_attachments?: number | null
          total_emails?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          error_log?: Json | null
          error_message?: string | null
          failed_emails?: number | null
          id?: string
          organization_id?: string
          processed_attachments?: number | null
          processed_emails?: number | null
          pst_file_name?: string | null
          pst_file_size?: number | null
          pst_file_url?: string | null
          started_at?: string | null
          status?: string | null
          total_attachments?: number | null
          total_emails?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_import_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_import_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      flagged_content: {
        Row: {
          action_taken: string | null
          auto_flagged: boolean | null
          content_id: string | null
          content_type: string
          created_at: string | null
          flagged_by: string | null
          flagged_content: string | null
          id: string
          organization_id: string
          reason: string
          reviewed: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
        }
        Insert: {
          action_taken?: string | null
          auto_flagged?: boolean | null
          content_id?: string | null
          content_type: string
          created_at?: string | null
          flagged_by?: string | null
          flagged_content?: string | null
          id?: string
          organization_id: string
          reason: string
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
        }
        Update: {
          action_taken?: string | null
          auto_flagged?: boolean | null
          content_id?: string | null
          content_type?: string
          created_at?: string | null
          flagged_by?: string | null
          flagged_content?: string | null
          id?: string
          organization_id?: string
          reason?: string
          reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "flagged_content_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flagged_content_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flagged_content_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json[] | null
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          read_by: string[] | null
          ticket_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json[] | null
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          read_by?: string[] | null
          ticket_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json[] | null
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          read_by?: string[] | null
          ticket_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          branding: Json | null
          company_size: string | null
          created_at: string | null
          custom_domain: string | null
          domain_verification_method: string | null
          domain_verification_token: string | null
          domain_verified: boolean | null
          email_config: Json | null
          id: string
          industry: string | null
          logo_url: string | null
          metadata: Json | null
          name: string
          plan: Database["public"]["Enums"]["plan_type"] | null
          primary_color: string | null
          security_settings: Json | null
          slug: string
          status: Database["public"]["Enums"]["org_status"] | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          branding?: Json | null
          company_size?: string | null
          created_at?: string | null
          custom_domain?: string | null
          domain_verification_method?: string | null
          domain_verification_token?: string | null
          domain_verified?: boolean | null
          email_config?: Json | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
          primary_color?: string | null
          security_settings?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["org_status"] | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          branding?: Json | null
          company_size?: string | null
          created_at?: string | null
          custom_domain?: string | null
          domain_verification_method?: string | null
          domain_verification_token?: string | null
          domain_verified?: boolean | null
          email_config?: Json | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
          primary_color?: string | null
          security_settings?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["org_status"] | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          type: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          type: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          type?: string
          used_at?: string | null
        }
        Relationships: []
      }
      pending_clients: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          organization_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          organization_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_clients_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          organization_id: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name: string
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          organization_id?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          organization_id?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          blocked_until: string | null
          first_attempt_at: string | null
          id: string
          identifier: string
          last_attempt_at: string | null
        }
        Insert: {
          action: string
          attempts?: number | null
          blocked_until?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier: string
          last_attempt_at?: string | null
        }
        Update: {
          action?: string
          attempts?: number | null
          blocked_until?: string | null
          first_attempt_at?: string | null
          id?: string
          identifier?: string
          last_attempt_at?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          organization_id: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_configurations: {
        Row: {
          business_hours_only: boolean
          created_at: string
          first_response_minutes: number
          id: string
          is_active: boolean
          organization_id: string
          priority: string
          resolution_minutes: number
          updated_at: string
        }
        Insert: {
          business_hours_only?: boolean
          created_at?: string
          first_response_minutes?: number
          id?: string
          is_active?: boolean
          organization_id: string
          priority: string
          resolution_minutes?: number
          updated_at?: string
        }
        Update: {
          business_hours_only?: boolean
          created_at?: string
          first_response_minutes?: number
          id?: string
          is_active?: boolean
          organization_id?: string
          priority?: string
          resolution_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          limits: Json | null
          name: string
          price_annual: number | null
          price_monthly: number | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name: string
          price_annual?: number | null
          price_monthly?: number | null
          slug: string
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limits?: Json | null
          name?: string
          price_annual?: number | null
          price_monthly?: number | null
          slug?: string
        }
        Relationships: []
      }
      subscription_usage: {
        Row: {
          created_at: string | null
          emails_sent_this_month: number | null
          id: string
          last_reset_at: string | null
          organization_id: string
          storage_used_mb: number | null
          tickets_used_this_month: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          emails_sent_this_month?: number | null
          id?: string
          last_reset_at?: string | null
          organization_id: string
          storage_used_mb?: number | null
          tickets_used_this_month?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          emails_sent_this_month?: number | null
          id?: string
          last_reset_at?: string | null
          organization_id?: string
          storage_used_mb?: number | null
          tickets_used_this_month?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          created_by: string
          description: string
          due_date: string | null
          first_response_at: string | null
          id: string
          metadata: Json | null
          organization_id: string
          priority: Database["public"]["Enums"]["ticket_priority"] | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          created_by: string
          description: string
          due_date?: string | null
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          due_date?: string | null
          first_response_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          custom_message: string | null
          email: string
          full_name: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          status: string
          token: string
          token_expires_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          custom_message?: string | null
          email: string
          full_name: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          token: string
          token_expires_at: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          custom_message?: string | null
          email?: string
          full_name?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          token?: string
          token_expires_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string | null
          device_fingerprint: string | null
          device_type: string | null
          expires_at: string
          geo_location: Json | null
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_activity_at: string | null
          os: string | null
          session_token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          device_type?: string | null
          expires_at: string
          geo_location?: Json | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_activity_at?: string | null
          os?: string | null
          session_token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_fingerprint?: string | null
          device_type?: string | null
          expires_at?: string
          geo_location?: Json | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_activity_at?: string | null
          os?: string | null
          session_token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configs: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          failure_count: number
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          organization_id: string
          secret: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          organization_id: string
          secret: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          organization_id?: string
          secret?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_configs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          attempt_count: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          event: string
          id: string
          organization_id: string
          payload: Json
          response_body: string | null
          response_code: number | null
          status: string
          webhook_config_id: string
        }
        Insert: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          event: string
          id?: string
          organization_id: string
          payload: Json
          response_body?: string | null
          response_code?: number | null
          status?: string
          webhook_config_id: string
        }
        Update: {
          attempt_count?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          event?: string
          id?: string
          organization_id?: string
          payload?: Json
          response_body?: string | null
          response_code?: number | null
          status?: string
          webhook_config_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_logs_webhook_config_id_fkey"
            columns: ["webhook_config_id"]
            isOneToOne: false
            referencedRelation: "webhook_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_config: {
        Row: {
          business_hours: Json
          created_at: string
          emoji_picker_enabled: boolean
          file_upload_enabled: boolean
          id: string
          is_enabled: boolean
          notification_sound: string | null
          offline_message: string
          organization_id: string
          position: string
          pre_chat_form_enabled: boolean
          primary_color: string
          topics: string[] | null
          trigger_text: string
          updated_at: string
          welcome_message: string
        }
        Insert: {
          business_hours?: Json
          created_at?: string
          emoji_picker_enabled?: boolean
          file_upload_enabled?: boolean
          id?: string
          is_enabled?: boolean
          notification_sound?: string | null
          offline_message?: string
          organization_id: string
          position?: string
          pre_chat_form_enabled?: boolean
          primary_color?: string
          topics?: string[] | null
          trigger_text?: string
          updated_at?: string
          welcome_message?: string
        }
        Update: {
          business_hours?: Json
          created_at?: string
          emoji_picker_enabled?: boolean
          file_upload_enabled?: boolean
          id?: string
          is_enabled?: boolean
          notification_sound?: string | null
          offline_message?: string
          organization_id?: string
          position?: string
          pre_chat_form_enabled?: boolean
          primary_color?: string
          topics?: string[] | null
          trigger_text?: string
          updated_at?: string
          welcome_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_config_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_conversations: {
        Row: {
          assigned_agent_id: string | null
          created_at: string
          ended_at: string | null
          id: string
          organization_id: string
          page_url: string | null
          referrer: string | null
          started_at: string
          status: string
          topic: string | null
          updated_at: string
          user_agent: string | null
          visitor_id: string
        }
        Insert: {
          assigned_agent_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          organization_id: string
          page_url?: string | null
          referrer?: string | null
          started_at?: string
          status?: string
          topic?: string | null
          updated_at?: string
          user_agent?: string | null
          visitor_id: string
        }
        Update: {
          assigned_agent_id?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          organization_id?: string
          page_url?: string | null
          referrer?: string | null
          started_at?: string
          status?: string
          topic?: string | null
          updated_at?: string
          user_agent?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_conversations_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "widget_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "widget_conversations_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "widget_visitors"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_messages: {
        Row: {
          attachments: Json[] | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          attachments?: Json[] | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          attachments?: Json[] | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "widget_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_visitors: {
        Row: {
          created_at: string
          email: string | null
          first_seen_at: string
          id: string
          last_seen_at: string
          metadata: Json | null
          name: string | null
          organization_id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          metadata?: Json | null
          name?: string | null
          organization_id: string
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          metadata?: Json | null
          name?: string | null
          organization_id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_visitors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { p_token: string; p_user_id: string }
        Returns: boolean
      }
      check_api_rate_limit: {
        Args: { p_api_key_id: string; p_rate_limit: number }
        Returns: {
          allowed: boolean
          remaining: number
          reset_at: string
        }[]
      }
      check_domain_allowed: {
        Args: { p_email: string; p_organization_id: string }
        Returns: {
          allowed: boolean
          requires_approval: boolean
        }[]
      }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_attempts: number
          p_window_minutes: number
        }
        Returns: {
          allowed: boolean
          attempts_remaining: number
          blocked_until: string
        }[]
      }
      cleanup_expired_invitations: { Args: never; Returns: undefined }
      cleanup_expired_otps: { Args: never; Returns: undefined }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      generate_invitation_token: { Args: never; Returns: string }
      generate_otp: {
        Args: { p_email: string; p_expires_minutes?: number; p_type: string }
        Returns: string
      }
      get_agent_performance: {
        Args: {
          p_end_date: string
          p_organization_id: string
          p_start_date: string
        }
        Returns: {
          agent_avatar: string
          agent_id: string
          agent_name: string
          avg_resolution_minutes: number
          avg_response_minutes: number
          csat_average: number
          tickets_assigned: number
          tickets_resolved: number
        }[]
      }
      get_ticket_analytics: {
        Args: {
          p_end_date: string
          p_organization_id: string
          p_start_date: string
        }
        Returns: {
          avg_resolution_minutes: number
          avg_response_minutes: number
          closed_tickets: number
          in_progress_tickets: number
          open_tickets: number
          resolved_tickets: number
          total_tickets: number
        }[]
      }
      get_tickets_by_date: {
        Args: {
          p_end_date: string
          p_organization_id: string
          p_start_date: string
        }
        Returns: {
          closed_count: number
          created_count: number
          date: string
          resolved_count: number
        }[]
      }
      get_user_organization_id: { Args: never; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_super_admin: { Args: never; Returns: boolean }
      log_security_event: {
        Args: {
          p_details?: Json
          p_event_type: string
          p_ip_address?: string
          p_organization_id: string
          p_severity?: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
      validate_api_key: {
        Args: { p_api_key: string }
        Returns: {
          api_key_id: string
          organization_id: string
          permissions: string[]
          rate_limit: number
        }[]
      }
      verify_otp: {
        Args: { p_code: string; p_email: string; p_type: string }
        Returns: boolean
      }
    }
    Enums: {
      org_status: "active" | "suspended" | "cancelled"
      plan_type: "free" | "starter" | "pro" | "enterprise"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status:
        | "open"
        | "in_progress"
        | "waiting_customer"
        | "resolved"
        | "closed"
      user_role: "super_admin" | "admin" | "agent" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      org_status: ["active", "suspended", "cancelled"],
      plan_type: ["free", "starter", "pro", "enterprise"],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: [
        "open",
        "in_progress",
        "waiting_customer",
        "resolved",
        "closed",
      ],
      user_role: ["super_admin", "admin", "agent", "client"],
    },
  },
} as const
