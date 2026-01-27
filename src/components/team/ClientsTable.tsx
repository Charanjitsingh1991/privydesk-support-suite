import { formatDistanceToNow } from 'date-fns';
import {
  MoreHorizontal,
  UserX,
  UserCheck,
  Users,
} from 'lucide-react';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import type { TeamMember } from '@/types/team';

interface ClientsTableProps {
  clients: TeamMember[];
  onToggleStatus: (clientId: string, isActive: boolean) => void;
  isLoading?: boolean;
}

export function ClientsTable({
  clients,
  onToggleStatus,
  isLoading = false,
}: ClientsTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (clients.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No clients yet</h3>
        <p className="text-muted-foreground mt-1">
          Clients will appear here when they sign up or are invited
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={client.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(client.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{client.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={client.is_active}
                    onCheckedChange={(checked) => onToggleStatus(client.id, checked)}
                  />
                  <span className={client.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                    {client.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {client.last_login_at
                  ? formatDistanceToNow(new Date(client.last_login_at), { addSuffix: true })
                  : 'Never'}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {client.is_active ? (
                      <DropdownMenuItem onClick={() => onToggleStatus(client.id, false)}>
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate Client
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onToggleStatus(client.id, true)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activate Client
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
