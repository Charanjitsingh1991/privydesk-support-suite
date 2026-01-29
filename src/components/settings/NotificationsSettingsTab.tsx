import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Mail, Smartphone, Clock } from 'lucide-react';
import { DEFAULT_NOTIFICATION_SETTINGS, type NotificationSettings } from '@/types/settings';

export function NotificationsSettingsTab() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Admin Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Admin Email Notifications
          </CardTitle>
          <CardDescription>
            Email notifications for organization administrators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Ticket Created</Label>
              <p className="text-xs text-muted-foreground">
                Get notified when a new ticket is created
              </p>
            </div>
            <Switch
              checked={settings.admin_new_ticket}
              onCheckedChange={(checked) => updateSetting('admin_new_ticket', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Priority Ticket</Label>
              <p className="text-xs text-muted-foreground">
                Alert when a high or urgent priority ticket arrives
              </p>
            </div>
            <Switch
              checked={settings.admin_high_priority}
              onCheckedChange={(checked) => updateSetting('admin_high_priority', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Negative Sentiment Detected</Label>
              <p className="text-xs text-muted-foreground">
                Alert when AI detects negative customer sentiment
              </p>
            </div>
            <Switch
              checked={settings.admin_negative_sentiment}
              onCheckedChange={(checked) => updateSetting('admin_negative_sentiment', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Ticket Summary</Label>
              <p className="text-xs text-muted-foreground">
                Receive a daily summary of ticket activity
              </p>
            </div>
            <Switch
              checked={settings.admin_daily_summary}
              onCheckedChange={(checked) => updateSetting('admin_daily_summary', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Analytics Report</Label>
              <p className="text-xs text-muted-foreground">
                Get weekly performance and analytics insights
              </p>
            </div>
            <Switch
              checked={settings.admin_weekly_report}
              onCheckedChange={(checked) => updateSetting('admin_weekly_report', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Agent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Agent Email Notifications
          </CardTitle>
          <CardDescription>
            Email notifications for support agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ticket Assigned to Me</Label>
              <p className="text-xs text-muted-foreground">
                Notify when a ticket is assigned to the agent
              </p>
            </div>
            <Switch
              checked={settings.agent_ticket_assigned}
              onCheckedChange={(checked) => updateSetting('agent_ticket_assigned', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Message on My Ticket</Label>
              <p className="text-xs text-muted-foreground">
                Notify when a customer replies to an assigned ticket
              </p>
            </div>
            <Switch
              checked={settings.agent_new_message}
              onCheckedChange={(checked) => updateSetting('agent_new_message', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ticket Overdue</Label>
              <p className="text-xs text-muted-foreground">
                Alert when an assigned ticket exceeds its SLA
              </p>
            </div>
            <Switch
              checked={settings.agent_ticket_overdue}
              onCheckedChange={(checked) => updateSetting('agent_ticket_overdue', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mentioned in Internal Note</Label>
              <p className="text-xs text-muted-foreground">
                Notify when mentioned by another team member
              </p>
            </div>
            <Switch
              checked={settings.agent_mentioned}
              onCheckedChange={(checked) => updateSetting('agent_mentioned', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Client Email Notifications
          </CardTitle>
          <CardDescription>
            Email notifications sent to clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ticket Status Changed</Label>
              <p className="text-xs text-muted-foreground">
                Notify clients when their ticket status changes
              </p>
            </div>
            <Switch
              checked={settings.client_status_changed}
              onCheckedChange={(checked) => updateSetting('client_status_changed', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Reply from Agent</Label>
              <p className="text-xs text-muted-foreground">
                Notify when an agent responds to their ticket
              </p>
            </div>
            <Switch
              checked={settings.client_new_reply}
              onCheckedChange={(checked) => updateSetting('client_new_reply', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ticket Resolved</Label>
              <p className="text-xs text-muted-foreground">
                Notify when their ticket has been resolved
              </p>
            </div>
            <Switch
              checked={settings.client_ticket_resolved}
              onCheckedChange={(checked) => updateSetting('client_ticket_resolved', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Browser Push Notifications
          </CardTitle>
          <CardDescription>
            Receive real-time notifications in your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Push Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive browser notifications for important events
              </p>
            </div>
            <Switch
              checked={settings.push_notifications_enabled}
              onCheckedChange={(checked) => updateSetting('push_notifications_enabled', checked)}
            />
          </div>

          {settings.push_notifications_enabled && (
            <Button
              variant="outline"
              onClick={() => {
                Notification.requestPermission().then((permission) => {
                  if (permission === 'granted') {
                    new Notification('Notifications Enabled', {
                      body: 'You will now receive browser notifications',
                      icon: '/favicon.ico',
                    });
                  }
                });
              }}
            >
              Request Permission
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification Digest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Notification Digest
          </CardTitle>
          <CardDescription>
            Control how notifications are batched and delivered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Digest Frequency</Label>
            <Select
              value={settings.digest_frequency}
              onValueChange={(value: NotificationSettings['digest_frequency']) =>
                updateSetting('digest_frequency', value)
              }
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant (No batching)</SelectItem>
                <SelectItem value="15min">Every 15 minutes</SelectItem>
                <SelectItem value="hourly">Every hour</SelectItem>
                <SelectItem value="twice_daily">Twice daily</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Batch non-urgent notifications to reduce interruptions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>Save Notification Settings</Button>
      </div>
    </div>
  );
}
