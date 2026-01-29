import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, X, Calendar as CalendarIcon, LayoutGrid, List } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Profile, TicketStatus, TicketPriority } from '@/types/database';
import type { DateRange } from 'react-day-picker';

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

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'updated', label: 'Recently Updated' },
];

export interface TicketFiltersState {
  search: string;
  statuses: TicketStatus[];
  priorities: TicketPriority[];
  assignedTo: string | null;
  dateRange: DateRange | undefined;
  tags: string[];
  sortBy: string;
}

interface TicketFiltersProps {
  filters: TicketFiltersState;
  onFiltersChange: (filters: TicketFiltersState) => void;
  view: 'list' | 'kanban';
  onViewChange: (view: 'list' | 'kanban') => void;
}

export function TicketFilters({
  filters,
  onFiltersChange,
  view,
  onViewChange,
}: TicketFiltersProps) {
  const [agents, setAgents] = useState<Profile[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchAgents() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'agent'])
        .eq('is_active', true);
      if (data) setAgents(data as Profile[]);
    }
    fetchAgents();
  }, []);

  const updateFilter = <K extends keyof TicketFiltersState>(
    key: K,
    value: TicketFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <T extends string>(
    key: 'statuses' | 'priorities' | 'tags',
    value: T
  ) => {
    const current = filters[key] as T[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      statuses: [],
      priorities: [],
      assignedTo: null,
      dateRange: undefined,
      tags: [],
      sortBy: 'newest',
    });
  };

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assignedTo !== null ||
    filters.dateRange !== undefined ||
    filters.tags.length > 0;

  return (
    <div className="space-y-4">
      {/* Main toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, subject, or client..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter toggle */}
        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {filters.statuses.length +
                filters.priorities.length +
                (filters.assignedTo ? 1 : 0) +
                (filters.dateRange ? 1 : 0)}
            </Badge>
          )}
        </Button>

        {/* Sort */}
        <Select value={filters.sortBy} onValueChange={(v) => updateFilter('sortBy', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="flex border rounded-lg">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-r-none"
            onClick={() => onViewChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'kanban' ? 'secondary' : 'ghost'}
            size="sm"
            className="rounded-l-none"
            onClick={() => onViewChange('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 bg-muted/30 rounded-lg border animate-in">
          {/* Status filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((status) => (
                <Badge
                  key={status.value}
                  variant={filters.statuses.includes(status.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('statuses', status.value)}
                >
                  {status.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Priority filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Priority</label>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITY_OPTIONS.map((priority) => (
                <Badge
                  key={priority.value}
                  variant={filters.priorities.includes(priority.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleArrayFilter('priorities', priority.value)}
                >
                  {priority.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Assigned to filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Assigned To</label>
            <Select
              value={filters.assignedTo || 'all'}
              onValueChange={(v) => updateFilter('assignedTo', v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Anyone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Anyone</SelectItem>
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
          </div>

          {/* Date range filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, 'LLL dd')} -{' '}
                        {format(filters.dateRange.to, 'LLL dd')}
                      </>
                    ) : (
                      format(filters.dateRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange?.from}
                  selected={filters.dateRange}
                  onSelect={(range) => updateFilter('dateRange', range)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-4 w-4" />
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active filter badges */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.statuses.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              Status: {STATUS_OPTIONS.find((s) => s.value === status)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter('statuses', status)}
              />
            </Badge>
          ))}
          {filters.priorities.map((priority) => (
            <Badge key={priority} variant="secondary" className="gap-1">
              Priority: {PRIORITY_OPTIONS.find((p) => p.value === priority)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleArrayFilter('priorities', priority)}
              />
            </Badge>
          ))}
          {filters.assignedTo && (
            <Badge variant="secondary" className="gap-1">
              Assigned:{' '}
              {filters.assignedTo === 'unassigned'
                ? 'Unassigned'
                : agents.find((a) => a.id === filters.assignedTo)?.full_name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('assignedTo', null)}
              />
            </Badge>
          )}
          {filters.dateRange && (
            <Badge variant="secondary" className="gap-1">
              Date:{' '}
              {filters.dateRange.from && format(filters.dateRange.from, 'MMM d')}
              {filters.dateRange.to && ` - ${format(filters.dateRange.to, 'MMM d')}`}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('dateRange', undefined)}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
