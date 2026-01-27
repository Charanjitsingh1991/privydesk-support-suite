import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  MoreHorizontal,
  Eye,
  UserPlus,
  RefreshCw,
  Tag,
  Trash2,
  Paperclip,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import type { Ticket, Profile, TicketStatus, TicketPriority } from '@/types/database';
import type { TicketFiltersState } from './TicketFilters';

interface TicketWithRelations extends Ticket {
  creator?: Profile;
  assignee?: Profile;
}

interface TicketsTableProps {
  filters: TicketFiltersState;
  selectedTickets: string[];
  onSelectionChange: (selected: string[]) => void;
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 25;

const TicketRow = memo(function TicketRow({
  ticket,
  isSelected,
  onSelect,
  onAssignToMe,
  onStatusChange,
  userRole,
}: {
  ticket: TicketWithRelations;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onAssignToMe: (id: string) => void;
  onStatusChange: (id: string, status: TicketStatus) => void;
  userRole?: string;
}) {
  const hasAttachments = false; // TODO: Check metadata for attachments

  return (
    <TableRow className="group">
      <TableCell className="w-12">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(ticket.id, !!checked)}
        />
      </TableCell>
      <TableCell>
        <Link to={`/dashboard/tickets/${ticket.id}`} className="block">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground font-mono">
                  #{ticket.id.slice(0, 8)}
                </span>
              </TooltipTrigger>
              <TooltipContent>{ticket.id}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Link>
      </TableCell>
      <TableCell>
        <Link to={`/dashboard/tickets/${ticket.id}`} className="block">
          <div className="flex items-center gap-2">
            <span className="font-medium">{ticket.subject}</span>
            {hasAttachments && <Paperclip className="h-3 w-3 text-muted-foreground" />}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
            {ticket.description}
          </p>
        </Link>
      </TableCell>
      <TableCell>
        <StatusBadge status={ticket.status} />
      </TableCell>
      <TableCell>
        <PriorityBadge priority={ticket.priority} />
      </TableCell>
      <TableCell>
        {ticket.creator && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={ticket.creator.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {ticket.creator.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{ticket.creator.full_name}</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        {ticket.assignee ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={ticket.assignee.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {ticket.assignee.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{ticket.assignee.full_name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(ticket.updated_at || ticket.created_at), {
          addSuffix: true,
        })}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/dashboard/tickets/${ticket.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            {(userRole === 'admin' || userRole === 'agent') && (
              <>
                <DropdownMenuItem onClick={() => onAssignToMe(ticket.id)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign to Me
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'in_progress')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Mark In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(ticket.id, 'resolved')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Mark Resolved
                </DropdownMenuItem>
              </>
            )}
            {userRole === 'admin' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

export function TicketsTable({
  filters,
  selectedTickets,
  onSelectionChange,
  onRefresh,
}: TicketsTableProps) {
  const { userId, role } = useUser();
  const [tickets, setTickets] = useState<TicketWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchTickets = useCallback(
    async (pageNum: number, append: boolean = false) => {
      setLoading(true);

      let query = supabase
        .from('tickets')
        .select(
          `
          *,
          creator:profiles!tickets_created_by_fkey(*),
          assignee:profiles!tickets_assigned_to_fkey(*)
        `
        )
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      // Apply filters
      if (filters.statuses.length > 0) {
        query = query.in('status', filters.statuses);
      }
      if (filters.priorities.length > 0) {
        query = query.in('priority', filters.priorities);
      }
      if (filters.assignedTo === 'unassigned') {
        query = query.is('assigned_to', null);
      } else if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString());
      }
      if (filters.search) {
        query = query.or(
          `subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'priority':
          query = query.order('priority', { ascending: false });
          break;
        case 'status':
          query = query.order('status', { ascending: true });
          break;
        case 'updated':
          query = query.order('updated_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Failed to load tickets');
        setLoading(false);
        return;
      }

      const newTickets = (data || []) as TicketWithRelations[];
      setHasMore(newTickets.length === ITEMS_PER_PAGE);

      if (append) {
        setTickets((prev) => [...prev, ...newTickets]);
      } else {
        setTickets(newTickets);
      }
      setLoading(false);
    },
    [filters]
  );

  useEffect(() => {
    setPage(0);
    fetchTickets(0);
  }, [filters, fetchTickets]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTickets(nextPage, true);
  };

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedTickets, id]);
    } else {
      onSelectionChange(selectedTickets.filter((t) => t !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(tickets.map((t) => t.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleAssignToMe = async (ticketId: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to: userId })
      .eq('id', ticketId);

    if (error) {
      toast.error('Failed to assign ticket');
    } else {
      toast.success('Ticket assigned to you');
      onRefresh();
    }
  };

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    const { error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      onRefresh();
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-20" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎫</div>
        <h3 className="text-lg font-medium">No tickets found</h3>
        <p className="text-muted-foreground mb-4">
          {filters.search || filters.statuses.length > 0
            ? 'Try adjusting your filters'
            : 'Create your first ticket to get started'}
        </p>
        <Button asChild>
          <Link to="/dashboard/tickets/new">Create Ticket</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedTickets.length === tickets.length && tickets.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-24">ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="w-24">Priority</TableHead>
            <TableHead className="w-36">Client</TableHead>
            <TableHead className="w-36">Assigned</TableHead>
            <TableHead className="w-32">Updated</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TicketRow
              key={ticket.id}
              ticket={ticket}
              isSelected={selectedTickets.includes(ticket.id)}
              onSelect={handleSelect}
              onAssignToMe={handleAssignToMe}
              onStatusChange={handleStatusChange}
              userRole={role}
            />
          ))}
        </TableBody>
      </Table>

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
