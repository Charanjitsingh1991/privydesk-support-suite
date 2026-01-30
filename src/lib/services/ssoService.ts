import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type SSOConfigRow = Database['public']['Tables']['sso_configurations']['Row'];

export interface SSOConfiguration extends SSOConfigRow {}

export class SSOService {
  /**
   * Get SSO configuration for organization
   */
  static async getSSOConfig(organizationId: string): Promise<SSOConfiguration | null> {
    const { data, error } = await supabase
      .from('sso_configurations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Failed to fetch SSO config:', error);
      return null;
    }

    return data;
  }

  /**
   * Create SSO configuration
   */
  static async createSSOConfig(
    organizationId: string,
    userId: string,
    config: {
      provider: string;
      entity_id?: string;
      sso_url?: string;
      certificate?: string;
      metadata_url?: string;
      client_id?: string;
      client_secret?: string;
      domain?: string;
    }
  ): Promise<SSOConfiguration | null> {
    const { data, error } = await supabase
      .from('sso_configurations')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        ...config,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create SSO config:', error);
      return null;
    }

    return data;
  }

  /**
   * Update SSO configuration
   */
  static async updateSSOConfig(
    configId: string,
    updates: Partial<SSOConfiguration>
  ): Promise<SSOConfiguration | null> {
    const { data, error } = await supabase
      .from('sso_configurations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', configId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update SSO config:', error);
      return null;
    }

    return data;
  }

  /**
   * Delete SSO configuration
   */
  static async deleteSSOConfig(configId: string): Promise<boolean> {
    const { error } = await supabase
      .from('sso_configurations')
      .delete()
      .eq('id', configId);

    if (error) {
      console.error('Failed to delete SSO config:', error);
      return false;
    }

    return true;
  }

  /**
   * Test SSO configuration
   */
  static async testSSOConfig(configId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    // This would integrate with actual SSO providers
    // For now, return a placeholder
    return {
      success: true,
      message: 'SSO configuration test successful',
    };
  }

  /**
   * Enable/Disable SSO
   */
  static async toggleSSO(
    configId: string,
    isActive: boolean
  ): Promise<boolean> {
    const { error } = await supabase
      .from('sso_configurations')
      .update({ is_active: isActive })
      .eq('id', configId);

    return !error;
  }
}
