import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  tickets: 'Tickets',
  new: 'New Ticket',
  chat: 'Chat',
  team: 'Team Members',
  clients: 'Clients',
  analytics: 'Analytics',
  settings: 'Settings',
  branding: 'Branding',
  domain: 'Domain',
  email: 'Email Config',
  subscription: 'Subscription',
  organizations: 'Organizations',
  users: 'All Users',
  'system-settings': 'System Settings',
  support: 'Support Inbox',
  performance: 'My Performance',
  profile: 'Profile',
};

export function Breadcrumbs({ className }: { className?: string }) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length <= 1) {
    return null;
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;

    return { path, label, isLast };
  });

  return (
    <nav className={cn('flex items-center text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1">
        <li>
          <Link
            to="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {breadcrumbs.slice(1).map((crumb, index) => (
          <li key={crumb.path} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {crumb.isLast ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
