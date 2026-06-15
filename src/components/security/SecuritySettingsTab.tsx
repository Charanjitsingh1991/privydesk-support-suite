import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useUser } from '@/hooks/useSession';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TwoFactorSetup, TwoFactorStatus } from '@/components/auth/TwoFactorSetup';
import { SessionManager } from '@/components/security/SessionManager';
import type { SecuritySettings } from '@/types/security';
import { 
  Loader2, 
  Shield, 
  Smartphone, 
  Key, 
  Clock, 
  Monitor, 
  Globe,
  Lock,
  AlertTriangle,
  Eye,
  EyeOff,
  History,
} from 'lucide-react';

export function SecuritySettingsTab() {
  const { user } = useAuth();
  const { organizationId, role } = useUser();
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
  
  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disabling2FA, setDisabling2FA] = useState(false);

  useEffect(() => {
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      // Check if user has 2FA enabled (would check user metadata or separate table in real implementation)
      // For demo purposes, checking local state
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
       
      const { error } = await supabase
        .from('organizations')
        .update({ security_settings: settings as Record<string, unknown> })
        .eq('id', organizationId);

      if (error) throw error;
      toast({ title: 'Settings saved successfully' });
    } catch (error: unknown) {
      toast({
        title: 'Error saving settings',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleEnable2FA = async (data: { secret: string; backupCodes: string[] }) => {
    // In production, save to database/auth provider
    setTwoFactorEnabled(true);
    setShowTwoFactorSetup(false);
    toast({
      title: '2FA Enabled',
      description: 'Your account is now protected with two-factor authentication.',
    });
  };

  const handleDisable2FA = async () => {
    if (!disableCode) return;
    
    setDisabling2FA(true);
    try {
      // In production, verify the code and disable 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorEnabled(false);
      setShowDisable2FADialog(false);
      setDisableCode('');
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Invalid verification code.',
        variant: 'destructive',
      });
    } finally {
      setDisabling2FA(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (showTwoFactorSetup && user?.email) {
    return (
      <div className="max-w-md mx-auto">
        <TwoFactorSetup
          email={user.email}
          onComplete={handleEnable2FA}
          onCancel={() => setShowTwoFactorSetup(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TwoFactorStatus
            enabled={twoFactorEnabled}
            onEnable={() => setShowTwoFactorSetup(true)}
            onDisable={() => setShowDisable2FADialog(true)}
          />

          {(role === 'admin' || role === 'super_admin') && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require 2FA for all admins</Label>
                  <p className="text-xs text-muted-foreground">
                    Force all admin users to enable 2FA
                  </p>
                </div>
                <Switch checked={false} onCheckedChange={() => {}} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require 2FA for all agents</Label>
                  <p className="text-xs text-muted-foreground">
                    Force all agent users to enable 2FA
                  </p>
                </div>
                <Switch checked={false} onCheckedChange={() => {}} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Session Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Session Security
          </CardTitle>
          <CardDescription>
            Configure session timeouts and device management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
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
                Max devices logged in simultaneously
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Idle Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                min={5}
                max={480}
                value={settings.session_timeout_minutes}
                onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value) || 30)}
              />
              <p className="text-xs text-muted-foreground">
                Auto-logout after inactivity
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-max-age">Absolute Timeout (days)</Label>
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

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  IP Address Binding
                </Label>
                <p className="text-xs text-muted-foreground">
                  Sessions only valid from original IP address
                </p>
              </div>
              <Switch
                checked={settings.ip_binding_enabled}
                onCheckedChange={(checked) => updateSetting('ip_binding_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  New Device Notifications
                </Label>
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

          <Separator />

          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <History className="h-4 w-4" />
              Active Sessions
            </h4>
            <SessionManager />
          </div>
        </CardContent>
      </Card>

      {/* Content Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Content Security
          </CardTitle>
          <CardDescription>
            Configure link and attachment scanning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Scan External Links</Label>
              <p className="text-xs text-muted-foreground">
                Check links for phishing and malware patterns
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
                Block executable and script files (.exe, .bat, .ps1, etc.)
              </p>
            </div>
            <Switch
              checked={settings.block_dangerous_attachments}
              onCheckedChange={(checked) => updateSetting('block_dangerous_attachments', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Client Access */}
      {(role === 'admin' || role === 'super_admin') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Client Access Controls
            </CardTitle>
            <CardDescription>
              Control how clients can access your portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Domain Approval</Label>
                <p className="text-xs text-muted-foreground">
                  New client signups require admin approval
                </p>
              </div>
              <Switch
                checked={settings.require_domain_approval}
                onCheckedChange={(checked) => updateSetting('require_domain_approval', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Block Generic Email Providers</Label>
                <p className="text-xs text-muted-foreground">
                  Prevent signups from Gmail, Yahoo, etc.
                </p>
              </div>
              <Switch
                checked={settings.block_generic_email_providers}
                onCheckedChange={(checked) => updateSetting('block_generic_email_providers', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enterprise Features */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enterprise Security
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>
            Advanced security features for enterprise customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 opacity-60">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP Allowlist</Label>
              <p className="text-xs text-muted-foreground">
                Restrict access to specific IP ranges
              </p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SAML SSO</Label>
              <p className="text-xs text-muted-foreground">
                Single sign-on with your identity provider
              </p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>End-to-End Encryption</Label>
              <p className="text-xs text-muted-foreground">
                Zero-knowledge message encryption
              </p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Audit Log Export</Label>
              <p className="text-xs text-muted-foreground">
                Export detailed security audit logs
              </p>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Settings
        </Button>
      </div>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FADialog} onOpenChange={setShowDisable2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your authentication code to confirm disabling 2FA
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Disabling 2FA will make your account less secure
              </AlertDescription>
            </Alert>
            <Label htmlFor="disable-code">Verification Code</Label>
            <Input
              id="disable-code"
              placeholder="000000"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mt-2 text-center text-xl tracking-widest font-mono"
              maxLength={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisable2FADialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisable2FA}
              disabled={disableCode.length !== 6 || disabling2FA}
            >
              {disabling2FA && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Disable 2FA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
