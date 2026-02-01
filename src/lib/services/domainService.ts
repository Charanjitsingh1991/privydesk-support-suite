/**
 * Domain Service - Unified service for domain management
 * Combines DNS verification, subdomain creation, and SSL provisioning
 */

import { supabase } from '@/integrations/supabase/client';
import { DNSVerificationService } from './dnsVerificationService';
import { SubdomainService } from './subdomainService';
import { SSLService } from './sslService';

export interface DomainSetupResult {
  success: boolean;
  message: string;
  subdomain?: string;
  sslEnabled?: boolean;
  errors?: string[];
}

export interface CustomDomainVerificationResult {
  success: boolean;
  message: string;
  verified?: boolean;
  sslProvisioned?: boolean;
  errors?: string[];
}

/**
 * Unified Domain Service
 * Handles complete domain lifecycle
 */
export class DomainService {
  /**
   * Setup subdomain for new organization
   * Called during onboarding
   */
  static async setupOrganizationSubdomain(
    organizationId: string,
    organizationName: string
  ): Promise<DomainSetupResult> {
    try {
      // Generate slug
      const slug = SubdomainService.generateSlug(organizationName);

      // Validate slug
      const validation = SubdomainService.validateSubdomain(slug);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message || 'Invalid subdomain',
        };
      }

      // Check availability
      const available = await SubdomainService.isSubdomainAvailable(slug);
      if (!available) {
        return {
          success: false,
          message: 'Subdomain already taken. Please choose a different organization name.',
        };
      }

      // Create subdomain
      const result = await SubdomainService.createSubdomain({
        subdomain: slug,
        organizationId,
        organizationName,
        slug,
      });

      if (!result.success) {
        return {
          success: false,
          message: result.message,
        };
      }

      // SSL is auto-enabled by Hostinger for subdomains
      return {
        success: true,
        message: 'Organization subdomain created successfully',
        subdomain: result.subdomain,
        sslEnabled: true,
      };
    } catch (error) {
      console.error('Subdomain setup failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Subdomain setup failed',
      };
    }
  }

  /**
   * Add custom domain to organization
   * Called from settings when user adds custom domain
   */
  static async addCustomDomain(
    organizationId: string,
    domain: string
  ): Promise<{ success: boolean; message: string; domainId?: string; verificationToken?: string }> {
    try {
      // Validate domain format
      if (!/^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/.test(domain)) {
        return {
          success: false,
          message: 'Invalid domain format',
        };
      }

      // Check if domain already exists
      const { data: existing } = await supabase
        .from('custom_domains')
        .select('id')
        .eq('domain', domain)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          message: 'Domain already registered',
        };
      }

      // Generate verification token
      const verificationToken = Math.random().toString(36).substring(2, 15) +
                               Math.random().toString(36).substring(2, 15);

      // Insert domain
      const { data, error } = await supabase
        .from('custom_domains')
        .insert({
          organization_id: organizationId,
          domain,
          verification_token: verificationToken,
          verification_method: 'txt',
          is_verified: false,
          is_active: false,
          ssl_status: 'pending',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Domain added. Please configure DNS records to verify.',
        domainId: data.id,
        verificationToken,
      };
    } catch (error) {
      console.error('Add custom domain failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add domain',
      };
    }
  }

  /**
   * Verify custom domain
   * Checks DNS records and provisions SSL if verified
   */
  static async verifyCustomDomain(
    domainId: string
  ): Promise<CustomDomainVerificationResult> {
    try {
      // Get domain details
      const { data: domainData, error: fetchError } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('id', domainId)
        .single();

      if (fetchError || !domainData) {
        return {
          success: false,
          message: 'Domain not found',
        };
      }

      // Verify DNS records
      const verificationResult = await DNSVerificationService.verifyDomain(
        domainData.domain,
        domainData.verification_token
      );

      if (!verificationResult.verified) {
        return {
          success: false,
          message: verificationResult.message,
          verified: false,
        };
      }

      // Update domain as verified
      await supabase
        .from('custom_domains')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('id', domainId);

      // Provision SSL certificate
      const sslResult = await SSLService.provisionSSL(domainData.domain);

      if (!sslResult.success) {
        return {
          success: true, // Domain verified but SSL failed
          message: 'Domain verified but SSL provisioning failed. Will retry automatically.',
          verified: true,
          sslProvisioned: false,
          errors: [sslResult.message],
        };
      }

      return {
        success: true,
        message: 'Domain verified and SSL certificate provisioned successfully!',
        verified: true,
        sslProvisioned: true,
      };
    } catch (error) {
      console.error('Domain verification failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Activate custom domain
   * Makes the domain the primary access point
   */
  static async activateCustomDomain(domainId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get domain details
      const { data: domainData, error: fetchError } = await supabase
        .from('custom_domains')
        .select('*, organizations(*)')
        .eq('id', domainId)
        .single();

      if (fetchError || !domainData) {
        return {
          success: false,
          message: 'Domain not found',
        };
      }

      if (!domainData.is_verified) {
        return {
          success: false,
          message: 'Domain must be verified before activation',
        };
      }

      // Deactivate all other domains for this organization
      await supabase
        .from('custom_domains')
        .update({ is_active: false })
        .eq('organization_id', domainData.organization_id);

      // Activate this domain
      await supabase
        .from('custom_domains')
        .update({ is_active: true })
        .eq('id', domainId);

      return {
        success: true,
        message: 'Domain activated successfully',
      };
    } catch (error) {
      console.error('Domain activation failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Activation failed',
      };
    }
  }

  /**
   * Get organization by domain (for routing)
   */
  static async getOrganizationByDomain(host: string): Promise<any | null> {
    try {
      // Check if it's a custom domain
      if (!host.endsWith('.privydesk.com')) {
        const { data } = await supabase
          .from('custom_domains')
          .select('organization_id, organizations(*)')
          .eq('domain', host)
          .eq('is_active', true)
          .eq('is_verified', true)
          .maybeSingle();

        return data?.organizations || null;
      }

      // It's a subdomain
      const slug = host.split('.')[0];
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      return data;
    } catch (error) {
      console.error('Organization lookup failed:', error);
      return null;
    }
  }

  /**
   * Delete custom domain
   */
  static async deleteCustomDomain(domainId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', domainId);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Domain deleted successfully',
      };
    } catch (error) {
      console.error('Domain deletion failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Deletion failed',
      };
    }
  }

  /**
   * Get DNS records for domain setup
   */
  static getDNSInstructions(domain: string, verificationToken: string) {
    return DNSVerificationService.getRecommendedDNSRecords(domain, verificationToken);
  }
}
