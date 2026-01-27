import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import type { ResponseTimeDistribution as ResponseTimeData } from '@/types/analytics';

interface ResponseTimeDistributionProps {
  data: ResponseTimeData[];
  loading?: boolean;
}

export function ResponseTimeDistribution({ data, loading }: ResponseTimeDistributionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Response Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Color based on SLA compliance (assume 1hr SLA)
  const getBarColor = (bucket: string) => {
    if (bucket.includes('0-15') || bucket.includes('15-30') || bucket.includes('30-60')) {
      return 'hsl(142, 76%, 36%)'; // Green - within SLA
    }
    if (bucket.includes('1-2') || bucket.includes('2-4')) {
      return 'hsl(47, 100%, 50%)'; // Yellow - borderline
    }
    return 'hsl(0, 84%, 60%)'; // Red - SLA breach
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Response Time Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <XAxis 
                dataKey="bucket" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value} tickets (${props.payload.percentage}%)`,
                  'Count'
                ]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.bucket} fill={getBarColor(entry.bucket)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Within SLA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>SLA Breach</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
