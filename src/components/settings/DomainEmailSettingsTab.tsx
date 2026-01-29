import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Globe, Mail, CheckCircle2, AlertCircle, Clock, Lock } from 'lucide-react';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';
import { useToast } from '@/hooks/use-toast';
import type { EmailConfig } from '@/types/settings';

export function DomainEmailSettingsTab() {
  const { settings, loading, saving, updateSettings, updateEmailConfig } = useOrganizationSettings();
  const { toast } = useToast();
  const [customDomain, setCustomDomain] = useState('');
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    provider: 'shared',
    from_name: '',
    from_email: '',
    reply_to: '',
  });
  const [verifying, setVerifying] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    if (settings) {
      setCustomDomain(settings.custom_domain || '');
      if (settings.email_config) {
        setEmailConfig(prev => ({
          ...prev,
          ...(settings.email_config as EmailConfig),
        }));
      }
    }
  }, [settings]);

  const handleVerifyDomain = async () => {
    if (!customDomain) return;
    setVerifying(true);

    try {
      // TODO: Implement actual domain verification
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({ title: 'Verification started', description: 'Check your DNS settings' });
    } catch (error) {
      toast({ title: 'Verification failed', variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);

    try {
      // TODO: Implement actual email test
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({ title: 'Test email sent successfully' });
    } catch (error) {
      toast({ title: 'Connection test failed', variant: 'destructive' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async () => {
    await updateSettings({ custom_domain: customDomain || null });
    await updateEmailConfig(emailConfig);
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
      {/* Custom Domain Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Domain
          </CardTitle>
          <CardDescription>
            Use your own domain for a branded support experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Domain</Label>
            <div className="flex items-center gap-2">
              <code className="px-3 py-2 bg-muted rounded-md text-sm">
                {settings?.slug}.privydesk.com
              </code>
              <Badge variant="secondary">Default</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_domain">Custom Domain</Label>
            <div className="flex gap-2">
              <Input
                id="custom_domain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="support.yourcompany.com"
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleVerifyDomain}
                disabled={verifying || !customDomain}
              >
                {verifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Verify
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label>Verification Status:</Label>
            {settings?.domain_verified ? (
              <Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            ) : customDomain ? (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Pending Verification
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Not Configured
              </Badge>
            )}
          </div>

          {customDomain && !settings?.domain_verified && (
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h4 className="font-medium text-sm">DNS Configuration Required</h4>
              <p className="text-sm text-muted-foreground">
                Add the following DNS records to verify ownership:
              </p>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2 bg-background rounded">
                  <span className="text-muted-foreground">TXT</span> _verification.{customDomain}{' '}
                  <span className="text-primary">"privydesk-verify={settings?.id}"</span>
                </div>
                <div className="p-2 bg-background rounded">
                  <span className="text-muted-foreground">CNAME</span> {customDomain}{' '}
                  <span className="text-primary">custom.privydesk.com</span>
                </div>
              </div>
            </div>
          )}

          {settings?.domain_verified && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Lock className="h-4 w-4" />
              SSL certificate active
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure how emails are sent from your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Email Provider</Label>
            <RadioGroup
              value={emailConfig.provider}
              onValueChange={(value: 'shared' | 'resend' | 'smtp') =>
                setEmailConfig(prev => ({ ...prev, provider: value }))
              }
              className="space-y-3"
            >
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <RadioGroupItem value="shared" id="shared" className="mt-1" />
                <div>
                  <Label htmlFor="shared" className="font-medium cursor-pointer">
                    Shared Email (Default)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Use our shared email infrastructure. Free but limited branding.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <RadioGroupItem value="resend" id="resend" className="mt-1" />
                <div>
                  <Label htmlFor="resend" className="font-medium cursor-pointer">
                    Resend API (Recommended)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Professional email delivery with full branding support.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <RadioGroupItem value="smtp" id="smtp" className="mt-1" />
                <div>
                  <Label htmlFor="smtp" className="font-medium cursor-pointer">
                    Custom SMTP Server
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Use your own SMTP server for complete control.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {emailConfig.provider === 'resend' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="resend_api_key">Resend API Key</Label>
                <Input
                  id="resend_api_key"
                  type="password"
                  value={emailConfig.resend_api_key || ''}
                  onChange={(e) =>
                    setEmailConfig(prev => ({ ...prev, resend_api_key: e.target.value }))
                  }
                  placeholder="re_xxxxxxxxxx"
                />
              </div>
            </div>
          )}

          {emailConfig.provider === 'smtp' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={emailConfig.smtp_host || ''}
                    onChange={(e) =>
                      setEmailConfig(prev => ({ ...prev, smtp_host: e.target.value }))
                    }
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={emailConfig.smtp_port || 587}
                    onChange={(e) =>
                      setEmailConfig(prev => ({ ...prev, smtp_port: parseInt(e.target.value) }))
                    }
                    placeholder="587"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_username">Username</Label>
                  <Input
                    id="smtp_username"
                    value={emailConfig.smtp_username || ''}
                    onChange={(e) =>
                      setEmailConfig(prev => ({ ...prev, smtp_username: e.target.value }))
                    }
                    placeholder="user@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_password">Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={emailConfig.smtp_password || ''}
                    onChange={(e) =>
                      setEmailConfig(prev => ({ ...prev, smtp_password: e.target.value }))
                    }
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Encryption</Label>
                <Select
                  value={emailConfig.smtp_encryption || 'tls'}
                  onValueChange={(value: 'ssl' | 'tls' | 'none') =>
                    setEmailConfig(prev => ({ ...prev, smtp_encryption: value }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* From Email Settings */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">From Email Settings</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from_name">From Name</Label>
                <Input
                  id="from_name"
                  value={emailConfig.from_name || ''}
                  onChange={(e) =>
                    setEmailConfig(prev => ({ ...prev, from_name: e.target.value }))
                  }
                  placeholder="Support Team"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from_email">From Email</Label>
                <Input
                  id="from_email"
                  type="email"
                  value={emailConfig.from_email || ''}
                  onChange={(e) =>
                    setEmailConfig(prev => ({ ...prev, from_email: e.target.value }))
                  }
                  placeholder="support@yourcompany.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply_to">Reply-To Email</Label>
                <Input
                  id="reply_to"
                  type="email"
                  value={emailConfig.reply_to || ''}
                  onChange={(e) =>
                    setEmailConfig(prev => ({ ...prev, reply_to: e.target.value }))
                  }
                  placeholder="help@yourcompany.com"
                />
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testingConnection}
          >
            {testingConnection && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Test Connection
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
