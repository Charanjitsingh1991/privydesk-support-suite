import { supabase } from '@/lib/supabase';

export interface AuditLogEntry {
  action: string;
  resourceType?: string;
  resourceId?: string;
  beforeSnapshot?: any;
  afterSnapshot?: any;
  metadata?: Record<string, any>;
}

export class AuditLogService {
  /**
   * Log an action to the audit trail
   */
  static async log(
    organizationId: string,
    userId: string | null,
    entry: AuditLogEntry
  ): Promise<void> {
    try {
      const { error } = await supabase.from('audit_logs').insert({
        organization_id: organizationId,
        user_id: userId,
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        before_snapshot: entry.beforeSnapshot,
        after_snapshot: entry.afterSnapshot,
        metadata: entry.metadata || {},
        ip_address: null, // Will be populated by middleware
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });

      if (error) {
        console.error('Failed to create audit log:', error);
      }
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  /**
   * Log ticket creation
   */
  static async logTicketCreated(
    organizationId: string,
    userId: string,
    ticketId: string,
    ticketData: any
  ): Promise<void> {
    await this.log(organizationId, userId, {
      action: 'ticket.created',
      resourceType: 'ticket',
      resourceId: ticketId,
      afterSnapshot: ticketData,
    });
  }

  /**
   * Log ticket update
   */
  static async logTicketUpdated(
    organizationId: string,
    userId: string,
    ticketId: string,
    before: any,
    after: any
  ): Promise<void> {
    await this.log(organizationId, userId, {
      action: 'ticket.updated',
      resourceType: 'ticket',
      resourceId: ticketId,
      beforeSnapshot: before,
      afterSnapshot: after,
    });
  }

  /**
   * Log user action
   */
  static async logUserAction(
    organizationId: string,
    userId: string,
    action: string,
    targetUserId: string,
    data?: any
  ): Promise<void> {
    await this.log(organizationId, userId, {
      action: `user.${action}`,
      resourceType: 'user',
      resourceId: targetUserId,
      afterSnapshot: data,
    });
  }

  /**
   * Log settings change
   */
  static async logSettingsChanged(
    organizationId: string,
    userId: string,
    settingType: string,
    before: any,
    after: any
  ): Promise<void> {
    await this.log(organizationId, userId, {
      action: 'settings.changed',
      resourceType: settingType,
      beforeSnapshot: before,
      afterSnapshot: after,
    });
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(
    organizationId: string,
    userId: string | null,
    event: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log(organizationId, userId, {
      action: `security.${event}`,
      metadata,
    });
  }

  /**
   * Get audit logs for an organization
   */
  static async getLogs(
    organizationId: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    let query = supabase
      .from('audit_logs')
      .select('*, user:users(email, full_name)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (options?.action) {
      query = query.eq('action', options.action);
    }

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options?.startDate) {
      query = query.gte('created_at', options.startDate.toISOString());
    }

    if (options?.endDate) {
      query = query.lte('created_at', options.endDate.toISOString());
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Export audit logs as CSV
   */
  static async exportLogs(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<string> {
    const logs = await this.getLogs(organizationId, {
      startDate,
      endDate,
      limit: 10000,
    });

    const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'Details'];
    const rows = logs.map((log: any) => [
      new Date(log.created_at).toISOString(),
      log.user?.email || 'System',
      log.action,
      log.resource_type || '',
      log.resource_id || '',
      JSON.stringify(log.metadata || {}),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return csv;
  }
}
