import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { apiQuery, apiMutate } from '@/lib/api-client';
import { useUser } from './useSession';
import type { Database } from '@/integrations/supabase/types';

type Ticket = Database['public']['Tables']['tickets']['Row'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];
type TicketUpdate = Database['public']['Tables']['tickets']['Update'];
type TicketStatus = Database['public']['Enums']['ticket_status'];
type TicketPriority = Database['public']['Enums']['ticket_priority'];

export function useTickets(filters?: {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
}) {
  const { organizationId, role } = useUser();

  return useQuery({
    queryKey: ['tickets', organizationId, filters],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select('*, created_by:profiles!tickets_created_by_fkey(full_name, avatar_url), assigned_to:profiles!tickets_assigned_to_fkey(full_name, avatar_url)')
        .eq('organization_id', organizationId!)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      return apiQuery(
        () => query,
        { cacheKey: `tickets-${organizationId}-${JSON.stringify(filters)}` }
      );
    },
    enabled: !!organizationId,
    staleTime: 30000, // 30 seconds
  });
}

export function useTicket(ticketId?: string) {
  const { organizationId } = useUser();

  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) return null;

      return apiQuery(
        () =>
          supabase
            .from('tickets')
            .select('*, created_by:profiles!tickets_created_by_fkey(*), assigned_to:profiles!tickets_assigned_to_fkey(*)')
            .eq('id', ticketId)
            .single(),
        { cacheKey: `ticket-${ticketId}` }
      );
    },
    enabled: !!ticketId && !!organizationId,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  const { organizationId, userId } = useUser();

  return useMutation({
    mutationFn: async (ticket: Omit<TicketInsert, 'organization_id' | 'created_by'>) => {
      return apiMutate(
        () =>
          supabase.from('tickets').insert({
            ...ticket,
            organization_id: organizationId!,
            created_by: userId!,
          }).select().single(),
        { invalidateCache: ['tickets-*'] }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TicketUpdate }) => {
      return apiMutate(
        () =>
          supabase
            .from('tickets')
            .update(updates)
            .eq('id', id)
            .select()
            .single(),
        { invalidateCache: [`ticket-${id}`, 'tickets-*'] }
      );
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['ticket', data.id] });
      }
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      return apiMutate(
        () => supabase.from('tickets').delete().eq('id', ticketId),
        { invalidateCache: [`ticket-${ticketId}`, 'tickets-*'] }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useTicketStats() {
  const { organizationId, role, userId } = useUser();

  return useQuery({
    queryKey: ['ticket-stats', organizationId, userId, role],
    queryFn: async () => {
      let query = supabase
        .from('tickets')
        .select('status, priority', { count: 'exact' })
        .eq('organization_id', organizationId!);

      // Clients only see their own tickets
      if (role === 'client') {
        query = query.eq('created_by', userId!);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const stats = {
        total: count || 0,
        open: data?.filter(t => t.status === 'open').length || 0,
        inProgress: data?.filter(t => t.status === 'in_progress').length || 0,
        resolved: data?.filter(t => t.status === 'resolved').length || 0,
        urgent: data?.filter(t => t.priority === 'urgent').length || 0,
      };

      return stats;
    },
    enabled: !!organizationId,
    staleTime: 60000, // 1 minute
  });
}
