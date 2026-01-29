import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import { formatDistanceToNow } from 'date-fns';
import { Ticket, CheckCircle, UserPlus, AlertCircle, MessageSquare } from 'lucide-react';

interface Activity {
  id: string;
  type: 'created' | 'resolved' | 'assigned' | 'status_changed' | 'message';
  ticketId: string;
  ticketSubject: string;
  timestamp: string;
  details?: string;
}

export function RecentActivityFeed() {
  const { organizationId } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentTickets() {
      if (!organizationId) return;

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('id, subject, status, created_at, updated_at, resolved_at, assigned_to')
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (!error && tickets) {
        const activityList: Activity[] = tickets.map(ticket => {
          if (ticket.resolved_at) {
            return {
              id: `${ticket.id}-resolved`,
              type: 'resolved' as const,
              ticketId: ticket.id,
              ticketSubject: ticket.subject,
              timestamp: ticket.resolved_at
            };
          }
          if (ticket.assigned_to) {
            return {
              id: `${ticket.id}-assigned`,
              type: 'assigned' as const,
              ticketId: ticket.id,
              ticketSubject: ticket.subject,
              timestamp: ticket.updated_at
            };
          }
          return {
            id: `${ticket.id}-created`,
            type: 'created' as const,
            ticketId: ticket.id,
            ticketSubject: ticket.subject,
            timestamp: ticket.created_at
          };
        });

        setActivities(activityList.slice(0, 10));
      }
      setLoading(false);
    }

    fetchRecentTickets();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('ticket-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newTicket = payload.new as any;
            const newActivity: Activity = {
              id: `${newTicket.id}-created-${Date.now()}`,
              type: 'created',
              ticketId: newTicket.id,
              ticketSubject: newTicket.subject,
              timestamp: newTicket.created_at
            };
            setActivities(prev => [newActivity, ...prev].slice(0, 10));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return <Ticket className="h-4 w-4 text-primary" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'assigned':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'status_changed':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Ticket className="h-4 w-4" />;
    }
  };

  const getActivityLabel = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return 'New ticket';
      case 'resolved':
        return 'Resolved';
      case 'assigned':
        return 'Assigned';
      case 'status_changed':
        return 'Status changed';
      case 'message':
        return 'New message';
      default:
        return 'Activity';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
          <Badge variant="outline" className="text-green-600">
            <span className="mr-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        <Badge variant="outline" className="text-green-600">
          <span className="mr-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </Badge>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getActivityLabel(activity.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate mt-1">
                    {activity.ticketSubject}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
