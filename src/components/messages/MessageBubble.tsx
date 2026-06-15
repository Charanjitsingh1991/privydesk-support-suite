import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MoreHorizontal,
  Copy,
  Pencil,
  Trash2,
  Flag,
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  Paperclip,
  Download,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import type { Profile, UserRole } from '@/types/database';

interface Attachment {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}

interface MessageBubbleProps {
  id: string;
  content: string;
  user?: Profile;
  createdAt: string;
  isOwn: boolean;
  isInternal?: boolean;
  isSystem?: boolean;
  attachments?: Attachment[];
  readBy?: string[];
  sending?: boolean;
  sendError?: boolean;
  currentUserRole?: UserRole;
  showAvatar?: boolean;
  isGrouped?: boolean;
  onRetry?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MessageBubble({
  id,
  content,
  user,
  createdAt,
  isOwn,
  isInternal = false,
  isSystem = false,
  attachments = [],
  readBy = [],
  sending = false,
  sendError = false,
  currentUserRole,
  showAvatar = true,
  isGrouped = false,
  onRetry,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  const [showFullTimestamp, setShowFullTimestamp] = useState(false);

  const canEdit =
    isOwn &&
    !sending &&
    !sendError &&
    new Date(createdAt).getTime() > Date.now() - 5 * 60 * 1000; // Within 5 minutes
  const canDelete =
    currentUserRole === 'admin' || currentUserRole === 'super_admin';

  const copyMessage = () => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied');
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>')
      .replace(
        /^> (.*)$/gm,
        '<blockquote class="border-l-2 border-primary/50 pl-2 italic text-muted-foreground">$1</blockquote>'
      )
      .replace(/^- (.*)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*)$/gm, '<li class="ml-4">$1</li>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(/\n/g, '<br />');

    return html;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role?: UserRole) => {
    if (!role) return null;
    const roleConfig: Record<UserRole, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      super_admin: { label: 'Super Admin', variant: 'default' },
      admin: { label: 'Admin', variant: 'default' },
      agent: { label: 'Agent', variant: 'secondary' },
      client: { label: 'Client', variant: 'outline' },
    };
    const config = roleConfig[role];
    return (
      <Badge variant={config.variant} className="text-[10px] px-1 py-0">
        {config.label}
      </Badge>
    );
  };

  const isImageAttachment = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const isPdfAttachment = (url: string) => {
    return /\.pdf$/i.test(url);
  };

  // System message style
  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 py-1',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        isGrouped && 'pt-0'
      )}
    >
      {/* Avatar */}
      {showAvatar && !isGrouped ? (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarImage src={user?.avatar_url || undefined} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {getInitials(user?.full_name)}
          </AvatarFallback>
        </Avatar>
      ) : (
        showAvatar && <div className="w-8 flex-shrink-0" />
      )}

      {/* Message content */}
      <div
        className={cn(
          'flex flex-col max-w-[70%]',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {/* Header (name + role) */}
        {!isGrouped && (
          <div
            className={cn(
              'flex items-center gap-2 mb-1',
              isOwn ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <span className="text-sm font-medium">{user?.full_name || 'Unknown'}</span>
            {getRoleBadge(user?.role)}
            {isInternal && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 bg-warning/10 text-warning border-warning/30">
                Internal
              </Badge>
            )}
          </div>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'relative rounded-lg px-3 py-2 text-sm',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-tr-none'
              : 'bg-muted rounded-tl-none',
            isInternal && 'bg-warning/10 border border-warning/30',
            sendError && 'bg-destructive/10 border border-destructive/30'
          )}
        >
          {/* Content */}
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((attachment, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {isImageAttachment(attachment.url) ? (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={attachment.url}
                        alt={attachment.name || 'Attachment'}
                        className="max-w-[200px] max-h-[200px] rounded object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex items-center gap-2 p-2 rounded border hover:bg-accent transition-colors',
                        isOwn
                          ? 'border-primary-foreground/20 text-primary-foreground'
                          : 'border-border'
                      )}
                    >
                      {isPdfAttachment(attachment.url) ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <Paperclip className="h-4 w-4" />
                      )}
                      <span className="text-xs truncate max-w-[150px]">
                        {attachment.name || 'Download'}
                      </span>
                      <Download className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Menu button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0',
                  isOwn ? '-left-8' : '-right-8'
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? 'start' : 'end'}>
              <DropdownMenuItem onClick={copyMessage}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </DropdownMenuItem>
              {canEdit && onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {!isOwn && currentUserRole === 'client' && (
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              )}
              {canDelete && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer (timestamp + status) */}
        <div
          className={cn(
            'flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground',
            isOwn ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{format(new Date(createdAt), 'PPpp')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Status indicators */}
          {isOwn && (
            <>
              {sending && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              {sendError && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-destructive" />
                  {onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 px-1 text-[10px]"
                      onClick={onRetry}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              )}
              {!sending && !sendError && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {readBy.length > 0 ? (
                        <CheckCheck className="h-3 w-3 text-primary" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {readBy.length > 0 ? (
                        <p>Seen by {readBy.length}</p>
                      ) : (
                        <p>Sent</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
