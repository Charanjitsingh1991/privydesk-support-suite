import { useState, useEffect } from 'react';
import { Plug, Check, X, Settings } from 'lucide-react';
import { IntegrationService } from '@/lib/services/integrationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Integration {
  id: string;
  integration_name: string;
  integration_type: string;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
}

export function IntegrationsList({ organizationId }: { organizationId: string }) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const loadIntegrations = async () => {
    setLoading(true);
    const data = await IntegrationService.getIntegrations(organizationId);
    setIntegrations(data);
    setLoading(false);
  };

  const handleToggle = async (integrationId: string, isActive: boolean) => {
    await IntegrationService.updateIntegration(integrationId, { is_active: !isActive });
    loadIntegrations();
  };

  const handleSync = async (integrationId: string) => {
    await IntegrationService.startSync(integrationId, 'manual');
    loadIntegrations();
  };

  const integrationIcons: Record<string, string> = {
    zapier: '⚡',
    slack: '💬',
    salesforce: '☁️',
    shopify: '🛍️',
    hubspot: '🎯',
    mailchimp: '📧',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Integrations</h2>
        <Button>
          <Plug className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading integrations...</div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No integrations configured
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {integrationIcons[integration.integration_type] || '🔌'}
                    </span>
                    <div>
                      <CardTitle>{integration.integration_name}</CardTitle>
                      <CardDescription className="capitalize">
                        {integration.integration_type}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={integration.is_active ? 'default' : 'secondary'}>
                    {integration.is_active ? (
                      <Check className="h-3 w-3 mr-1" />
                    ) : (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    {integration.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {integration.last_sync_at && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(integration.last_sync_at).toLocaleString()}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggle(integration.id, integration.is_active)}
                      className="flex-1"
                    >
                      {integration.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(integration.id)}
                      disabled={!integration.is_active}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
