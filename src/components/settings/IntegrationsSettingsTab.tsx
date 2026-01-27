import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Puzzle, Webhook, Plus, Copy, Eye, EyeOff } from 'lucide-react';
import { IntegrationCard } from './IntegrationCard';
import { useToast } from '@/hooks/use-toast';
import type { Integration, WebhookConfig } from '@/types/settings';

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
    connected: true,
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

const WEBHOOK_EVENTS = [
  { id: 'ticket_created', label: 'Ticket Created' },
  { id: 'ticket_updated', label: 'Ticket Updated' },
  { id: 'ticket_resolved', label: 'Ticket Resolved' },
  { id: 'ticket_closed', label: 'Ticket Closed' },
  { id: 'message_sent', label: 'Message Sent' },
  { id: 'message_received', label: 'Message Received' },
];

export function IntegrationsSettingsTab() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState(AVAILABLE_INTEGRATIONS);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
    url: '',
    secret: '',
    events: [],
    is_active: true,
  });
  const [showSecret, setShowSecret] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);

  const handleConnect = (integrationId: string) => {
    // TODO: Implement OAuth flow
    toast({ title: 'Integration', description: 'OAuth flow would open here' });
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((int) => (int.id === integrationId ? { ...int, connected: false } : int))
    );
    toast({ title: 'Disconnected', description: 'Integration has been disconnected' });
  };

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = 'whsec_';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewWebhook((prev) => ({ ...prev, secret }));
  };

  const handleAddWebhook = () => {
    if (!newWebhook.url || !newWebhook.secret || newWebhook.events?.length === 0) {
      toast({ title: 'Invalid webhook configuration', variant: 'destructive' });
      return;
    }

    const webhook: WebhookConfig = {
      id: `webhook_${Date.now()}`,
      url: newWebhook.url!,
      secret: newWebhook.secret!,
      events: newWebhook.events!,
      is_active: true,
    };

    setWebhooks((prev) => [...prev, webhook]);
    setNewWebhook({ url: '', secret: '', events: [], is_active: true });
    setWebhookDialogOpen(false);
    toast({ title: 'Webhook added successfully' });
  };

  const toggleWebhookEvent = (eventId: string) => {
    setNewWebhook((prev) => ({
      ...prev,
      events: prev.events?.includes(eventId)
        ? prev.events.filter((e) => e !== eventId)
        : [...(prev.events || []), eventId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            Integrations
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

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhooks
              </CardTitle>
              <CardDescription>
                Send real-time notifications to your endpoints
              </CardDescription>
            </div>
            <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Webhook</DialogTitle>
                  <DialogDescription>
                    Configure a new webhook endpoint to receive event notifications
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook_url">Endpoint URL</Label>
                    <Input
                      id="webhook_url"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder="https://yourserver.com/webhook"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="webhook_secret">Secret Key</Label>
                      <Button variant="ghost" size="sm" onClick={generateSecret}>
                        Generate
                      </Button>
                    </div>
                    <div className="relative">
                      <Input
                        id="webhook_secret"
                        type={showSecret ? 'text' : 'password'}
                        value={newWebhook.secret}
                        onChange={(e) =>
                          setNewWebhook((prev) => ({ ...prev, secret: e.target.value }))
                        }
                        placeholder="whsec_..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used to verify webhook signatures
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Events to Trigger</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {WEBHOOK_EVENTS.map((event) => (
                        <div key={event.id} className="flex items-center gap-2">
                          <Checkbox
                            id={event.id}
                            checked={newWebhook.events?.includes(event.id)}
                            onCheckedChange={() => toggleWebhookEvent(event.id)}
                          />
                          <Label
                            htmlFor={event.id}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {event.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setWebhookDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddWebhook}>Add Webhook</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No webhooks configured</p>
              <p className="text-sm">Add a webhook to receive real-time event notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm">{webhook.url}</code>
                      <Badge variant={webhook.is_active ? 'secondary' : 'outline'}>
                        {webhook.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {webhook.events.length} events configured
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={webhook.is_active}
                      onCheckedChange={(checked) =>
                        setWebhooks((prev) =>
                          prev.map((w) =>
                            w.id === webhook.id ? { ...w, is_active: checked } : w
                          )
                        )
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setWebhooks((prev) => prev.filter((w) => w.id !== webhook.id))
                      }
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Webhook Payload Example */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Example Payload</h4>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(
                {
                  event: 'ticket_created',
                  timestamp: new Date().toISOString(),
                  data: {
                    ticket_id: 'ticket_abc123',
                    subject: 'Example ticket',
                    status: 'open',
                    priority: 'high',
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
