import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface UseTypingIndicatorOptions {
  ticketId: string;
  userId?: string;
  userName?: string;
  enabled?: boolean;
}

const TYPING_TIMEOUT = 5000; // Clear typing status after 5s of inactivity
const THROTTLE_INTERVAL = 2000; // Max one typing event per 2 seconds

export function useTypingIndicator({
  ticketId,
  userId,
  userName,
  enabled = true,
}: UseTypingIndicatorOptions) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastTypingRef = useRef<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up stale typing indicators
  const cleanupTyping = useCallback(() => {
    const now = Date.now();
    setTypingUsers((prev) =>
      prev.filter((user) => now - user.timestamp < TYPING_TIMEOUT)
    );
  }, []);

  // Handle incoming typing events
  const handleTypingEvent = useCallback(
    (payload: { userId: string; userName: string; isTyping: boolean }) => {
      if (payload.userId === userId) return; // Ignore own typing

      if (payload.isTyping) {
        setTypingUsers((prev) => {
          const existing = prev.find((u) => u.userId === payload.userId);
          if (existing) {
            return prev.map((u) =>
              u.userId === payload.userId
                ? { ...u, timestamp: Date.now() }
                : u
            );
          }
          return [
            ...prev,
            { userId: payload.userId, userName: payload.userName, timestamp: Date.now() },
          ];
        });
      } else {
        setTypingUsers((prev) =>
          prev.filter((u) => u.userId !== payload.userId)
        );
      }
    },
    [userId]
  );

  // Broadcast typing status
  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current || !userId || !userName) return;

      const now = Date.now();
      
      // Throttle typing events
      if (isTyping && now - lastTypingRef.current < THROTTLE_INTERVAL) {
        return;
      }

      lastTypingRef.current = now;

      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, userName, isTyping },
      });

      // Clear typing status after timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          if (channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'typing',
              payload: { userId, userName, isTyping: false },
            });
          }
        }, TYPING_TIMEOUT);
      }
    },
    [userId, userName]
  );

  // Start typing
  const startTyping = useCallback(() => {
    sendTypingStatus(true);
  }, [sendTypingStatus]);

  // Stop typing
  const stopTyping = useCallback(() => {
    sendTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [sendTypingStatus]);

  // Setup channel
  useEffect(() => {
    if (!ticketId || !enabled) return;

    const channel = supabase.channel(`typing:${ticketId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        handleTypingEvent(payload);
      })
      .subscribe();

    channelRef.current = channel;

    // Setup cleanup interval
    cleanupIntervalRef.current = setInterval(cleanupTyping, 1000);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [ticketId, enabled, handleTypingEvent, cleanupTyping]);

  // Generate typing indicator text
  const typingText = (() => {
    const filtered = typingUsers.filter((u) => u.userId !== userId);
    if (filtered.length === 0) return null;
    if (filtered.length === 1) return `${filtered[0].userName} is typing...`;
    if (filtered.length === 2) {
      return `${filtered[0].userName} and ${filtered[1].userName} are typing...`;
    }
    return `${filtered.length} people are typing...`;
  })();

  return {
    typingUsers: typingUsers.filter((u) => u.userId !== userId),
    typingText,
    startTyping,
    stopTyping,
    isAnyoneTyping: typingUsers.some((u) => u.userId !== userId),
  };
}
