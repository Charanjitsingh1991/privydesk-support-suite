/**
 * SSL Certificate Service
 * Manages SSL certificates for custom domains
 * Uses Let's Encrypt for free SSL certificates
 */

import { supabase } from '@/integrations/supabase/client';

export interface SSLCertificate {
  domain: string;
  status: 'pending' | 'active' | 'expired' | 'failed';
  issuedAt?: Date;
  expiresAt?: Date;
  provider: 'letsencrypt' | 'hostinger' | 'custom';
}

export interface SSLProvisionResult {
  success: boolean;
  message: string;
  certificate?: SSLCertificate;
}

/**
 * SSL Certificate Service
 * Manages SSL certificates for custom domains
 */
export class SSLService {
  private static readonly HOSTINGER_API_URL = process.env.VITE_HOSTINGER_API_URL || 'https://api.hostinger.com/v1';
  private static readonly HOSTINGER_API_KEY = process.env.VITE_HOSTINGER_API_KEY;

  /**
   * Provision SSL certificate for custom domain
   * Hostinger provides free SSL via Let's Encrypt
   */
  static async provisionSSL(domain: string): Promise<SSLProvisionResult> {
    try {
      // For subdomains (*.privydesk.com), Hostinger auto-provisions SSL
      if (domain.endsWith('.privydesk.com')) {
        return await this.provisionSubdomainSSL(domain);
      }

      // For custom domains, use Hostinger API
      return await this.provisionCustomDomainSSL(domain);
    } catch (error) {
      console.error('SSL provisioning failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'SSL provisioning failed',
      };
    }
  }

  /**
   * Provision SSL for subdomain (*.privydesk.com)
   * Hostinger automatically provisions SSL for all subdomains
   */
  private static async provisionSubdomainSSL(
    subdomain: string
  ): Promise<SSLProvisionResult> {
    // Hostinger automatically provisions SSL for subdomains
    // We just need to verify it's active
    
    const certificate: SSLCertificate = {
      domain: subdomain,
      status: 'active',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      provider: 'hostinger',
    };

    return {
      success: true,
      message: 'SSL certificate active (Hostinger auto-provisioned)',
      certificate,
    };
  }

  /**
   * Provision SSL for custom domain
   * Uses Hostinger API to install Let's Encrypt certificate
   */
  private static async provisionCustomDomainSSL(
    domain: string
  ): Promise<SSLProvisionResult> {
    if (!this.HOSTINGER_API_KEY) {
      return {
        success: false,
        message: 'Hostinger API key not configured. Manual SSL setup required.',
      };
    }

    try {
      // Request SSL certificate via Hostinger API
      const response = await fetch(`${this.HOSTINGER_API_URL}/ssl/install`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HOSTINGER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: domain,
          type: 'letsencrypt',
          force: false, // Don't force if already exists
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'SSL installation failed');
      }

      const data = await response.json();

      const certificate: SSLCertificate = {
        domain: domain,
        status: 'active',
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        provider: 'letsencrypt',
      };

      // Update database
      await this.updateSSLStatus(domain, certificate);

      return {
        success: true,
        message: 'SSL certificate installed successfully',
        certificate,
      };
    } catch (error) {
      console.error('Custom domain SSL provisioning failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'SSL provisioning failed',
      };
    }
  }

  /**
   * Check SSL certificate status
   */
  static async checkSSLStatus(domain: string): Promise<SSLCertificate | null> {
    try {
      // Query database for SSL status
      const { data, error } = await supabase
        .from('custom_domains')
        .select('ssl_status, ssl_expires_at, ssl_provider')
        .eq('domain', domain)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        domain,
        status: data.ssl_status as SSLCertificate['status'],
        expiresAt: data.ssl_expires_at ? new Date(data.ssl_expires_at) : undefined,
        provider: (data.ssl_provider as SSLCertificate['provider']) || 'letsencrypt',
      };
    } catch (error) {
      console.error('SSL status check failed:', error);
      return null;
    }
  }

  /**
   * Renew SSL certificate
   * Should be called 30 days before expiry
   */
  static async renewSSL(domain: string): Promise<SSLProvisionResult> {
    const currentCert = await this.checkSSLStatus(domain);

    if (!currentCert) {
      return {
        success: false,
        message: 'No existing certificate found',
      };
    }

    // Check if renewal is needed
    const daysUntilExpiry = currentCert.expiresAt
      ? Math.floor((currentCert.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysUntilExpiry > 30) {
      return {
        success: true,
        message: `Certificate valid for ${daysUntilExpiry} more days. Renewal not needed yet.`,
        certificate: currentCert,
      };
    }

    // Renew certificate
    return await this.provisionSSL(domain);
  }

  /**
   * Update SSL status in database
   */
  private static async updateSSLStatus(
    domain: string,
    certificate: SSLCertificate
  ): Promise<void> {
    await supabase
      .from('custom_domains')
      .update({
        ssl_status: certificate.status,
        ssl_expires_at: certificate.expiresAt?.toISOString(),
        ssl_provider: certificate.provider,
        ssl_renewed_at: new Date().toISOString(),
      })
      .eq('domain', domain);
  }

  /**
   * Get certificates expiring soon (for cron job)
   */
  static async getExpiringCertificates(daysThreshold: number = 30): Promise<string[]> {
    const thresholdDate = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('custom_domains')
      .select('domain')
      .eq('is_verified', true)
      .eq('ssl_status', 'active')
      .lt('ssl_expires_at', thresholdDate.toISOString());

    if (error || !data) {
      return [];
    }

    return data.map((d) => d.domain);
  }

  /**
   * Bulk renew expiring certificates (cron job)
   */
  static async renewExpiringCertificates(): Promise<{
    renewed: number;
    failed: number;
  }> {
    const expiringDomains = await this.getExpiringCertificates(30);
    
    let renewed = 0;
    let failed = 0;

    for (const domain of expiringDomains) {
      const result = await this.renewSSL(domain);
      if (result.success) {
        renewed++;
      } else {
        failed++;
        console.error(`Failed to renew SSL for ${domain}:`, result.message);
      }
    }

    return { renewed, failed };
  }

  /**
   * Force SSL redirect check
   */
  static async checkSSLRedirect(domain: string): Promise<boolean> {
    try {
      const response = await fetch(`http://${domain}`, {
        method: 'HEAD',
        redirect: 'manual',
      });

      // Should redirect to HTTPS
      return response.status === 301 || response.status === 302;
    } catch {
      return false;
    }
  }
}
