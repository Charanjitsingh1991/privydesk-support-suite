import { useState, useEffect } from 'react';
import { UsageTrackingService, UsageData, UsageLimits } from '@/lib/services/usageTrackingService';
import { useToast } from '@/hooks/use-toast';

export function useUsageTracking(organizationId: string, limits?: UsageLimits) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [withinLimits, setWithinLimits] = useState(true);
  const { toast } = useToast();

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const data = await UsageTrackingService.getCurrentMonthUsage(organizationId);
      setUsage(data);

      // Check limits if provided
      if (data && limits) {
        const result = await UsageTrackingService.checkUsageLimits(organizationId, limits);
        setWithinLimits(result.withinLimits);
        setWarnings(result.warnings);

        // Show warnings
        if (result.warnings.length > 0 && !result.withinLimits) {
          toast({
            title: 'Usage Limit Reached',
            description: result.warnings.join(', '),
            variant: 'destructive',
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async (metric: 'tickets_created' | 'emails_sent' | 'api_calls' | 'storage_used_bytes' | 'chat_messages', amount: number = 1) => {
    await UsageTrackingService.incrementUsage(organizationId, metric, amount);
    // Refresh usage data
    await fetchUsage();
  };

  const getUsagePercentage = (metric: keyof UsageData): number => {
    if (!usage || !limits) return 0;
    
    const limitMap: Record<keyof UsageData, keyof UsageLimits> = {
      date: 'tickets_per_month', // Not used
      tickets_created: 'tickets_per_month',
      emails_sent: 'emails_per_month',
      api_calls: 'api_calls_per_month',
      storage_used_bytes: 'storage_bytes',
      chat_messages: 'chat_messages_per_month',
    };

    const limitKey = limitMap[metric];
    if (!limitKey || metric === 'date') return 0;

    return UsageTrackingService.getUsagePercentage(usage[metric], limits[limitKey]);
  };

  useEffect(() => {
    if (organizationId) {
      fetchUsage();
      
      // Refresh every 5 minutes
      const interval = setInterval(fetchUsage, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [organizationId]);

  return {
    usage,
    loading,
    warnings,
    withinLimits,
    fetchUsage,
    incrementUsage,
    getUsagePercentage,
  };
}
