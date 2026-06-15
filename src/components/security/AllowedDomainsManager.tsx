import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  X, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Loader2
} from 'lucide-react';
import { useAllowedDomains, usePendingClients } from '@/hooks/useSecurity';
import { useUser } from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { GENERIC_EMAIL_DOMAINS } from '@/types/security';

export function AllowedDomainsManager() {
  const { domains, loading: domainsLoading, fetchDomains, addDomain, removeDomain } = useAllowedDomains();
  const { pendingClients, loading: pendingLoading, fetchPendingClients, approveClient, rejectClient } = usePendingClients();
  const { organizationId } = useUser();
  const { toast } = useToast();
  
  const [newDomain, setNewDomain] = useState('');
  const [blockGeneric, setBlockGeneric] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    fetchDomains();
    fetchPendingClients();
    loadSecuritySettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDomains, fetchPendingClients]);

  const loadSecuritySettings = async () => {
    if (!organizationId) return;
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('security_settings')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      
      const settings = data?.security_settings as Record<string, boolean> | null;
      if (settings) {
        setBlockGeneric(settings.block_generic_email_providers || false);
        setRequireApproval(settings.require_domain_approval !== false);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const updateSecuritySetting = async (key: string, value: boolean) => {
    if (!organizationId) return;
    setSettingsLoading(true);
    
    try {
      // First get current settings
      const { data: current } = await supabase
        .from('organizations')
        .select('security_settings')
        .eq('id', organizationId)
        .single();

      const currentSettings = (current?.security_settings as Record<string, unknown>) || {};
      
      const updatedSettings = {
        ...currentSettings,
        [key]: value,
      };
      
       
      const { error } = await supabase
        .from('organizations')
        .update({
          security_settings: updatedSettings as Record<string, unknown>,
        })
        .eq('id', organizationId);

      if (error) throw error;
      
      toast({ title: 'Setting updated' });
    } catch (error) {
      toast({
        title: 'Error updating setting',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim() || !organizationId) return;
    
    // Validate domain format
    const domainRegex = /^[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    if (!domainRegex.test(newDomain.trim())) {
      toast({
        title: 'Invalid domain format',
        description: 'Please enter a valid domain (e.g., example.com)',
        variant: 'destructive',
      });
      return;
    }

    await addDomain(newDomain.trim(), organizationId);
    setNewDomain('');
  };

  const handleBlockGenericToggle = async (checked: boolean) => {
    setBlockGeneric(checked);
    await updateSecuritySetting('block_generic_email_providers', checked);
  };

  const handleRequireApprovalToggle = async (checked: boolean) => {
    setRequireApproval(checked);
    await updateSecuritySetting('require_domain_approval', checked);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Allowed Client Domains
          </CardTitle>
          <CardDescription>
            Control which email domains can create client accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Domain */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
              />
            </div>
            <Button onClick={handleAddDomain} disabled={!newDomain.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </div>

          {/* Domain List */}
          <ScrollArea className="h-[200px] border rounded-md p-4">
            {domainsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : domains.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Globe className="h-12 w-12 mb-2" />
                <p>No domains configured</p>
                <p className="text-xs">Add domains to restrict client signups</p>
              </div>
            ) : (
              <div className="space-y-2">
                {domains.map((domain) => (
                  <div 
                    key={domain.id} 
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{domain.domain}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDomain(domain.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Settings */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="block-generic">Block Generic Email Providers</Label>
                <p className="text-xs text-muted-foreground">
                  Prevent signups from Gmail, Yahoo, Outlook, etc.
                </p>
              </div>
              <Switch
                id="block-generic"
                checked={blockGeneric}
                onCheckedChange={handleBlockGenericToggle}
                disabled={settingsLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-approval">Require Domain Approval</Label>
                <p className="text-xs text-muted-foreground">
                  Manually approve clients from unlisted domains
                </p>
              </div>
              <Switch
                id="require-approval"
                checked={requireApproval}
                onCheckedChange={handleRequireApprovalToggle}
                disabled={settingsLoading}
              />
            </div>
          </div>

          {blockGeneric && (
            <div className="p-3 rounded-md bg-muted">
              <p className="text-sm font-medium mb-2">Blocked email providers:</p>
              <div className="flex flex-wrap gap-1">
                {GENERIC_EMAIL_DOMAINS.map((domain) => (
                  <Badge key={domain} variant="secondary" className="text-xs">
                    {domain}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Client Approvals
            {pendingClients.length > 0 && (
              <Badge variant="secondary">{pendingClients.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Clients from unknown domains awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : pendingClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mb-2" />
              <p>No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingClients.map((client) => (
                <div 
                  key={client.id} 
                  className="flex items-center justify-between p-3 rounded-md border"
                >
                  <div>
                    <p className="font-medium">{client.email}</p>
                    {client.full_name && (
                      <p className="text-sm text-muted-foreground">{client.full_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Requested {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectClient(client.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveClient(client.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
