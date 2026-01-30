import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ForumTopicRow = Database['public']['Tables']['forum_topics']['Row'];
type ForumReplyRow = Database['public']['Tables']['forum_replies']['Row'];

export interface ForumTopic extends ForumTopicRow {
  author?: {
    full_name: string;
    email: string;
  };
}

export interface ForumReply extends ForumReplyRow {
  author?: {
    full_name: string;
    email: string;
  };
}

export class ForumService {
  /**
   * Get all topics
   */
  static async getTopics(
    organizationId: string,
    options?: {
      categoryId?: string;
      status?: 'open' | 'closed' | 'pinned';
      limit?: number;
      offset?: number;
    }
  ): Promise<ForumTopic[]> {
    let query = supabase
      .from('forum_topics')
      .select('*, author:profiles!created_by(full_name, email)')
      .eq('organization_id', organizationId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch topics:', error);
      return [];
    }

    // Get reply counts
    const topicsWithCounts = await Promise.all(
      (data || []).map(async (topic) => {
        const { count } = await supabase
          .from('forum_replies')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topic.id);

        return {
          ...topic,
          reply_count: count || 0,
        } as ForumTopic;
      })
    );

    return topicsWithCounts;
  }

  /**
   * Get topic by ID
   */
  static async getTopicById(topicId: string): Promise<ForumTopic | null> {
    const { data, error } = await supabase
      .from('forum_topics')
      .select('*, author:profiles!created_by(full_name, email)')
      .eq('id', topicId)
      .single();

    if (error) {
      console.error('Failed to fetch topic:', error);
      return null;
    }

    // Increment view count
    if (data) {
      await this.incrementTopicViews(topicId);
    }

    // Get reply count
    const { count } = await supabase
      .from('forum_replies')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId);

    return {
      ...data,
      reply_count: count || 0,
    } as ForumTopic;
  }

  /**
   * Create topic
   */
  static async createTopic(
    organizationId: string,
    userId: string,
    topic: {
      title: string;
      slug: string;
      content: string;
      category_id?: string;
      tags?: string[];
    }
  ): Promise<ForumTopic | null> {
    const { data, error } = await supabase
      .from('forum_topics')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        ...topic,
      })
      .select('*, author:profiles!created_by(full_name, email)')
      .single();

    if (error) {
      console.error('Failed to create topic:', error);
      return null;
    }

    return data as ForumTopic;
  }

  /**
   * Update topic
   */
  static async updateTopic(
    topicId: string,
    updates: Partial<ForumTopic>
  ): Promise<ForumTopic | null> {
    const { data, error } = await supabase
      .from('forum_topics')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', topicId)
      .select('*, author:profiles!created_by(full_name, email)')
      .single();

    if (error) {
      console.error('Failed to update topic:', error);
      return null;
    }

    return data as ForumTopic;
  }

  /**
   * Delete topic
   */
  static async deleteTopic(topicId: string): Promise<boolean> {
    const { error } = await supabase
      .from('forum_topics')
      .delete()
      .eq('id', topicId);

    if (error) {
      console.error('Failed to delete topic:', error);
      return false;
    }

    return true;
  }

  /**
   * Get replies for a topic
   */
  static async getReplies(
    topicId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<ForumReply[]> {
    let query = supabase
      .from('forum_replies')
      .select('*, author:profiles!created_by(full_name, email)')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch replies:', error);
      return [];
    }

    return (data || []) as ForumReply[];
  }

  /**
   * Create reply
   */
  static async createReply(
    topicId: string,
    userId: string,
    content: string,
    parentReplyId?: string
  ): Promise<ForumReply | null> {
    const { data, error } = await supabase
      .from('forum_replies')
      .insert({
        topic_id: topicId,
        created_by: userId,
        content,
        parent_reply_id: parentReplyId,
      })
      .select('*, author:profiles!created_by(full_name, email)')
      .single();

    if (error) {
      console.error('Failed to create reply:', error);
      return null;
    }

    // Update topic's last activity
    await supabase
      .from('forum_topics')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', topicId);

    return data as ForumReply;
  }

  /**
   * Update reply
   */
  static async updateReply(
    replyId: string,
    content: string
  ): Promise<ForumReply | null> {
    const { data, error } = await supabase
      .from('forum_replies')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', replyId)
      .select('*, author:profiles!created_by(full_name, email)')
      .single();

    if (error) {
      console.error('Failed to update reply:', error);
      return null;
    }

    return data as ForumReply;
  }

  /**
   * Delete reply
   */
  static async deleteReply(replyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('forum_replies')
      .delete()
      .eq('id', replyId);

    if (error) {
      console.error('Failed to delete reply:', error);
      return false;
    }

    return true;
  }

  /**
   * Vote on topic
   */
  static async voteTopic(topicId: string, upvote: boolean): Promise<boolean> {
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('vote_count')
      .eq('id', topicId)
      .single();

    if (!topic) return false;

    const newVoteCount = upvote
      ? (topic.vote_count || 0) + 1
      : (topic.vote_count || 0) - 1;

    const { error } = await supabase
      .from('forum_topics')
      .update({ vote_count: newVoteCount })
      .eq('id', topicId);

    return !error;
  }

  /**
   * Vote on reply
   */
  static async voteReply(replyId: string, upvote: boolean): Promise<boolean> {
    const { data: reply } = await supabase
      .from('forum_replies')
      .select('vote_count')
      .eq('id', replyId)
      .single();

    if (!reply) return false;

    const newVoteCount = upvote
      ? (reply.vote_count || 0) + 1
      : (reply.vote_count || 0) - 1;

    const { error } = await supabase
      .from('forum_replies')
      .update({ vote_count: newVoteCount })
      .eq('id', replyId);

    return !error;
  }

  /**
   * Mark reply as solution
   */
  static async markAsSolution(
    topicId: string,
    replyId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('forum_topics')
      .update({ 
        is_solved: true,
      })
      .eq('id', topicId);

    if (error) {
      console.error('Failed to mark as solution:', error);
      return false;
    }

    // Mark reply as best answer
    await supabase
      .from('forum_replies')
      .update({ is_best_answer: true })
      .eq('id', replyId);

    return true;
  }

  /**
   * Increment topic views
   */
  private static async incrementTopicViews(topicId: string): Promise<void> {
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('view_count')
      .eq('id', topicId)
      .single();

    if (topic) {
      await supabase
        .from('forum_topics')
        .update({ view_count: (topic.view_count || 0) + 1 })
        .eq('id', topicId);
    }
  }

  /**
   * Search topics
   */
  static async searchTopics(
    organizationId: string,
    searchQuery: string
  ): Promise<ForumTopic[]> {
    // @ts-expect-error - Supabase type instantiation depth limitation
    const { data, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        profiles:created_by(full_name, avatar_url),
        forum_replies(count)
      `)
      .eq('organization_id', organizationId)
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to search topics:', error);
      return [];
    }

    return (data || []) as ForumTopic[];
  }
}
