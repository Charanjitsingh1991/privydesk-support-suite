import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TicketAnalytics } from '@/types/analytics';

interface TicketsByStatusChartProps {
  analytics: TicketAnalytics | null;
  loading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  'Open': 'hsl(var(--primary))',
  'In Progress': 'hsl(47, 100%, 50%)',
  'Resolved': 'hsl(142, 76%, 36%)',
  'Closed': 'hsl(var(--muted-foreground))'
};

export function TicketsByStatusChart({ analytics, loading }: TicketsByStatusChartProps) {
  if (loading || !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Tickets by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: 'Open', value: analytics.open_tickets },
    { name: 'In Progress', value: analytics.in_progress_tickets },
    { name: 'Resolved', value: analytics.resolved_tickets },
    { name: 'Closed', value: analytics.closed_tickets }
  ].filter(item => item.value > 0);

  const totalActive = analytics.open_tickets + analytics.in_progress_tickets;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Tickets by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell 
                    key={entry.name} 
                    fill={STATUS_COLORS[entry.name]}
                    className="stroke-background stroke-2"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-3xl font-bold">{totalActive}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
