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
      cleanup_expired_otps: { Args: never; Returns: undefined }
      generate_otp: {
        Args: { p_email: string; p_expires_minutes?: number; p_type: string }
        Returns: string
      }
      get_user_organization_id: { Args: never; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_super_admin: { Args: never; Returns: boolean }
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
