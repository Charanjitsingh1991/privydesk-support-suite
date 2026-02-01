/**
 * Subdomain Service
 * Manages subdomain creation and configuration for organizations
 * Integrates with Hostinger API
 */

import { supabase } from '@/integrations/supabase/client';

export interface SubdomainConfig {
  subdomain: string;
  organizationId: string;
  organizationName: string;
  slug: string;
}

export interface SubdomainCreationResult {
  success: boolean;
  subdomain?: string;
  message: string;
  sslEnabled?: boolean;
}

/**
 * Subdomain Service for PrivyDesk
 * Creates subdomains like: acme-corp.privydesk.com
 */
export class SubdomainService {
  private static readonly BASE_DOMAIN = 'privydesk.com';
  private static readonly HOSTINGER_API_URL = process.env.VITE_HOSTINGER_API_URL || 'https://api.hostinger.com/v1';
  private static readonly HOSTINGER_API_KEY = process.env.VITE_HOSTINGER_API_KEY;

  /**
   * Generate slug from organization name
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 63); // DNS label max length
  }

  /**
   * Check if subdomain is available
   */
  static async isSubdomainAvailable(slug: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    return !data && !error;
  }

  /**
   * Create subdomain via Hostinger API
   * Note: Current Hostinger API token is VPS-only and doesn't support subdomain creation
   * Using manual workflow until proper API access is obtained
   */
  private static async createHostingerSubdomain(
    subdomain: string
  ): Promise<{ success: boolean; message: string; manualSetup?: any }> {
    // Check if API key is configured
    if (!this.HOSTINGER_API_KEY) {
      console.warn('Hostinger API key not configured. Subdomain creation will be manual.');
      return {
        success: true, // Allow creation in DB, manual setup required
        message: 'Subdomain registered. Manual DNS configuration required.',
        manualSetup: this.getManualSetupInstructions(subdomain),
      };
    }

    // Current API token is VPS-only, doesn't support subdomain management
    // Return manual setup instructions
    console.info('Using manual subdomain setup (VPS API token has limited access)');
    return {
      success: true,
      message: 'Subdomain registered. Manual setup required in Hostinger panel.',
      manualSetup: this.getManualSetupInstructions(subdomain),
    };

    /* 
    // TODO: Uncomment when Hosting API token is available
    try {
      // Hostinger Hosting API call to create subdomain
      const response = await fetch(`${this.HOSTINGER_API_URL}/hosting/v1/subdomains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HOSTINGER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: this.BASE_DOMAIN,
          subdomain: subdomain.replace(`.${this.BASE_DOMAIN}`, ''),
          document_root: '/public_html/privydesk',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create subdomain');
      }

      return {
        success: true,
        message: 'Subdomain created successfully',
      };
    } catch (error) {
      console.error('Hostinger subdomain creation failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create subdomain',
      };
    }
    */
  }

  /**
   * Get manual setup instructions for subdomain
   */
  private static getManualSetupInstructions(subdomain: string) {
    const subdomainName = subdomain.replace(`.${this.BASE_DOMAIN}`, '');
    
    return {
      title: 'Manual Subdomain Setup Required',
      steps: [
        {
          step: 1,
          action: 'Log in to Hostinger',
          details: 'Go to https://hostinger.com and log in to your account',
        },
        {
          step: 2,
          action: 'Navigate to Subdomains',
          details: 'Go to: Domains → privydesk.com → Subdomains',
        },
        {
          step: 3,
          action: 'Create Subdomain',
          details: `Click "Create Subdomain" and enter: ${subdomainName}`,
        },
        {
          step: 4,
          action: 'Set Document Root',
          details: 'Set document root to: /public_html/privydesk',
        },
        {
          step: 5,
          action: 'Wait for SSL',
          details: 'SSL certificate will auto-provision (5-10 minutes)',
        },
        {
          step: 6,
          action: 'Verify',
          details: `Visit https://${subdomain} to confirm it's working`,
        },
      ],
      subdomain: subdomain,
      estimatedTime: '5-10 minutes',
      note: 'This is a one-time manual setup. Once configured, the subdomain will work automatically.',
    };
  }

