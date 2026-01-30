import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type MobileDeviceRow = Database['public']['Tables']['mobile_devices']['Row'];
type PushNotificationRow = Database['public']['Tables']['push_notifications']['Row'];
type MobileAppSessionRow = Database['public']['Tables']['mobile_app_sessions']['Row'];
type OfflineSyncQueueRow = Database['public']['Tables']['offline_sync_queue']['Row'];

export interface MobileDevice extends MobileDeviceRow {}
export interface PushNotification extends PushNotificationRow {}
export interface MobileAppSession extends MobileAppSessionRow {}
export interface OfflineSyncQueue extends OfflineSyncQueueRow {}

export class MobileService {
  /**
   * Register mobile device
   */
  static async registerDevice(
    userId: string,
    organizationId: string,
    device: {
      device_token: string;
      device_type: string;
      device_name?: string;
      os_version?: string;
      app_version?: string;
    }
  ): Promise<MobileDevice | null> {
    // Check if device already registered
    const { data: existing } = await supabase
      .from('mobile_devices')
      .select('*')
      .eq('user_id', userId)
      .eq('device_token', device.device_token)
      .single();

    if (existing) {
      // Update existing device
      const { data, error } = await supabase
        .from('mobile_devices')
        .update({
          ...device,
          is_active: true,
          last_active_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      return error ? null : data;
    }

    // Register new device
    const { data, error } = await supabase
      .from('mobile_devices')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        is_active: true,
        ...device,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to register device:', error);
      return null;
    }

    return data;
  }

  /**
   * Unregister device
   */
  static async unregisterDevice(deviceId: string): Promise<boolean> {
    const { error } = await supabase
      .from('mobile_devices')
      .update({ is_active: false })
      .eq('id', deviceId);

    return !error;
  }

  /**
   * Get user devices
   */
  static async getUserDevices(userId: string): Promise<MobileDevice[]> {
    const { data, error } = await supabase
      .from('mobile_devices')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_active_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch devices:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Send push notification
   */
  static async sendPushNotification(
    userId: string,
    notification: {
      title: string;
      body: string;
      data?: any;
      action_url?: string;
    }
  ): Promise<PushNotification | null> {
    const { data, error } = await supabase
      .from('push_notifications')
      .insert({
        user_id: userId,
        status: 'pending',
        ...notification,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create push notification:', error);
      return null;
    }

    // Get user's devices
    const devices = await this.getUserDevices(userId);

    // In production, send to FCM/APNS
    for (const device of devices) {
      console.log('Sending push to device:', device.device_token);
      // await sendToFCM(device.device_token, notification);
    }

    // Update status
    await supabase
      .from('push_notifications')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    return data;
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 50
  ): Promise<PushNotification[]> {
    const { data, error } = await supabase
      .from('push_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Mark notification as read
   */
  static async markNotificationRead(notificationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('push_notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    return !error;
  }

  /**
   * Create app session
   */
  static async createSession(
    userId: string,
    deviceId: string
  ): Promise<MobileAppSession | null> {
    const { data, error } = await supabase
      .from('mobile_app_sessions')
      .insert({
        user_id: userId,
        device_id: deviceId,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create session:', error);
      return null;
    }

    return data;
  }

  /**
   * End app session
   */
  static async endSession(sessionId: string): Promise<boolean> {
    const { data: session } = await supabase
      .from('mobile_app_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();

    if (!session) return false;

    const endedAt = new Date();
    const startedAt = new Date(session.started_at);
    const duration = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

    const { error } = await supabase
      .from('mobile_app_sessions')
      .update({ 
        ended_at: endedAt.toISOString(),
        duration_seconds: duration,
      })
      .eq('id', sessionId);

    return !error;
  }

  /**
   * Add to offline sync queue
   */
  static async addToSyncQueue(
    userId: string,
    deviceId: string,
    action: {
      action_type: string;
      entity_type: string;
      entity_id?: string;
      data: any;
    }
  ): Promise<OfflineSyncQueue | null> {
    const { data, error } = await supabase
      .from('offline_sync_queue')
      .insert({
        user_id: userId,
        device_id: deviceId,
        status: 'pending',
        ...action,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add to sync queue:', error);
      return null;
    }

    return data;
  }

  /**
   * Process sync queue
   */
  static async processSyncQueue(deviceId: string): Promise<number> {
    const { data: items } = await supabase
      .from('offline_sync_queue')
      .select('*')
      .eq('device_id', deviceId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (!items || items.length === 0) return 0;

    let processed = 0;

    for (const item of items) {
      try {
        // Process the sync action
        // In production, execute the actual action
        console.log('Processing sync:', item);

        await supabase
          .from('offline_sync_queue')
          .update({ 
            status: 'completed',
            synced_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        processed++;
      } catch (error) {
        await supabase
          .from('offline_sync_queue')
          .update({ 
            status: 'failed',
            error_message: (error as Error).message,
          })
          .eq('id', item.id);
      }
    }

    return processed;
  }

  /**
   * Get sync queue status
   */
  static async getSyncQueueStatus(deviceId: string): Promise<{
    pending: number;
    completed: number;
    failed: number;
  }> {
    const { data: items } = await supabase
      .from('offline_sync_queue')
      .select('status')
      .eq('device_id', deviceId);

    if (!items) {
      return { pending: 0, completed: 0, failed: 0 };
    }

    return {
      pending: items.filter(i => i.status === 'pending').length,
      completed: items.filter(i => i.status === 'completed').length,
      failed: items.filter(i => i.status === 'failed').length,
    };
  }
}
