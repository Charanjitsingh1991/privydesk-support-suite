import { cn } from '@/lib/utils';
import type { TicketStatus, TicketPriority } from '@/types/database';

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-status-open/10 text-status-open border-status-open/20' },
  in_progress: { label: 'In Progress', className: 'bg-status-in-progress/10 text-status-in-progress border-status-in-progress/20' },
  waiting_customer: { label: 'Waiting', className: 'bg-status-waiting/10 text-status-waiting border-status-waiting/20' },
  resolved: { label: 'Resolved', className: 'bg-status-resolved/10 text-status-resolved border-status-resolved/20' },
  closed: { label: 'Closed', className: 'bg-status-closed/10 text-status-closed border-status-closed/20' },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-priority-low/10 text-priority-low border-priority-low/20' },
  medium: { label: 'Medium', className: 'bg-priority-medium/10 text-priority-medium border-priority-medium/20' },
  high: { label: 'High', className: 'bg-priority-high/10 text-priority-high border-priority-high/20' },
  urgent: { label: 'Urgent', className: 'bg-priority-urgent/10 text-priority-urgent border-priority-urgent/20' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
