import { Link } from 'react-router-dom';
import { PlusCircle, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/useSession';

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const { role } = useUser();

  const actions = [
    {
      title: 'New Ticket',
      description: 'Create a support ticket',
      icon: PlusCircle,
      href: '/dashboard/tickets/new',
      roles: ['client', 'agent', 'admin', 'super_admin'],
    },
    {
      title: 'Invite Client',
      description: 'Add a new client',
      icon: UserPlus,
      href: '/dashboard/clients/invite',
      roles: ['agent', 'admin', 'super_admin'],
    },
    {
      title: 'Invite Team Member',
      description: 'Add to your team',
      icon: Users,
      href: '/dashboard/team/invite',
      roles: ['admin', 'super_admin'],
    },
  ];

  const visibleActions = actions.filter(action => 
    role && action.roles.includes(role)
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {visibleActions.map(action => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant="outline"
              className="justify-start h-auto p-3"
              asChild
            >
              <Link to={action.href}>
                <Icon className="h-4 w-4 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
