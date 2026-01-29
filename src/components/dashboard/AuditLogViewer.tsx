import { useState } from 'react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogViewerProps {
  organizationId: string;
}

export function AuditLogViewer({ organizationId }: AuditLogViewerProps) {
  const { logs, loading, fetchLogs, exportLogs } = useAuditLogs(organizationId);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.user?.email?.toLowerCase().includes(searchLower) ||
      log.resource_type?.toLowerCase().includes(searchLower)
    );
  });

  const handleExport = () => {
    exportLogs(startDate, endDate);
  };

  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-500/10 text-green-500';
    if (action.includes('updated')) return 'bg-blue-500/10 text-blue-500';
    if (action.includes('deleted')) return 'bg-red-500/10 text-red-500';
    if (action.includes('security')) return 'bg-yellow-500/10 text-yellow-500';
    return 'bg-gray-500/10 text-gray-500';
  };

  return (
    <Card className="bg-[#1a1a1a] border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Audit Logs</CardTitle>
            <CardDescription className="text-gray-400">
              Track all admin actions and security events
            </CardDescription>
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/20 border-white/10 text-white"
            />
          </div>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No audit logs found</div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      {log.resource_type && (
                        <span className="text-sm text-gray-400">
                          {log.resource_type}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300">
                      <span className="font-medium text-white">
                        {log.user?.full_name || log.user?.email || 'System'}
                      </span>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <span className="text-gray-500 ml-2">
                          {JSON.stringify(log.metadata)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div>{format(new Date(log.created_at), 'MMM dd, yyyy')}</div>
                    <div>{format(new Date(log.created_at), 'HH:mm:ss')}</div>
                  </div>
                </div>
                {log.ip_address && (
                  <div className="mt-2 text-xs text-gray-500">
                    IP: {log.ip_address}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
