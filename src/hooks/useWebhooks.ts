import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import { useToast } from '@/hooks/use-toast';

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  failure_count: number;
  last_triggered_at: string | null;
  created_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_config_id: string;
  event: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'success' | 'failed';
  response_code: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface CreateWebhookInput {
  name: string;
  url: string;
  secret: string;
  events: string[];
}

// Available webhook events
export const WEBHOOK_EVENTS = [
  { id: 'ticket.created', label: 'Ticket Created', description: 'When a new ticket is created' },
  { id: 'ticket.updated', label: 'Ticket Updated', description: 'When a ticket is updated' },
  { id: 'ticket.resolved', label: 'Ticket Resolved', description: 'When a ticket status changes to resolved' },
  { id: 'ticket.closed', label: 'Ticket Closed', description: 'When a ticket is closed' },
  { id: 'message.created', label: 'Message Created', description: 'When a new message is sent' },
  { id: 'user.created', label: 'User Created', description: 'When a new user is created' },
] as const;

// Generate a secure webhook secret
export function generateWebhookSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let secret = 'whsec_';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

export function useWebhooks() {
  const { organizationId, userId } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all webhooks for the organization
  const { data: webhooks, isLoading, error } = useQuery({
    queryKey: ['webhooks', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('webhook_configs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WebhookConfig[];
    },
    enabled: !!organizationId,
  });

  // Create a new webhook
  const createWebhook = useMutation({
    mutationFn: async (input: CreateWebhookInput) => {
      if (!organizationId || !userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('webhook_configs')
        .insert({
          organization_id: organizationId,
          name: input.name,
          url: input.url,
          secret: input.secret,
          events: input.events,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({ title: 'Webhook Created', description: 'Your webhook has been configured successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update a webhook
  const updateWebhook = useMutation({
    mutationFn: async ({ id, ...input }: Partial<CreateWebhookInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('webhook_configs')
        .update({
          name: input.name,
          url: input.url,
          events: input.events,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({ title: 'Webhook Updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete a webhook
  const deleteWebhook = useMutation({
    mutationFn: async (webhookId: string) => {
      const { error } = await supabase
        .from('webhook_configs')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({ title: 'Webhook Deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Toggle webhook active status
  const toggleWebhook = useMutation({
    mutationFn: async ({ webhookId, isActive }: { webhookId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('webhook_configs')
        .update({ is_active: isActive })
        .eq('id', webhookId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Test a webhook
  const testWebhook = useMutation({
    mutationFn: async (webhook: WebhookConfig) => {
      const payload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook from Privydesk',
        },
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(payload),
      });

      return { success: true };
    },
    onSuccess: () => {
      toast({ 
        title: 'Test Sent', 
        description: 'Webhook test request sent. Check your endpoint for the payload.' 
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    webhooks: webhooks || [],
    isLoading,
    error,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhook,
    testWebhook,
  };
}

export function useWebhookLogs(webhookId?: string) {
  const { organizationId } = useUser();

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['webhook-logs', organizationId, webhookId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      let query = supabase
        .from('webhook_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (webhookId) {
        query = query.eq('webhook_config_id', webhookId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WebhookLog[];
    },
    enabled: !!organizationId,
  });

  return {
    logs: logs || [],
    isLoading,
    error,
  };
}
