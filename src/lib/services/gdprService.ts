import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type GDPRRequestRow = Database['public']['Tables']['gdpr_requests']['Row'];
type DataRetentionPolicyRow = Database['public']['Tables']['data_retention_policies']['Row'];

export type GDPRRequest = GDPRRequestRow
export type DataRetentionPolicy = DataRetentionPolicyRow

export class GDPRService {
  /**
   * Create GDPR request
   */
  static async createRequest(
    organizationId: string,
    userId: string,
    email: string,
    requestType: 'export' | 'delete' | 'rectify'
  ): Promise<GDPRRequest | null> {
    const { data, error } = await supabase
      .from('gdpr_requests')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        email,
        request_type: requestType,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create GDPR request:', error);
      return null;
    }

    return data;
  }

  /**
   * Get GDPR requests
   */
  static async getRequests(
    organizationId: string,
    options?: {
      status?: string;
      requestType?: string;
      limit?: number;
    }
  ): Promise<GDPRRequest[]> {
    let query = supabase
      .from('gdpr_requests')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.requestType) {
      query = query.eq('request_type', options.requestType);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch GDPR requests:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Process data export request
   */
  static async processExportRequest(requestId: string): Promise<{
    success: boolean;
    exportUrl?: string;
    error?: string;
  }> {
    const { data: request } = await supabase
      .from('gdpr_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // In production, this would:
    // 1. Gather all user data from all tables
    // 2. Create a JSON/CSV export
    // 3. Upload to storage
    // 4. Generate signed URL
    // 5. Send email to user

    const exportData = {
      user_id: request.user_id,
      email: request.email,
      exported_at: new Date().toISOString(),
      // Add all user data here
    };

    const fileName = `gdpr-exports/${request.organization_id}/${request.user_id}.json`;
    
    const { error: uploadError } = await supabase.storage
      .from('gdpr-exports')
      .upload(fileName, JSON.stringify(exportData, null, 2));

    if (uploadError) {
      await supabase
        .from('gdpr_requests')
        .update({
          status: 'failed',
          error_message: uploadError.message,
        })
        .eq('id', requestId);

      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from('gdpr-exports')
      .getPublicUrl(fileName);

    await supabase
      .from('gdpr_requests')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
        export_file_url: urlData.publicUrl,
      })
      .eq('id', requestId);

    return {
      success: true,
      exportUrl: urlData.publicUrl,
    };
  }

  /**
   * Process data deletion request
   */
  static async processDeleteRequest(requestId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const { data: request } = await supabase
      .from('gdpr_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    // In production, this would:
    // 1. Delete or anonymize user data
    // 2. Keep audit trail
    // 3. Update request status

    try {
      // Mark user as deleted (soft delete)
      await supabase
        .from('profiles')
        .update({
          email: `deleted_${request.user_id}@deleted.com`,
          full_name: 'Deleted User',
        })
        .eq('id', request.user_id);

      await supabase
        .from('gdpr_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      return { success: true };
    } catch (error) {
      await supabase
        .from('gdpr_requests')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', requestId);

      return { success: false, error: error.message };
    }
  }

  /**
   * Get data retention policies
   */
  static async getRetentionPolicies(
    organizationId: string
  ): Promise<DataRetentionPolicy[]> {
    const { data, error } = await supabase
      .from('data_retention_policies')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch retention policies:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create retention policy
   */
  static async createRetentionPolicy(
    organizationId: string,
    policy: {
      resource_type: string;
      retention_days: number;
      action_on_expiry?: string;
      description?: string;
    }
  ): Promise<DataRetentionPolicy | null> {
    const { data, error } = await supabase
      .from('data_retention_policies')
      .insert({
        organization_id: organizationId,
        resource_type: policy.resource_type,
        retention_days: policy.retention_days,
        action_on_expiry: policy.action_on_expiry || 'archive',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create retention policy:', error);
      return null;
    }

    return data;
  }

  /**
   * Update retention policy
   */
  static async updateRetentionPolicy(
    policyId: string,
    updates: Partial<DataRetentionPolicy>
  ): Promise<DataRetentionPolicy | null> {
    const { data, error } = await supabase
      .from('data_retention_policies')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', policyId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update retention policy:', error);
      return null;
    }

    return data;
  }

  /**
   * Delete retention policy
   */
  static async deleteRetentionPolicy(policyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('data_retention_policies')
      .delete()
      .eq('id', policyId);

    if (error) {
      console.error('Failed to delete retention policy:', error);
      return false;
    }

    return true;
  }
}
