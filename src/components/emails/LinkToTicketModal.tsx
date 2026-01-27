import { useState, useEffect } from 'react';
import { Search, Ticket, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
}

interface LinkToTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLink: (ticketId: string) => void;
  loading?: boolean;
}

export function LinkToTicketModal({
  open,
  onOpenChange,
  onLink,
  loading = false
}: LinkToTicketModalProps) {
  const { organizationId } = useUser();
  const [search, setSearch] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (open && organizationId) {
      searchTickets('');
    }
  }, [open, organizationId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        searchTickets(search);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, open]);

  const searchTickets = async (query: string) => {
    if (!organizationId) return;

    setSearching(true);
    try {
      let q = supabase
        .from('tickets')
        .select('id, subject, status, created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (query) {
        q = q.or(`subject.ilike.%${query}%,id.ilike.%${query}%`);
      }

      const { data, error } = await q;
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Failed to search tickets:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleLink = () => {
    if (selectedId) {
      onLink(selectedId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'resolved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'closed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Link to Ticket</DialogTitle>
          <DialogDescription>
            Search for a ticket to link this email to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket ID or subject..."
              className="pl-10"
            />
          </div>

          {/* Ticket List */}
          <ScrollArea className="h-[300px] border rounded-lg">
            {searching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Ticket className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No tickets found</p>
              </div>
            ) : (
              <div className="divide-y">
                {tickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedId(ticket.id)}
                    className={cn(
                      'p-3 cursor-pointer hover:bg-muted/50 transition-colors',
                      selectedId === ticket.id && 'bg-primary/10 border-l-2 border-primary'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">
                        {ticket.subject}
                      </p>
                      <Badge className={cn('shrink-0', getStatusColor(ticket.status))}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      #{ticket.id.slice(0, 8)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleLink} 
            disabled={!selectedId || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Link Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
