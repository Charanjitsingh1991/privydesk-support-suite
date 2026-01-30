import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IntegrationService } from '../integrationService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('IntegrationService', () => {
  const mockOrgId = 'org-123';
  const mockIntegrationId = 'int-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getIntegrations', () => {
    it('should fetch all integrations for an organization', async () => {
      const integrations = await IntegrationService.getIntegrations(mockOrgId);
      expect(integrations).toBeDefined();
      expect(Array.isArray(integrations)).toBe(true);
    });

    it('should filter by integration type', async () => {
      const integrations = await IntegrationService.getIntegrations(mockOrgId, 'zapier');
      expect(integrations).toBeDefined();
    });
  });

  describe('createIntegration', () => {
    it('should create a new integration', async () => {
      const integrationData = {
        integration_name: 'Zapier',
        integration_type: 'zapier',
        config: {},
      };
      const integration = await IntegrationService.createIntegration(mockOrgId, integrationData);
      expect(integration).toBeDefined();
    });
  });

  describe('startSync', () => {
    it('should start a sync operation', async () => {
      const syncLog = await IntegrationService.startSync(mockIntegrationId, 'manual');
      expect(syncLog).toBeDefined();
    });
  });

  describe('createZapierTrigger', () => {
    it('should create a Zapier trigger', async () => {
      const triggerData = {
        trigger_event: 'ticket.created',
        webhook_url: 'https://hooks.zapier.com/test',
      };
      const trigger = await IntegrationService.createZapierTrigger(mockOrgId, triggerData);
      expect(trigger).toBeDefined();
    });
  });

  describe('testConnection', () => {
    it('should test integration connection', async () => {
      const result = await IntegrationService.testConnection(mockIntegrationId);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
    });
  });
});
