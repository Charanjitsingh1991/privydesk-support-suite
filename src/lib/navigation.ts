import {
  Home,
  Building2,
  Users,
  BarChart3,
  Settings,
  Ticket,
  MessageSquare,
  UserCircle,
  PlusCircle,
  TrendingUp,
  Palette,
  Globe,
  Mail,
  CreditCard,
  LucideIcon,
  MessageCircle,
  Inbox,
  FolderOpen,
} from 'lucide-react';
import type { UserRole } from '@/types/database';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: NavItem[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const getNavigationByRole = (role: UserRole): NavSection[] => {
  switch (role) {
    case 'super_admin':
      return [
        {
          items: [
            { title: 'Overview', href: '/dashboard', icon: Home },
            { title: 'Organizations', href: '/dashboard/organizations', icon: Building2 },
            { title: 'All Users', href: '/dashboard/users', icon: Users },
            { title: 'Platform Analytics', href: '/dashboard/analytics', icon: BarChart3 },
            { title: 'System Settings', href: '/dashboard/system-settings', icon: Settings },
            { title: 'Support Inbox', href: '/dashboard/support', icon: Ticket },
          ],
        },
      ];

    case 'admin':
      return [
        {
          items: [
            { title: 'Dashboard', href: '/dashboard', icon: Home },
            { title: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
            { title: 'Live Chat', href: '/dashboard/live-chat', icon: Inbox },
            { title: 'Files', href: '/dashboard/files', icon: FolderOpen },
            { title: 'Team Members', href: '/dashboard/team', icon: Users },
            { title: 'Clients', href: '/dashboard/clients', icon: UserCircle },
            { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
          ],
        },
        {
          title: 'Settings',
          items: [
            { title: 'General', href: '/dashboard/settings', icon: Settings },
            { title: 'Chat Widget', href: '/dashboard/chat-widget', icon: MessageCircle },
            { title: 'Branding', href: '/dashboard/settings/branding', icon: Palette },
            { title: 'Domain', href: '/dashboard/settings/domain', icon: Globe },
            { title: 'Email Config', href: '/dashboard/settings/email', icon: Mail },
            { title: 'Subscription', href: '/dashboard/settings/subscription', icon: CreditCard },
          ],
        },
      ];

    case 'agent':
      return [
        {
          items: [
            { title: 'Dashboard', href: '/dashboard', icon: Home },
            { title: 'My Tickets', href: '/dashboard/tickets', icon: Ticket },
            { title: 'Live Chat', href: '/dashboard/live-chat', icon: Inbox },
            { title: 'Files', href: '/dashboard/files', icon: FolderOpen },
            { title: 'My Performance', href: '/dashboard/performance', icon: TrendingUp },
          ],
        },
      ];

    case 'client':
    default:
      return [
        {
          items: [
            { title: 'Dashboard', href: '/dashboard', icon: Home },
            { title: 'My Tickets', href: '/dashboard/tickets', icon: Ticket },
            { title: 'New Ticket', href: '/dashboard/tickets/new', icon: PlusCircle },
            { title: 'Support Chat', href: '/dashboard/chat', icon: MessageSquare },
          ],
        },
      ];
  }
};

export const getRoleBadgeColor = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'admin':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'agent':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'client':
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'agent':
      return 'Agent';
    case 'client':
    default:
      return 'Client';
  }
};
