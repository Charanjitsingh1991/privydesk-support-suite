export interface TicketAnalytics {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  avg_response_minutes: number | null;
  avg_resolution_minutes: number | null;
}

export interface TicketsByDate {
  date: string;
  created_count: number;
  resolved_count: number;
  closed_count: number;
}

export interface AgentPerformance {
  agent_id: string;
  agent_name: string;
  agent_avatar: string | null;
  tickets_assigned: number;
  tickets_resolved: number;
  avg_response_minutes: number | null;
  avg_resolution_minutes: number | null;
  csat_average: number | null;
}

export interface CSATResponse {
  id: string;
  ticket_id: string;
  organization_id: string;
  rating_resolution: number;
  rating_response_time: number | null;
  rating_agent: number | null;
  feedback_text: string | null;
  submitted_at: string;
}

export interface SLAConfiguration {
  id: string;
  organization_id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  first_response_minutes: number;
  resolution_minutes: number;
  business_hours_only: boolean;
  is_active: boolean;
}

export interface DateRange {
  label: string;
  value: string;
  startDate: Date;
  endDate: Date;
}

export interface AnalyticsFilters {
  dateRange: DateRange;
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  category?: string[];
}

export interface HourlyStats {
  hour: number;
  day: number;
  count: number;
}

export interface ResponseTimeDistribution {
  bucket: string;
  count: number;
  percentage: number;
}
