import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WidgetMessageList } from './WidgetMessageList';
import { WidgetComposer } from './WidgetComposer';
import type { WidgetConfig, WidgetMessage, WidgetConversation, WidgetVisitor } from '@/types/widget';

interface ChatWindowProps {
  config: WidgetConfig;
  visitor: WidgetVisitor;
  conversation: WidgetConversation;
  onConversationUpdate?: (conversation: WidgetConversation) => void;
}

export function ChatWindow({
  config,
  visitor,
  conversation,
  onConversationUpdate,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [agentName, setAgentName] = useState<string>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTypingBroadcast = useRef<number>(0);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('widget_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data as WidgetMessage[]);
      }
    };

    fetchMessages();
  }, [conversation.id]);

  // Fetch agent name if assigned
  useEffect(() => {
    const fetchAgent = async () => {
      if (conversation.assigned_agent_id) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', conversation.assigned_agent_id)
          .single();

        if (data) {
          setAgentName(data.full_name);
        }
      }
    };

    fetchAgent();
  }, [conversation.assigned_agent_id]);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`widget_messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'widget_messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMessage = payload.new as WidgetMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.sender_type === 'agent') {
          setIsAgentTyping(true);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsAgentTyping(false);
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversation.id]);

  // Subscribe to conversation updates
  useEffect(() => {
    const channel = supabase
      .channel(`widget_conversation:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'widget_conversations',
          filter: `id=eq.${conversation.id}`,
        },
        (payload) => {
          onConversationUpdate?.(payload.new as WidgetConversation);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, onConversationUpdate]);

  const handleSend = useCallback(
    async (content: string) => {
      // Optimistic update
      const optimisticMessage: WidgetMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversation.id,
        sender_type: 'visitor',
        sender_id: visitor.id,
        content,
        attachments: [],
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Insert to database
      const { data, error } = await supabase
        .from('widget_messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'visitor',
          sender_id: visitor.id,
          content,
        })
        .select()
        .single();

      if (error) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        console.error('Failed to send message:', error);
      } else if (data) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? (data as WidgetMessage) : m))
        );
      }
    },
    [conversation.id, visitor.id]
  );

  const handleTyping = useCallback(() => {
    const now = Date.now();
    // Throttle typing broadcasts to once every 2 seconds
    if (now - lastTypingBroadcast.current < 2000) return;
    lastTypingBroadcast.current = now;

    supabase.channel(`widget_messages:${conversation.id}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender_type: 'visitor', visitor_id: visitor.id },
    });
  }, [conversation.id, visitor.id]);

  return (
    <div className="flex flex-col h-full">
      <WidgetMessageList
        messages={messages}
        primaryColor={config.primary_color}
        isTyping={isAgentTyping}
        agentName={agentName}
      />
      <WidgetComposer
        config={config}
        onSend={handleSend}
        onTyping={handleTyping}
      />
    </div>
  );
}
