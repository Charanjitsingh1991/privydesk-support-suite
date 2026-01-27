import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Puzzle } from 'lucide-react';
import { IntegrationCard } from './IntegrationCard';
import { ApiKeysManager } from './ApiKeysManager';
import { WebhooksManager } from './WebhooksManager';
import { useToast } from '@/hooks/use-toast';
import type { Integration } from '@/types/settings';

const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send ticket notifications to Slack channels',
    icon: 'https://cdn.simpleicons.org/slack',
    connected: false,
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Integrate with Teams for notifications and updates',
    icon: 'https://cdn.simpleicons.org/microsoftteams',
    connected: false,
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Send notifications to Discord servers',
    icon: 'https://cdn.simpleicons.org/discord',
    connected: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps through Zapier',
    icon: 'https://cdn.simpleicons.org/zapier',
    connected: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Sync customer billing data and payment info',
    icon: 'https://cdn.simpleicons.org/stripe',
    connected: false,
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Sync tickets with Jira issues',
    icon: 'https://cdn.simpleicons.org/jira',
    connected: false,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Link tickets to GitHub issues and PRs',
    icon: 'https://cdn.simpleicons.org/github',
    connected: false,
  },
  {
    id: 'gdrive',
    name: 'Google Drive',
    description: 'Attach files directly from Google Drive',
    icon: 'https://cdn.simpleicons.org/googledrive',
    connected: false,
  },
];

export function IntegrationsSettingsTab() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState(AVAILABLE_INTEGRATIONS);

  const handleConnect = (integrationId: string) => {
    toast({ title: 'Integration', description: 'OAuth flow would open here' });
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((int) => (int.id === integrationId ? { ...int, connected: false } : int))
    );
    toast({ title: 'Disconnected', description: 'Integration has been disconnected' });
  };

  return (
    <div className="space-y-6">
      {/* API Keys Management */}
      <ApiKeysManager />

      {/* Webhooks Management */}
      <WebhooksManager />

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            Third-Party Integrations
          </CardTitle>
          <CardDescription>
            Connect your favorite tools and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={() => handleConnect(integration.id)}
                onConfigure={() =>
                  toast({ title: 'Configure', description: 'Settings dialog would open' })
                }
                onDisconnect={() => handleDisconnect(integration.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
