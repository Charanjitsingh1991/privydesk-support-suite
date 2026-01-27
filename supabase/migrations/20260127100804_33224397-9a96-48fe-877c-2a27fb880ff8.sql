-- Create CSAT responses table for customer satisfaction surveys
CREATE TABLE public.csat_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  rating_resolution INTEGER NOT NULL CHECK (rating_resolution >= 1 AND rating_resolution <= 5),
  rating_response_time INTEGER CHECK (rating_response_time >= 1 AND rating_response_time <= 5),
  rating_agent INTEGER CHECK (rating_agent >= 1 AND rating_agent <= 5),
  feedback_text TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create SLA configurations table
CREATE TABLE public.sla_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  first_response_minutes INTEGER NOT NULL DEFAULT 60,
  resolution_minutes INTEGER NOT NULL DEFAULT 480,
  business_hours_only BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, priority)
);

-- Create analytics cache table for precomputed daily statistics
CREATE TABLE public.analytics_daily_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  tickets_created INTEGER NOT NULL DEFAULT 0,
  tickets_resolved INTEGER NOT NULL DEFAULT 0,
  tickets_closed INTEGER NOT NULL DEFAULT 0,
  avg_response_time_minutes NUMERIC,
  avg_resolution_time_minutes NUMERIC,
  sla_compliance_rate NUMERIC,
  csat_average NUMERIC,
  csat_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, stat_date)
);

-- Create indexes
CREATE INDEX idx_csat_responses_ticket ON public.csat_responses(ticket_id);
CREATE INDEX idx_csat_responses_org ON public.csat_responses(organization_id);
CREATE INDEX idx_csat_responses_submitted ON public.csat_responses(submitted_at);
CREATE INDEX idx_sla_configurations_org ON public.sla_configurations(organization_id);
CREATE INDEX idx_analytics_daily_org_date ON public.analytics_daily_stats(organization_id, stat_date);

-- Enable RLS
ALTER TABLE public.csat_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_stats ENABLE ROW LEVEL SECURITY;

-- CSAT responses policies
CREATE POLICY "Clients can submit CSAT for their tickets" ON public.csat_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Org members can view CSAT responses" ON public.csat_responses
  FOR SELECT USING (
    organization_id = get_user_organization_id() AND
    get_user_role() IN ('admin', 'agent', 'super_admin')
  );

-- SLA configurations policies
CREATE POLICY "Admins can manage SLA configurations" ON public.sla_configurations
  FOR ALL USING (
    organization_id = get_user_organization_id() AND
    get_user_role() IN ('admin', 'super_admin')
  ) WITH CHECK (
    organization_id = get_user_organization_id() AND
    get_user_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Org members can view SLA configurations" ON public.sla_configurations
  FOR SELECT USING (
    organization_id = get_user_organization_id()
  );

-- Analytics daily stats policies
CREATE POLICY "Admins and agents can view analytics" ON public.analytics_daily_stats
  FOR SELECT USING (
    organization_id = get_user_organization_id() AND
    get_user_role() IN ('admin', 'agent', 'super_admin')
  );

-- Insert default SLA configurations function
CREATE OR REPLACE FUNCTION public.create_default_sla_config()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.sla_configurations (organization_id, priority, first_response_minutes, resolution_minutes)
  VALUES
    (NEW.id, 'urgent', 60, 240),
    (NEW.id, 'high', 120, 480),
    (NEW.id, 'medium', 240, 1440),
    (NEW.id, 'low', 480, 2880);
  RETURN NEW;
END;
$$;

-- Trigger to create default SLA configs for new organizations
CREATE TRIGGER create_org_sla_config
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_sla_config();

-- Function to calculate ticket analytics
CREATE OR REPLACE FUNCTION public.get_ticket_analytics(
  p_organization_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  total_tickets BIGINT,
  open_tickets BIGINT,
  in_progress_tickets BIGINT,
  resolved_tickets BIGINT,
  closed_tickets BIGINT,
  avg_response_minutes NUMERIC,
  avg_resolution_minutes NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_tickets,
    COUNT(*) FILTER (WHERE status = 'open')::BIGINT as open_tickets,
    COUNT(*) FILTER (WHERE status = 'in_progress')::BIGINT as in_progress_tickets,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved_tickets,
    COUNT(*) FILTER (WHERE status = 'closed')::BIGINT as closed_tickets,
    ROUND(AVG(EXTRACT(EPOCH FROM (first_response_at - created_at)) / 60)::NUMERIC, 2) as avg_response_minutes,
    ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 60)::NUMERIC, 2) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_minutes
  FROM public.tickets
  WHERE organization_id = p_organization_id
    AND created_at >= p_start_date
    AND created_at <= p_end_date;
