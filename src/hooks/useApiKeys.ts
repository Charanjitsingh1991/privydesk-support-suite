import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import { useToast } from '@/hooks/use-toast';

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  rate_limit: number;
  expires_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateApiKeyInput {
  name: string;
  permissions: string[];
  rate_limit: number;
  expires_at?: string;
}

// Available permission scopes
export const API_SCOPES = [
  { id: 'read:tickets', label: 'Read Tickets', description: 'View ticket details and list tickets' },
  { id: 'write:tickets', label: 'Write Tickets', description: 'Create and update tickets' },
  { id: 'delete:tickets', label: 'Delete Tickets', description: 'Delete tickets' },
  { id: 'read:users', label: 'Read Users', description: 'View user details and list users' },
  { id: 'write:users', label: 'Write Users', description: 'Create and update users' },
  { id: 'read:organization', label: 'Read Organization', description: 'View organization settings' },
  { id: 'write:organization', label: 'Write Organization', description: 'Update organization settings' },
  { id: 'read:analytics', label: 'Read Analytics', description: 'View analytics and reports' },
] as const;

// Generate a secure API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'pk_live_';
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Hash API key using Web Crypto API
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useApiKeys() {
  const { organizationId, userId } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Fetch all API keys for the organization
  const { data: apiKeys, isLoading, error } = useQuery({
    queryKey: ['api-keys', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApiKey[];
    },
    enabled: !!organizationId,
  });

  // Create a new API key
  const createApiKey = useMutation({
    mutationFn: async (input: CreateApiKeyInput) => {
      if (!organizationId || !userId) throw new Error('Not authenticated');

      const rawKey = generateApiKey();
      const keyHash = await hashApiKey(rawKey);
      const keyPrefix = rawKey.substring(0, 12) + '...';

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          organization_id: organizationId,
          name: input.name,
          key_prefix: keyPrefix,
          key_hash: keyHash,
          permissions: input.permissions,
          rate_limit: input.rate_limit,
          expires_at: input.expires_at || null,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Return the raw key for display (only shown once)
      return { apiKey: data, rawKey };
    },
    onSuccess: ({ rawKey }) => {
      setNewlyCreatedKey(rawKey);
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({ title: 'API Key Created', description: 'Copy the key now - it won\'t be shown again!' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Revoke (delete) an API key
  const revokeApiKey = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({ title: 'API Key Revoked', description: 'The API key has been revoked and can no longer be used.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Toggle API key active status
  const toggleApiKey = useMutation({
    mutationFn: async ({ keyId, isActive }: { keyId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: isActive })
        .eq('id', keyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const clearNewKey = () => setNewlyCreatedKey(null);

  return {
    apiKeys: apiKeys || [],
    isLoading,
    error,
    createApiKey,
    revokeApiKey,
    toggleApiKey,
    newlyCreatedKey,
    clearNewKey,
  };
}
