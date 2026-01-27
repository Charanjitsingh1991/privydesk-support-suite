import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SecurityDashboard } from '@/components/security/SecurityDashboard';
import { AllowedDomainsManager } from '@/components/security/AllowedDomainsManager';
import { SessionManager } from '@/components/security/SessionManager';
import { Shield, Globe, Monitor, Settings } from 'lucide-react';

export default function SecuritySettings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Security Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage security settings, monitor threats, and control access
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="dashboard" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="domains" className="gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Domains</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <SecurityDashboard />
          </TabsContent>

          <TabsContent value="domains">
            <AllowedDomainsManager />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionManager />
          </TabsContent>

          <TabsContent value="settings">
            <SecuritySettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { SecuritySettings } from '@/types/security';

function SecuritySettingsPanel() {
  const { organizationId } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SecuritySettings>({
    block_generic_email_providers: false,
    require_domain_approval: true,
    max_concurrent_sessions: 3,
    session_timeout_minutes: 30,
    session_max_age_days: 7,
    ip_binding_enabled: false,
    notify_new_device_login: true,
    scan_external_links: true,
    block_dangerous_attachments: true,
  });

  useEffect(() => {
    loadSettings();
  }, [organizationId]);

  const loadSettings = async () => {
    if (!organizationId) return;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('security_settings')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      
      if (data?.security_settings) {
        const loadedSettings = data.security_settings as unknown as Partial<SecuritySettings>;
        setSettings(prev => ({ ...prev, ...loadedSettings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!organizationId) return;
    setSaving(true);
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from('organizations')
        .update({ security_settings: settings as any })
        .eq('id', organizationId);

      if (error) throw error;
      toast({ title: 'Settings saved successfully' });
    } catch (error: any) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Security</CardTitle>
          <CardDescription>
            Configure session timeouts and device management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max-sessions">Max Concurrent Sessions</Label>
              <Input
                id="max-sessions"
                type="number"
                min={1}
                max={10}
                value={settings.max_concurrent_sessions}
                onChange={(e) => updateSetting('max_concurrent_sessions', parseInt(e.target.value) || 3)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum devices logged in simultaneously
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                min={5}
                max={480}
                value={settings.session_timeout_minutes}
                onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value) || 30)}
              />
              <p className="text-xs text-muted-foreground">
                Logout after inactivity
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-max-age">Max Session Age (days)</Label>
              <Input
                id="session-max-age"
                type="number"
                min={1}
                max={30}
                value={settings.session_max_age_days}
                onChange={(e) => updateSetting('session_max_age_days', parseInt(e.target.value) || 7)}
              />
              <p className="text-xs text-muted-foreground">
                Force re-login after this period
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>IP Address Binding</Label>
                <p className="text-xs text-muted-foreground">
                  Sessions only valid from original IP
                </p>
              </div>
              <Switch
                checked={settings.ip_binding_enabled}
                onCheckedChange={(checked) => updateSetting('ip_binding_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Device Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Email alert on login from new device
                </p>
              </div>
              <Switch
                checked={settings.notify_new_device_login}
                onCheckedChange={(checked) => updateSetting('notify_new_device_login', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Security</CardTitle>
          <CardDescription>
            Configure link and attachment scanning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Scan External Links</Label>
              <p className="text-xs text-muted-foreground">
                Check links for phishing and malware
              </p>
            </div>
            <Switch
              checked={settings.scan_external_links}
              onCheckedChange={(checked) => updateSetting('scan_external_links', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Block Dangerous Attachments</Label>
              <p className="text-xs text-muted-foreground">
                Block executable and script files
              </p>
            </div>
            <Switch
              checked={settings.block_dangerous_attachments}
              onCheckedChange={(checked) => updateSetting('block_dangerous_attachments', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
