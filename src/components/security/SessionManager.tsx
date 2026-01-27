import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe,
  LogOut,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useUserSessions } from '@/hooks/useSecurity';
import { formatDistanceToNow } from 'date-fns';

export function SessionManager() {
  const { sessions, loading, fetchSessions, terminateSession, terminateAllSessions } = useUserSessions();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getLocationString = (geoLocation: { country?: string; city?: string; region?: string } | null) => {
    if (!geoLocation) return 'Unknown location';
    const parts = [geoLocation.city, geoLocation.region, geoLocation.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown location';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage your active login sessions across devices
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={() => terminateAllSessions(true)}
            disabled={sessions.length <= 1}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout All Other
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mb-2" />
            <p>No active sessions</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className={`flex items-start justify-between p-4 rounded-lg border ${
                    session.is_current ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getDeviceIcon(session.device_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {session.browser || 'Unknown Browser'} on {session.os || 'Unknown OS'}
                        </span>
                        {session.is_current && (
                          <Badge variant="default" className="text-xs">
                            Current Session
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getLocationString(session.geo_location)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        IP: {session.ip_address || 'Unknown'}
                      </p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>
                          Started: {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                        </span>
                        <span>
                          Last activity: {formatDistanceToNow(new Date(session.last_activity_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Expires: {formatDistanceToNow(new Date(session.expires_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {!session.is_current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => terminateSession(session.id)}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
