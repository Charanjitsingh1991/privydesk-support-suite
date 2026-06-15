import { useState, useEffect } from 'react';
import { AuditLogService } from '@/lib/services/auditLogService';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AuditLogRow = Database['public']['Tables']['audit_logs']['Row'];

export interface AuditLog extends Omit<AuditLogRow, 'metadata'> {
  metadata: Record<string, unknown>;
  user?: {
    email: string;
    full_name: string;
  };
}

export function useAuditLogs(organizationId: string) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLogs = async (options?: {
    limit?: number;
    offset?: number;
    action?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await AuditLogService.getLogs(organizationId, options);
      // Cast metadata from Json to Record<string, unknown>
      const typedLogs = data.map(log => ({
        ...log,
        metadata: (log.metadata as Record<string, unknown>) || {},
      })) as AuditLog[];
      setLogs(typedLogs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch audit logs';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async (startDate: Date, endDate: Date) => {
    try {
      const csv = await AuditLogService.exportLogs(organizationId, startDate, endDate);
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Audit logs exported successfully',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export audit logs';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchLogs();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    exportLogs,
  };
}
