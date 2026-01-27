import type { LinkScanResult } from '@/types/security';

// Known phishing patterns and suspicious domains
const SUSPICIOUS_PATTERNS = [
  /bit\.ly/i,
  /tinyurl\.com/i,
  /goo\.gl/i,
  /t\.co/i,
  /ow\.ly/i,
  /is\.gd/i,
  /buff\.ly/i,
  // Typosquatting patterns
  /paypa[il1]\.com/i,
  /g00gle\.com/i,
  /micros[o0]ft\.com/i,
  /amaz[o0]n\.com/i,
  /faceb[o0]{2}k\.com/i,
  // Suspicious TLDs
  /\.(tk|ml|ga|cf|gq|pw|top|xyz|work|click|link|info|biz)$/i,
  // IP address URLs
  /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i,
  // Encoded characters in domain
  /%[0-9a-f]{2}/i,
];

const KNOWN_SAFE_DOMAINS = [
  'google.com',
  'microsoft.com',
  'github.com',
  'stackoverflow.com',
  'wikipedia.org',
  'linkedin.com',
  'twitter.com',
  'facebook.com',
  'youtube.com',
  'dropbox.com',
  'drive.google.com',
  'docs.google.com',
  'sheets.google.com',
  'onedrive.live.com',
  'sharepoint.com',
  'slack.com',
  'zoom.us',
  'teams.microsoft.com',
];

export function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"']+/gi;
  return text.match(urlRegex) || [];
}

export function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch {
    return '';
  }
}

export function isExternalLink(url: string, trustedDomains: string[] = []): boolean {
  const domain = getDomainFromUrl(url);
  if (!domain) return true;
  
  // Check if it's a trusted domain
  const allTrusted = [...trustedDomains, ...KNOWN_SAFE_DOMAINS];
  return !allTrusted.some(trusted => 
    domain === trusted || domain.endsWith(`.${trusted}`)
  );
}

export function isSuspiciousUrl(url: string): { suspicious: boolean; reason?: string } {
  // Check against suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      return { suspicious: true, reason: 'URL matches suspicious pattern' };
    }
  }

  // Check for lookalike characters
  const domain = getDomainFromUrl(url);
  if (hasLookalikeCharacters(domain)) {
    return { suspicious: true, reason: 'Domain contains lookalike characters' };
  }

  // Check for excessive subdomains (potential phishing)
  const subdomainCount = (domain.match(/\./g) || []).length;
  if (subdomainCount > 3) {
    return { suspicious: true, reason: 'Excessive subdomains detected' };
  }

  // Check for suspicious path patterns
  if (/\/(login|signin|verify|account|password|secure)/i.test(url)) {
    const trustedLoginDomains = ['google.com', 'microsoft.com', 'github.com'];
    if (!trustedLoginDomains.some(d => domain.includes(d))) {
      return { suspicious: true, reason: 'Suspicious login URL from untrusted domain' };
    }
  }

  return { suspicious: false };
}

function hasLookalikeCharacters(domain: string): boolean {
  // Check for Cyrillic or other lookalike characters
  const lookalikePatterns = [
    /[аеіоруАЕІОРУ]/u, // Cyrillic lookalikes
    /[𝐚-𝐳𝑎-𝑧𝒂-𝒛]/u, // Mathematical alphanumerics
    /\u200b|\u200c|\u200d|\ufeff/u, // Zero-width characters
  ];
  
  return lookalikePatterns.some(pattern => pattern.test(domain));
}

export function scanLink(url: string, organizationDomains: string[] = []): LinkScanResult {
  const domain = getDomainFromUrl(url);
  const trustedDomains = [...organizationDomains];
  
  // Check if it's a trusted/internal domain
  const trustedDomain = trustedDomains.some(d => 
    domain === d || domain.endsWith(`.${d}`)
  );

  // Check if it's external
  const external = isExternalLink(url, trustedDomains);

  // Check for suspicious patterns
  const suspiciousCheck = isSuspiciousUrl(url);
  
  if (suspiciousCheck.suspicious) {
    return {
      url,
      safe: false,
      reason: suspiciousCheck.reason,
      external,
      trustedDomain: false,
    };
  }

  return {
    url,
    safe: true,
    external,
    trustedDomain,
  };
}

export function scanLinksInContent(
  content: string, 
  organizationDomains: string[] = []
): LinkScanResult[] {
  const urls = extractUrls(content);
  return urls.map(url => scanLink(url, organizationDomains));
}

export function hasUnsafeLinks(content: string, organizationDomains: string[] = []): boolean {
  const results = scanLinksInContent(content, organizationDomains);
  return results.some(result => !result.safe);
}
