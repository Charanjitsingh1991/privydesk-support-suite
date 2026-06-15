import { supabase } from '@/integrations/supabase/client';
import crypto from 'crypto';

import type { Database } from '@/integrations/supabase/types';

type ApiKeyRow = Database['public']['Tables']['api_keys']['Row'];

export type ApiKey = ApiKeyRow

export class ApiKeyService {
  /**
   * Generate a new API key
   */
  static generateApiKey(): { key: string; hash: string; prefix: string } {
    const key = `pk_live_${crypto.randomBytes(32).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    const prefix = key.substring(0, 15); // First 15 chars for display
    
    return { key, hash, prefix };
  }

  /**
   * Create a new API key
   */
  static async createApiKey(
    organizationId: string,
    name: string,
    permissions: string[] = ['read', 'write'],
    expiresInDays?: number
  ): Promise<{ apiKey: ApiKey; plainKey: string } | null> {
    const { key, hash, prefix } = this.generateApiKey();
    
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        organization_id: organizationId,
        name,
        key_hash: hash,
        key_prefix: prefix,
        permissions,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create API key:', error);
      return null;
    }

    return {
      apiKey: data,
      plainKey: key, // Return plain key only once
    };
  }

  /**
   * Get all API keys for an organization
   */
  static async getApiKeys(organizationId: string): Promise<ApiKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch API keys:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Revoke (deactivate) an API key
   */
  static async revokeApiKey(keyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId);

    if (error) {
      console.error('Failed to revoke API key:', error);
      return false;
    }

    return true;
  }

  /**
   * Delete an API key
   */
  static async deleteApiKey(keyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId);

    if (error) {
      console.error('Failed to delete API key:', error);
      return false;
    }

    return true;
  }

  /**
   * Verify an API key (for API endpoints)
   */
  static async verifyApiKey(key: string): Promise<ApiKey | null> {
    const hash = crypto.createHash('sha256').update(key).digest('hex');

    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', hash)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', hash);

    return data;
  }

  /**
   * Check if API key has required scope
   */
  static hasScope(apiKey: ApiKey, requiredScope: string): boolean {
    if (!apiKey.permissions) return false;
    if (apiKey.permissions.includes('*')) return true;
    return apiKey.permissions.includes(requiredScope);
  }
}
