import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PriorityBadge } from '@/components/ui/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MessageSquare, Paperclip, Plus, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Ticket, Profile, TicketStatus } from '@/types/database';
import type { TicketFiltersState } from './TicketFilters';

interface TicketWithRelations extends Ticket {
  creator?: Profile;
  assignee?: Profile;
  message_count?: number;
}

interface TicketsKanbanProps {
  filters: TicketFiltersState;
  onRefresh: () => void;
}

const COLUMNS: { status: TicketStatus; label: string; color: string }[] = [
  { status: 'open', label: 'Open', color: 'bg-status-open' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-status-in-progress' },
  { status: 'waiting_customer', label: 'Waiting', color: 'bg-status-waiting' },
  { status: 'resolved', label: 'Resolved', color: 'bg-status-resolved' },
  { status: 'closed', label: 'Closed', color: 'bg-status-closed' },
];

function TicketCard({
  ticket,
  onDragStart,
}: {
  ticket: TicketWithRelations;
  onDragStart: (e: React.DragEvent, ticket: TicketWithRelations) => void;
}) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, ticket)}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/dashboard/tickets/${ticket.id}`}
            className="font-medium text-sm line-clamp-2 hover:text-primary"
          >
            {ticket.subject}
          </Link>
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            #{ticket.id.slice(0, 8)}
          </span>
          <PriorityBadge priority={ticket.priority} className="text-[10px] px-1.5 py-0" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {ticket.assignee ? (
              <Avatar className="h-5 w-5">
                <AvatarImage src={ticket.assignee.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {ticket.assignee.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">?</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              <span className="text-xs">{ticket.message_count || 0}</span>
            </div>
            {ticket.metadata && Object.keys(ticket.metadata).length > 0 && (
              <Paperclip className="h-3 w-3" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({
  column,
  tickets,
  onDrop,
  onDragOver,
  onDragStart,
  loading,
}: {
  column: (typeof COLUMNS)[0];
  tickets: TicketWithRelations[];
  onDrop: (e: React.DragEvent, status: TicketStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, ticket: TicketWithRelations) => void;
  loading: boolean;
}) {
  return (
    <div
      className="flex flex-col w-72 shrink-0 bg-muted/30 rounded-lg"
      onDrop={(e) => onDrop(e, column.status)}
      onDragOver={onDragOver}
    >
      {/* Column header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', column.color)} />
          <h3 className="font-medium text-sm">{column.label}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {tickets.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
          <Link to="/dashboard/tickets/new">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Column content */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2 min-h-[200px]">
          {loading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No tickets
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} onDragStart={onDragStart} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function TicketsKanban({ filters, onRefresh }: TicketsKanbanProps) {
  const [tickets, setTickets] = useState<TicketWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTicket, setDraggedTicket] = useState<TicketWithRelations | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);

    let query = supabase.from('tickets').select(`
      *,
      creator:profiles!tickets_created_by_fkey(*),
      assignee:profiles!tickets_assigned_to_fkey(*)
    `);

    // Apply filters (excluding status for kanban view)
    if (filters.priorities.length > 0) {
      query = query.in('priority', filters.priorities);
    }
    if (filters.assignedTo === 'unassigned') {
      query = query.is('assigned_to', null);
    } else if (filters.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    if (filters.search) {
      query = query.or(
        `subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load tickets');
    } else {
      setTickets((data || []) as TicketWithRelations[]);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleDragStart = (e: React.DragEvent, ticket: TicketWithRelations) => {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TicketStatus) => {
    e.preventDefault();

    if (!draggedTicket || draggedTicket.status === newStatus) {
      setDraggedTicket(null);
      return;
    }

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) =>
        t.id === draggedTicket.id ? { ...t, status: newStatus } : t
      )
    );

    const { error } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', draggedTicket.id);

    if (error) {
      toast.error('Failed to update ticket status');
      // Revert on error
      setTickets((prev) =>
        prev.map((t) =>
          t.id === draggedTicket.id ? { ...t, status: draggedTicket.status } : t
        )
      );
    } else {
      toast.success(`Ticket moved to ${COLUMNS.find((c) => c.status === newStatus)?.label}`);
    }

    setDraggedTicket(null);
  };

  const getTicketsByStatus = (status: TicketStatus) =>
    tickets.filter((t) => t.status === status);

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            column={column}
            tickets={getTicketsByStatus(column.status)}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            loading={loading}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
