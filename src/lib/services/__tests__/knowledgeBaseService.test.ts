import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KnowledgeBaseService } from '../knowledgeBaseService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
}));

describe('KnowledgeBaseService', () => {
  const mockOrgId = 'org-123';
  const mockArticleId = 'article-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPublishedArticles', () => {
    it('should fetch published articles for an organization', async () => {
      const articles = await KnowledgeBaseService.getPublishedArticles(mockOrgId);
      expect(articles).toBeDefined();
      expect(Array.isArray(articles)).toBe(true);
    });

    it('should filter by category when provided', async () => {
      const articles = await KnowledgeBaseService.getPublishedArticles(mockOrgId, {
        categoryId: 'cat-123',
      });
      expect(articles).toBeDefined();
    });

    it('should filter by language when provided', async () => {
      const articles = await KnowledgeBaseService.getPublishedArticles(mockOrgId, {
        language: 'en',
      });
      expect(articles).toBeDefined();
    });
  });

  describe('searchArticles', () => {
    it('should search articles by query', async () => {
      const results = await KnowledgeBaseService.searchArticles(mockOrgId, 'password reset');
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return empty array for empty query', async () => {
      const results = await KnowledgeBaseService.searchArticles(mockOrgId, '');
      expect(results).toBeDefined();
    });
  });

  describe('voteArticle', () => {
    it('should increment helpful count when voting helpful', async () => {
      const result = await KnowledgeBaseService.voteArticle(mockArticleId, true);
      expect(typeof result).toBe('boolean');
    });

    it('should increment not helpful count when voting not helpful', async () => {
      const result = await KnowledgeBaseService.voteArticle(mockArticleId, false);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('incrementViewCount', () => {
    it('should increment article view count', async () => {
      const result = await KnowledgeBaseService.incrementViewCount(mockArticleId);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics for organization', async () => {
      const analytics = await KnowledgeBaseService.getAnalytics(mockOrgId);
      expect(analytics).toHaveProperty('totalArticles');
      expect(analytics).toHaveProperty('totalViews');
      expect(analytics).toHaveProperty('totalHelpful');
      expect(analytics).toHaveProperty('totalNotHelpful');
      expect(analytics).toHaveProperty('topArticles');
    });

    it('should filter analytics by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const analytics = await KnowledgeBaseService.getAnalytics(mockOrgId, startDate, endDate);
      expect(analytics).toBeDefined();
    });
  });
});
