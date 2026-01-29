import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star } from 'lucide-react';
import type { AgentPerformance } from '@/types/analytics';

interface TeamPerformanceTableProps {
  data: AgentPerformance[];
  loading?: boolean;
}

function formatTime(minutes: number | null): string {
  if (minutes === null || minutes === undefined) return '-';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

export function TeamPerformanceTable({ data, loading }: TeamPerformanceTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find top performer (most resolved tickets)
  const topPerformer = data.reduce((top, agent) => 
    (agent.tickets_resolved > (top?.tickets_resolved || 0)) ? agent : top
  , data[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No agent data available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead className="text-right">Resolved</TableHead>
                <TableHead className="text-right">Avg Response</TableHead>
                <TableHead className="text-right">Avg Resolution</TableHead>
                <TableHead className="text-right">CSAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((agent) => (
                <TableRow key={agent.agent_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={agent.agent_avatar || undefined} />
                        <AvatarFallback>
                          {agent.agent_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{agent.agent_name}</span>
                        {topPerformer && agent.agent_id === topPerformer.agent_id && agent.tickets_resolved > 0 && (
                          <Trophy className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{agent.tickets_assigned}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{agent.tickets_resolved}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={
                      agent.avg_response_minutes && agent.avg_response_minutes < 60 
                        ? 'text-green-600' 
                        : agent.avg_response_minutes && agent.avg_response_minutes < 240
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }>
                      {formatTime(agent.avg_response_minutes)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatTime(agent.avg_resolution_minutes)}
                  </TableCell>
                  <TableCell className="text-right">
                    {agent.csat_average ? (
                      <div className="flex items-center justify-end gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span>{agent.csat_average.toFixed(1)}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
