import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetricCard } from '@/components/analytics/MetricCard';
import { TicketsOverTimeChart } from '@/components/analytics/TicketsOverTimeChart';
import { TicketsByStatusChart } from '@/components/analytics/TicketsByStatusChart';
import { TicketsByPriorityChart } from '@/components/analytics/TicketsByPriorityChart';
import { TicketsByCategoryChart } from '@/components/analytics/TicketsByCategoryChart';
import { TeamPerformanceTable } from '@/components/analytics/TeamPerformanceTable';
import { ResponseTimeDistribution } from '@/components/analytics/ResponseTimeDistribution';
import { BusiestHoursHeatmap } from '@/components/analytics/BusiestHoursHeatmap';
import { CSATWidget } from '@/components/analytics/CSATWidget';
import { SLATracker } from '@/components/analytics/SLATracker';
import { DateRangeSelector } from '@/components/analytics/DateRangeSelector';
import { ExportReport } from '@/components/analytics/ExportReport';
import { RecentActivityFeed } from '@/components/analytics/RecentActivityFeed';
import { AIInsightsWidget } from '@/components/analytics/AIInsightsWidget';
import { 
  useAnalytics, 
  useTicketsByPriority, 
  useTicketsByCategory,
  useResponseTimeDistribution,
  useHourlyHeatmap,
  useSLAConfigurations
} from '@/hooks/useAnalytics';
import { Ticket, Clock, CheckCircle, Star, RefreshCw } from 'lucide-react';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import type { DateRange } from '@/types/analytics';

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>({
    label: 'Last 30 days',
    value: '30d',
    startDate: startOfDay(subDays(new Date(), 30)),
    endDate: endOfDay(new Date())
  });

  const { 
    loading, 
    analytics, 
    ticketsByDate, 
    agentPerformance, 
    csatData,
    refetch
  } = useAnalytics(dateRange.startDate, dateRange.endDate);

  const { data: priorityData, loading: priorityLoading } = useTicketsByPriority(dateRange.startDate, dateRange.endDate);
  const { data: categoryData, loading: categoryLoading } = useTicketsByCategory(dateRange.startDate, dateRange.endDate);
  const { data: responseTimeData, loading: responseTimeLoading } = useResponseTimeDistribution(dateRange.startDate, dateRange.endDate);
  const { data: heatmapData, loading: heatmapLoading } = useHourlyHeatmap(dateRange.startDate, dateRange.endDate);
  const { configurations: slaConfigs, loading: slaLoading } = useSLAConfigurations();

  // Calculate trends (mock - would need previous period data)
  const trends = useMemo(() => ({
    tickets: 15,
    responseTime: -8,
    resolutionRate: 5,
    csat: 2
  }), []);

  // Format response time
  const formatResponseTime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    return `${Math.round(minutes / 60)}h ${Math.round(minutes % 60)}m`;
  };

  // Determine response time color
  const getResponseTimeColor = (minutes: number | null) => {
    if (!minutes) return 'default';
    if (minutes < 60) return 'success';
    if (minutes < 240) return 'warning';
    return 'danger';
  };

  // Sparkline data for tickets
  const ticketSparkline = useMemo(() => 
    ticketsByDate.slice(-7).map(d => d.created_count),
  [ticketsByDate]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track performance and customer satisfaction</p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeSelector value={dateRange} onChange={setDateRange} />
            <Button variant="ghost" size="icon" onClick={refetch} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <ExportReport 
              analytics={analytics}
              ticketsByDate={ticketsByDate}
              agentPerformance={agentPerformance}
              dateRange={dateRange}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Tickets"
            value={analytics?.total_tickets || 0}
            icon={Ticket}
            trend={{ value: trends.tickets, label: 'vs last period' }}
            sparklineData={ticketSparkline}
          />
          <MetricCard
            title="Avg Response Time"
            value={formatResponseTime(analytics?.avg_response_minutes ?? null)}
            icon={Clock}
            color={getResponseTimeColor(analytics?.avg_response_minutes ?? null)}
            trend={{ value: trends.responseTime, label: 'vs last period' }}
          />
          <MetricCard
            title="Resolution Rate"
            value={analytics && analytics.total_tickets > 0 
              ? `${Math.round(((analytics.resolved_tickets + analytics.closed_tickets) / analytics.total_tickets) * 100)}%`
              : 'N/A'
            }
            icon={CheckCircle}
            color="success"
            trend={{ value: trends.resolutionRate, label: 'vs last period' }}
          />
          <MetricCard
            title="Customer Satisfaction"
            value={csatData?.average ? `${csatData.average.toFixed(1)}/5.0` : 'N/A'}
            subtitle={csatData ? `${csatData.count} responses` : undefined}
            icon={Star}
            color={csatData?.average && csatData.average >= 4 ? 'success' : 
                   csatData?.average && csatData.average >= 3 ? 'warning' : 'default'}
            trend={{ value: trends.csat, label: 'vs last period' }}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TicketsOverTimeChart data={ticketsByDate} loading={loading} />
          <TicketsByStatusChart analytics={analytics} loading={loading} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-3">
          <TicketsByPriorityChart data={priorityData} loading={priorityLoading} />
          <TicketsByCategoryChart data={categoryData} loading={categoryLoading} />
          <CSATWidget data={csatData} loading={loading} />
        </div>

        {/* Team Performance */}
        <TeamPerformanceTable data={agentPerformance} loading={loading} />

        {/* Charts Row 3 */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ResponseTimeDistribution data={responseTimeData} loading={responseTimeLoading} />
          <BusiestHoursHeatmap data={heatmapData} loading={heatmapLoading} />
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <AIInsightsWidget />
          <SLATracker configurations={slaConfigs} loading={slaLoading} />
          <RecentActivityFeed />
        </div>
      </div>
    </DashboardLayout>
  );
}
