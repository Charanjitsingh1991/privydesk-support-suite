import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Smile, Meh, Frown, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AISentimentBadgeProps {
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'urgent' | string;
  score?: number;
  emotions?: string[];
  showDetails?: boolean;
  escalationRecommended?: boolean;
  escalationReason?: string;
  className?: string;
}

const SENTIMENT_CONFIG = {
  positive: {
    icon: Smile,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    label: 'Positive',
  },
  neutral: {
    icon: Meh,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    label: 'Neutral',
  },
  negative: {
    icon: Frown,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    label: 'Negative',
  },
  frustrated: {
    icon: AlertCircle,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    label: 'Frustrated',
  },
  urgent: {
    icon: Zap,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    label: 'Urgent',
  },
};

export function AISentimentBadge({
  sentiment,
  score,
  emotions = [],
  showDetails = true,
  escalationRecommended = false,
  escalationReason,
  className,
}: AISentimentBadgeProps) {
  const config = SENTIMENT_CONFIG[sentiment as keyof typeof SENTIMENT_CONFIG] || SENTIMENT_CONFIG.neutral;
  const Icon = config.icon;

  const badge = (
    <Badge
      variant="secondary"
      className={cn(config.color, 'flex items-center gap-1', className)}
    >
      <Icon className="h-3 w-3" />
      <span className="capitalize">{config.label}</span>
      {escalationRecommended && (
        <AlertCircle className="h-3 w-3 text-red-600 ml-1" />
      )}
    </Badge>
  );

  if (!showDetails || (emotions.length === 0 && score === undefined && !escalationRecommended)) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            {escalationRecommended && (
              <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-800 dark:text-red-300">
                <p className="font-medium">⚠️ Escalation Recommended</p>
                {escalationReason && <p className="mt-1">{escalationReason}</p>}
              </div>
            )}
            {score !== undefined && (
              <p className="text-xs">
                Sentiment score: <span className="font-medium">{score.toFixed(2)}</span>
              </p>
            )}
            {emotions.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Detected emotions:</p>
                <div className="flex flex-wrap gap-1">
                  {emotions.map((emotion) => (
                    <Badge key={emotion} variant="outline" className="text-xs py-0">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
