import { useState, useEffect } from 'react';
import { Smartphone, Bell, Wifi, Download, Trash2 } from 'lucide-react';
import { MobileService } from '@/lib/services/mobileService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface MobileDevice {
  id: string;
  device_token: string;
  platform: string;
  device_model: string;
  os_version: string;
  app_version: string;
  is_active: boolean;
  last_active_at: string;
  created_at: string;
}

interface NotificationSettings {
  newTicket: boolean;
  ticketUpdates: boolean;
  mentions: boolean;
  assignments: boolean;
}

export function MobileSettings({ organizationId, userId }: { organizationId: string; userId: string }) {
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    newTicket: true,
    ticketUpdates: true,
    mentions: true,
    assignments: true,
  });

  useEffect(() => {
    loadDevices();
  }, [userId]);

  const loadDevices = async () => {
    setLoading(true);
    const data = await MobileService.getUserDevices(userId);
    setDevices(data);
    setLoading(false);
  };

  const handleRemoveDevice = async (deviceId: string) => {
    if (confirm('Remove this device? You will need to log in again on that device.')) {
      await MobileService.removeDevice(deviceId);
      loadDevices();
    }
  };

  const handleToggleNotifications = async (deviceId: string, enabled: boolean) => {
    // Update device notification settings
    // This would need an updateDevice method in MobileService
    console.log('Toggle notifications for device:', deviceId, enabled);
  };

  const handleSendTestNotification = async () => {
    if (devices.length === 0) {
      alert('No devices registered');
      return;
    }
    
    await MobileService.sendPushNotification(
      userId,
      organizationId,
      'Test Notification',
      'This is a test notification from PrivyDesk',
      { type: 'test' },
      'test'
    );
    
    alert('Test notification sent to all devices!');
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'ios' ? '🍎' : '🤖';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Mobile App Settings</h2>
        <p className="text-muted-foreground">Manage mobile devices and notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Tickets</p>
              <p className="text-sm text-muted-foreground">When a new ticket is created</p>
            </div>
            <Switch
              checked={notificationSettings.newTicket}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, newTicket: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Ticket Updates</p>
              <p className="text-sm text-muted-foreground">When tickets you're watching are updated</p>
            </div>
            <Switch
              checked={notificationSettings.ticketUpdates}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, ticketUpdates: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mentions</p>
              <p className="text-sm text-muted-foreground">When someone mentions you</p>
            </div>
            <Switch
              checked={notificationSettings.mentions}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, mentions: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Assignments</p>
              <p className="text-sm text-muted-foreground">When a ticket is assigned to you</p>
            </div>
            <Switch
              checked={notificationSettings.assignments}
              onCheckedChange={(checked) =>
                setNotificationSettings({ ...notificationSettings, assignments: checked })
              }
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleSendTestNotification} variant="outline" className="w-full">
              <Bell className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Registered Devices
          </CardTitle>
          <CardDescription>
            Devices that have access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading devices...</div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No mobile devices registered</p>
              <p className="text-sm text-muted-foreground mt-2">
                Download the PrivyDesk mobile app to get started
              </p>
              <div className="flex gap-4 justify-center mt-4">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  iOS App
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Android App
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {getPlatformIcon(device.platform)}
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {device.device_model}
                        {device.is_active && (
                          <Badge variant="default" className="text-xs">
                            <Wifi className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {device.platform.toUpperCase()} {device.os_version} • App v{device.app_version}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last active: {new Date(device.last_active_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={device.is_active}
                      onCheckedChange={(checked) => handleToggleNotifications(device.id, checked)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveDevice(device.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Offline Mode</CardTitle>
          <CardDescription>
            Work without internet connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The mobile app can work offline. Your changes will sync automatically when you're back online.
          </p>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Enable Offline Mode</p>
              <p className="text-sm text-muted-foreground">Cache data for offline access</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
