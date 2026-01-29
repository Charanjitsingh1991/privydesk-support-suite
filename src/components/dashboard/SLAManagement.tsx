import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SLAPolicy {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  first_response_time: number;
  resolution_time: number;
  timezone: string;
}

interface SLAManagementProps {
  organizationId: string;
}

export function SLAManagement({ organizationId }: SLAManagementProps) {
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const fetchPolicies = async () => {
    try {
      const { data, error } = await supabase
        .from('sla_policies')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Failed to fetch SLA policies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SLA policies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePolicy = async (policyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('sla_policies')
        .update({ is_active: isActive })
        .eq('id', policyId);

      if (error) throw error;

      setPolicies(policies.map(p => p.id === policyId ? { ...p, is_active: isActive } : p));
      
      toast({
        title: 'Success',
        description: `SLA policy ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Failed to toggle SLA policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to update SLA policy',
        variant: 'destructive',
      });
    }
  };

  const deletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this SLA policy?')) return;

    try {
      const { error } = await supabase
        .from('sla_policies')
        .delete()
        .eq('id', policyId);

      if (error) throw error;

      setPolicies(policies.filter(p => p.id !== policyId));
      
      toast({
        title: 'Success',
        description: 'SLA policy deleted',
      });
    } catch (error) {
      console.error('Failed to delete SLA policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete SLA policy',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  useEffect(() => {
    fetchPolicies();
  }, [organizationId]);

  return (
    <Card className="bg-[#1a1a1a] border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">SLA Policies</CardTitle>
            <CardDescription className="text-gray-400">
              Manage service level agreements for ticket response and resolution
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-lime-500 text-black hover:bg-lime-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Policy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading SLA policies...</div>
        ) : policies.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No SLA policies configured</p>
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              Create Your First Policy
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium">{policy.name}</h3>
                      <Badge
                        className={
                          policy.is_active
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }
                      >
                        {policy.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {policy.description && (
                      <p className="text-sm text-gray-400 mb-3">{policy.description}</p>
                    )}
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">First Response:</span>
                        <span className="text-white ml-2 font-medium">
                          {formatTime(policy.first_response_time)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Resolution:</span>
                        <span className="text-white ml-2 font-medium">
                          {formatTime(policy.resolution_time)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Timezone:</span>
                        <span className="text-white ml-2 font-medium">
                          {policy.timezone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={policy.is_active}
                      onCheckedChange={(checked) => togglePolicy(policy.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePolicy(policy.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
