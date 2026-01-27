import { Ticket, Clock, CheckCircle, Timer } from 'lucide-react';
import { StatCard } from './StatCard';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useUser } from '@/hooks/useSession';

// Mock data
const assignedTickets = [
  { id: '1', subject: 'Payment processing error', priority: 'high', client: 'Acme Corp', createdAt: '1 hour ago' },
  { id: '2', subject: 'Login issues for team', priority: 'medium', client: 'TechStart Inc', createdAt: '3 hours ago' },
  { id: '3', subject: 'Feature inquiry', priority: 'low', client: 'Global LLC', createdAt: '5 hours ago' },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

export function AgentDashboard() {
  const { role } = useUser();
  const isAdmin = role === 'admin';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Tickets"
          value={12}
          change={{ value: 8, trend: 'up' }}
          icon={Ticket}
          description="vs last week"
        />
        <StatCard
          title="In Progress"
          value={5}
          change={{ value: 2, trend: 'down' }}
          icon={Clock}
          description="vs last week"
        />
        <StatCard
          title="Resolved Today"
          value={8}
          change={{ value: 15, trend: 'up' }}
          icon={CheckCircle}
          description="vs yesterday"
        />
        <StatCard
          title="Avg Response Time"
          value="2.4h"
          change={{ value: 12, trend: 'down' }}
          icon={Timer}
          description="vs last week"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tickets Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              {isAdmin ? 'All Open Tickets' : 'My Assigned Tickets'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignedTickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/dashboard/tickets/${ticket.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.client} • {ticket.createdAt}
                    </p>
                  </div>
                  <Badge variant="secondary" className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <RecentActivity maxItems={4} />
          <QuickActions />
        </div>
      </div>

      {/* Team Performance (Admin only) */}
      {isAdmin && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <p>Performance chart coming soon</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
