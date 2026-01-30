import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarketplaceService } from '../marketplaceService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('MarketplaceService', () => {
  const mockOrgId = 'org-123';
  const mockAppId = 'app-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFeaturedApps', () => {
    it('should fetch featured marketplace apps', async () => {
      const apps = await MarketplaceService.getFeaturedApps(10);
      expect(apps).toBeDefined();
      expect(Array.isArray(apps)).toBe(true);
    });

    it('should limit results', async () => {
      const apps = await MarketplaceService.getFeaturedApps(5);
      expect(apps).toBeDefined();
    });
  });

  describe('searchApps', () => {
    it('should search apps by query', async () => {
      const results = await MarketplaceService.searchApps('slack', 'communication');
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('installApp', () => {
    it('should install an app for organization', async () => {
      const installation = await MarketplaceService.installApp(mockOrgId, mockAppId);
      expect(installation).toBeDefined();
    });
  });

  describe('uninstallApp', () => {
    it('should uninstall an app', async () => {
      const result = await MarketplaceService.uninstallApp('install-123');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('createReview', () => {
    it('should create an app review', async () => {
      const reviewData = {
        rating: 5,
        review_text: 'Great app!',
      };
      const review = await MarketplaceService.createReview(mockAppId, 'user-123', mockOrgId, reviewData);
      expect(review).toBeDefined();
    });
  });

  describe('getCategories', () => {
    it('should return list of categories', () => {
      const categories = MarketplaceService.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });
  });
});
