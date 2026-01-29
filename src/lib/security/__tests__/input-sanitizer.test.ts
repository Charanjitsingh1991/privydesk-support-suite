import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeForDisplay,
  escapeHtml,
  sanitizeFilename,
  sanitizeUrl,
  validateInput,
  validationSchemas,
  ticketFormSchema,
  RateLimiter,
} from '../input-sanitizer';

describe('sanitizeHtml', () => {
  it('should allow safe HTML tags', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  it('should remove script tags', () => {
    const input = '<script>alert("xss")</script><p>Safe content</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>Safe content</p>');
  });

  it('should remove onclick handlers', () => {
    const input = '<button onclick="alert(1)">Click me</button>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
  });

  it('should remove iframe tags', () => {
    const input = '<iframe src="http://evil.com"></iframe>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<iframe');
  });

  it('should allow anchor tags with href', () => {
    const input = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('href="https://example.com"');
  });

  it('should remove onerror handlers', () => {
    const input = '<img src="x" onerror="alert(1)">';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onerror');
  });
});

describe('sanitizeText', () => {
  it('should remove all HTML tags', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    const result = sanitizeText(input);
    expect(result).toBe('Hello World');
  });

  it('should handle script tags', () => {
    const input = '<script>alert("xss")</script>Safe text';
    const result = sanitizeText(input);
    expect(result).toBe('Safe text');
  });
});

describe('sanitizeForDisplay', () => {
  it('should allow basic formatting tags', () => {
    const input = '<p>Hello <em>World</em></p>';
    const result = sanitizeForDisplay(input);
    expect(result).toContain('<p>');
    expect(result).toContain('<em>');
  });
});

