import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface TicketsByPriorityChartProps {
  data: { priority: string; count: number }[];
  loading?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'hsl(0, 84%, 60%)',
  high: 'hsl(25, 95%, 53%)',
  medium: 'hsl(47, 100%, 50%)',
  low: 'hsl(142, 76%, 36%)'
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

export function TicketsByPriorityChart({ data, loading }: TicketsByPriorityChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Tickets by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((acc, item) => acc + item.count, 0) || 1;
  const formattedData = data.map(item => ({
    ...item,
    label: PRIORITY_LABELS[item.priority] || item.priority,
    percentage: Math.round((item.count / total) * 100)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Tickets by Priority</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={formattedData} 
              layout="vertical" 
              margin={{ top: 0, right: 30, left: 60, bottom: 0 }}
            >
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis 
                type="category" 
                dataKey="label" 
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: number, name: string, props: any) => [
                  `${value} (${props.payload.percentage}%)`,
                  'Tickets'
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {formattedData.map((entry) => (
                  <Cell 
                    key={entry.priority} 
                    fill={PRIORITY_COLORS[entry.priority] || 'hsl(var(--primary))'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
