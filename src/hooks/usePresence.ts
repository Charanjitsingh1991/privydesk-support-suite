import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceUser {
  id: string;
  name: string;
  avatarUrl?: string;
  lastActive: number;
}

interface UsePresenceOptions {
  ticketId: string;
  userId?: string;
  userName?: string;
  avatarUrl?: string;
  enabled?: boolean;
}

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const ACTIVITY_INTERVAL = 30000; // Update activity every 30 seconds

export function usePresence({
  ticketId,
  userId,
  userName,
  avatarUrl,
  enabled = true,
}: UsePresenceOptions) {
  const [viewers, setViewers] = useState<PresenceUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Update presence state
  const updatePresence = useCallback(() => {
    if (!channelRef.current || !userId) return;

    channelRef.current.track({
      id: userId,
      name: userName,
      avatarUrl,
      lastActive: Date.now(),
    });

    lastActivityRef.current = Date.now();
  }, [userId, userName, avatarUrl]);

  // Handle activity events
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    updatePresence();
  }, [updatePresence]);

  // Setup presence tracking
  useEffect(() => {
    if (!ticketId || !userId || !enabled) return;

    const channel = supabase.channel(`presence:${ticketId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = [];

        Object.values(state).forEach((presences) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (presences as any[]).forEach((presence) => {
            if (presence.id) {
              users.push({
                id: presence.id,
                name: presence.name || 'Unknown',
                avatarUrl: presence.avatarUrl,
                lastActive: presence.lastActive || Date.now(),
              });
            }
          });
        });

        // Filter out idle users
        const now = Date.now();
        const activeUsers = users.filter(
          (user) => now - user.lastActive < IDLE_TIMEOUT
        );

        setViewers(activeUsers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Toast notification for new viewers (optional)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // Handle user leaving
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: userId,
            name: userName,
            avatarUrl,
            lastActive: Date.now(),
          });
        }
      });

    channelRef.current = channel;

    // Update activity periodically
    activityIntervalRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current < IDLE_TIMEOUT) {
        updatePresence();
      }
    }, ACTIVITY_INTERVAL);

    // Listen for user activity
    const activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];
    const throttledActivity = throttle(handleActivity, 10000);
    activityEvents.forEach((event) => {
      window.addEventListener(event, throttledActivity);
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, throttledActivity);
      });
    };
  }, [ticketId, userId, userName, avatarUrl, enabled, handleActivity, updatePresence]);

  // Get other viewers (excluding current user)
  const otherViewers = viewers.filter((v) => v.id !== userId);

  return {
    viewers,
    otherViewers,
    viewerCount: viewers.length,
    otherViewerCount: otherViewers.length,
  };
}

// Simple throttle helper
function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle = false;
  return ((...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}
