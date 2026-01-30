import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type KBArticleRow = Database['public']['Tables']['kb_articles']['Row'];
type KBCategoryRow = Database['public']['Tables']['kb_categories']['Row'];

export interface KBArticle extends KBArticleRow {
  category?: KBCategoryRow;
  author?: {
    full_name: string;
    email: string;
  };
}

export interface KBCategory extends KBCategoryRow {}

export class KnowledgeBaseService {
  /**
   * Get all published articles
   */
  static async getPublishedArticles(
    organizationId: string,
    options?: {
      categoryId?: string;
      language?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<KBArticle[]> {
    let query = supabase
      .from('kb_articles')
      .select('*, category:kb_categories(*), author:profiles!created_by(full_name, email)')
      .eq('organization_id', organizationId)
      .eq('status', 'published')
      .order('view_count', { ascending: false });

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.language) {
      query = query.eq('language', options.language);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch articles:', error);
      return [];
    }

    return (data || []) as KBArticle[];
  }

  /**
   * Get article by slug
   */
  static async getArticleBySlug(
    organizationId: string,
    slug: string
  ): Promise<KBArticle | null> {
    const { data, error } = await supabase
      .from('kb_articles')
      .select('*, category:kb_categories(*), author:profiles!created_by(full_name, email)')
      .eq('organization_id', organizationId)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      console.error('Failed to fetch article:', error);
      return null;
    }

    // Increment view count
    if (data) {
      await this.incrementViewCount(data.id);
    }

    return data as KBArticle;
  }

  /**
   * Search articles
   */
  static async searchArticles(
    organizationId: string,
    searchQuery: string,
    language?: string
  ): Promise<KBArticle[]> {
    let query = supabase
      .from('kb_articles')
      .select('*, category:kb_categories(*), author:profiles!created_by(full_name, email)')
      .eq('organization_id', organizationId)
      .eq('status', 'published')
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);

    if (language) {
      query = query.eq('language', language);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to search articles:', error);
      return [];
    }

    return (data || []) as KBArticle[];
  }

  /**
   * Create article
   */
  static async createArticle(
    organizationId: string,
    userId: string,
    article: {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      category_id?: string;
      language?: string;
      status?: 'draft' | 'published' | 'archived';
      meta_title?: string;
      meta_description?: string;
      featured_image_url?: string;
    }
  ): Promise<KBArticle | null> {
    const { data, error } = await supabase
      .from('kb_articles')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        ...article,
      })
      .select('*, category:kb_categories(*), author:profiles!created_by(full_name, email)')
      .single();

    if (error) {
      console.error('Failed to create article:', error);
      return null;
    }

    return data as KBArticle;
  }

  /**
   * Update article
   */
  static async updateArticle(
    articleId: string,
    userId: string,
    updates: Partial<KBArticle>
  ): Promise<KBArticle | null> {
    const { data, error } = await supabase
      .from('kb_articles')
      .update({
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleId)
      .select('*, category:kb_categories(*), author:profiles!created_by(full_name, email)')
      .single();

    if (error) {
      console.error('Failed to update article:', error);
      return null;
    }

    return data as KBArticle;
  }

  /**
   * Delete article
   */
  static async deleteArticle(articleId: string): Promise<boolean> {
    const { error } = await supabase
      .from('kb_articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      console.error('Failed to delete article:', error);
      return false;
    }

    return true;
  }

  /**
   * Increment view count
   */
  static async incrementViewCount(articleId: string): Promise<void> {
    const { data: article } = await supabase
      .from('kb_articles')
      .select('view_count')
      .eq('id', articleId)
      .single();

    if (article) {
      await supabase
        .from('kb_articles')
        .update({ view_count: (article.view_count || 0) + 1 })
        .eq('id', articleId);
    }
  }

  /**
   * Vote on article (helpful/not helpful)
   */
  static async voteArticle(
    articleId: string,
    helpful: boolean
  ): Promise<boolean> {
    const { data: article } = await supabase
      .from('kb_articles')
      .select('upvotes, downvotes')
      .eq('id', articleId)
      .single();

    if (!article) return false;

    const updates = helpful
      ? { upvotes: (article.upvotes || 0) + 1 }
      : { downvotes: (article.downvotes || 0) + 1 };

    const { error } = await supabase
      .from('kb_articles')
      .update(updates)
      .eq('id', articleId);

    return !error;
  }

  /**
   * Get all categories
   */
  static async getCategories(organizationId: string): Promise<KBCategory[]> {
    const { data, error } = await supabase
      .from('kb_categories')
      .select('*')
      .eq('organization_id', organizationId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create category
   */
  static async createCategory(
    organizationId: string,
    category: {
      name: string;
      slug: string;
      description?: string;
      icon?: string;
      parent_id?: string;
      sort_order?: number;
    }
  ): Promise<KBCategory | null> {
    const { data, error } = await supabase
      .from('kb_categories')
      .insert({
        organization_id: organizationId,
        ...category,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create category:', error);
      return null;
    }

    return data;
  }

  /**
   * Update category
   */
  static async updateCategory(
    categoryId: string,
    updates: Partial<KBCategory>
  ): Promise<KBCategory | null> {
    const { data, error } = await supabase
      .from('kb_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update category:', error);
      return null;
    }

    return data;
  }

  /**
   * Delete category
   */
  static async deleteCategory(categoryId: string): Promise<boolean> {
    const { error } = await supabase
      .from('kb_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Failed to delete category:', error);
      return false;
    }

    return true;
  }

  /**
   * Get article analytics
   */
  static async getArticleAnalytics(
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalArticles: number;
    totalViews: number;
    totalUpvotes: number;
    totalDownvotes: number;
    topArticles: KBArticle[];
  }> {
    let query = supabase
      .from('kb_articles')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'published');

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error || !data) {
      return {
        totalArticles: 0,
        totalViews: 0,
        totalUpvotes: 0,
        totalDownvotes: 0,
        topArticles: [],
      };
    }

    const totalViews = data.reduce((sum, article) => sum + (article.view_count || 0), 0);
    const totalUpvotes = data.reduce((sum, article) => sum + (article.upvotes || 0), 0);
    const totalDownvotes = data.reduce((sum, article) => sum + (article.downvotes || 0), 0);

    const topArticles = [...data]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 10) as KBArticle[];

    return {
      totalArticles: data.length,
      totalViews,
      totalUpvotes,
      totalDownvotes,
      topArticles,
    };
  }
}
