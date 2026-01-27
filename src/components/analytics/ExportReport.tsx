import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Table } from 'lucide-react';
import { toast } from 'sonner';
import type { TicketAnalytics, TicketsByDate, AgentPerformance } from '@/types/analytics';

interface ExportReportProps {
  analytics: TicketAnalytics | null;
  ticketsByDate: TicketsByDate[];
  agentPerformance: AgentPerformance[];
  dateRange: { startDate: Date; endDate: Date };
}

export function ExportReport({ 
  analytics, 
  ticketsByDate, 
  agentPerformance, 
  dateRange 
}: ExportReportProps) {
  const exportToCSV = () => {
    if (!analytics) {
      toast.error('No data to export');
      return;
    }

    // Create CSV content
    let csv = 'Analytics Report\n';
    csv += `Period: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}\n\n`;
    
    csv += 'Summary Metrics\n';
    csv += `Total Tickets,${analytics.total_tickets}\n`;
    csv += `Open Tickets,${analytics.open_tickets}\n`;
    csv += `In Progress,${analytics.in_progress_tickets}\n`;
    csv += `Resolved,${analytics.resolved_tickets}\n`;
    csv += `Closed,${analytics.closed_tickets}\n`;
    csv += `Avg Response Time (min),${analytics.avg_response_minutes || 'N/A'}\n`;
    csv += `Avg Resolution Time (min),${analytics.avg_resolution_minutes || 'N/A'}\n\n`;

    csv += 'Tickets by Date\n';
    csv += 'Date,Created,Resolved,Closed\n';
    ticketsByDate.forEach(row => {
      csv += `${row.date},${row.created_count},${row.resolved_count},${row.closed_count}\n`;
    });
    csv += '\n';

    csv += 'Agent Performance\n';
    csv += 'Agent,Assigned,Resolved,Avg Response (min),Avg Resolution (min),CSAT\n';
    agentPerformance.forEach(agent => {
      csv += `${agent.agent_name},${agent.tickets_assigned},${agent.tickets_resolved},`;
      csv += `${agent.avg_response_minutes || 'N/A'},${agent.avg_resolution_minutes || 'N/A'},`;
      csv += `${agent.csat_average || 'N/A'}\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${dateRange.startDate.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Report exported as CSV');
  };

  const exportToJSON = () => {
    if (!analytics) {
      toast.error('No data to export');
      return;
    }

    const data = {
      period: {
        start: dateRange.startDate.toISOString(),
        end: dateRange.endDate.toISOString()
      },
      summary: analytics,
      ticketsByDate,
      agentPerformance
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${dateRange.startDate.toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Report exported as JSON');
  };

  const printReport = () => {
    toast.info('Preparing print view...');
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <Table className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printReport}>
          <FileText className="h-4 w-4 mr-2" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
