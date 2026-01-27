import { describe, it, expect } from 'vitest';
import {
  extractUrls,
  getDomainFromUrl,
  isExternalLink,
  isSuspiciousUrl,
  scanLink,
  scanLinksInContent,
  hasUnsafeLinks,
} from '../link-validator';

describe('extractUrls', () => {
  it('should extract HTTP URLs', () => {
    const text = 'Visit http://example.com for more info';
    const urls = extractUrls(text);
    expect(urls).toContain('http://example.com');
  });

  it('should extract HTTPS URLs', () => {
    const text = 'Secure link: https://example.com/path';
    const urls = extractUrls(text);
    expect(urls).toContain('https://example.com/path');
  });

  it('should extract multiple URLs', () => {
    const text = 'Links: https://one.com and https://two.com';
    const urls = extractUrls(text);
    expect(urls).toHaveLength(2);
  });

  it('should return empty array for no URLs', () => {
    const text = 'No links here';
    const urls = extractUrls(text);
    expect(urls).toHaveLength(0);
  });

  it('should extract URLs with query parameters', () => {
    const text = 'Check https://example.com/search?q=test&page=1';
    const urls = extractUrls(text);
    expect(urls[0]).toContain('?q=test&page=1');
  });
});

describe('getDomainFromUrl', () => {
  it('should extract domain from URL', () => {
    expect(getDomainFromUrl('https://example.com/path')).toBe('example.com');
  });

  it('should extract subdomain', () => {
    expect(getDomainFromUrl('https://sub.example.com')).toBe('sub.example.com');
  });

  it('should lowercase the domain', () => {
    expect(getDomainFromUrl('https://EXAMPLE.COM')).toBe('example.com');
  });

  it('should return empty string for invalid URL', () => {
    expect(getDomainFromUrl('not-a-url')).toBe('');
  });

  it('should handle URLs with ports', () => {
    expect(getDomainFromUrl('https://example.com:8080/path')).toBe('example.com');
  });
});

describe('isExternalLink', () => {
  it('should identify external links', () => {
    expect(isExternalLink('https://unknown-site.net')).toBe(true);
  });

  it('should identify known safe domains as internal', () => {
    expect(isExternalLink('https://google.com')).toBe(false);
    expect(isExternalLink('https://github.com/repo')).toBe(false);
    expect(isExternalLink('https://docs.google.com')).toBe(false);
  });

  it('should respect custom trusted domains', () => {
    const trustedDomains = ['mycompany.com'];
    expect(isExternalLink('https://mycompany.com', trustedDomains)).toBe(false);
    expect(isExternalLink('https://app.mycompany.com', trustedDomains)).toBe(false);
  });

  it('should treat invalid URLs as external', () => {
    expect(isExternalLink('not-a-url')).toBe(true);
  });
});

describe('isSuspiciousUrl', () => {
  describe('URL shorteners', () => {
    it('should flag bit.ly URLs', () => {
      const result = isSuspiciousUrl('https://bit.ly/abc123');
      expect(result.suspicious).toBe(true);
    });

    it('should flag tinyurl.com URLs', () => {
      const result = isSuspiciousUrl('https://tinyurl.com/xyz');
      expect(result.suspicious).toBe(true);
    });
  });

  describe('typosquatting', () => {
    it('should flag paypal typosquatting', () => {
      const result = isSuspiciousUrl('https://paypa1.com/login');
      expect(result.suspicious).toBe(true);
    });

    it('should flag google typosquatting', () => {
      const result = isSuspiciousUrl('https://g00gle.com');
      expect(result.suspicious).toBe(true);
    });
  });

  describe('suspicious TLDs', () => {
    it('should flag .tk domains', () => {
      const result = isSuspiciousUrl('https://freesite.tk');
      expect(result.suspicious).toBe(true);
    });

    it('should flag .xyz domains', () => {
      const result = isSuspiciousUrl('https://suspicious.xyz');
      expect(result.suspicious).toBe(true);
    });
  });

  describe('IP address URLs', () => {
    it('should flag direct IP URLs', () => {
      const result = isSuspiciousUrl('http://192.168.1.1/login');
      expect(result.suspicious).toBe(true);
    });
  });

  describe('excessive subdomains', () => {
    it('should flag URLs with many subdomains', () => {
      const result = isSuspiciousUrl('https://login.secure.account.bank.phishing.com');
      expect(result.suspicious).toBe(true);
      expect(result.reason).toContain('subdomain');
    });
  });

  describe('safe URLs', () => {
    it('should not flag normal URLs', () => {
      const result = isSuspiciousUrl('https://example.com/page');
      expect(result.suspicious).toBe(false);
    });

    it('should not flag subdomain URLs under limit', () => {
      const result = isSuspiciousUrl('https://app.api.example.com');
      expect(result.suspicious).toBe(false);
    });
  });
});

describe('scanLink', () => {
  it('should mark safe URLs as safe', () => {
    const result = scanLink('https://example.com');
    expect(result.safe).toBe(true);
    expect(result.external).toBe(true);
    expect(result.url).toBe('https://example.com');
  });

  it('should mark suspicious URLs as unsafe', () => {
    const result = scanLink('https://bit.ly/malicious');
    expect(result.safe).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('should identify trusted organization domains', () => {
    const result = scanLink('https://mycompany.com/docs', ['mycompany.com']);
    expect(result.trustedDomain).toBe(true);
    expect(result.safe).toBe(true);
  });

  it('should identify subdomains of trusted domains', () => {
    const result = scanLink('https://app.mycompany.com', ['mycompany.com']);
    expect(result.trustedDomain).toBe(true);
  });
});

describe('scanLinksInContent', () => {
  it('should scan all links in content', () => {
    const content = 'Check https://example.com and https://bit.ly/sus for details';
    const results = scanLinksInContent(content);
    expect(results).toHaveLength(2);
    expect(results[0].safe).toBe(true);
    expect(results[1].safe).toBe(false);
  });

  it('should return empty array for content without links', () => {
    const results = scanLinksInContent('No links here');
    expect(results).toHaveLength(0);
  });
});

describe('hasUnsafeLinks', () => {
  it('should return true when unsafe links exist', () => {
    const content = 'Click here: https://bit.ly/malware';
    expect(hasUnsafeLinks(content)).toBe(true);
  });

  it('should return false when all links are safe', () => {
    const content = 'Visit https://google.com';
    expect(hasUnsafeLinks(content)).toBe(false);
  });

  it('should return false for content without links', () => {
    expect(hasUnsafeLinks('No links')).toBe(false);
  });
});
