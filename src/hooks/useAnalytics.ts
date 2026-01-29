import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useSession';
import type { 
  TicketAnalytics, 
  TicketsByDate, 
  AgentPerformance,
  CSATResponse,
  SLAConfiguration,
  HourlyStats,
  ResponseTimeDistribution
} from '@/types/analytics';

export function useAnalytics(startDate: Date, endDate: Date) {
  const { organizationId } = useUser();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<TicketAnalytics | null>(null);
  const [ticketsByDate, setTicketsByDate] = useState<TicketsByDate[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [csatData, setCsatData] = useState<{
    average: number;
    count: number;
    distribution: { rating: number; count: number }[];
  } | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    try {
      // Fetch main analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .rpc('get_ticket_analytics', {
          p_organization_id: organizationId,
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        });

      if (analyticsError) throw analyticsError;
      if (analyticsData && analyticsData.length > 0) {
        setAnalytics(analyticsData[0]);
      }

      // Fetch tickets by date
      const { data: dateData, error: dateError } = await supabase
        .rpc('get_tickets_by_date', {
          p_organization_id: organizationId,
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        });

      if (dateError) throw dateError;
      setTicketsByDate(dateData || []);

      // Fetch agent performance
      const { data: agentData, error: agentError } = await supabase
        .rpc('get_agent_performance', {
          p_organization_id: organizationId,
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        });

      if (agentError) throw agentError;
      setAgentPerformance(agentData || []);

      // Fetch CSAT data
      const { data: csatResponses, error: csatError } = await supabase
        .from('csat_responses')
        .select('rating_resolution')
        .eq('organization_id', organizationId)
        .gte('submitted_at', startDate.toISOString())
        .lte('submitted_at', endDate.toISOString());

      if (!csatError && csatResponses) {
        const ratings = csatResponses.map(c => c.rating_resolution);
        const average = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0;
        
        const distribution = [1, 2, 3, 4, 5].map(rating => ({
          rating,
          count: ratings.filter(r => r === rating).length
        }));

        setCsatData({
          average,
          count: ratings.length,
          distribution
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [organizationId, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    loading,
    analytics,
    ticketsByDate,
    agentPerformance,
    csatData,
    refetch: fetchAnalytics
  };
}

export function useTicketsByPriority(startDate: Date, endDate: Date) {
  const { organizationId } = useUser();
  const [data, setData] = useState<{ priority: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!organizationId) return;

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('priority')
        .eq('organization_id', organizationId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (!error && tickets) {
        const counts: Record<string, number> = {
          urgent: 0,
          high: 0,
          medium: 0,
          low: 0
        };
        tickets.forEach(t => {
          if (t.priority) counts[t.priority] = (counts[t.priority] || 0) + 1;
        });
        setData(Object.entries(counts).map(([priority, count]) => ({ priority, count })));
      }
      setLoading(false);
    }
    fetch();
  }, [organizationId, startDate, endDate]);

  return { data, loading };
}

export function useTicketsByCategory(startDate: Date, endDate: Date) {
  const { organizationId } = useUser();
  const [data, setData] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!organizationId) return;

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('category')
        .eq('organization_id', organizationId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (!error && tickets) {
        const counts: Record<string, number> = {};
        tickets.forEach(t => {
          const cat = t.category || 'Uncategorized';
          counts[cat] = (counts[cat] || 0) + 1;
        });
        
        const sorted = Object.entries(counts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);
        
        // Top 5 + Other
        if (sorted.length > 5) {
          const top5 = sorted.slice(0, 5);
          const otherCount = sorted.slice(5).reduce((acc, item) => acc + item.count, 0);
          setData([...top5, { category: 'Other', count: otherCount }]);
        } else {
          setData(sorted);
        }
      }
      setLoading(false);
    }
    fetch();
  }, [organizationId, startDate, endDate]);

  return { data, loading };
}

export function useResponseTimeDistribution(startDate: Date, endDate: Date) {
  const { organizationId } = useUser();
  const [data, setData] = useState<ResponseTimeDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!organizationId) return;

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('created_at, first_response_at')
        .eq('organization_id', organizationId)
        .not('first_response_at', 'is', null)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (!error && tickets) {
        const buckets: Record<string, number> = {
          '0-15min': 0,
          '15-30min': 0,
          '30-60min': 0,
          '1-2hr': 0,
          '2-4hr': 0,
          '4-8hr': 0,
          '>8hr': 0
        };

        tickets.forEach(t => {
          const responseTime = (new Date(t.first_response_at!).getTime() - new Date(t.created_at).getTime()) / 60000;
          if (responseTime < 15) buckets['0-15min']++;
          else if (responseTime < 30) buckets['15-30min']++;
          else if (responseTime < 60) buckets['30-60min']++;
          else if (responseTime < 120) buckets['1-2hr']++;
          else if (responseTime < 240) buckets['2-4hr']++;
          else if (responseTime < 480) buckets['4-8hr']++;
          else buckets['>8hr']++;
        });

        const total = tickets.length || 1;
        setData(Object.entries(buckets).map(([bucket, count]) => ({
          bucket,
          count,
          percentage: Math.round((count / total) * 100)
        })));
      }
      setLoading(false);
    }
    fetch();
  }, [organizationId, startDate, endDate]);

  return { data, loading };
}

export function useHourlyHeatmap(startDate: Date, endDate: Date) {
  const { organizationId } = useUser();
  const [data, setData] = useState<HourlyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!organizationId) return;

      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('created_at')
        .eq('organization_id', organizationId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (!error && tickets) {
        const heatmap: Record<string, number> = {};
        
        tickets.forEach(t => {
          const date = new Date(t.created_at);
          const day = date.getDay();
          const hour = date.getHours();
          const key = `${day}-${hour}`;
          heatmap[key] = (heatmap[key] || 0) + 1;
        });

        const result: HourlyStats[] = [];
        for (let day = 0; day < 7; day++) {
          for (let hour = 0; hour < 24; hour++) {
            result.push({
              day,
              hour,
              count: heatmap[`${day}-${hour}`] || 0
            });
          }
        }
        setData(result);
      }
      setLoading(false);
    }
    fetch();
  }, [organizationId, startDate, endDate]);

  return { data, loading };
}

export function useSLAConfigurations() {
  const { organizationId } = useUser();
  const [configurations, setConfigurations] = useState<SLAConfiguration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!organizationId) return;

      const { data, error } = await supabase
        .from('sla_configurations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('priority');

      if (!error && data) {
        setConfigurations(data as SLAConfiguration[]);
      }
      setLoading(false);
    }
    fetch();
  }, [organizationId]);

  const updateSLA = async (id: string, updates: Partial<SLAConfiguration>) => {
    const { error } = await supabase
      .from('sla_configurations')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setConfigurations(prev => 
        prev.map(c => c.id === id ? { ...c, ...updates } : c)
      );
    }
    return { error };
  };

  return { configurations, loading, updateSLA };
}
