import { supabase } from '@/integrations/supabase/client';
import crypto from 'crypto';
import type { Database } from '@/integrations/supabase/types';

type WebhookRow = Database['public']['Tables']['webhooks']['Row'];
type WebhookDeliveryRow = Database['public']['Tables']['webhook_deliveries']['Row'];

export interface Webhook extends WebhookRow {}
export interface WebhookDelivery extends WebhookDeliveryRow {}

export class WebhookService {
  /**
   * Create a new webhook
   */
  static async createWebhook(
    organizationId: string,
    url: string,
    events: string[],
    description?: string
  ): Promise<Webhook | null> {
    // Generate secret for HMAC signature
    const secret = crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        organization_id: organizationId,
        url,
        secret,
        events,
        description,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create webhook:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all webhooks for an organization
   */
  static async getWebhooks(organizationId: string): Promise<Webhook[]> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch webhooks:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Update webhook
   */
  static async updateWebhook(
    webhookId: string,
    updates: Partial<Pick<Webhook, 'url' | 'events' | 'description' | 'is_active'>>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', webhookId);

    if (error) {
      console.error('Failed to update webhook:', error);
      return false;
    }

    return true;
  }

  /**
   * Delete webhook
   */
  static async deleteWebhook(webhookId: string): Promise<boolean> {
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) {
      console.error('Failed to delete webhook:', error);
      return false;
    }

    return true;
  }

  /**
   * Trigger webhook for an event
   */
  static async triggerWebhook(
    organizationId: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    // Get all active webhooks for this organization that listen to this event
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .contains('events', [eventType]);

    if (!webhooks || webhooks.length === 0) {
      return;
    }

    // Create delivery records for each webhook
    for (const webhook of webhooks) {
      await supabase
        .from('webhook_deliveries')
        .insert({
          webhook_id: webhook.id,
          event_type: eventType,
          payload: payload,
          status: 'pending',
        });
    }
  }

  /**
   * Get webhook deliveries
   */
  static async getWebhookDeliveries(
    webhookId: string,
    limit: number = 50
  ): Promise<WebhookDelivery[]> {
    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch webhook deliveries:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Retry failed webhook delivery
   */
  static async retryDelivery(deliveryId: string): Promise<boolean> {
    const { error } = await supabase
      .from('webhook_deliveries')
      .update({
        status: 'pending',
        next_retry_at: new Date().toISOString(),
      })
      .eq('id', deliveryId);

    if (error) {
      console.error('Failed to retry delivery:', error);
      return false;
    }

    return true;
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  static generateSignature(secret: string, payload: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  static verifySignature(
    secret: string,
    payload: string,
    signature: string
  ): boolean {
    const expectedSignature = this.generateSignature(secret, payload);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
