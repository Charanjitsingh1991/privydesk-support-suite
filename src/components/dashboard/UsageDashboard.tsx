import { useUsageTracking } from '@/hooks/useUsageTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UsageDashboardProps {
  organizationId: string;
  plan: 'starter' | 'professional' | 'enterprise';
}

const PLAN_LIMITS = {
  starter: {
    tickets_per_month: 1000,
    emails_per_month: 2000,
    api_calls_per_month: 5000,
    storage_bytes: 5 * 1024 * 1024 * 1024, // 5 GB
    chat_messages_per_month: 1000,
  },
  professional: {
    tickets_per_month: 10000,
    emails_per_month: 10000,
    api_calls_per_month: 50000,
    storage_bytes: 50 * 1024 * 1024 * 1024, // 50 GB
    chat_messages_per_month: 10000,
  },
  enterprise: {
    tickets_per_month: 999999,
    emails_per_month: 999999,
    api_calls_per_month: 999999,
    storage_bytes: 999 * 1024 * 1024 * 1024, // Unlimited
    chat_messages_per_month: 999999,
  },
};

export function UsageDashboard({ organizationId, plan }: UsageDashboardProps) {
  const limits = PLAN_LIMITS[plan];
  const { usage, loading, warnings, withinLimits, getUsagePercentage } = useUsageTracking(
    organizationId,
    limits
  );

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-500';
    if (percentage >= 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-lime-500';
  };

  if (loading) {
    return (
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardContent className="py-12">
          <div className="text-center text-gray-400">Loading usage data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const metrics = [
    {
      label: 'Tickets Created',
      value: usage.tickets_created,
      limit: limits.tickets_per_month,
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Emails Sent',
      value: usage.emails_sent,
      limit: limits.emails_per_month,
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'API Calls',
      value: usage.api_calls,
      limit: limits.api_calls_per_month,
      format: (v: number) => v.toLocaleString(),
    },
    {
      label: 'Storage Used',
      value: usage.storage_used_bytes,
      limit: limits.storage_bytes,
      format: formatBytes,
    },
    {
      label: 'Chat Messages',
      value: usage.chat_messages,
      limit: limits.chat_messages_per_month,
      format: (v: number) => v.toLocaleString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            {warnings.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Badge */}
      <Card className="bg-[#1a1a1a] border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Usage Overview</CardTitle>
              <CardDescription className="text-gray-400">
                Current month usage for {plan} plan
              </CardDescription>
            </div>
            <Badge
              className={
                withinLimits
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }
            >
              {withinLimits ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Within Limits
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Limit Exceeded
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {metrics.map((metric) => {
              const percentage = getUsagePercentage(
                metric.label.toLowerCase().replace(/ /g, '_') as any
              );
              return (
                <div key={metric.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      {metric.label}
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(percentage)}`}>
                      {metric.format(metric.value)} / {metric.format(metric.limit)}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={percentage}
                      className="h-2 bg-white/5"
                      indicatorClassName={getProgressColor(percentage)}
                    />
                    <div className="absolute right-0 -top-6 text-xs text-gray-400">
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upgrade CTA */}
          {!withinLimits && plan !== 'enterprise' && (
            <div className="mt-6 p-4 rounded-lg bg-lime-500/10 border border-lime-500/20">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-lime-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">
                    Upgrade Your Plan
                  </h4>
                  <p className="text-sm text-gray-400 mb-3">
                    You've reached your usage limits. Upgrade to continue using PrivyDesk.
                  </p>
                  <button className="px-4 py-2 bg-lime-500 text-black rounded-lg text-sm font-medium hover:bg-lime-400 transition-colors">
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
