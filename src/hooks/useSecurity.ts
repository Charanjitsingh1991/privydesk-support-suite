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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast({
        title: 'Error reviewing content',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchFlaggedContent, toast]);

  return { flaggedItems, loading, fetchFlaggedContent, reviewContent };
}

// GDPR Compliance utilities
export function useGDPRCompliance() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Export all user data
  const exportUserData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Gather all user data
      const [
        { data: profile },
        { data: tickets },
        { data: messages },
        { data: sessions },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('tickets').select('*').eq('created_by', user.id),
        supabase.from('messages').select('*').eq('user_id', user.id),
        supabase.from('user_sessions').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile,
        tickets: tickets || [],
        messages: messages || [],
        sessions: sessions || [],
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `privydesk-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data Exported',
        description: 'Your data has been downloaded successfully.',
      });
    } catch (error) {
      console.error('Failed to export data:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Request account deletion (30-day grace period)
  const requestAccountDeletion = useCallback(async (reason?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      const updatedPrefs = {
        ...((profile?.preferences as Record<string, unknown>) || {}),
        deletion_requested: true,
        deletion_requested_at: new Date().toISOString(),
        deletion_scheduled_for: deletionDate.toISOString(),
        deletion_reason: reason,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPrefs as unknown as null })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Deletion Requested',
        description: `Your account will be deleted on ${deletionDate.toLocaleDateString()}. You can cancel this within 30 days.`,
      });

      return deletionDate;
    } catch (error) {
      console.error('Failed to request deletion:', error);
      toast({
        title: 'Request Failed',
        description: 'Failed to request account deletion.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Cancel deletion request
  const cancelAccountDeletion = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      const updatedPrefs = { ...((profile?.preferences as Record<string, unknown>) || {}) };
      delete updatedPrefs.deletion_requested;
      delete updatedPrefs.deletion_requested_at;
      delete updatedPrefs.deletion_scheduled_for;
      delete updatedPrefs.deletion_reason;

      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPrefs as unknown as null })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Deletion Cancelled',
        description: 'Your account deletion has been cancelled.',
      });
    } catch (error) {
      console.error('Failed to cancel deletion:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel account deletion.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update consent preferences
  const updateConsentPreferences = useCallback(async (
    consents: {
      analytics?: boolean;
      marketing?: boolean;
      thirdParty?: boolean;
    }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      const existingPrefs = (profile?.preferences as Record<string, unknown>) || {};
      const existingConsent = (existingPrefs.consent as Record<string, unknown>) || {};
      
      const updatedPrefs = {
        ...existingPrefs,
        consent: {
          ...existingConsent,
          ...consents,
          updated_at: new Date().toISOString(),
        },
      } as Record<string, unknown>;

      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPrefs as unknown as null })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Preferences Updated',
        description: 'Your privacy preferences have been saved.',
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return {
    loading,
    exportUserData,
    requestAccountDeletion,
    cancelAccountDeletion,
    updateConsentPreferences,
  };
}
