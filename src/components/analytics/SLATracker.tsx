import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SLAConfiguration } from '@/types/analytics';

interface SLATrackerProps {
  configurations: SLAConfiguration[];
  loading?: boolean;
  onConfigure?: () => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function SLATracker({ configurations, loading, onConfigure }: SLATrackerProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">SLA Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock compliance data - in production this would come from actual calculations
  const complianceData: Record<string, number> = {
    urgent: 92,
    high: 88,
    medium: 95,
    low: 98
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">SLA Configuration</CardTitle>
        {onConfigure && (
          <Button variant="ghost" size="sm" onClick={onConfigure}>
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {configurations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No SLA configurations set</p>
            <Button variant="link" onClick={onConfigure} className="mt-2">
              Configure SLAs
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {configurations.map(config => {
              const compliance = complianceData[config.priority] || 0;
              return (
                <div key={config.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={PRIORITY_COLORS[config.priority]}>
                        {config.priority.charAt(0).toUpperCase() + config.priority.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Response: {formatDuration(config.first_response_minutes)} • 
                        Resolution: {formatDuration(config.resolution_minutes)}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      compliance >= 95 ? 'text-green-600' :
                      compliance >= 80 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {compliance}% compliant
                    </span>
                  </div>
                  <Progress 
                    value={compliance} 
                    className={`h-2 ${
                      compliance >= 95 ? '[&>div]:bg-green-500' :
                      compliance >= 80 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
