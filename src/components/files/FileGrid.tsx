import { useState } from 'react';
import {
  Search,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  FolderOpen,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { FileCard } from './FileCard';
import { cn } from '@/lib/utils';
import type { FileWithUploader, SortOption, SortDirection } from '@/types/files';

interface FileGridProps {
  files: FileWithUploader[];
  loading?: boolean;
  onDownload: (storagePath: string) => void;
  onDelete: (fileId: string) => void;
  onUpdate: (fileId: string, updates: { description?: string; tags?: string[] }) => void;
  onSearch: (search: string) => void;
  onSort: (sort: SortOption, direction: SortDirection) => void;
  onFilterType: (type: string | undefined) => void;
  canDelete?: boolean;
}

const FILE_TYPES = [
  { value: 'image', label: 'Images' },
  { value: 'application/pdf', label: 'PDFs' },
  { value: 'application', label: 'Documents' },
  { value: 'text', label: 'Text Files' },
];

export function FileGrid({
  files,
  loading = false,
  onDownload,
  onDelete,
  onUpdate,
  onSearch,
  onSort,
  onFilterType,
  canDelete = false
}: FileGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [typeFilter, setTypeFilter] = useState<string | undefined>();

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch(value);
  };

  const handleSort = (newSort: SortOption) => {
    const newDir = sort === newSort && sortDir === 'desc' ? 'asc' : 'desc';
    setSort(newSort);
    setSortDir(newDir);
    onSort(newSort, newDir);
  };

  const handleTypeFilter = (type: string | undefined) => {
    setTypeFilter(type);
    onFilterType(type);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search files..."
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter || 'all'} onValueChange={(v) => handleTypeFilter(v === 'all' ? undefined : v)}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {FILE_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {sortDir === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem 
              checked={sort === 'date'} 
              onCheckedChange={() => handleSort('date')}
            >
              Date
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={sort === 'name'} 
              onCheckedChange={() => handleSort('name')}
            >
              Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={sort === 'size'} 
              onCheckedChange={() => handleSort('size')}
            >
              Size
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem 
              checked={sort === 'type'} 
              onCheckedChange={() => handleSort('type')}
            >
              Type
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Toggle */}
        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-r-none"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-l-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg">No files found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {search ? 'Try a different search term' : 'Upload files to get started'}
          </p>
        </div>
      )}

      {/* File Grid/List */}
      {files.length > 0 && (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'space-y-2'
        )}>
          {files.map(file => (
            <FileCard
              key={file.id}
              file={file}
              onDownload={onDownload}
              onDelete={onDelete}
              onUpdate={onUpdate}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
