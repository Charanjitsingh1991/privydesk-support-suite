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
  CheckCircle2,
  MapPin,
  Clock,
} from 'lucide-react';
import { useUserSessions } from '@/hooks/useSecurity';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SessionManagerProps {
  showCard?: boolean;
  maxHeight?: string;
  className?: string;
}

export function SessionManager({ 
  showCard = true, 
  maxHeight = '400px',
  className 
}: SessionManagerProps) {
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

  const content = (
    <>
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
        <ScrollArea className={cn(maxHeight && `h-[${maxHeight}]`)}>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className={cn(
                  'flex items-start justify-between p-4 rounded-lg border transition-colors',
                  session.is_current 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1 p-2 rounded-full bg-muted">
                    {getDeviceIcon(session.device_type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {session.browser || 'Unknown Browser'}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        on {session.os || 'Unknown OS'}
                      </span>
                      {session.is_current && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {getLocationString(session.geo_location)}
                      <span className="mx-1">•</span>
                      IP: {session.ip_address || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Active {formatDistanceToNow(new Date(session.last_activity_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                {!session.is_current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => terminateSession(session.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </>
  );

  if (!showCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
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
        {content}
      </CardContent>
    </Card>
  );
}
