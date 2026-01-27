import { useEffect, useRef } from 'react';
import { WidgetMessageBubble } from './WidgetMessageBubble';
import type { WidgetMessage } from '@/types/widget';

interface WidgetMessageListProps {
  messages: WidgetMessage[];
  primaryColor: string;
  isTyping?: boolean;
  agentName?: string;
}

export function WidgetMessageList({
  messages,
  primaryColor,
  isTyping,
  agentName,
}: WidgetMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-3">
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Start the conversation...
        </div>
      )}
      
      {messages.map((message, index) => {
        const prevMessage = messages[index - 1];
        const showTimestamp =
          !prevMessage ||
          prevMessage.sender_type !== message.sender_type ||
          new Date(message.created_at).getTime() -
            new Date(prevMessage.created_at).getTime() >
            300000; // 5 minutes

        return (
          <WidgetMessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_type === 'visitor'}
            primaryColor={primaryColor}
            showTimestamp={showTimestamp}
            agentName={agentName}
          />
        );
      })}

      {isTyping && (
        <div className="flex items-start mb-3">
          <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
            <div className="flex gap-1">
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: primaryColor, animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: primaryColor, animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: primaryColor, animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
