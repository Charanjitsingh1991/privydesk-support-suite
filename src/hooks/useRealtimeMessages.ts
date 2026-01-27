import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Message, Profile } from '@/types/database';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface MessageWithUser extends Omit<Message, 'user'> {
  user?: Profile;
  sending?: boolean;
  sendError?: boolean;
}

interface UseRealtimeMessagesOptions {
  ticketId: string;
  enabled?: boolean;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export function useRealtimeMessages({ ticketId, enabled = true }: UseRealtimeMessagesOptions) {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial messages with user data
  const fetchMessages = useCallback(async () => {
    if (!ticketId) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:profiles!messages_user_id_fkey(*)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } else if (data) {
      setMessages(data as MessageWithUser[]);
    }
    setLoading(false);
  }, [ticketId]);

  // Handle new message from realtime
  const handleNewMessage = useCallback(async (payload: RealtimePostgresChangesPayload<Message>) => {
    if (payload.eventType === 'INSERT') {
      const newMessage = payload.new as Message;
      
      // Fetch user data for the new message
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', newMessage.user_id)
        .single();

      setMessages((prev) => {
        // Check if message already exists (optimistic update)
        const exists = prev.some((m) => m.id === newMessage.id);
        if (exists) {
          // Replace the optimistic message with the real one
          return prev.map((m) =>
            m.id === newMessage.id
              ? { ...newMessage, user: userData as Profile, sending: false }
              : m
          );
        }
        return [...prev, { ...newMessage, user: userData as Profile }];
      });
    } else if (payload.eventType === 'UPDATE') {
      const updatedMessage = payload.new as Message;
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m))
      );
    } else if (payload.eventType === 'DELETE') {
      const deletedMessage = payload.old as Message;
      setMessages((prev) => prev.filter((m) => m.id !== deletedMessage.id));
    }
  }, []);

  // Setup realtime subscription
  const setupSubscription = useCallback(() => {
    if (!ticketId || !enabled) return;

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    setConnectionState('connecting');

    const channel = supabase
      .channel(`messages:${ticketId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: ticketId },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        handleNewMessage
      )
      .on('broadcast', { event: 'heartbeat' }, () => {
        // Keep connection alive
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionState('connected');
          // Start heartbeat
          if (heartbeatRef.current) clearInterval(heartbeatRef.current);
          heartbeatRef.current = setInterval(() => {
            channel.send({
              type: 'broadcast',
              event: 'heartbeat',
              payload: { timestamp: Date.now() },
            });
          }, 30000); // Ping every 30 seconds
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionState('error');
          // Attempt reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            setupSubscription();
          }, 5000);
        } else if (status === 'CLOSED') {
          setConnectionState('disconnected');
        }
      });

    channelRef.current = channel;
  }, [ticketId, enabled, handleNewMessage]);

  // Add optimistic message
  const addOptimisticMessage = useCallback(
    (message: Omit<MessageWithUser, 'id' | 'created_at' | 'updated_at'>) => {
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage: MessageWithUser = {
        ...message,
        id: optimisticId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sending: true,
        read_by: [],
        attachments: message.attachments || [],
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      return optimisticId;
    },
    []
  );

  // Mark optimistic message as failed
  const markMessageFailed = useCallback((optimisticId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === optimisticId ? { ...m, sending: false, sendError: true } : m
      )
    );
  }, []);

  // Remove optimistic message (after successful send)
  const removeOptimisticMessage = useCallback((optimisticId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(
    async (userId: string) => {
      if (!userId) return;

      const unreadMessages = messages.filter(
        (m) => !m.read_by?.includes(userId) && m.user_id !== userId
      );

      if (unreadMessages.length === 0) return;

      const updates = unreadMessages.map((m) => ({
        id: m.id,
        read_by: [...(m.read_by || []), userId],
      }));

      for (const update of updates) {
        await supabase
          .from('messages')
          .update({ read_by: update.read_by })
          .eq('id', update.id);
      }

      setMessages((prev) =>
        prev.map((m) => {
          const update = updates.find((u) => u.id === m.id);
          return update ? { ...m, read_by: update.read_by } : m;
        })
      );
    },
    [messages]
  );

  // Retry failed message
  const retryMessage = useCallback(
    async (messageId: string, content: string, userId: string, isInternal: boolean) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, sending: true, sendError: false } : m
        )
      );

      const { data, error } = await supabase.from('messages').insert({
        ticket_id: ticketId,
        user_id: userId,
        content,
        is_internal: isInternal,
      }).select().single();

      if (error) {
        markMessageFailed(messageId);
        toast.error('Failed to send message');
      } else {
        // Remove optimistic and let realtime add the real one
        removeOptimisticMessage(messageId);
      }
    },
    [ticketId, markMessageFailed, removeOptimisticMessage]
  );

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Setup realtime
  useEffect(() => {
    setupSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [setupSubscription]);

  return {
    messages,
    loading,
    connectionState,
    refetch: fetchMessages,
    addOptimisticMessage,
    markMessageFailed,
    removeOptimisticMessage,
    markAsRead,
    retryMessage,
  };
}
