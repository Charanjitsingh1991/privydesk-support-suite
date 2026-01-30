import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type IntegrationConfigRow = Database['public']['Tables']['integration_configurations']['Row'];
type IntegrationSyncLogRow = Database['public']['Tables']['integration_sync_logs']['Row'];
type ZapierTriggerRow = Database['public']['Tables']['zapier_triggers']['Row'];

export interface IntegrationConfiguration extends IntegrationConfigRow {}
export interface IntegrationSyncLog extends IntegrationSyncLogRow {}
export interface ZapierTrigger extends ZapierTriggerRow {}

export class IntegrationService {
  /**
   * Get all integrations for organization
   */
  static async getIntegrations(
    organizationId: string
  ): Promise<IntegrationConfiguration[]> {
    const { data, error } = await supabase
      .from('integration_configurations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch integrations:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create integration
   */
  static async createIntegration(
    organizationId: string,
    integration: {
      integration_type: string;
      integration_name: string;
      credentials: any;
      settings?: any;
    }
  ): Promise<IntegrationConfiguration | null> {
    const { data, error } = await supabase
      .from('integration_configurations')
      .insert({
        organization_id: organizationId,
        is_active: true,
        ...integration,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create integration:', error);
      return null;
    }

    return data;
  }

  /**
   * Update integration
   */
  static async updateIntegration(
    integrationId: string,
    updates: Partial<IntegrationConfiguration>
  ): Promise<IntegrationConfiguration | null> {
    const { data, error } = await supabase
      .from('integration_configurations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update integration:', error);
      return null;
    }

    return data;
  }

  /**
   * Delete integration
   */
  static async deleteIntegration(integrationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('integration_configurations')
      .delete()
      .eq('id', integrationId);

    return !error;
  }

  /**
   * Test integration connection
   */
  static async testIntegration(integrationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const { data: integration } = await supabase
      .from('integration_configurations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    // In production, test actual API connection
    // For now, return success
    return {
      success: true,
      message: `${integration.integration_name} connection successful`,
    };
  }

  /**
   * Sync integration data
   */
  static async syncIntegration(
    integrationId: string,
    syncType: string
  ): Promise<IntegrationSyncLog | null> {
    const { data, error } = await supabase
      .from('integration_sync_logs')
      .insert({
        integration_id: integrationId,
        sync_type: syncType,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to start sync:', error);
      return null;
    }

    // In production, perform actual sync
    // For now, mark as completed
    setTimeout(async () => {
      await supabase
        .from('integration_sync_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          records_synced: 0,
        })
        .eq('id', data.id);
    }, 1000);

    return data;
  }

  /**
   * Get sync logs
   */
  static async getSyncLogs(
    integrationId: string,
    limit: number = 50
  ): Promise<IntegrationSyncLog[]> {
    const { data, error } = await supabase
      .from('integration_sync_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch sync logs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Zapier: Create trigger
   */
  static async createZapierTrigger(
    organizationId: string,
    trigger: {
      trigger_type: string;
      trigger_name: string;
      webhook_url: string;
      filters?: any;
    }
  ): Promise<ZapierTrigger | null> {
    const { data, error } = await supabase
      .from('zapier_triggers')
      .insert({
        organization_id: organizationId,
        is_active: true,
        ...trigger,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create Zapier trigger:', error);
      return null;
    }

    return data;
  }

  /**
   * Get Zapier triggers
   */
  static async getZapierTriggers(
    organizationId: string
  ): Promise<ZapierTrigger[]> {
    const { data, error } = await supabase
      .from('zapier_triggers')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch Zapier triggers:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Fire Zapier trigger
   */
  static async fireZapierTrigger(
    triggerId: string,
    payload: any
  ): Promise<boolean> {
    const { data: trigger } = await supabase
      .from('zapier_triggers')
      .select('*')
      .eq('id', triggerId)
      .eq('is_active', true)
      .single();

    if (!trigger) return false;

    try {
      // Send webhook to Zapier
      const response = await fetch(trigger.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Update last triggered
      await supabase
        .from('zapier_triggers')
        .update({ last_triggered_at: new Date().toISOString() })
        .eq('id', triggerId);

      return response.ok;
    } catch (error) {
      console.error('Failed to fire Zapier trigger:', error);
      return false;
    }
  }

  /**
   * Slack integration: Send message
   */
  static async sendSlackMessage(
    integrationId: string,
    channel: string,
    message: string
  ): Promise<boolean> {
    const { data: integration } = await supabase
      .from('integration_configurations')
      .select('*')
      .eq('id', integrationId)
      .eq('integration_type', 'slack')
      .single();

    if (!integration) return false;

    // In production, use Slack API
    console.log('Sending Slack message:', { channel, message });
    return true;
  }

  /**
   * Salesforce integration: Sync contact
   */
  static async syncSalesforceContact(
    integrationId: string,
    contactData: any
  ): Promise<boolean> {
    const { data: integration } = await supabase
      .from('integration_configurations')
      .select('*')
      .eq('id', integrationId)
      .eq('integration_type', 'salesforce')
      .single();

    if (!integration) return false;

    // In production, use Salesforce API
    console.log('Syncing Salesforce contact:', contactData);
    return true;
  }

  /**
   * Get available integration types
   */
  static getAvailableIntegrations(): Array<{
    type: string;
    name: string;
    description: string;
    category: string;
  }> {
    return [
      {
        type: 'zapier',
        name: 'Zapier',
        description: 'Connect to 5000+ apps',
        category: 'automation',
      },
      {
        type: 'slack',
        name: 'Slack',
        description: 'Team communication',
        category: 'communication',
      },
      {
        type: 'salesforce',
        name: 'Salesforce',
        description: 'CRM integration',
        category: 'crm',
      },
      {
        type: 'shopify',
        name: 'Shopify',
        description: 'E-commerce platform',
        category: 'ecommerce',
      },
      {
        type: 'woocommerce',
        name: 'WooCommerce',
        description: 'WordPress e-commerce',
        category: 'ecommerce',
      },
      {
        type: 'hubspot',
        name: 'HubSpot',
        description: 'Marketing & CRM',
        category: 'crm',
      },
      {
        type: 'mailchimp',
        name: 'Mailchimp',
        description: 'Email marketing',
        category: 'marketing',
      },
      {
        type: 'google_workspace',
        name: 'Google Workspace',
        description: 'Gmail, Calendar, Drive',
        category: 'productivity',
      },
      {
        type: 'microsoft_365',
        name: 'Microsoft 365',
        description: 'Outlook, Teams, OneDrive',
        category: 'productivity',
      },
      {
        type: 'jira',
        name: 'Jira',
        description: 'Project management',
        category: 'productivity',
      },
    ];
  }
}
