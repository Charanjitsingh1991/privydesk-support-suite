import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { WidgetMessage } from '@/types/widget';

interface WidgetMessageBubbleProps {
  message: WidgetMessage;
  isOwn: boolean;
  primaryColor: string;
  showTimestamp?: boolean;
  agentName?: string;
}

export function WidgetMessageBubble({
  message,
  isOwn,
  primaryColor,
  showTimestamp = true,
  agentName,
}: WidgetMessageBubbleProps) {
  const isSystem = message.sender_type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col mb-3', isOwn ? 'items-end' : 'items-start')}
    >
      {!isOwn && message.sender_type === 'agent' && agentName && (
        <span className="text-xs text-muted-foreground mb-1 ml-1">
          {agentName}
        </span>
      )}
      <div
        className={cn(
          'max-w-[80%] px-3 py-2 rounded-2xl',
          isOwn
            ? 'rounded-br-sm text-white'
            : 'bg-muted rounded-bl-sm'
        )}
        style={isOwn ? { backgroundColor: primaryColor } : undefined}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
      </div>
      {showTimestamp && (
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {isOwn && (
            <span className="text-muted-foreground">
              {message.is_read ? (
                <CheckCheck className="w-3 h-3" style={{ color: primaryColor }} />
              ) : (
                <Check className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
