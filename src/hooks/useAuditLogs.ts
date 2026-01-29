import { useState, useEffect } from 'react';
import { AuditLogService } from '@/lib/services/auditLogService';
import { useToast } from '@/hooks/use-toast';

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  before_snapshot: any;
  after_snapshot: any;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
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
      setLogs(data);
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
  }, [organizationId]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    exportLogs,
  };
}
