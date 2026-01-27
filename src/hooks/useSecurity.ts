import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  SecurityEvent,
  AllowedDomain,
  PendingClient,
  UserSession,
  BlockedIP,
  FlaggedContent,
  SecuritySettings,
  LinkScanResult,
  AttachmentScanResult,
  DANGEROUS_FILE_EXTENSIONS,
  SAFE_FILE_EXTENSIONS,
} from '@/types/security';

export function useSecurityEvents() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEvents = useCallback(async (filters?: {
    eventType?: string;
    severity?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) => {
    setLoading(true);
    try {
      let query = supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(100);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvents((data as SecurityEvent[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching security events',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const resolveEvent = useCallback(async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('security_events')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;
      await fetchEvents();
      toast({ title: 'Event marked as resolved' });
    } catch (error: any) {
      toast({
        title: 'Error resolving event',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchEvents, toast]);

  return { events, loading, fetchEvents, resolveEvent };
}

export function useAllowedDomains() {
  const [domains, setDomains] = useState<AllowedDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('allowed_domains')
        .select('*')
        .order('domain');

      if (error) throw error;
      setDomains((data as AllowedDomain[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching allowed domains',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addDomain = useCallback(async (domain: string, organizationId: string) => {
    try {
      const normalizedDomain = domain.toLowerCase().trim();
      const { error } = await supabase
        .from('allowed_domains')
        .insert({
          domain: normalizedDomain,
          organization_id: organizationId,
        });

      if (error) throw error;
      await fetchDomains();
      toast({ title: 'Domain added successfully' });
    } catch (error: any) {
      toast({
        title: 'Error adding domain',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchDomains, toast]);

  const removeDomain = useCallback(async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('allowed_domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;
      await fetchDomains();
      toast({ title: 'Domain removed' });
    } catch (error: any) {
      toast({
        title: 'Error removing domain',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchDomains, toast]);

  return { domains, loading, fetchDomains, addDomain, removeDomain };
}

export function usePendingClients() {
  const [pendingClients, setPendingClients] = useState<PendingClient[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPendingClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_clients')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingClients((data as PendingClient[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching pending clients',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const approveClient = useCallback(async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('pending_clients')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      if (error) throw error;
      await fetchPendingClients();
      toast({ title: 'Client approved' });
    } catch (error: any) {
      toast({
        title: 'Error approving client',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchPendingClients, toast]);

  const rejectClient = useCallback(async (clientId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('pending_clients')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', clientId);

      if (error) throw error;
      await fetchPendingClients();
      toast({ title: 'Client rejected' });
    } catch (error: any) {
      toast({
        title: 'Error rejecting client',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchPendingClients, toast]);

  return { pendingClients, loading, fetchPendingClients, approveClient, rejectClient };
}

export function useUserSessions() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .order('last_activity_at', { ascending: false });

      if (error) throw error;
      setSessions((data as UserSession[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching sessions',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const terminateSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      await fetchSessions();
      toast({ title: 'Session terminated' });
    } catch (error: any) {
      toast({
        title: 'Error terminating session',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchSessions, toast]);

  const terminateAllSessions = useCallback(async (exceptCurrent = true) => {
    try {
      let query = supabase.from('user_sessions').delete();
      if (exceptCurrent) {
        query = query.eq('is_current', false);
      }
      const { error } = await query;

      if (error) throw error;
      await fetchSessions();
      toast({ title: 'All sessions terminated' });
    } catch (error: any) {
      toast({
        title: 'Error terminating sessions',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchSessions, toast]);

  return { sessions, loading, fetchSessions, terminateSession, terminateAllSessions };
}

export function useFlaggedContent() {
  const [flaggedItems, setFlaggedItems] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFlaggedContent = useCallback(async (includeReviewed = false) => {
    setLoading(true);
    try {
      let query = supabase
        .from('flagged_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeReviewed) {
        query = query.eq('reviewed', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFlaggedItems((data as FlaggedContent[]) || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching flagged content',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const reviewContent = useCallback(async (contentId: string, action: string) => {
    try {
      const { error } = await supabase
        .from('flagged_content')
        .update({
          reviewed: true,
          reviewed_at: new Date().toISOString(),
          action_taken: action,
        })
        .eq('id', contentId);

      if (error) throw error;
      await fetchFlaggedContent();
      toast({ title: 'Content reviewed' });
    } catch (error: any) {
      toast({
        title: 'Error reviewing content',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchFlaggedContent, toast]);

  return { flaggedItems, loading, fetchFlaggedContent, reviewContent };
}
