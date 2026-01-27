import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Webhook, 
  Plus, 
  Copy, 
  Trash2, 
  Check, 
  Eye, 
  EyeOff, 
  Loader2, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useWebhooks, useWebhookLogs, WEBHOOK_EVENTS, generateWebhookSecret, CreateWebhookInput } from '@/hooks/useWebhooks';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function WebhooksManager() {
  const { toast } = useToast();
  const { 
    webhooks, 
    isLoading, 
    createWebhook, 
    deleteWebhook, 
    toggleWebhook, 
    testWebhook 
  } = useWebhooks();
  const { logs } = useWebhookLogs();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const [newWebhookForm, setNewWebhookForm] = useState<CreateWebhookInput>({
    name: '',
    url: '',
    secret: '',
    events: [],
  });

  const handleGenerateSecret = () => {
    setNewWebhookForm(prev => ({ ...prev, secret: generateWebhookSecret() }));
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookForm.name || !newWebhookForm.url || !newWebhookForm.secret || newWebhookForm.events.length === 0) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    await createWebhook.mutateAsync(newWebhookForm);
    setCreateDialogOpen(false);
    setNewWebhookForm({ name: '', url: '', secret: '', events: [] });
  };

  const toggleEvent = (eventId: string) => {
    setNewWebhookForm(prev => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter(e => e !== eventId)
        : [...prev.events, eventId],
    }));
  };

  const confirmDelete = async () => {
    if (webhookToDelete) {
      await deleteWebhook.mutateAsync(webhookToDelete);
      setDeleteDialogOpen(false);
      setWebhookToDelete(null);
    }
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast({ title: 'Secret Copied!' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  return (
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
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
                  <Label htmlFor="webhook_name">Name</Label>
                  <Input
                    id="webhook_name"
                    value={newWebhookForm.name}
                    onChange={(e) => setNewWebhookForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Slack Notifications"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Endpoint URL</Label>
                  <Input
                    id="webhook_url"
                    value={newWebhookForm.url}
                    onChange={(e) => setNewWebhookForm(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://your-server.com/webhook"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="webhook_secret">Secret Key</Label>
                    <Button variant="ghost" size="sm" onClick={handleGenerateSecret}>
                      Generate
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="webhook_secret"
                      type={showSecret ? 'text' : 'password'}
                      value={newWebhookForm.secret}
                      onChange={(e) => setNewWebhookForm(prev => ({ ...prev, secret: e.target.value }))}
                      placeholder="whsec_..."
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used to verify webhook signatures (HMAC-SHA256)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Events to Subscribe</Label>
                  <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {WEBHOOK_EVENTS.map((event) => (
                      <div key={event.id} className="flex items-start gap-2">
                        <Checkbox
                          id={event.id}
                          checked={newWebhookForm.events.includes(event.id)}
                          onCheckedChange={() => toggleEvent(event.id)}
                        />
                        <div className="grid gap-0.5">
                          <Label htmlFor={event.id} className="text-sm font-medium cursor-pointer">
                            {event.label}
                          </Label>
                          <span className="text-xs text-muted-foreground">
                            {event.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWebhook} disabled={createWebhook.isPending}>
                  {createWebhook.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Webhook
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="webhooks">
          <TabsList>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
            <TabsTrigger value="payload">Payload Example</TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : webhooks.length === 0 ? (
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
                        <span className="font-medium">{webhook.name}</span>
                        <Badge variant={webhook.is_active ? 'secondary' : 'outline'}>
                          {webhook.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {webhook.failure_count >= 3 && (
                          <Badge variant="destructive">Failed</Badge>
                        )}
                      </div>
                      <code className="text-xs text-muted-foreground block">{webhook.url}</code>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{webhook.events.length} events</span>
                        {webhook.last_triggered_at && (
                          <span>Last triggered: {format(new Date(webhook.last_triggered_at), 'MMM d, yyyy HH:mm')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copySecret(webhook.secret)}
                        title="Copy secret"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => testWebhook.mutate(webhook)}
                        disabled={testWebhook.isPending}
                        title="Test webhook"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={webhook.is_active}
                        onCheckedChange={(checked) => toggleWebhook.mutate({ webhookId: webhook.id, isActive: checked })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setWebhookToDelete(webhook.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No webhook deliveries yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusBadge(log.status)}
                      <span className="font-medium">{log.event}</span>
                      {log.response_code && (
                        <code className="text-xs bg-muted px-2 py-0.5 rounded">
                          HTTP {log.response_code}
                        </code>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      {log.error_message && (
                        <span className="text-xs text-destructive">{log.error_message}</span>
                      )}
                      <span className="text-xs">
                        {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payload" className="mt-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Example Webhook Payload</h4>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(
                  {
                    event: 'ticket.created',
                    timestamp: new Date().toISOString(),
                    organization_id: 'org_uuid_here',
                    data: {
                      ticket_id: 'ticket_uuid_here',
                      subject: 'Example ticket',
                      status: 'open',
                      priority: 'high',
                      created_by: {
                        id: 'user_uuid',
                        name: 'John Doe',
                        email: 'john@example.com',
                      },
                    },
                  },
                  null,
                  2
                )}
              </pre>
              <div className="mt-4 text-xs text-muted-foreground">
                <p className="font-medium">Signature Verification:</p>
                <p>Verify the <code className="bg-background px-1 rounded">X-Webhook-Signature</code> header using HMAC-SHA256 with your secret key.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete confirmation dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. You will stop receiving event notifications at this endpoint.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete Webhook
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
