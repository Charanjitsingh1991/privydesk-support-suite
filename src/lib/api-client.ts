import { supabase } from '@/integrations/supabase/client';
import { handleError } from './error-handler';

export interface ApiOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  showErrorToast?: boolean;
}

const DEFAULT_OPTIONS: ApiOptions = {
  retries: 3,
  retryDelay: 1000,
  timeout: 30000,
  showErrorToast: true,
};

export class ApiClient {
  private static cache = new Map<string, { data: unknown; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static async query<T>(
    queryFn: () => Promise<{ data: T | null; error: unknown }>,
    options: ApiOptions & { cacheKey?: string } = {}
  ): Promise<T | null> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Check cache first
    if (opts.cacheKey) {
      const cached = this.getFromCache<T>(opts.cacheKey);
      if (cached) return cached;
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= (opts.retries || 0); attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

        const { data, error } = await queryFn();

        clearTimeout(timeoutId);

        if (error) {
          throw error;
        }

        // Cache successful result
        if (opts.cacheKey && data) {
          this.setCache(opts.cacheKey, data);
        }

        return data;
      } catch (error) {
        lastError = error;

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break;
        }

        // Wait before retrying (with exponential backoff)
        if (attempt < (opts.retries || 0)) {
          await this.delay((opts.retryDelay || 1000) * Math.pow(2, attempt));
        }
      }
    }

    // Handle final error
    handleError(lastError, 'API Query', opts.showErrorToast);
    return null;
  }

  static async mutate<T>(
    mutateFn: () => Promise<{ data: T | null; error: unknown }>,
    options: ApiOptions & { invalidateCache?: string[] } = {}
  ): Promise<T | null> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const { data, error } = await mutateFn();

      if (error) {
        throw error;
      }

      // Invalidate related cache entries
      if (opts.invalidateCache) {
        opts.invalidateCache.forEach(key => this.invalidateCache(key));
      }

      return data;
    } catch (error) {
      handleError(error, 'API Mutation', opts.showErrorToast);
      return null;
    }
  }

  static async edgeFunction<T>(
    functionName: string,
    payload?: Record<string, unknown>,
    options: ApiOptions = {}
  ): Promise<T | null> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const { data, error } = await supabase.functions.invoke<T>(functionName, {
        body: payload,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      handleError(error, `Edge Function: ${functionName}`, opts.showErrorToast);
      return null;
    }
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private static setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private static invalidateCache(pattern: string): void {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      Array.from(this.cache.keys()).forEach(key => {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      });
    } else {
      this.cache.delete(pattern);
    }
  }

  static clearCache(): void {
    this.cache.clear();
  }

  private static isNonRetryableError(error: unknown): boolean {
    if (typeof error === 'object' && error !== null) {
      const code = 'code' in error ? error.code : null;
      const status = 'status' in error ? error.status : null;

      // Don't retry auth errors, validation errors, or not found
      const nonRetryableCodes = ['23505', '42501', 'PGRST116', 'PGRST301'];
      const nonRetryableStatuses = [400, 401, 403, 404, 422];

      return (
        (typeof code === 'string' && nonRetryableCodes.includes(code)) ||
        (typeof status === 'number' && nonRetryableStatuses.includes(status))
      );
    }

    return false;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Convenience exports
export const apiQuery = ApiClient.query.bind(ApiClient);
export const apiMutate = ApiClient.mutate.bind(ApiClient);
export const apiEdgeFunction = ApiClient.edgeFunction.bind(ApiClient);
export const clearApiCache = ApiClient.clearCache.bind(ApiClient);
