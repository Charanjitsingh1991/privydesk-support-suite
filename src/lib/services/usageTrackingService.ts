import { supabase } from '@/lib/supabase';

export type UsageMetric = 'tickets_created' | 'emails_sent' | 'api_calls' | 'storage_used_bytes' | 'chat_messages';

export interface UsageData {
  date: string;
  tickets_created: number;
  emails_sent: number;
  api_calls: number;
  storage_used_bytes: number;
  chat_messages: number;
}

export interface UsageLimits {
  tickets_per_month: number;
  emails_per_month: number;
  api_calls_per_month: number;
  storage_bytes: number;
  chat_messages_per_month: number;
}

export class UsageTrackingService {
  /**
   * Increment a usage metric
   */
  static async incrementUsage(
    organizationId: string,
    metric: UsageMetric,
    amount: number = 1
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_usage', {
        p_organization_id: organizationId,
        p_metric: metric,
        p_amount: amount,
      });

      if (error) {
        console.error('Failed to increment usage:', error);
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }

  /**
   * Get current month usage for an organization
   */
  static async getCurrentMonthUsage(organizationId: string): Promise<UsageData | null> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('usage_daily')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0]);

    if (error) {
      console.error('Failed to get usage:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        date: new Date().toISOString().split('T')[0],
        tickets_created: 0,
        emails_sent: 0,
        api_calls: 0,
        storage_used_bytes: 0,
        chat_messages: 0,
      };
    }

    // Sum up all daily usage
    const total = data.reduce(
      (acc, day) => ({
        date: new Date().toISOString().split('T')[0],
        tickets_created: acc.tickets_created + day.tickets_created,
        emails_sent: acc.emails_sent + day.emails_sent,
        api_calls: acc.api_calls + day.api_calls,
        storage_used_bytes: Math.max(acc.storage_used_bytes, day.storage_used_bytes), // Use max for storage
        chat_messages: acc.chat_messages + day.chat_messages,
      }),
      {
        date: '',
        tickets_created: 0,
        emails_sent: 0,
        api_calls: 0,
        storage_used_bytes: 0,
        chat_messages: 0,
      }
    );

    return total;
  }

  /**
   * Get usage history for a date range
   */
  static async getUsageHistory(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UsageData[]> {
    const { data, error } = await supabase
      .from('usage_daily')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Check if usage is within limits
   */
  static async checkUsageLimits(
    organizationId: string,
    limits: UsageLimits
  ): Promise<{
    withinLimits: boolean;
    usage: UsageData;
    warnings: string[];
  }> {
    const usage = await this.getCurrentMonthUsage(organizationId);

    if (!usage) {
      return {
        withinLimits: true,
        usage: {
          date: new Date().toISOString().split('T')[0],
          tickets_created: 0,
          emails_sent: 0,
          api_calls: 0,
          storage_used_bytes: 0,
          chat_messages: 0,
        },
        warnings: [],
      };
    }

    const warnings: string[] = [];
    let withinLimits = true;

    // Check each metric
    if (usage.tickets_created >= limits.tickets_per_month) {
      warnings.push(`Ticket limit reached (${usage.tickets_created}/${limits.tickets_per_month})`);
      withinLimits = false;
    } else if (usage.tickets_created >= limits.tickets_per_month * 0.8) {
      warnings.push(`Approaching ticket limit (${usage.tickets_created}/${limits.tickets_per_month})`);
    }

    if (usage.emails_sent >= limits.emails_per_month) {
      warnings.push(`Email limit reached (${usage.emails_sent}/${limits.emails_per_month})`);
      withinLimits = false;
    } else if (usage.emails_sent >= limits.emails_per_month * 0.8) {
      warnings.push(`Approaching email limit (${usage.emails_sent}/${limits.emails_per_month})`);
    }

    if (usage.api_calls >= limits.api_calls_per_month) {
      warnings.push(`API call limit reached (${usage.api_calls}/${limits.api_calls_per_month})`);
      withinLimits = false;
    } else if (usage.api_calls >= limits.api_calls_per_month * 0.8) {
      warnings.push(`Approaching API call limit (${usage.api_calls}/${limits.api_calls_per_month})`);
    }

    if (usage.storage_used_bytes >= limits.storage_bytes) {
      warnings.push(`Storage limit reached (${this.formatBytes(usage.storage_used_bytes)}/${this.formatBytes(limits.storage_bytes)})`);
      withinLimits = false;
    } else if (usage.storage_used_bytes >= limits.storage_bytes * 0.8) {
      warnings.push(`Approaching storage limit (${this.formatBytes(usage.storage_used_bytes)}/${this.formatBytes(limits.storage_bytes)})`);
    }

    return {
      withinLimits,
      usage,
      warnings,
    };
  }

  /**
   * Format bytes to human-readable string
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get usage percentage for a metric
   */
  static getUsagePercentage(current: number, limit: number): number {
    if (limit === 0) return 0;
    return Math.min(Math.round((current / limit) * 100), 100);
  }
}
