import { Building2, Users, Ticket, DollarSign, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { StatCard } from './StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock data
const organizations = [
  { id: '1', name: 'Acme Corporation', status: 'active', users: 45, tickets: 234, plan: 'pro' },
  { id: '2', name: 'TechStart Inc', status: 'active', users: 12, tickets: 89, plan: 'starter' },
  { id: '3', name: 'Global Solutions', status: 'suspended', users: 8, tickets: 156, plan: 'free' },
  { id: '4', name: 'Enterprise Co', status: 'active', users: 120, tickets: 567, plan: 'enterprise' },
];

const recentSignups = [
  { id: '1', name: 'John Smith', email: 'john@newcompany.com', org: 'New Company Ltd', time: '5 min ago' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@startup.io', org: 'Startup.io', time: '1 hour ago' },
  { id: '3', name: 'Mike Chen', email: 'mike@techfirm.com', org: 'TechFirm', time: '3 hours ago' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Active</Badge>;
    case 'suspended':
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Suspended</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getPlanBadge = (plan: string) => {
  const colors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    starter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    pro: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    enterprise: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return <Badge className={colors[plan] || colors.free}>{plan}</Badge>;
};

export function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Organizations"
          value={156}
          change={{ value: 12, trend: 'up' }}
          icon={Building2}
          description="vs last month"
        />
        <StatCard
          title="Active Users"
          value="2,847"
          change={{ value: 8, trend: 'up' }}
          icon={Users}
          description="vs last month"
        />
        <StatCard
          title="Total Tickets"
          value="45,231"
          change={{ value: 5, trend: 'up' }}
          icon={Ticket}
          description="all time"
        />
        <StatCard
          title="Monthly Revenue"
          value="$24,500"
          change={{ value: 18, trend: 'up' }}
          icon={DollarSign}
          description="vs last month"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Organizations List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {organizations.map(org => (
                  <div
                    key={org.id}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{org.name}</p>
                        {getStatusBadge(org.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {org.users} users • {org.tickets} tickets
                      </p>
                    </div>
                    {getPlanBadge(org.plan)}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Signups */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">Recent Signups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSignups.map(signup => (
                  <div key={signup.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {signup.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{signup.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{signup.org}</p>
                      <p className="text-xs text-muted-foreground">{signup.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">API</span>
                  </div>
                  <span className="text-xs text-green-600">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Database</span>
                  </div>
                  <span className="text-xs text-green-600">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Email Service</span>
                  </div>
                  <span className="text-xs text-yellow-600">Degraded</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Uptime</span>
                  </div>
                  <span className="text-xs text-muted-foreground">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
