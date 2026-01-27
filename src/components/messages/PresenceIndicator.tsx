import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresenceUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface PresenceIndicatorProps {
  viewers: PresenceUser[];
  currentUserId?: string;
  className?: string;
}

export function PresenceIndicator({
  viewers,
  currentUserId,
  className,
}: PresenceIndicatorProps) {
  const otherViewers = viewers.filter((v) => v.id !== currentUserId);

  if (otherViewers.length === 0) return null;

  const displayedViewers = otherViewers.slice(0, 3);
  const remainingCount = otherViewers.length - 3;

  return (
    <TooltipProvider>
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-muted-foreground',
          className
        )}
      >
        <Eye className="h-4 w-4" />
        <div className="flex -space-x-2">
          {displayedViewers.map((viewer) => (
            <Tooltip key={viewer.id}>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={viewer.avatarUrl} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {viewer.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{viewer.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {remainingCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                    +{remainingCount}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{remainingCount} more viewing</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span>
          {otherViewers.length === 1
            ? '1 person viewing'
            : `${otherViewers.length} people viewing`}
        </span>
      </div>
    </TooltipProvider>
  );
}
