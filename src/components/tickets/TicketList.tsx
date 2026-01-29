import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import type { Ticket, Profile } from '@/types/database';

interface TicketWithCreator extends Ticket {
  creator?: Profile;
  assignee?: Profile;
}

export function TicketList() {
  const [tickets, setTickets] = useState<TicketWithCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          creator:profiles!tickets_created_by_fkey(*),
          assignee:profiles!tickets_assigned_to_fkey(*)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setTickets(data as TicketWithCreator[]);
      }
      setLoading(false);
    }

    fetchTickets();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tickets yet</p>
            <Link
              to="/dashboard/tickets/new"
              className="text-primary hover:underline text-sm mt-2 inline-block"
            >
              Create your first ticket
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Tickets</CardTitle>
        <Link
          to="/dashboard/tickets"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/dashboard/tickets/${ticket.id}`}
              className="flex items-start gap-4 py-4 hover:bg-muted/50 -mx-4 px-4 transition-colors first:pt-0 last:pb-0"
            >
              <Avatar className="h-10 w-10 mt-0.5">
                <AvatarImage src={ticket.creator?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {ticket.creator?.full_name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{ticket.subject}</p>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {ticket.description}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{ticket.creator?.full_name || 'Unknown'}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                  {ticket.assignee && (
                    <>
                      <span>•</span>
                      <span>Assigned to {ticket.assignee.full_name}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
