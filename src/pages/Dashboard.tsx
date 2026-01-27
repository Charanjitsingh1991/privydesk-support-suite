import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';
import { AgentDashboard } from '@/components/dashboard/AgentDashboard';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { useUser } from '@/hooks/useSession';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { role } = useUser();
  const { profile } = useAuth();
  const [organizationName, setOrganizationName] = useState<string>('');

  useEffect(() => {
    const fetchOrganization = async () => {
      if (profile?.organization_id) {
        const { data } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', profile.organization_id)
          .single();
        
        if (data) {
          setOrganizationName(data.name);
        }
      }
    };

    fetchOrganization();
  }, [profile?.organization_id]);

  const renderDashboard = () => {
    switch (role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'admin':
      case 'agent':
        return <AgentDashboard />;
      case 'client':
      default:
        return <ClientDashboard organizationName={organizationName} />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}
