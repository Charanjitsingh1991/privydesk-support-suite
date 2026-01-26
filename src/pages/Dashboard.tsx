import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TicketList } from '@/components/tickets/TicketList';
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: '2.4h',
  });

  useEffect(() => {
    async function fetchStats() {
      const { count: total } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true });

      const { count: open } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      const { count: resolved } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      setStats({
        totalTickets: total || 0,
        openTickets: open || 0,
        resolvedTickets: resolved || 0,
        avgResponseTime: '2.4h',
      });
    }

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in">
        {/* Welcome message */}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your support queue today.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Tickets"
            value={stats.totalTickets}
            change={12}
            icon={<Ticket className="w-5 h-5" />}
          />
          <StatsCard
            title="Open Tickets"
            value={stats.openTickets}
            change={-8}
            icon={<AlertCircle className="w-5 h-5" />}
          />
          <StatsCard
            title="Resolved"
            value={stats.resolvedTickets}
            change={24}
            icon={<CheckCircle className="w-5 h-5" />}
          />
          <StatsCard
            title="Avg. Response"
            value={stats.avgResponseTime}
            change={-15}
            icon={<Clock className="w-5 h-5" />}
          />
        </div>

        {/* Recent tickets */}
        <TicketList />
      </div>
    </DashboardLayout>
  );
}
