import { supabase } from '@/integrations/supabase/client';

export interface TicketFollower {
  id: string;
  ticket_id: string;
  user_id: string;
  notify_on_update: boolean;
  notify_on_comment: boolean;
  notify_on_status_change: boolean;
  created_at: string;
}

export interface TicketMention {
  id: string;
  ticket_id: string;
  message_id: string | null;
  mentioned_user_id: string;
  mentioned_by_user_id: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface TicketRelationship {
  id: string;
  parent_ticket_id: string;
  child_ticket_id: string;
  relationship_type: 'parent_child' | 'related' | 'duplicate' | 'blocks';
  created_at: string;
  created_by: string | null;
}

export class CollaborationService {
  /**
   * Follow a ticket
   */
  static async followTicket(ticketId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('ticket_followers')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
      });

    if (error) {
      console.error('Failed to follow ticket:', error);
      return false;
    }

    return true;
  }

  /**
   * Unfollow a ticket
   */
  static async unfollowTicket(ticketId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('ticket_followers')
      .delete()
      .eq('ticket_id', ticketId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to unfollow ticket:', error);
      return false;
    }

    return true;
  }

  /**
   * Get ticket followers
   */
  static async getTicketFollowers(ticketId: string): Promise<TicketFollower[]> {
    const { data, error } = await supabase
      .from('ticket_followers')
      .select('*, user:users(id, email, full_name)')
      .eq('ticket_id', ticketId);

    if (error) {
      console.error('Failed to fetch ticket followers:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create a mention
   */
  static async createMention(
    ticketId: string,
    messageId: string | null,
    mentionedUserId: string,
    mentionedByUserId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('ticket_mentions')
      .insert({
        ticket_id: ticketId,
        message_id: messageId,
        mentioned_user_id: mentionedUserId,
        mentioned_by_user_id: mentionedByUserId,
      });

    if (error) {
      console.error('Failed to create mention:', error);
      return false;
    }

    return true;
  }

  /**
   * Get user mentions
   */
  static async getUserMentions(userId: string, unreadOnly: boolean = false): Promise<TicketMention[]> {
    let query = supabase
      .from('ticket_mentions')
      .select('*, ticket:tickets(id, subject), mentioned_by:users!mentioned_by_user_id(email, full_name)')
      .eq('mentioned_user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch mentions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Mark mention as read
   */
  static async markMentionAsRead(mentionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('ticket_mentions')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', mentionId);

    if (error) {
      console.error('Failed to mark mention as read:', error);
      return false;
    }

    return true;
  }

  /**
   * Create ticket relationship
   */
  static async createTicketRelationship(
    parentTicketId: string,
    childTicketId: string,
    relationshipType: TicketRelationship['relationship_type'],
    createdBy: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('ticket_relationships')
      .insert({
        parent_ticket_id: parentTicketId,
        child_ticket_id: childTicketId,
        relationship_type: relationshipType,
        created_by: createdBy,
      });

    if (error) {
      console.error('Failed to create ticket relationship:', error);
      return false;
    }

    return true;
  }

  /**
   * Get ticket relationships
   */
  static async getTicketRelationships(ticketId: string): Promise<TicketRelationship[]> {
    const { data, error } = await supabase
      .from('ticket_relationships')
      .select('*, parent_ticket:tickets!parent_ticket_id(id, subject), child_ticket:tickets!child_ticket_id(id, subject)')
      .or(`parent_ticket_id.eq.${ticketId},child_ticket_id.eq.${ticketId}`);

    if (error) {
      console.error('Failed to fetch ticket relationships:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Delete ticket relationship
   */
  static async deleteTicketRelationship(relationshipId: string): Promise<boolean> {
    const { error } = await supabase
      .from('ticket_relationships')
      .delete()
      .eq('id', relationshipId);

    if (error) {
      console.error('Failed to delete ticket relationship:', error);
      return false;
    }

    return true;
  }

  /**
   * Acquire edit lock
   */
  static async acquireEditLock(ticketId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('acquire_ticket_edit_lock', {
      p_ticket_id: ticketId,
      p_user_id: userId,
    });

    if (error) {
      console.error('Failed to acquire edit lock:', error);
      return false;
    }

    return data === true;
  }

  /**
   * Release edit lock
   */
  static async releaseEditLock(ticketId: string, userId: string): Promise<void> {
    await supabase.rpc('release_ticket_edit_lock', {
      p_ticket_id: ticketId,
      p_user_id: userId,
    });
  }

  /**
   * Get current edit lock
   */
  static async getEditLock(ticketId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('ticket_edit_locks')
      .select('*, user:users(email, full_name)')
      .eq('ticket_id', ticketId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }
}
