import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TicketFilters, TicketFiltersState } from '@/components/tickets/TicketFilters';
import { TicketsTable } from '@/components/tickets/TicketsTable';
import { TicketsKanban } from '@/components/tickets/TicketsKanban';
import { CreateTicketModal } from '@/components/tickets/CreateTicketModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Tag, UserPlus, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Tickets() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<TicketFiltersState>({
    search: '',
    statuses: [],
    priorities: [],
    assignedTo: null,
    dateRange: undefined,
    tags: [],
    sortBy: 'newest',
  });

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setSelectedTickets([]);
  }, []);

  const handleBulkAction = (action: string) => {
    toast.info(`Bulk action "${action}" for ${selectedTickets.length} tickets`);
    // TODO: Implement bulk actions
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tickets</h1>
            <p className="text-muted-foreground">Manage and track all support tickets</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <TicketFilters
              filters={filters}
              onFiltersChange={setFilters}
              view={view}
              onViewChange={setView}
            />
          </CardContent>
        </Card>

        {/* Bulk actions toolbar */}
        {selectedTickets.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in">
            <span className="text-sm font-medium">
              {selectedTickets.length} ticket{selectedTickets.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign to...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('assign')}>
                    Assign to Me
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Change status...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('status-open')}>
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('status-in_progress')}>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('status-resolved')}>
                    Resolved
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" onClick={() => handleBulkAction('tag')}>
                <Tag className="h-4 w-4 mr-2" />
                Add tags
              </Button>

              <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTickets([])}
              >
                Clear selection
              </Button>
            </div>
          </div>
        )}

        {/* Tickets display */}
        <Card>
          <CardContent className={view === 'kanban' ? 'p-4' : 'p-0'}>
            {view === 'list' ? (
              <TicketsTable
                key={refreshKey}
                filters={filters}
                selectedTickets={selectedTickets}
                onSelectionChange={setSelectedTickets}
                onRefresh={handleRefresh}
              />
            ) : (
              <TicketsKanban
                key={refreshKey}
                filters={filters}
                onRefresh={handleRefresh}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleRefresh}
      />
    </DashboardLayout>
  );
}
