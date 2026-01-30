import { useState, useEffect } from 'react';
import { Shield, Check, X, TestTube } from 'lucide-react';
import { SSOService, type SSOConfiguration } from '@/lib/services/ssoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type SSOConfig = SSOConfiguration;

export function SSOConfiguration({ organizationId }: { organizationId: string }) {
  const [configs, setConfigs] = useState<SSOConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    provider: '',
    sso_type: 'saml',
    entity_id: '',
    sso_url: '',
    certificate: '',
  });

  useEffect(() => {
    loadConfigs();
  }, [organizationId]);

  const loadConfigs = async () => {
    setLoading(true);
    const data = await SSOService.getSSOConfig(organizationId);
    setConfigs(data ? [data] : []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await SSOService.createSSOConfig(organizationId, 'current-user-id', {
      provider: formData.provider,
      entity_id: formData.entity_id,
      sso_url: formData.sso_url,
      certificate: formData.certificate,
    });
    setShowForm(false);
    setFormData({ provider: '', sso_type: 'saml', entity_id: '', sso_url: '', certificate: '' });
    loadConfigs();
  };

  const handleToggle = async (configId: string, isActive: boolean) => {
    await SSOService.toggleSSO(configId, !isActive);
    loadConfigs();
  };

  const handleTest = async (configId: string) => {
    const result = await SSOService.testSSOConfig(configId);
    alert(result.success ? 'Connection successful!' : `Failed: ${result.message}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">SSO Configuration</h2>
          <p className="text-muted-foreground">Configure single sign-on providers</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add SSO Provider'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New SSO Configuration</CardTitle>
            <CardDescription>Configure SAML or OAuth2 provider</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Provider Name</label>
                  <Input
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    placeholder="Okta, Azure AD, etc."
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SSO Type</label>
                  <Select value={formData.sso_type} onValueChange={(v) => setFormData({ ...formData, sso_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saml">SAML 2.0</SelectItem>
                      <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      <SelectItem value="oidc">OpenID Connect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Entity ID / Client ID</label>
                <Input
                  value={formData.entity_id}
                  onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
                  placeholder="https://your-org.okta.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">SSO URL / Authorization Endpoint</label>
                <Input
                  value={formData.sso_url}
                  onChange={(e) => setFormData({ ...formData, sso_url: e.target.value })}
                  placeholder="https://your-org.okta.com/sso"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Certificate / Client Secret</label>
                <Textarea
                  value={formData.certificate}
                  onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
                  placeholder="-----BEGIN CERTIFICATE-----"
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" className="w-full">Create SSO Configuration</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">Loading configurations...</div>
      ) : configs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No SSO providers configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {configs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {config.provider}
                    </CardTitle>
                    <CardDescription className="uppercase text-xs mt-1">
                      {config.sso_type}
                    </CardDescription>
                  </div>
                  <Badge variant={config.is_active ? 'default' : 'secondary'}>
                    {config.is_active ? (
                      <><Check className="h-3 w-3 mr-1" /> Active</>
                    ) : (
                      <><X className="h-3 w-3 mr-1" /> Inactive</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Entity ID</p>
                    <p className="font-mono text-xs truncate">{config.entity_id}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">SSO URL</p>
                    <p className="font-mono text-xs truncate">{config.sso_url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggle(config.id, config.is_active)}
                      className="flex-1"
                    >
                      {config.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTest(config.id)}
                    >
                      <TestTube className="h-4 w-4" />
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
