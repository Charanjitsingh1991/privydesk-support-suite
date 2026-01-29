import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  MoreHorizontal,
  Shield,
  ShieldCheck,
  UserCog,
  UserX,
  UserCheck,
  Trash2,
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import type { TeamMember } from '@/types/team';
import type { UserRole } from '@/types/database';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/team';

interface TeamMemberTableProps {
  members: TeamMember[];
  currentUserId?: string;
  onChangeRole: (memberId: string, newRole: UserRole) => void;
  onToggleStatus: (memberId: string, isActive: boolean) => void;
  onDeleteMember?: (memberId: string) => void;
  isLoading?: boolean;
}

export function TeamMemberTable({
  members,
  currentUserId,
  onChangeRole,
  onToggleStatus,
  onDeleteMember,
  isLoading = false,
}: TeamMemberTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const availableRoles: UserRole[] = ['admin', 'agent'];

  if (members.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No team members yet</h3>
        <p className="text-muted-foreground mt-1">
          Invite your first team member to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {member.full_name}
                      {member.id === currentUserId && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={ROLE_COLORS[member.role]}>
                  {member.role === 'admin' && <ShieldCheck className="h-3 w-3 mr-1" />}
                  {member.role === 'agent' && <Shield className="h-3 w-3 mr-1" />}
                  {ROLE_LABELS[member.role]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={member.is_active}
                    onCheckedChange={(checked) => onToggleStatus(member.id, checked)}
                    disabled={member.id === currentUserId}
                  />
                  <span className={member.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {member.last_login_at
                  ? formatDistanceToNow(new Date(member.last_login_at), { addSuffix: true })
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
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger disabled={member.id === currentUserId}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {availableRoles.map((role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => onChangeRole(member.id, role)}
                            disabled={member.role === role}
                          >
                            {ROLE_LABELS[role]}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>

                    {member.is_active ? (
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(member.id, false)}
                        disabled={member.id === currentUserId}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(member.id, true)}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activate
                      </DropdownMenuItem>
                    )}

                    {onDeleteMember && member.id !== currentUserId && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteMember(member.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove from Team
                        </DropdownMenuItem>
                      </>
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
