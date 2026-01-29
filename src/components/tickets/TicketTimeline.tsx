import { formatDistanceToNow, format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  RefreshCw,
  UserPlus,
  Tag,
  Paperclip,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Profile, TicketStatus, TicketPriority } from '@/types/database';

export interface TimelineEvent {
  id: string;
  type: 'message' | 'status_change' | 'assignment' | 'priority_change' | 'file_upload' | 'internal_note';
  content: string;
  user: Profile;
  created_at: string;
  metadata?: {
    old_value?: string;
    new_value?: string;
    is_internal?: boolean;
    attachments?: string[];
  };
}

interface TicketTimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
}

const getEventIcon = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'message':
      return MessageSquare;
    case 'status_change':
      return RefreshCw;
    case 'assignment':
      return UserPlus;
    case 'priority_change':
      return Tag;
    case 'file_upload':
      return Paperclip;
    case 'internal_note':
      return Eye;
    default:
      return MessageSquare;
  }
};

const getEventColor = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'message':
      return 'bg-primary';
    case 'internal_note':
      return 'bg-warning';
    case 'status_change':
      return 'bg-success';
    case 'assignment':
      return 'bg-accent';
    case 'priority_change':
      return 'bg-destructive';
    case 'file_upload':
      return 'bg-muted-foreground';
    default:
      return 'bg-muted';
  }
};

function TimelineItem({ event }: { event: TimelineEvent }) {
  const Icon = getEventIcon(event.type);
  const isSystemEvent = event.type !== 'message' && event.type !== 'internal_note';

  return (
    <div className="flex gap-4 relative pb-8 last:pb-0">
      {/* Timeline line */}
      <div className="absolute left-5 top-10 bottom-0 w-px bg-border last:hidden" />

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          event.metadata?.is_internal ? 'bg-warning/10 ring-2 ring-warning' : 'bg-muted'
        )}
      >
        <Icon className={cn('h-4 w-4', event.metadata?.is_internal ? 'text-warning' : 'text-muted-foreground')} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="h-6 w-6">
            <AvatarImage src={event.user.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {event.user.full_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-sm">{event.user.full_name}</span>
          {event.metadata?.is_internal && (
            <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
              Internal Note
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Body */}
        {isSystemEvent ? (
          <div className="text-sm text-muted-foreground">
            {event.type === 'status_change' && (
              <>
                Changed status from{' '}
                <Badge variant="secondary" className="text-xs">
                  {event.metadata?.old_value}
                </Badge>{' '}
                to{' '}
                <Badge variant="secondary" className="text-xs">
                  {event.metadata?.new_value}
                </Badge>
              </>
            )}
            {event.type === 'assignment' && (
              <>
                Assigned to{' '}
                <span className="font-medium">{event.metadata?.new_value}</span>
              </>
            )}
            {event.type === 'priority_change' && (
              <>
                Changed priority from{' '}
                <Badge variant="secondary" className="text-xs">
                  {event.metadata?.old_value}
                </Badge>{' '}
                to{' '}
                <Badge variant="secondary" className="text-xs">
                  {event.metadata?.new_value}
                </Badge>
              </>
            )}
            {event.type === 'file_upload' && (
              <>
                Uploaded {event.metadata?.attachments?.length || 1} file(s)
              </>
            )}
          </div>
        ) : (
          <div
            className={cn(
              'p-3 rounded-lg text-sm',
              event.metadata?.is_internal
                ? 'bg-warning/5 border border-warning/20'
                : 'bg-muted/50'
            )}
          >
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: event.content.replace(/\n/g, '<br />') }}
            />
          </div>
        )}

        {/* Attachments */}
        {event.metadata?.attachments && event.metadata.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {event.metadata.attachments.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Paperclip className="h-3 w-3" />
                Attachment {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function TicketTimeline({ events, loading }: TicketTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 bg-muted rounded" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-0">
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>
    </ScrollArea>
  );
}
