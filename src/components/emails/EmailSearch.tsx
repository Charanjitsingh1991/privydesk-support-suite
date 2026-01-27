import { useState } from 'react';
import { Search, X, Filter, Calendar, Paperclip, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { EmailSearchFilters } from '@/types/email';

interface EmailSearchProps {
  filters: EmailSearchFilters;
  folders: string[];
  onFiltersChange: (filters: EmailSearchFilters) => void;
  onSearch: () => void;
}

export function EmailSearch({
  filters,
  folders,
  onFiltersChange,
  onSearch
}: EmailSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.dateFrom ? new Date(filters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.dateTo ? new Date(filters.dateTo) : undefined
  );

  const activeFilterCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.sender,
    filters.folder,
    filters.hasAttachments,
    filters.linkedToTicket
  ].filter(Boolean).length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    onFiltersChange({
      query: filters.query
    });
  };

  const applyDateFilter = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(from);
    setDateTo(to);
    onFiltersChange({
      ...filters,
      dateFrom: from?.toISOString(),
      dateTo: to?.toISOString()
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filters.query || ''}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Search emails by subject, sender, or content..."
            className="pl-10 pr-10"
          />
          {filters.query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onFiltersChange({ ...filters, query: '' })}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Button */}
        <Button onClick={onSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && 'bg-secondary')}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateFrom && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => applyDateFilter(date, dateTo)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateTo && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => applyDateFilter(dateFrom, date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Sender Filter */}
            <div className="space-y-2">
              <Label>Sender</Label>
              <Input
                value={filters.sender || ''}
                onChange={(e) => onFiltersChange({ ...filters, sender: e.target.value })}
                placeholder="Filter by sender email..."
              />
            </div>

            {/* Folder Filter */}
            <div className="space-y-2">
              <Label>Folder</Label>
              <Select
                value={filters.folder || 'all'}
                onValueChange={(v) => onFiltersChange({ ...filters, folder: v === 'all' ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Folders</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder} value={folder}>
                      {folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Toggle Filters */}
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="has-attachments"
                checked={filters.hasAttachments || false}
                onCheckedChange={(checked) => onFiltersChange({ 
                  ...filters, 
                  hasAttachments: checked || undefined 
                })}
              />
              <Label htmlFor="has-attachments" className="flex items-center gap-1 cursor-pointer">
                <Paperclip className="h-4 w-4" />
                Has Attachments
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="linked-ticket"
                checked={filters.linkedToTicket || false}
                onCheckedChange={(checked) => onFiltersChange({ 
                  ...filters, 
                  linkedToTicket: checked || undefined 
                })}
              />
              <Label htmlFor="linked-ticket" className="flex items-center gap-1 cursor-pointer">
                <Link2 className="h-4 w-4" />
                Linked to Ticket
              </Label>
            </div>

            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.dateFrom && (
            <Badge variant="secondary">
              From: {format(new Date(filters.dateFrom), 'MMM d, yyyy')}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, dateFrom: undefined })} 
              />
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary">
              To: {format(new Date(filters.dateTo), 'MMM d, yyyy')}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, dateTo: undefined })} 
              />
            </Badge>
          )}
          {filters.sender && (
            <Badge variant="secondary">
              Sender: {filters.sender}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, sender: undefined })} 
              />
            </Badge>
          )}
          {filters.folder && (
            <Badge variant="secondary">
              Folder: {filters.folder}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, folder: undefined })} 
              />
            </Badge>
          )}
          {filters.hasAttachments && (
            <Badge variant="secondary">
              Has Attachments
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, hasAttachments: undefined })} 
              />
            </Badge>
          )}
          {filters.linkedToTicket && (
            <Badge variant="secondary">
              Linked to Ticket
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, linkedToTicket: undefined })} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
