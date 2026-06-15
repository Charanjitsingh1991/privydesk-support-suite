import { useState, useEffect } from 'react';
import { Palette, Upload, Globe, Check } from 'lucide-react';
import { BrandingService } from '@/lib/services/brandingService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface BrandingSettings {
  id?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  custom_css?: string;
  email_header_html?: string;
  email_footer_html?: string;
}

interface CustomDomain {
  id: string;
  domain: string;
  is_verified: boolean;
  verification_token?: string;
}

export function BrandingSettings({ organizationId }: { organizationId: string }) {
  const [settings, setSettings] = useState<BrandingSettings>({
    primary_color: '#6366f1',
    secondary_color: '#a3e635',
  });
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    loadDomains();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const loadSettings = async () => {
    setLoading(true);
    const data = await BrandingService.getBrandingSettings(organizationId);
    if (data) setSettings(data);
    setLoading(false);
  };

  const loadDomains = async () => {
    const data = await BrandingService.getCustomDomains(organizationId);
    setDomains(data);
  };

  const handleSave = async () => {
    await BrandingService.updateBrandingSettings(organizationId, settings);
    alert('Branding settings saved successfully!');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const logoUrl = await BrandingService.uploadLogo(organizationId, file);
    if (logoUrl) {
      setSettings({ ...settings, logo_url: logoUrl });
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    await BrandingService.addCustomDomain(organizationId, newDomain);
    setNewDomain('');
    loadDomains();
  };

  const handleVerifyDomain = async (domainId: string) => {
    const result = await BrandingService.verifyCustomDomain(domainId);
    alert(result.verified ? 'Domain verified!' : `Failed: ${result.message}`);
    loadDomains();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Branding & White-Label</h2>
        <p className="text-muted-foreground">Customize your support portal appearance</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading settings...</div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Logo & Favicon
              </CardTitle>
              <CardDescription>Upload your brand assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Logo</label>
                  <div className="mt-2 flex items-center gap-4">
                    {settings.logo_url && (
                      <img src={settings.logo_url} alt="Logo" className="h-12 w-auto" />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Favicon</label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      accept="image/x-icon,image/png"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Scheme
              </CardTitle>
              <CardDescription>Customize your brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Secondary Color</label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                      placeholder="#a3e635"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
              <CardDescription>Add custom styles to your portal</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={settings.custom_css || ''}
                onChange={(e) => setSettings({ ...settings, custom_css: e.target.value })}
                placeholder=".header { background: #000; }"
                rows={6}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Custom Domains
              </CardTitle>
              <CardDescription>Use your own domain for the support portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="support.yourcompany.com"
                  className="flex-1"
                />
                <Button onClick={handleAddDomain}>Add Domain</Button>
              </div>

              {domains.length > 0 && (
                <div className="space-y-2">
                  {domains.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{domain.domain}</span>
                        <Badge variant={domain.is_verified ? 'default' : 'secondary'}>
                          {domain.is_verified ? (
                            <><Check className="h-3 w-3 mr-1" /> Verified</>
                          ) : (
                            'Pending'
                          )}
                        </Badge>
                      </div>
                      {!domain.is_verified && (
                        <Button size="sm" variant="outline" onClick={() => handleVerifyDomain(domain.id)}>
                          Verify
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              Save Branding Settings
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
