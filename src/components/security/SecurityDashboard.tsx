import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  RefreshCw
} from 'lucide-react';
import { useSecurityEvents, useFlaggedContent, usePendingClients } from '@/hooks/useSecurity';
import { formatDistanceToNow } from 'date-fns';

export function SecurityDashboard() {
  const { events, loading: eventsLoading, fetchEvents } = useSecurityEvents();
  const { flaggedItems, loading: flaggedLoading, fetchFlaggedContent } = useFlaggedContent();
  const { pendingClients, loading: pendingLoading, fetchPendingClients } = usePendingClients();
  
  const [stats, setStats] = useState({
    failedLogins24h: 0,
    virusDetected24h: 0,
    suspiciousLinks24h: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      await Promise.all([
        fetchEvents({ dateFrom: yesterday.toISOString(), limit: 100 }),
        fetchFlaggedContent(),
        fetchPendingClients(),
      ]);
    };
    loadData();
  }, [fetchEvents, fetchFlaggedContent, fetchPendingClients]);

  useEffect(() => {
    setStats({
      failedLogins24h: events.filter(e => e.event_type === 'failed_login').length,
      virusDetected24h: events.filter(e => e.event_type === 'virus_detected').length,
      suspiciousLinks24h: events.filter(e => e.event_type === 'suspicious_link').length,
      pendingApprovals: pendingClients.length,
    });
  }, [events, pendingClients]);

  const handleRefresh = () => {
    fetchEvents();
    fetchFlaggedContent();
    fetchPendingClients();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'failed_login': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'virus_detected': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'suspicious_link': return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'new_device_login': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">Monitor security events and threats</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedLogins24h}</div>
            <p className="text-xs text-muted-foreground">
              {stats.failedLogins24h === 0 ? 'No failed attempts' : 'Review for patterns'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viruses Detected (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.virusDetected24h}</div>
            <p className="text-xs text-muted-foreground">
              {stats.virusDetected24h === 0 ? 'All clear' : 'Files blocked'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Links (24h)</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspiciousLinks24h}</div>
            <p className="text-xs text-muted-foreground">
              {stats.suspiciousLinks24h === 0 ? 'No threats' : 'Links blocked'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingApprovals === 0 ? 'Nothing pending' : 'Clients awaiting review'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>Last 24 hours of security activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {eventsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mb-2" />
                  <p>No security events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 10).map((event) => (
                    <div 
                      key={event.id} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      {getEventIcon(event.event_type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {event.event_type.replace(/_/g, ' ')}
                          </span>
                          <Badge variant={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {event.ip_address && `IP: ${event.ip_address}`}
                          {event.details && typeof event.details === 'object' && 
                            (event.details as any).email && ` • ${(event.details as any).email}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Flagged Content */}
        <Card>
          <CardHeader>
            <CardTitle>Flagged Content</CardTitle>
            <CardDescription>Content pending review</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {flaggedLoading ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : flaggedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mb-2" />
                  <p>No flagged content</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flaggedItems.slice(0, 10).map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm capitalize">
                            {item.content_type}
                          </span>
                          <Badge variant={getSeverityColor(item.severity)}>
                            {item.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.reason}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