describe('escapeHtml', () => {
  it('should escape ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape angle brackets', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('should escape quotes', () => {
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('should escape single quotes', () => {
    expect(escapeHtml("it's")).toBe("it&#x27;s");
  });

  it('should escape forward slashes', () => {
    expect(escapeHtml('</script>')).toBe('&lt;&#x2F;script&gt;');
  });
});

describe('sanitizeFilename', () => {
  it('should remove path separators', () => {
    expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd');
  });

  it('should remove null bytes', () => {
    expect(sanitizeFilename('file\0.txt')).toBe('file.txt');
  });

  it('should remove leading dots', () => {
    expect(sanitizeFilename('...hidden')).toBe('hidden');
  });

  it('should truncate long filenames', () => {
    const longName = 'a'.repeat(300) + '.txt';
    const result = sanitizeFilename(longName);
    expect(result.length).toBeLessThanOrEqual(255);
    expect(result.endsWith('.txt')).toBe(true);
  });

  it('should return "unnamed" for empty result', () => {
    expect(sanitizeFilename('../..')).toBe('unnamed');
  });
});

describe('sanitizeUrl', () => {
  it('should block javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('should block data: protocol', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('should block vbscript: protocol', () => {
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
  });

  it('should allow https: protocol', () => {
    const url = 'https://example.com';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('should allow http: protocol', () => {
    const url = 'http://example.com';
    expect(sanitizeUrl(url)).toBe(url);
  });

  it('should handle mixed case protocols', () => {
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
  });
});

describe('validationSchemas', () => {
  describe('email', () => {
    it('should validate correct email', () => {
      const result = validationSchemas.email.safeParse('test@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validationSchemas.email.safeParse('not-an-email');
      expect(result.success).toBe(false);
    });

    it('should lowercase email', () => {
      const result = validationSchemas.email.safeParse('TEST@EXAMPLE.COM');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should trim whitespace', () => {
      const result = validationSchemas.email.safeParse('  test@example.com  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });
  });

  describe('password', () => {
    it('should require minimum 12 characters', () => {
      const result = validationSchemas.password.safeParse('short');
      expect(result.success).toBe(false);
    });

    it('should accept valid password', () => {
      const result = validationSchemas.password.safeParse('ValidPassword123!');
      expect(result.success).toBe(true);
    });

    it('should reject too long password', () => {
      const result = validationSchemas.password.safeParse('a'.repeat(130));
      expect(result.success).toBe(false);
    });
  });

  describe('name', () => {
    it('should accept valid names', () => {
      expect(validationSchemas.name.safeParse('John Doe').success).toBe(true);
      expect(validationSchemas.name.safeParse("O'Brien").success).toBe(true);
      expect(validationSchemas.name.safeParse('Mary-Jane').success).toBe(true);
    });

    it('should reject names with numbers', () => {
      expect(validationSchemas.name.safeParse('John123').success).toBe(false);
    });

    it('should reject empty names', () => {
      expect(validationSchemas.name.safeParse('').success).toBe(false);
    });
  });

  describe('username', () => {
    it('should accept valid usernames', () => {
      expect(validationSchemas.username.safeParse('john_doe').success).toBe(true);
      expect(validationSchemas.username.safeParse('user-123').success).toBe(true);
    });

    it('should reject usernames with special characters', () => {
      expect(validationSchemas.username.safeParse('user@name').success).toBe(false);
    });

    it('should reject short usernames', () => {
      expect(validationSchemas.username.safeParse('ab').success).toBe(false);
    });
  });

  describe('domain', () => {
    it('should accept valid domains', () => {
      expect(validationSchemas.domain.safeParse('example.com').success).toBe(true);
      expect(validationSchemas.domain.safeParse('test.org').success).toBe(true);
    });

    it('should reject invalid domains', () => {
      expect(validationSchemas.domain.safeParse('not a domain').success).toBe(false);
      expect(validationSchemas.domain.safeParse('example').success).toBe(false);
    });
  });

  describe('hexColor', () => {
    it('should accept valid hex colors', () => {
      expect(validationSchemas.hexColor.safeParse('#ff0000').success).toBe(true);
      expect(validationSchemas.hexColor.safeParse('#FFF').success).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(validationSchemas.hexColor.safeParse('red').success).toBe(false);
      expect(validationSchemas.hexColor.safeParse('#gggggg').success).toBe(false);
    });
  });
});

describe('validateInput', () => {
  it('should return success for valid input', () => {
    const result = validateInput(ticketFormSchema, {
      subject: 'Test ticket subject',
      description: 'This is a detailed description of the issue that needs to be resolved.',
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should return errors for invalid input', () => {
    const result = validateInput(ticketFormSchema, {
      subject: 'AB', // Too short
      description: 'Short', // Too short
    });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.subject).toBeDefined();
    expect(result.errors?.description).toBeDefined();
  });
});

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter(3, 60000); // 3 attempts per minute
  });

  it('should not rate limit on first attempt', () => {
    expect(rateLimiter.isRateLimited('user1')).toBe(false);
  });

  it('should count remaining attempts', () => {
    expect(rateLimiter.getRemainingAttempts('user1')).toBe(3);
    rateLimiter.isRateLimited('user1');
    expect(rateLimiter.getRemainingAttempts('user1')).toBe(2);
  });

  it('should rate limit after max attempts', () => {
    rateLimiter.isRateLimited('user1');
    rateLimiter.isRateLimited('user1');
    rateLimiter.isRateLimited('user1');
    expect(rateLimiter.isRateLimited('user1')).toBe(true);
    expect(rateLimiter.getRemainingAttempts('user1')).toBe(0);
  });

  it('should track different keys separately', () => {
    rateLimiter.isRateLimited('user1');
    rateLimiter.isRateLimited('user1');
    rateLimiter.isRateLimited('user1');
    expect(rateLimiter.isRateLimited('user1')).toBe(true);
    expect(rateLimiter.isRateLimited('user2')).toBe(false);
  });

  it('should reset a specific key', () => {
    rateLimiter.isRateLimited('user1');
    rateLimiter.isRateLimited('user1');
    rateLimiter.reset('user1');
    expect(rateLimiter.getRemainingAttempts('user1')).toBe(3);
  });
});
