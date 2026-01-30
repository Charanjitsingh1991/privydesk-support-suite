import { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalyticsData {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  avgResolutionTime: number;
  customerSatisfaction: number;
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  agentPerformance: Array<{ name: string; resolved: number; avgTime: number }>;
}

export function AnalyticsDashboard({ organizationId }: { organizationId: string }) {
  const [data, setData] = useState<AnalyticsData>({
    totalTickets: 1247,
    openTickets: 89,
    resolvedTickets: 1158,
    avgResponseTime: 2.4,
    avgResolutionTime: 18.5,
    customerSatisfaction: 4.6,
    ticketsByStatus: { open: 89, pending: 45, resolved: 1158 },
    ticketsByPriority: { low: 234, medium: 678, high: 289, urgent: 46 },
    agentPerformance: [
      { name: 'John Doe', resolved: 234, avgTime: 16.2 },
      { name: 'Jane Smith', resolved: 198, avgTime: 14.8 },
      { name: 'Bob Johnson', resolved: 176, avgTime: 19.3 },
    ],
  });
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics & Reports</h2>
          <p className="text-muted-foreground">Performance insights and metrics</p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">+5%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgResponseTime}h</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-8%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.customerSatisfaction}/5</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+0.2</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>Distribution of ticket statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.ticketsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center">
                  <div className="w-24 capitalize">{status}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(count / data.totalTickets) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right font-medium">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets by Priority</CardTitle>
            <CardDescription>Priority level distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.ticketsByPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center">
                  <div className="w-24 capitalize">{priority}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          priority === 'urgent' ? 'bg-red-500' :
                          priority === 'high' ? 'bg-orange-500' :
                          priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${(count / data.totalTickets) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right font-medium">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Agent Performance
          </CardTitle>
          <CardDescription>Top performing support agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.agentPerformance.map((agent, index) => (
              <div key={agent.name} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {agent.resolved} tickets resolved • Avg {agent.avgTime}h
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{agent.resolved}</div>
                  <p className="text-xs text-muted-foreground">resolved</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
