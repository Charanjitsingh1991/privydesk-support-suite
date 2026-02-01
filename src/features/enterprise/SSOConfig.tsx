import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Globe, CheckCircle } from 'lucide-react';

interface SSOProvider {
  id: string;
  name: string;
  enabled: boolean;
  icon: any;
}

export function SSOConfig() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<SSOProvider[]>([
    { id: 'google', name: 'Google OAuth', enabled: false, icon: Globe },
    { id: 'microsoft', name: 'Microsoft Azure AD', enabled: false, icon: Shield },
    { id: 'okta', name: 'Okta', enabled: false, icon: Key },
    { id: 'saml', name: 'SAML 2.0', enabled: false, icon: Shield },
  ]);

  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    domain: '',
    redirectUri: window.location.origin + '/auth/callback',
  });

  const handleToggleProvider = (id: string) => {
    setProviders(providers.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const handleSaveConfig = async () => {
    // Save SSO configuration to database
    toast({
      title: 'SSO Configuration Saved',
      description: 'Single Sign-On has been configured successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Single Sign-On (SSO)</h2>
        <p className="text-white/60">Configure enterprise SSO providers for your organization</p>
      </div>

      {/* SSO Providers */}
      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <Card key={provider.id} className="p-6 bg-white/5 border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent-lime/10 flex items-center justify-center">
                  <provider.icon className="w-5 h-5 text-accent-lime" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{provider.name}</h3>
                  <p className="text-sm text-white/60">
                    {provider.enabled ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <Switch
                checked={provider.enabled}
                onCheckedChange={() => handleToggleProvider(provider.id)}
              />
            </div>
            {provider.enabled && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div>
                  <Label className="text-white/80">Client ID</Label>
                  <Input
                    value={config.clientId}
                    onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                    placeholder="Enter client ID"
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white/80">Client Secret</Label>
                  <Input
                    type="password"
                    value={config.clientSecret}
                    onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                    placeholder="Enter client secret"
                    className="bg-black/20 border-white/10 text-white"
                  />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Configuration */}
      <Card className="p-6 bg-white/5 border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">SSO Configuration</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-white/80">Domain</Label>
            <Input
              value={config.domain}
              onChange={(e) => setConfig({ ...config, domain: e.target.value })}
              placeholder="company.com"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-white/80">Redirect URI</Label>
            <Input
              value={config.redirectUri}
              readOnly
              className="bg-black/20 border-white/10 text-white/60"
            />
          </div>
          <Button onClick={handleSaveConfig} className="bg-accent-lime text-black hover:bg-accent-lime/90">
            <CheckCircle className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </Card>
    </div>
  );
}
