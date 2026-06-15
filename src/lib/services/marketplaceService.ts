import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type MarketplaceAppRow = Database['public']['Tables']['marketplace_apps']['Row'];
type AppInstallationRow = Database['public']['Tables']['app_installations']['Row'];
type AppReviewRow = Database['public']['Tables']['app_reviews']['Row'];

export type MarketplaceApp = MarketplaceAppRow
export type AppInstallation = AppInstallationRow
export type AppReview = AppReviewRow

export class MarketplaceService {
  /**
   * Get all marketplace apps
   */
  static async getMarketplaceApps(options?: {
    category?: string;
    featured?: boolean;
    limit?: number;
  }): Promise<MarketplaceApp[]> {
    // @ts-expect-error - Supabase type instantiation depth limitation
    let query = supabase
      .from('marketplace_apps')
      .select('*')
      .eq('is_published', true)
      .order('install_count', { ascending: false });

    if (options?.category) {
      query = query.eq('category', options.category);
    }

    if (options?.featured) {
      query = query.eq('is_featured', true);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch marketplace apps:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get app by ID
   */
  static async getAppById(appId: string): Promise<MarketplaceApp | null> {
    const { data, error } = await supabase
      .from('marketplace_apps')
      .select('*')
      .eq('id', appId)
      .single();

    if (error) {
      console.error('Failed to fetch app:', error);
      return null;
    }

    return data;
  }

  /**
   * Search marketplace apps
   */
  static async searchApps(query: string): Promise<MarketplaceApp[]> {
    const { data, error } = await supabase
      .from('marketplace_apps')
      .select('*')
      .eq('is_published', true)
      .or(`app_name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('install_count', { ascending: false });

    if (error) {
      console.error('Failed to search apps:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Install app
   */
  static async installApp(
    organizationId: string,
    appId: string,
    installedBy: string,
    settings?: unknown
  ): Promise<AppInstallation | null> {
    // Check if already installed
    const { data: existing } = await supabase
      .from('app_installations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('app_id', appId)
      .single();

    if (existing) {
      return existing;
    }

    const { data, error } = await supabase
      .from('app_installations')
      .insert({
        organization_id: organizationId,
        app_id: appId,
        installed_by: installedBy,
        settings,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to install app:', error);
      return null;
    }

    // Increment install count
    const { data: app } = await supabase
      .from('marketplace_apps')
      .select('install_count')
      .eq('id', appId)
      .single();

    if (app) {
      await supabase
        .from('marketplace_apps')
        .update({ install_count: (app.install_count || 0) + 1 })
        .eq('id', appId);
    }

    return data;
  }

  /**
   * Uninstall app
   */
  static async uninstallApp(installationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('app_installations')
      .delete()
      .eq('id', installationId);

    return !error;
  }

  /**
   * Get installed apps
   */
  static async getInstalledApps(
    organizationId: string
  ): Promise<Array<AppInstallation & { app: MarketplaceApp }>> {
    // @ts-expect-error - Supabase type instantiation depth limitation
    const { data, error } = await supabase
      .from('app_installations')
      .select('*, app:marketplace_apps(*)')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('installed_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch installed apps:', error);
      return [];
    }

    return (data || []) as AppInstallation[];
  }

  /**
   * Update app settings
   */
  static async updateAppSettings(
    installationId: string,
    settings: unknown
  ): Promise<AppInstallation | null> {
    const { data, error } = await supabase
      .from('app_installations')
      .update({ configuration: settings })
      .eq('id', installationId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update app settings:', error);
      return null;
    }

    return data;
  }

  /**
   * Create app review
   */
  static async createReview(
    appId: string,
    userId: string,
    organizationId: string,
    rating: number,
    reviewText?: string
  ): Promise<AppReview | null> {
    const { data, error } = await supabase
      .from('app_reviews')
      .insert({
        app_id: appId,
        user_id: userId,
        organization_id: organizationId,
        rating,
        review_text: reviewText,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create review:', error);
      return null;
    }

    // Update app average rating
    await this.updateAppRating(appId);

    return data;
  }

  /**
   * Get app reviews
   */
  static async getAppReviews(
    appId: string,
    limit: number = 50
  ): Promise<AppReview[]> {
    const { data, error } = await supabase
      .from('app_reviews')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch reviews:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Update app average rating
   */
  private static async updateAppRating(appId: string): Promise<void> {
    const { data: reviews } = await supabase
      .from('app_reviews')
      .select('rating')
      .eq('app_id', appId);

    if (!reviews || reviews.length === 0) return;

    const avgRating =
      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;

    await supabase
      .from('marketplace_apps')
      .update({ 
        rating_average: avgRating,
        rating_count: reviews.length,
      })
      .eq('id', appId);
  }

  /**
   * Get app categories
   */
  static getCategories(): string[] {
    return [
      'productivity',
      'communication',
      'crm',
      'ecommerce',
      'marketing',
      'analytics',
      'automation',
      'security',
      'integrations',
      'utilities',
    ];
  }

  /**
   * Publish app (for developers)
   */
  static async publishApp(
    publisherName: string,
    publisherEmail: string,
    app: {
      name: string;
      slug: string;
      description: string;
      long_description?: string;
      category: string;
      logo_url: string;
      pricing_model: string;
      price_monthly?: number;
      price_yearly?: number;
      publisher_website?: string;
    }
  ): Promise<MarketplaceApp | null> {
    const { data, error } = await supabase
      .from('marketplace_apps')
      .insert({
        publisher_name: publisherName,
        publisher_email: publisherEmail,
        status: 'pending', // Requires approval
        ...app,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to publish app:', error);
      return null;
    }

    return data;
  }
}
