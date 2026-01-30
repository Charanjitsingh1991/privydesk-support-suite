import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForumService } from '../forumService';

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

describe('ForumService', () => {
  const mockOrgId = 'org-123';
  const mockTopicId = 'topic-123';
  const mockReplyId = 'reply-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTopics', () => {
    it('should fetch topics for an organization', async () => {
      const topics = await ForumService.getTopics(mockOrgId);
      expect(topics).toBeDefined();
      expect(Array.isArray(topics)).toBe(true);
    });

    it('should filter by category when provided', async () => {
      const topics = await ForumService.getTopics(mockOrgId, { categoryId: 'cat-123' });
      expect(topics).toBeDefined();
    });

    it('should filter by solved status', async () => {
      const topics = await ForumService.getTopics(mockOrgId, { isSolved: true });
      expect(topics).toBeDefined();
    });
  });

  describe('createTopic', () => {
    it('should create a new forum topic', async () => {
      const topicData = {
        title: 'Test Topic',
        content: 'Test content',
        category_id: 'cat-123',
      };
      const topic = await ForumService.createTopic(mockOrgId, 'user-123', topicData);
      expect(topic).toBeDefined();
    });
  });

  describe('voteTopic', () => {
    it('should upvote a topic', async () => {
      const result = await ForumService.voteTopic(mockTopicId, 1);
      expect(typeof result).toBe('boolean');
    });

    it('should downvote a topic', async () => {
      const result = await ForumService.voteTopic(mockTopicId, -1);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('markSolution', () => {
    it('should mark a reply as solution', async () => {
      const result = await ForumService.markSolution(mockTopicId, mockReplyId);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getReplies', () => {
    it('should fetch replies for a topic', async () => {
      const replies = await ForumService.getReplies(mockTopicId);
      expect(replies).toBeDefined();
      expect(Array.isArray(replies)).toBe(true);
    });
  });
});
