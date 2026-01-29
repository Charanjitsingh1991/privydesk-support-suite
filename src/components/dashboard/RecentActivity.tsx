import { formatDistanceToNow } from 'date-fns';
import { Ticket, MessageSquare, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Activity {
  id: string;
  type: 'ticket_created' | 'ticket_resolved' | 'message_sent' | 'user_joined' | 'status_change';
  description: string;
  actor: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Mock activities - in production these would come from Supabase
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'ticket_created',
    description: 'New ticket: "Unable to access dashboard"',
    actor: 'John Doe',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    type: 'ticket_resolved',
    description: 'Resolved ticket #1234',
    actor: 'Jane Smith',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '3',
    type: 'message_sent',
    description: 'Replied to ticket #1230',
    actor: 'Mike Johnson',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '4',
    type: 'user_joined',
    description: 'New team member added',
    actor: 'Sarah Wilson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '5',
    type: 'status_change',
    description: 'Ticket #1228 escalated to urgent',
    actor: 'Admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'ticket_created':
      return <Ticket className="h-4 w-4 text-blue-500" />;
    case 'ticket_resolved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'message_sent':
      return <MessageSquare className="h-4 w-4 text-purple-500" />;
    case 'user_joined':
      return <UserPlus className="h-4 w-4 text-orange-500" />;
    case 'status_change':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Ticket className="h-4 w-4" />;
  }
};

interface RecentActivityProps {
  className?: string;
  maxItems?: number;
}

export function RecentActivity({ className, maxItems = 5 }: RecentActivityProps) {
  const activities = mockActivities.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="space-y-0">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-3 px-6 py-3',
                  index !== activities.length - 1 && 'border-b'
                )}
              >
                <div className="mt-0.5 h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.actor} • {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
