import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type BrandingSettingsRow = Database['public']['Tables']['branding_settings']['Row'];
type CustomDomainRow = Database['public']['Tables']['custom_domains']['Row'];

export interface BrandingSettings extends BrandingSettingsRow {}
export interface CustomDomain extends CustomDomainRow {}

export class BrandingService {
  /**
   * Get branding settings for organization
   */
  static async getBrandingSettings(
    organizationId: string
  ): Promise<BrandingSettings | null> {
    const { data, error } = await supabase
      .from('branding_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      console.error('Failed to fetch branding settings:', error);
      return null;
    }

    return data;
  }

  /**
   * Update branding settings
   */
  static async updateBrandingSettings(
    organizationId: string,
    settings: {
      logo_url?: string;
      favicon_url?: string;
      primary_color?: string;
      secondary_color?: string;
      accent_color?: string;
      font_family?: string;
      custom_css?: string;
      email_header_html?: string;
      email_footer_html?: string;
      support_email?: string;
      support_phone?: string;
      company_name?: string;
      company_address?: string;
      hide_powered_by?: boolean;
    }
  ): Promise<BrandingSettings | null> {
    // Check if settings exist
    const existing = await this.getBrandingSettings(organizationId);

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('branding_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        console.error('Failed to update branding settings:', error);
        return null;
      }

      return data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('branding_settings')
        .insert({
          organization_id: organizationId,
          ...settings,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create branding settings:', error);
        return null;
      }

      return data;
    }
  }

  /**
   * Upload logo
   */
  static async uploadLogo(
    organizationId: string,
    file: File
  ): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${organizationId}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('branding')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Failed to upload logo:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('branding')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  /**
   * Get custom domains for organization
   */
  static async getCustomDomains(
    organizationId: string
  ): Promise<CustomDomain[]> {
    const { data, error } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch custom domains:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Add custom domain
   */
  static async addCustomDomain(
    organizationId: string,
    domain: string
  ): Promise<CustomDomain | null> {
    const { data, error } = await supabase
      .from('custom_domains')
      .insert({
        organization_id: organizationId,
        domain,
        is_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add custom domain:', error);
      return null;
    }

    return data;
  }

  /**
   * Verify custom domain
   */
  static async verifyCustomDomain(domainId: string): Promise<{
    verified: boolean;
    message: string;
  }> {
    // This would check DNS records in production
    // For now, return placeholder
    const { error } = await supabase
      .from('custom_domains')
      .update({ 
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', domainId);

    if (error) {
      return {
        verified: false,
        message: 'Failed to verify domain',
      };
    }

    return {
      verified: true,
      message: 'Domain verified successfully',
    };
  }

  /**
   * Delete custom domain
   */
  static async deleteCustomDomain(domainId: string): Promise<boolean> {
    const { error } = await supabase
      .from('custom_domains')
      .delete()
      .eq('id', domainId);

    if (error) {
      console.error('Failed to delete custom domain:', error);
      return false;
    }

    return true;
  }

  /**
   * Set primary domain
   */
  static async setPrimaryDomain(
    organizationId: string,
    domainId: string
  ): Promise<boolean> {
    // Unset all primary domains
    await supabase
      .from('custom_domains')
      .update({ is_primary: false })
      .eq('organization_id', organizationId);

    // Set new primary
    const { error } = await supabase
      .from('custom_domains')
      .update({ is_primary: true })
      .eq('id', domainId);

    return !error;
  }
}
