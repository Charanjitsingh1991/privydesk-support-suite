import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ChannelConfigRow = Database['public']['Tables']['channel_configurations']['Row'];
type WhatsAppMessageRow = Database['public']['Tables']['whatsapp_messages']['Row'];
type SMSMessageRow = Database['public']['Tables']['sms_messages']['Row'];
type VoiceCallRow = Database['public']['Tables']['voice_calls']['Row'];
type SocialMediaMessageRow = Database['public']['Tables']['social_media_messages']['Row'];
type OmnichannelConversationRow = Database['public']['Tables']['omnichannel_conversations']['Row'];

export interface ChannelConfiguration extends ChannelConfigRow {}
export interface WhatsAppMessage extends WhatsAppMessageRow {}
export interface SMSMessage extends SMSMessageRow {}
export interface VoiceCall extends VoiceCallRow {}
export interface SocialMediaMessage extends SocialMediaMessageRow {}
export interface OmnichannelConversation extends OmnichannelConversationRow {}

// Alias for compatibility
export type OmnichannelMessage = SocialMediaMessage;
export type Conversation = OmnichannelConversation;

export class OmnichannelService {
  /**
   * Get channel configurations
   */
  static async getChannelConfigs(
    organizationId: string
  ): Promise<ChannelConfiguration[]> {
    const { data, error } = await supabase
      .from('channel_configurations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch channel configs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create channel configuration
   */
  static async createChannelConfig(
    organizationId: string,
    config: {
      channel_type: string;
      channel_name: string;
      credentials: any;
      settings?: any;
    }
  ): Promise<ChannelConfiguration | null> {
    const { data, error } = await supabase
      .from('channel_configurations')
      .insert({
        organization_id: organizationId,
        is_active: true,
        ...config,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create channel config:', error);
      return null;
    }

    return data;
  }

  /**
   * Update channel configuration
   */
  static async updateChannelConfig(
    configId: string,
    updates: Partial<ChannelConfiguration>
  ): Promise<ChannelConfiguration | null> {
    const { data, error } = await supabase
      .from('channel_configurations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', configId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update channel config:', error);
      return null;
    }

    return data;
  }

  /**
   * Delete channel configuration
   */
  static async deleteChannelConfig(configId: string): Promise<boolean> {
    const { error } = await supabase
      .from('channel_configurations')
      .delete()
      .eq('id', configId);

    return !error;
  }

  /**
   * Send WhatsApp message
   */
  static async sendWhatsAppMessage(
    organizationId: string,
    channelConfigId: string,
    to: string,
    message: string,
    mediaUrl?: string
  ): Promise<WhatsAppMessage | null> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        organization_id: organizationId,
        channel_config_id: channelConfigId,
        from_number: '', // Will be set by channel config
        to_number: to,
        message_type: 'text',
        content: message,
        media_url: mediaUrl,
        direction: 'outbound',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to send WhatsApp message:', error);
      return null;
    }

    // In production, integrate with WhatsApp Business API
    // For now, mark as sent
    await supabase
      .from('whatsapp_messages')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    return data;
  }

  /**
   * Get WhatsApp messages
   */
  static async getWhatsAppMessages(
    organizationId: string,
    options?: {
      conversationId?: string;
      limit?: number;
    }
  ): Promise<any[]> {
    let query = supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (options?.conversationId) {
      query = query.eq('conversation_id', options.conversationId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch WhatsApp messages:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Send SMS message
   */
  static async sendSMS(
    organizationId: string,
    channelConfigId: string,
    to: string,
    message: string
  ): Promise<SMSMessage | null> {
    const { data, error } = await supabase
      .from('sms_messages')
      .insert({
        organization_id: organizationId,
        channel_config_id: channelConfigId,
        from_number: '', // Will be set by channel config
        to_number: to,
        content: message,
        direction: 'outbound',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to send SMS:', error);
      return null;
    }

    // In production, integrate with Twilio
    await supabase
      .from('sms_messages')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    return data;
  }

  /**
   * Get SMS messages
   */
  static async getSMSMessages(
    organizationId: string,
    options?: {
      conversationId?: string;
      limit?: number;
    }
  ): Promise<SMSMessage[]> {
    let query = supabase
      .from('sms_messages')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (options?.conversationId) {
      query = query.eq('conversation_id', options.conversationId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch SMS messages:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Initiate voice call
   */
  static async initiateVoiceCall(
    organizationId: string,
    channelConfigId: string,
    to: string,
    agentId?: string
  ): Promise<VoiceCall | null> {
    const { data, error } = await supabase
      .from('voice_calls')
      .insert({
        organization_id: organizationId,
        channel_config_id: channelConfigId,
        from_number: '', // Will be set by channel config
        to_number: to,
        agent_id: agentId,
        direction: 'outbound',
        status: 'initiated',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to initiate voice call:', error);
      return null;
    }

    // In production, integrate with Twilio Voice
    return data;
  }

  /**
   * Get voice calls
   */
  static async getVoiceCalls(
    organizationId: string,
    options?: {
      agentId?: string;
      status?: string;
      limit?: number;
    }
  ): Promise<VoiceCall[]> {
    let query = supabase
      .from('voice_calls')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (options?.agentId) {
      query = query.eq('agent_id', options.agentId);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch voice calls:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Send social media message (unified method)
   */
  static async sendMessage(
    organizationId: string,
    channelConfigId: string,
    platform: string,
    recipientId: string,
    content: string,
    conversationId?: string
  ): Promise<SocialMediaMessage | null> {
    const { data, error } = await supabase
      .from('social_media_messages')
      .insert({
        organization_id: organizationId,
        channel_config_id: channelConfigId,
        platform,
        from_user_id: '', // Set by channel config
        to_user_id: recipientId,
        message_type: 'text',
        content,
        conversation_id: conversationId,
        direction: 'outbound',
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to send social media message:', error);
      return null;
    }

    return data;
  }

  /**
   * Get social media messages
   */
  static async getSocialMediaMessages(
    organizationId: string,
    options?: {
      platform?: string;
      conversationId?: string;
      limit?: number;
    }
  ): Promise<SocialMediaMessage[]> {
    let query = supabase
      .from('social_media_messages')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (options?.platform) {
      query = query.eq('platform', options.platform);
    }

    if (options?.conversationId) {
      query = query.eq('conversation_id', options.conversationId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch social media messages:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get unified conversations
   */
  static async getConversations(
    organizationId: string,
    options?: {
      channelType?: string;
      status?: string;
      assignedTo?: string;
      limit?: number;
    }
  ): Promise<any[]> {
    let query = supabase
      .from('omnichannel_conversations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('last_message_at', { ascending: false });

    if (options?.channelType) {
      query = query.eq('channel_type', options.channelType);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.assignedTo) {
      query = query.eq('assigned_to', options.assignedTo);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch conversations:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create conversation
   */
  static async createConversation(
    organizationId: string,
    channelType: string,
    channelIdentifier: string,
    customerIdentifier: string,
    customerName?: string
  ): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('omnichannel_conversations')
      .insert({
        organization_id: organizationId,
        channel_type: channelType,
        channel_identifier: channelIdentifier,
        customer_identifier: customerIdentifier,
        customer_name: customerName,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }

    return data;
  }

  /**
   * Assign conversation to agent
   */
  static async assignConversation(
    conversationId: string,
    agentId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('omnichannel_conversations')
      .update({ 
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return !error;
  }

  /**
   * Close conversation
   */
  static async closeConversation(conversationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('omnichannel_conversations')
      .update({ 
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return !error;
  }
}
