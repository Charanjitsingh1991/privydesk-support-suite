import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TicketTimeline, TimelineEvent } from '@/components/tickets/TicketTimeline';
import { MessageComposer } from '@/components/tickets/MessageComposer';
import {
  ArrowLeft,
  MoreHorizontal,
  Printer,
  FileDown,
  Share2,
  Trash2,
  Clock,
  Calendar,
  Tag,
  User,
  Building2,
  Paperclip,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import type { Ticket, Profile, TicketStatus, TicketPriority, Message } from '@/types/database';

interface TicketWithRelations extends Ticket {
  creator?: Profile;
  assignee?: Profile;
}

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_customer', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId, role } = useUser();

  const [ticket, setTicket] = useState<TicketWithRelations | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const canEdit = role === 'admin' || role === 'agent' || role === 'super_admin';

  const fetchTicket = useCallback(async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        creator:profiles!tickets_created_by_fkey(*),
        assignee:profiles!tickets_assigned_to_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Ticket not found');
      navigate('/dashboard/tickets');
      return;
    }

    setTicket(data as TicketWithRelations);
  }, [id, navigate]);

  const fetchMessages = useCallback(async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
    }
  }, [id]);

  const fetchAgents = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'agent'])
      .eq('is_active', true);
    if (data) setAgents(data as Profile[]);
  }, []);

  useEffect(() => {
    Promise.all([fetchTicket(), fetchMessages(), fetchAgents()]).finally(() => {
      setLoading(false);
    });
  }, [fetchTicket, fetchMessages, fetchAgents]);

  // Real-time subscription
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`ticket-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${id}`,
        },
        () => {
          fetchTicket();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, fetchMessages, fetchTicket]);

  const updateTicket = async (updates: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assigned_to?: string | null;
    category?: string;
    due_date?: string | null;
  }) => {
    if (!id || !canEdit) return;

    setUpdating(true);
    const { error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update ticket');
    } else {
      toast.success('Ticket updated');
      fetchTicket();
    }
    setUpdating(false);
  };

  const handleCloseTicket = () => {
    updateTicket({ status: 'closed' });
  };

  const handleReopenTicket = () => {
    updateTicket({ status: 'open' });
  };

  // Convert messages to timeline events
  const getTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Add original description as first event
    if (ticket?.creator) {
      events.push({
        id: 'original',
        type: 'message',
        content: ticket.description,
        user: ticket.creator,
        created_at: ticket.created_at,
      });
    }

    // Add messages
    messages.forEach((msg) => {
      // Find user - for now just use a placeholder since we don't have joined user data
      const user: Profile = {
        id: msg.user_id,
        email: '',
        full_name: 'User',
        role: 'client',
        organization_id: null,
        avatar_url: null,
        is_active: true,
        email_verified: true,
        last_login_at: null,
        created_at: '',
        updated_at: '',
        preferences: {},
      };

      events.push({
        id: msg.id,
        type: msg.is_internal ? 'internal_note' : 'message',
        content: msg.content,
        user,
        created_at: msg.created_at || '',
        metadata: {
          is_internal: msg.is_internal || false,
          attachments: (msg.attachments as any[])?.map((a: any) => a.url) || [],
        },
      });
    });

    return events.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Ticket not found</h2>
          <Button asChild className="mt-4">
            <Link to="/dashboard/tickets">Back to Tickets</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  #{ticket.id.slice(0, 8)}
                </Badge>
                <h1 className="text-xl font-bold">{ticket.subject}</h1>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isClosed ? (
              <Button variant="outline" onClick={handleReopenTicket} disabled={!canEdit}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reopen
              </Button>
            ) : (
              <Button variant="outline" onClick={handleCloseTicket} disabled={!canEdit}>
                <Check className="h-4 w-4 mr-2" />
                Close Ticket
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Ticket
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </DropdownMenuItem>
                {role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Ticket
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <TicketTimeline events={getTimelineEvents()} />
              </CardContent>
            </Card>

            {/* Composer */}
            <Card className="overflow-hidden">
              <MessageComposer
                ticketId={ticket.id}
                onMessageSent={fetchMessages}
                disabled={isClosed}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {canEdit ? (
                    <Select
                      value={ticket.status}
                      onValueChange={(v) => updateTicket({ status: v as TicketStatus })}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <StatusBadge status={ticket.status} />
                  )}
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Priority</span>
                  {canEdit ? (
                    <Select
                      value={ticket.priority}
                      onValueChange={(v) => updateTicket({ priority: v as TicketPriority })}
                      disabled={updating}
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <PriorityBadge priority={ticket.priority} />
                  )}
                </div>

                <Separator />

                {/* Assigned to */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Assigned
                  </span>
                  {canEdit ? (
                    <Select
                      value={ticket.assigned_to || 'unassigned'}
                      onValueChange={(v) =>
                        updateTicket({ assigned_to: v === 'unassigned' ? null : v })
                      }
                      disabled={updating}
                    >
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={agent.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">
                                  {agent.full_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {agent.full_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : ticket.assignee ? (
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
                </div>

                {/* Category */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Category
                  </span>
                  <Badge variant="secondary">{ticket.category || 'General'}</Badge>
                </div>

                {/* Due date */}
                {ticket.due_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due Date
                    </span>
                    <span className="text-sm">
                      {format(new Date(ticket.due_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}

                <Separator />

                {/* Creator */}
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Created by</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={ticket.creator?.avatar_url || undefined} />
                      <AvatarFallback>
                        {ticket.creator?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{ticket.creator?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time tracking */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm')}</span>
                </div>
                {ticket.first_response_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">First Response</span>
                    <span>
                      {formatDistanceToNow(new Date(ticket.first_response_at))}
                    </span>
                  </div>
                )}
                {ticket.resolved_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Resolved</span>
                    <span>{format(new Date(ticket.resolved_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>
                    {formatDistanceToNow(new Date(ticket.updated_at || ticket.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