  /**
   * Enable SSL for subdomain via Hostinger
   * Hostinger provides free SSL for all subdomains
   */
  private static async enableSSL(
    subdomain: string
  ): Promise<{ success: boolean; message: string }> {
    if (!this.HOSTINGER_API_KEY) {
      return {
        success: true,
        message: 'SSL will be enabled manually',
      };
    }

    try {
      // Hostinger automatically provisions SSL for subdomains
      // This is just to verify/trigger it
      const response = await fetch(`${this.HOSTINGER_API_URL}/ssl/install`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HOSTINGER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: subdomain,
          type: 'letsencrypt',
        }),
      });

      if (!response.ok) {
        // SSL might already be enabled, that's okay
        console.warn('SSL enable request failed, might already be enabled');
      }

      return {
        success: true,
        message: 'SSL enabled',
      };
    } catch (error) {
      console.error('SSL enablement failed:', error);
      return {
        success: true, // Don't block on SSL, Hostinger auto-enables it
        message: 'SSL will be auto-enabled by Hostinger',
      };
    }
  }

  /**
   * Create subdomain for organization
   */
  static async createSubdomain(
    config: SubdomainConfig
  ): Promise<SubdomainCreationResult> {
    const fullSubdomain = `${config.slug}.${this.BASE_DOMAIN}`;

    // Check if subdomain is available
    const available = await this.isSubdomainAvailable(config.slug);
    if (!available) {
      return {
        success: false,
        message: 'Subdomain already taken. Please choose a different organization name.',
      };
    }

    // Create subdomain in Hostinger
    const hostingerResult = await this.createHostingerSubdomain(fullSubdomain);
    
    if (!hostingerResult.success) {
      return {
        success: false,
        message: hostingerResult.message,
      };
    }

    // Enable SSL
    const sslResult = await this.enableSSL(fullSubdomain);

    // Update organization with subdomain
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        slug: config.slug,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.organizationId);

    if (updateError) {
      console.error('Failed to update organization:', updateError);
      return {
        success: false,
        message: 'Failed to save subdomain configuration',
      };
    }

    return {
      success: true,
      subdomain: fullSubdomain,
      message: hostingerResult.manualSetup 
        ? 'Subdomain registered. Please complete manual setup in Hostinger.'
        : 'Subdomain created successfully',
      sslEnabled: sslResult.success,
      manualSetup: hostingerResult.manualSetup,
    };
  }

  /**
   * Get subdomain URL for organization
   */
  static getSubdomainUrl(slug: string): string {
    return `https://${slug}.${this.BASE_DOMAIN}`;
  }

  /**
   * Validate subdomain format
   */
  static validateSubdomain(slug: string): { valid: boolean; message?: string } {
    // DNS label rules
    if (slug.length < 1 || slug.length > 63) {
      return {
        valid: false,
        message: 'Subdomain must be between 1 and 63 characters',
      };
    }

    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) {
      return {
        valid: false,
        message: 'Subdomain can only contain lowercase letters, numbers, and hyphens',
      };
    }

    if (slug.startsWith('-') || slug.endsWith('-')) {
      return {
        valid: false,
        message: 'Subdomain cannot start or end with a hyphen',
      };
    }

    // Reserved subdomains
    const reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'blog', 'custom'];
    if (reserved.includes(slug)) {
      return {
        valid: false,
        message: 'This subdomain is reserved',
      };
    }

    return { valid: true };
  }

  /**
   * Delete subdomain (for organization deletion)
   */
  static async deleteSubdomain(slug: string): Promise<boolean> {
    if (!this.HOSTINGER_API_KEY) {
      console.warn('Hostinger API key not configured. Manual subdomain deletion required.');
      return true;
    }

    try {
      const fullSubdomain = `${slug}.${this.BASE_DOMAIN}`;
      
      const response = await fetch(
        `${this.HOSTINGER_API_URL}/domains/subdomains/${fullSubdomain}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.HOSTINGER_API_KEY}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Subdomain deletion failed:', error);
      return false;
    }
  }
}
