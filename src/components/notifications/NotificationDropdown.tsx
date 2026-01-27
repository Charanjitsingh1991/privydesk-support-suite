import { useState } from 'react';
import { Bell, Check, MessageSquare, Ticket, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'ticket_assigned' | 'new_message' | 'status_change' | 'new_chat' | 'system';
  title: string;
  description: string;
  read: boolean;
  createdAt: Date;
}

// Mock notifications - in production these would come from Supabase
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'ticket_assigned',
    title: 'New ticket assigned',
    description: 'Ticket #1234 has been assigned to you',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    type: 'new_message',
    title: 'New message',
    description: 'John Doe replied to ticket #1230',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '3',
    type: 'status_change',
    title: 'Status updated',
    description: 'Ticket #1228 marked as resolved',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ticket_assigned':
        return <Ticket className="h-4 w-4 text-blue-500" />;
      case 'new_message':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'status_change':
        return <Check className="h-4 w-4 text-purple-500" />;
      case 'new_chat':
        return <User className="h-4 w-4 text-orange-500" />;
      case 'system':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-medium text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 p-3 cursor-pointer',
                    !notification.read && 'bg-muted/50'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 space-y-1">
                    <p className={cn('text-sm', !notification.read && 'font-medium')}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center justify-center text-sm text-primary">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
