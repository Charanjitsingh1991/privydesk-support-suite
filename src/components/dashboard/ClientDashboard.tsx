import { Link } from 'react-router-dom';
import { PlusCircle, ArrowRight, MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ClientDashboardProps {
  organizationName?: string;
  primaryColor?: string;
}

// Mock data
const recentTickets = [
  { id: '1', subject: 'Cannot access my account', status: 'open', createdAt: '2 hours ago' },
  { id: '2', subject: 'Payment failed', status: 'in_progress', createdAt: '1 day ago' },
  { id: '3', subject: 'Feature request: Dark mode', status: 'resolved', createdAt: '3 days ago' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

export function ClientDashboard({ organizationName = 'Your Organization' }: ClientDashboardProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Welcome to {organizationName}</h2>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                How can we help you today? Create a new ticket or check on existing ones.
              </p>
            </div>
            <Button asChild size="lg" className="w-full md:w-auto md:self-start touch-target">
              <Link to="/dashboard/tickets/new">
                <PlusCircle className="h-5 w-5 mr-2" />
                Create New Ticket
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Recent Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 md:px-6">
            <CardTitle className="text-base font-medium">Recent Tickets</CardTitle>
            <Button variant="ghost" size="sm" asChild className="touch-target">
              <Link to="/dashboard/tickets">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="space-y-2 md:space-y-3">
              {recentTickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/dashboard/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors touch-target"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-medium truncate text-sm md:text-base">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground">{ticket.createdAt}</p>
                  </div>
                  <Badge variant="secondary" className={cn('shrink-0 text-xs', getStatusColor(ticket.status))}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </Link>
              ))}
              {recentTickets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tickets yet.</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/dashboard/tickets/new">Create your first ticket</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Help */}
        <div className="space-y-6">
          {/* Active Conversations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Active Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active chats</p>
                <Button variant="link" size="sm" asChild>
                  <Link to="/dashboard/chat">Start a conversation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search help articles..."
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Find answers to common questions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
