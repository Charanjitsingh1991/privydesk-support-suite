import { formatDistanceToNow } from 'date-fns';
import {
  MoreHorizontal,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
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
import type { UserInvitation } from '@/types/team';
import { ROLE_LABELS, ROLE_COLORS } from '@/types/team';

interface InvitationsTableProps {
  invitations: UserInvitation[];
  onResend: (invitationId: string) => void;
  onCancel: (invitationId: string) => void;
  isLoading?: boolean;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  expired: {
    label: 'Expired',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

export function InvitationsTable({
  invitations,
  onResend,
  onCancel,
  isLoading = false,
}: InvitationsTableProps) {
  if (invitations.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No pending invitations</h3>
        <p className="text-muted-foreground mt-1">
          All invitations have been accepted or cancelled
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invitee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => {
            const statusConfig = STATUS_CONFIG[invitation.status];
            const StatusIcon = statusConfig.icon;
            const isExpired = new Date(invitation.token_expires_at) < new Date();
            const effectiveStatus = invitation.status === 'pending' && isExpired ? 'expired' : invitation.status;
            const effectiveConfig = STATUS_CONFIG[effectiveStatus];
            const EffectiveIcon = effectiveConfig.icon;

            return (
              <TableRow key={invitation.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{invitation.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {invitation.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={ROLE_COLORS[invitation.role]}>
                    {ROLE_LABELS[invitation.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={effectiveConfig.className}>
                    <EffectiveIcon className="h-3 w-3 mr-1" />
                    {effectiveConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {effectiveStatus === 'pending'
                    ? formatDistanceToNow(new Date(invitation.token_expires_at), { addSuffix: true })
                    : '-'}
                </TableCell>
                <TableCell>
                  {(effectiveStatus === 'pending' || effectiveStatus === 'expired') && (
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
                        <DropdownMenuItem onClick={() => onResend(invitation.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resend Invitation
                        </DropdownMenuItem>
                        {effectiveStatus === 'pending' && (
                          <DropdownMenuItem
                            onClick={() => onCancel(invitation.id)}
                            className="text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Invitation
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
