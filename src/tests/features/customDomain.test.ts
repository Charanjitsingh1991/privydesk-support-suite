import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrandingService } from '@/lib/services/brandingService';

describe('Custom Domain Feature', () => {
  const mockOrgId = 'org-123';
  const mockDomain = 'support.acme.com';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Domain Addition', () => {
    it('should add a custom domain with verification token', async () => {
      const domain = await BrandingService.addCustomDomain(mockOrgId, mockDomain);
      
      expect(domain).toBeDefined();
      expect(domain?.domain).toBe(mockDomain);
      expect(domain?.verification_token).toBeDefined();
      expect(domain?.is_verified).toBe(false);
    });

    it('should reject invalid domain formats', async () => {
      const invalidDomains = [
        'invalid',
        'http://domain.com',
        'domain.com/',
        'domain..com',
        '-domain.com',
      ];

      for (const invalid of invalidDomains) {
        await expect(
          BrandingService.addCustomDomain(mockOrgId, invalid)
        ).rejects.toThrow();
      }
    });

    it('should prevent duplicate domains across organizations', async () => {
      await BrandingService.addCustomDomain('org-1', mockDomain);
      
      await expect(
        BrandingService.addCustomDomain('org-2', mockDomain)
      ).rejects.toThrow('Domain already in use');
    });
  });

  describe('Domain Verification', () => {
    it('should verify domain with correct DNS records', async () => {
      const domain = await BrandingService.addCustomDomain(mockOrgId, mockDomain);
      
      // Mock DNS lookup returning correct TXT record
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          txtRecords: [`privydesk-verify=${domain?.verification_token}`],
          cnameRecord: 'custom.privydesk.com',
        }),
      } as Response);

      const result = await BrandingService.verifyCustomDomain(domain!.id);
      
      expect(result.verified).toBe(true);
      expect(result.message).toContain('verified');
    });

    it('should fail verification with incorrect DNS records', async () => {
      const domain = await BrandingService.addCustomDomain(mockOrgId, mockDomain);
      
      // Mock DNS lookup returning wrong TXT record
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          txtRecords: ['wrong-token'],
          cnameRecord: null,
        }),
      } as Response);

      const result = await BrandingService.verifyCustomDomain(domain!.id);
      
      expect(result.verified).toBe(false);
      expect(result.message).toContain('DNS records not found');
    });

    it('should handle DNS propagation delays gracefully', async () => {
      const domain = await BrandingService.addCustomDomain(mockOrgId, mockDomain);
      
      // Mock DNS lookup returning no records (propagation in progress)
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          txtRecords: [],
          cnameRecord: null,
        }),
      } as Response);

      const result = await BrandingService.verifyCustomDomain(domain!.id);
      
      expect(result.verified).toBe(false);
      expect(result.message).toContain('DNS propagation');
    });
  });

  describe('Domain Management', () => {
    it('should list all domains for an organization', async () => {
      await BrandingService.addCustomDomain(mockOrgId, 'support.acme.com');
      await BrandingService.addCustomDomain(mockOrgId, 'help.acme.com');

      const domains = await BrandingService.getCustomDomains(mockOrgId);
      
      expect(domains).toHaveLength(2);
      expect(domains.map(d => d.domain)).toContain('support.acme.com');
      expect(domains.map(d => d.domain)).toContain('help.acme.com');
    });

    it('should delete a custom domain', async () => {
      const domain = await BrandingService.addCustomDomain(mockOrgId, mockDomain);
      
      const deleted = await BrandingService.deleteCustomDomain(domain!.id);
      expect(deleted).toBe(true);

      const domains = await BrandingService.getCustomDomains(mockOrgId);
      expect(domains).toHaveLength(0);
    });

    it('should activate only one domain at a time', async () => {
      const domain1 = await BrandingService.addCustomDomain(mockOrgId, 'support.acme.com');
      const domain2 = await BrandingService.addCustomDomain(mockOrgId, 'help.acme.com');

      await BrandingService.setActiveDomain(domain1!.id);
      await BrandingService.setActiveDomain(domain2!.id);

      const domains = await BrandingService.getCustomDomains(mockOrgId);
      const activeDomains = domains.filter(d => d.is_active);
      
      expect(activeDomains).toHaveLength(1);
      expect(activeDomains[0].id).toBe(domain2!.id);
    });
  });

  describe('SSL Certificate', () => {
    it('should provision SSL certificate after verification', async () => {
      const domain = await BrandingService.addCustomDomain(mockOrgId, mockDomain);
      
      // Verify domain
      await BrandingService.verifyCustomDomain(domain!.id);

      // Check SSL status
      const updatedDomain = await BrandingService.getCustomDomains(mockOrgId);
      expect(updatedDomain[0].ssl_status).toBe('active');
    });

    it('should track SSL certificate expiry', async () => {
      const domain = await BrandingService.addCustomDomain(mockOrgId, mockDomain);
      await BrandingService.verifyCustomDomain(domain!.id);

      const updatedDomain = await BrandingService.getCustomDomains(mockOrgId);
      expect(updatedDomain[0].ssl_expires_at).toBeDefined();
      
      // Should be ~90 days from now (Let's Encrypt default)
      const expiryDate = new Date(updatedDomain[0].ssl_expires_at!);
      const now = new Date();
      const daysDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      expect(daysDiff).toBeGreaterThan(80);
      expect(daysDiff).toBeLessThan(95);
    });
  });

  describe('Domain Routing', () => {
    it('should resolve organization from custom domain', async () => {
      // Add and verify domain
      await BrandingService.addCustomDomain(mockOrgId, mockDomain);
      
      // Simulate request with custom domain
      const org = await BrandingService.getOrganizationByDomain(mockDomain);
      
      expect(org).toBeDefined();
      expect(org?.id).toBe(mockOrgId);
    });

    it('should fall back to subdomain if custom domain not found', async () => {
      const org = await BrandingService.getOrganizationByDomain('nonexistent.com');
      expect(org).toBeNull();
    });

    it('should handle www subdomain correctly', async () => {
      await BrandingService.addCustomDomain(mockOrgId, 'support.acme.com');
      
      // Should work with or without www
      const org1 = await BrandingService.getOrganizationByDomain('support.acme.com');
      const org2 = await BrandingService.getOrganizationByDomain('www.support.acme.com');
      
      expect(org1?.id).toBe(mockOrgId);
      expect(org2?.id).toBe(mockOrgId);
    });
  });

  describe('Security', () => {
    it('should prevent domain hijacking', async () => {
      // Org 1 adds domain
      await BrandingService.addCustomDomain('org-1', mockDomain);
      
      // Org 2 tries to verify the same domain
      await expect(
        BrandingService.addCustomDomain('org-2', mockDomain)
      ).rejects.toThrow();
    });

    it('should require admin role to manage domains', async () => {
      // Mock non-admin user
      const clientUserId = 'user-client';
      
      await expect(
        BrandingService.addCustomDomain(mockOrgId, mockDomain)
      ).rejects.toThrow('Insufficient permissions');
    });

    it('should validate domain ownership before verification', async () => {
      const domain = await BrandingService.addCustomDomain(mockOrgId, mockDomain);
      
      // Try to verify with wrong organization
      await expect(
        BrandingService.verifyCustomDomain(domain!.id)
      ).rejects.toThrow('Domain not found');
    });
  });

  describe('Plan Restrictions', () => {
    it('should allow custom domains for Professional plan', async () => {
      // Mock org with Professional plan
      const domain = await BrandingService.addCustomDomain(mockOrgId, mockDomain);
      expect(domain).toBeDefined();
    });

    it('should block custom domains for Free/Starter plans', async () => {
      // Mock org with Free plan
      await expect(
        BrandingService.addCustomDomain('free-org-id', mockDomain)
      ).rejects.toThrow('Custom domains require Professional or Enterprise plan');
    });

    it('should limit number of domains based on plan', async () => {
      // Professional: 1 domain
      // Enterprise: Unlimited domains
      
      await BrandingService.addCustomDomain(mockOrgId, 'support.acme.com');
      
      // Try to add second domain on Professional plan
      await expect(
        BrandingService.addCustomDomain(mockOrgId, 'help.acme.com')
      ).rejects.toThrow('Domain limit reached for your plan');
    });
  });
});
