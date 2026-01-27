import DOMPurify, { Config } from 'dompurify';
import { z } from 'zod';

// Configure DOMPurify for strict sanitization
const purifyConfig: Config = {
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
    'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'title'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target', 'rel'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur'],
};

// Sanitize HTML content to prevent XSS
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, purifyConfig) as string;
}

// Sanitize plain text (remove all HTML)
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) as string;
}

// Sanitize for display (with some basic formatting allowed)
export function sanitizeForDisplay(html: string): string {
  return DOMPurify.sanitize(html, {
    ...purifyConfig,
    // Force all links to open in new tab with noopener noreferrer
    ADD_ATTR: ['target'],
  }) as string;
}

// Escape HTML entities for safe text display
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

// Sanitize filename to prevent path traversal and injection
export function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  let safe = filename.replace(/[/\\:\0]/g, '');
  // Remove leading dots to prevent hidden files
  safe = safe.replace(/^\.+/, '');
  // Limit length
  if (safe.length > 255) {
    const ext = safe.slice(safe.lastIndexOf('.'));
    safe = safe.slice(0, 255 - ext.length) + ext;
  }
  return safe || 'unnamed';
}

// Sanitize URL to prevent javascript: and data: protocols
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return '';
  }
  return url;
}

// Common validation schemas
export const validationSchemas = {
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .transform(s => s.toLowerCase()),
    
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be less than 128 characters'),
    
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters'),
    
  username: z.string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_\-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    
  ticketSubject: z.string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be less than 200 characters'),
    
  ticketDescription: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description must be less than 10000 characters'),
    
  message: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(10000, 'Message must be less than 10000 characters'),
    
  domain: z.string()
    .trim()
    .min(3, 'Domain must be at least 3 characters')
    .max(255, 'Domain must be less than 255 characters')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/, 'Invalid domain format'),
    
  url: z.string()
    .trim()
    .url('Invalid URL')
    .max(2048, 'URL must be less than 2048 characters'),
    
  phoneNumber: z.string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional(),
    
  hexColor: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
    
  uuid: z.string()
    .uuid('Invalid ID format'),
};

// Create a ticket form schema
export const ticketFormSchema = z.object({
  subject: validationSchemas.ticketSubject,
  description: validationSchemas.ticketDescription,
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  category: z.string().max(50).optional(),
});

// Create a message form schema
export const messageFormSchema = z.object({
  content: validationSchemas.message,
  isInternal: z.boolean().optional(),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: validationSchemas.name,
  email: validationSchemas.email,
  message: validationSchemas.message,
  subject: validationSchemas.ticketSubject.optional(),
});

// User profile update schema
export const profileUpdateSchema = z.object({
  fullName: validationSchemas.name,
  email: validationSchemas.email.optional(),
  avatarUrl: validationSchemas.url.optional().or(z.literal('')),
});

// Validate and sanitize input using schema
export function validateInput<T>(schema: z.ZodType<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string[]> = {};
  result.error.issues.forEach(issue => {
    const path = issue.path.join('.') || 'form';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  });
  
  return { success: false, errors };
}

// Rate limiting helper for client-side
export class RateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }> = new Map();
  
  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}
  
  isRateLimited(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + this.windowMs });
      return false;
    }
    
    if (record.count >= this.maxAttempts) {
      return true;
    }
    
    record.count++;
    return false;
  }
  
  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record || Date.now() > record.resetAt) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Create common rate limiters
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 min
export const otpRateLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 per hour
export const ticketRateLimiter = new RateLimiter(20, 60 * 60 * 1000); // 20 per hour
export const messageRateLimiter = new RateLimiter(100, 60 * 60 * 1000); // 100 per hour
