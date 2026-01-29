import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { HourlyStats } from '@/types/analytics';

interface BusiestHoursHeatmapProps {
  data: HourlyStats[];
  loading?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function BusiestHoursHeatmap({ data, loading }: BusiestHoursHeatmapProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Busiest Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted';
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'bg-primary/20';
    if (intensity < 0.5) return 'bg-primary/40';
    if (intensity < 0.75) return 'bg-primary/60';
    return 'bg-primary';
  };

  const getCellData = (day: number, hour: number) => {
    return data.find(d => d.day === day && d.hour === hour) || { day, hour, count: 0 };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Busiest Hours</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour labels */}
              <div className="flex mb-1">
                <div className="w-10" />
                {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
                  <div 
                    key={hour} 
                    className="text-xs text-muted-foreground"
                    style={{ width: `${100 / 8}%` }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex items-center gap-1 mb-1">
                  <div className="w-10 text-xs text-muted-foreground font-medium">{day}</div>
                  <div className="flex-1 flex gap-[2px]">
                    {HOURS.map(hour => {
                      const cellData = getCellData(dayIndex, hour);
                      return (
                        <Tooltip key={`${dayIndex}-${hour}`}>
                          <TooltipTrigger asChild>
                            <div 
                              className={`flex-1 h-6 rounded-sm cursor-pointer transition-colors ${getColor(cellData.count)}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{day} {hour}:00 - {hour + 1}:00</p>
                            <p className="text-sm text-muted-foreground">{cellData.count} tickets</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-sm bg-muted" />
                  <div className="w-4 h-4 rounded-sm bg-primary/20" />
                  <div className="w-4 h-4 rounded-sm bg-primary/40" />
                  <div className="w-4 h-4 rounded-sm bg-primary/60" />
                  <div className="w-4 h-4 rounded-sm bg-primary" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
