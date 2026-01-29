import { useEffect, useRef, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowDown, WifiOff, Wifi } from 'lucide-react';
import type { Profile, UserRole } from '@/types/database';

interface Attachment {
  url: string;
  name?: string;
}

interface MessageData {
  id: string;
  content: string;
  user?: Profile;
  user_id: string;
  created_at: string;
  is_internal?: boolean;
  attachments?: Attachment[];
  read_by?: string[];
  sending?: boolean;
  sendError?: boolean;
}

interface MessageListProps {
  messages: MessageData[];
  currentUserId?: string;
  currentUserRole?: UserRole;
  typingText?: string | null;
  connectionState?: 'connecting' | 'connected' | 'disconnected' | 'error';
  loading?: boolean;
  hasMore?: boolean;
  className?: string;
  onLoadMore?: () => void;
  onRetry?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onMarkAsRead?: () => void;
}

export function MessageList({
  messages,
  currentUserId,
  currentUserRole,
  typingText,
  connectionState = 'connected',
  loading = false,
  hasMore = false,
  className,
  onLoadMore,
  onRetry,
  onDelete,
  onMarkAsRead,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // Check if message is grouped with previous
  const isGrouped = (index: number) => {
    if (index === 0) return false;
    const prev = messages[index - 1];
    const curr = messages[index];
    if (!prev || !curr) return false;
    if (prev.user_id !== curr.user_id) return false;
    
    const prevTime = new Date(prev.created_at).getTime();
    const currTime = new Date(curr.created_at).getTime();
    return currTime - prevTime < 5 * 60 * 1000; // Within 5 minutes
  };

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    setShowScrollButton(distanceFromBottom > 100);
    setAutoScroll(distanceFromBottom < 50);

    // Load more when scrolling to top
    if (scrollTop < 100 && hasMore && onLoadMore && !loading) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages.length, autoScroll, scrollToBottom]);

  // Mark as read when visible
  useEffect(() => {
    if (onMarkAsRead) {
      const timer = setTimeout(onMarkAsRead, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, onMarkAsRead]);

  // Scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className={cn('relative flex flex-col h-full', className)}>
      {/* Connection status */}
      {connectionState !== 'connected' && (
        <div
          className={cn(
            'flex items-center justify-center gap-2 py-2 text-xs',
            connectionState === 'connecting' && 'bg-warning/10 text-warning',
            connectionState === 'disconnected' && 'bg-muted text-muted-foreground',
            connectionState === 'error' && 'bg-destructive/10 text-destructive'
          )}
        >
          {connectionState === 'connecting' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Connecting...
            </>
          )}
          {connectionState === 'disconnected' && (
            <>
              <WifiOff className="h-3 w-3" />
              Disconnected - Reconnecting...
            </>
          )}
          {connectionState === 'error' && (
            <>
              <WifiOff className="h-3 w-3" />
              Connection error - Retrying...
            </>
          )}
        </div>
      )}

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-4 space-y-1"
      >
        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Load earlier messages
            </Button>
          </div>
        )}

        {/* Loading state */}
        {loading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Wifi className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start the conversation
            </p>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((message, index) => {
          const isOwn = message.user_id === currentUserId;
          const grouped = isGrouped(index);
          const hideInternal = message.is_internal && currentUserRole === 'client';

          if (hideInternal) return null;

          return (
            <MessageBubble
              key={message.id}
              id={message.id}
              content={message.content}
              user={message.user}
              createdAt={message.created_at}
              isOwn={isOwn}
              isInternal={message.is_internal}
              attachments={message.attachments}
              readBy={message.read_by}
              sending={message.sending}
              sendError={message.sendError}
              currentUserRole={currentUserRole}
              showAvatar={true}
              isGrouped={grouped}
              onRetry={
                message.sendError && onRetry
                  ? () => onRetry(message.id)
                  : undefined
              }
              onDelete={onDelete ? () => onDelete(message.id) : undefined}
            />
          );
        })}

        {/* Typing indicator */}
        <TypingIndicator typingText={typingText || null} />

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-20 right-4 shadow-lg rounded-full h-10 w-10 p-0"
          onClick={() => scrollToBottom(true)}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