END;
$$;

-- Function to get tickets by date for charts
CREATE OR REPLACE FUNCTION public.get_tickets_by_date(
  p_organization_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  date DATE,
  created_count BIGINT,
  resolved_count BIGINT,
  closed_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.date::DATE,
    COALESCE(created.count, 0)::BIGINT as created_count,
    COALESCE(resolved.count, 0)::BIGINT as resolved_count,
    COALESCE(closed.count, 0)::BIGINT as closed_count
  FROM generate_series(p_start_date::DATE, p_end_date::DATE, '1 day'::INTERVAL) AS d(date)
  LEFT JOIN (
    SELECT DATE(created_at) as ticket_date, COUNT(*) as count
    FROM public.tickets
    WHERE organization_id = p_organization_id
      AND created_at >= p_start_date AND created_at <= p_end_date
    GROUP BY DATE(created_at)
  ) created ON d.date::DATE = created.ticket_date
  LEFT JOIN (
    SELECT DATE(resolved_at) as ticket_date, COUNT(*) as count
    FROM public.tickets
    WHERE organization_id = p_organization_id
      AND resolved_at >= p_start_date AND resolved_at <= p_end_date
    GROUP BY DATE(resolved_at)
  ) resolved ON d.date::DATE = resolved.ticket_date
  LEFT JOIN (
    SELECT DATE(updated_at) as ticket_date, COUNT(*) as count
    FROM public.tickets
    WHERE organization_id = p_organization_id
      AND status = 'closed'
      AND updated_at >= p_start_date AND updated_at <= p_end_date
    GROUP BY DATE(updated_at)
  ) closed ON d.date::DATE = closed.ticket_date
  ORDER BY d.date;
END;
$$;

-- Function to get agent performance
CREATE OR REPLACE FUNCTION public.get_agent_performance(
  p_organization_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  agent_id UUID,
  agent_name TEXT,
  agent_avatar TEXT,
  tickets_assigned BIGINT,
  tickets_resolved BIGINT,
  avg_response_minutes NUMERIC,
  avg_resolution_minutes NUMERIC,
  csat_average NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as agent_id,
    p.full_name as agent_name,
    p.avatar_url as agent_avatar,
    COUNT(DISTINCT t.id)::BIGINT as tickets_assigned,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('resolved', 'closed'))::BIGINT as tickets_resolved,
    ROUND(AVG(EXTRACT(EPOCH FROM (t.first_response_at - t.created_at)) / 60)::NUMERIC, 2) as avg_response_minutes,
    ROUND(AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 60)::NUMERIC, 2) FILTER (WHERE t.resolved_at IS NOT NULL) as avg_resolution_minutes,
    ROUND(AVG(c.rating_agent)::NUMERIC, 2) as csat_average
  FROM public.profiles p
  LEFT JOIN public.tickets t ON t.assigned_to = p.id
    AND t.organization_id = p_organization_id
    AND t.created_at >= p_start_date
    AND t.created_at <= p_end_date
  LEFT JOIN public.csat_responses c ON c.ticket_id = t.id
  WHERE p.organization_id = p_organization_id
    AND p.role IN ('agent', 'admin')
  GROUP BY p.id, p.full_name, p.avatar_url
  ORDER BY tickets_resolved DESC NULLS LAST;
END;
$$;