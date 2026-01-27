import { formatDistanceToNow, format } from 'date-fns';
import { Paperclip, Link2, FolderOpen, Mail, MailOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { EmailWithAttachments } from '@/types/email';

interface EmailListProps {
  emails: EmailWithAttachments[];
  loading?: boolean;
  selectedId?: string;
  onSelect: (email: EmailWithAttachments) => void;
}

export function EmailList({
  emails,
  loading = false,
  selectedId,
  onSelect
}: EmailListProps) {
  if (loading) {
    return (
      <div className="divide-y">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24 ml-auto" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg">No emails found</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {emails.map(email => (
        <div
          key={email.id}
          onClick={() => onSelect(email)}
          className={cn(
            'p-4 cursor-pointer hover:bg-muted/50 transition-colors',
            selectedId === email.id && 'bg-muted',
            !email.is_read && 'bg-primary/5'
          )}
        >
          {/* Header Row */}
          <div className="flex items-center gap-2 mb-1">
            {email.is_read ? (
              <MailOpen className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <Mail className="h-4 w-4 text-primary shrink-0" />
            )}
            
            <span className={cn(
              'text-sm truncate',
              !email.is_read && 'font-semibold'
            )}>
              {email.from_name || email.from_email}
            </span>

            {email.from_name && (
              <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                &lt;{email.from_email}&gt;
              </span>
            )}

            <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap" title={format(new Date(email.received_datetime), 'PPpp')}>
              {formatDistanceToNow(new Date(email.received_datetime), { addSuffix: true })}
            </span>
          </div>

          {/* Subject */}
          <h4 className={cn(
            'text-sm truncate mb-1',
            !email.is_read && 'font-medium'
          )}>
            {email.subject || '(No Subject)'}
          </h4>

          {/* Preview */}
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {email.body_preview || 'No preview available'}
          </p>

          {/* Footer Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {email.folder_path && (
              <Badge variant="outline" className="text-xs">
                <FolderOpen className="h-3 w-3 mr-1" />
                {email.folder_path.split('/').pop()}
              </Badge>
            )}

            {email.has_attachments && (
              <Badge variant="secondary" className="text-xs">
                <Paperclip className="h-3 w-3 mr-1" />
                Attachments
              </Badge>
            )}

            {email.linked_ticket_id && (
              <Badge variant="default" className="text-xs">
                <Link2 className="h-3 w-3 mr-1" />
                Linked
              </Badge>
            )}

            {email.importance === 'high' && (
              <Badge variant="destructive" className="text-xs">
                High Priority
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
