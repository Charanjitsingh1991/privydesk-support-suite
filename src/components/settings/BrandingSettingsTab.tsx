import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Palette, Image, Mail, Share2 } from 'lucide-react';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';
import { ColorPicker } from './ColorPicker';
import { FileUploader } from './FileUploader';
import type { BrandingSettings } from '@/types/settings';

export function BrandingSettingsTab() {
  const { settings, loading, saving, updateSettings, updateBranding, uploadLogo, uploadFavicon } =
    useOrganizationSettings();
  const [branding, setBranding] = useState<BrandingSettings>({
    secondary_color: '#8b5cf6',
    accent_color: '#22c55e',
    text_color: '#1e293b',
    background_color: '#ffffff',
    email_header_position: 'center',
    email_footer_text: '',
    email_signature: '',
    company_address: '',
    social_links: {},
  });
  const [primaryColor, setPrimaryColor] = useState('#6366f1');

  useEffect(() => {
    if (settings) {
      setPrimaryColor(settings.primary_color || '#6366f1');
      if (settings.branding) {
        setBranding(prev => ({
          ...prev,
          ...(settings.branding as BrandingSettings),
        }));
      }
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({ primary_color: primaryColor });
    await updateBranding(branding);
  };

  const updateSocialLink = (platform: keyof NonNullable<BrandingSettings['social_links']>, url: string) => {
    setBranding(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: url,
      },
    }));
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
      {/* Logo Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Logo Management
          </CardTitle>
          <CardDescription>
            Upload your organization's logo and favicon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FileUploader
              label="Main Logo"
              description="Used in dashboard and emails. Max 2MB. PNG, SVG, or JPG."
              currentFile={settings?.logo_url}
              onUpload={async (file) => {
                await uploadLogo(file);
              }}
            />

            <FileUploader
              label="Favicon"
              description="Browser tab icon. ICO or PNG format."
              currentFile={branding.favicon_url}
              onUpload={async (file) => {
                await uploadFavicon(file);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Scheme
          </CardTitle>
          <CardDescription>
            Customize your brand colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ColorPicker
              label="Primary Color"
              value={primaryColor}
              onChange={setPrimaryColor}
              description="Main brand color used for buttons and accents"
            />

            <ColorPicker
              label="Secondary Color"
              value={branding.secondary_color || '#8b5cf6'}
              onChange={(value) => setBranding(prev => ({ ...prev, secondary_color: value }))}
              description="Used for secondary elements"
            />

            <ColorPicker
              label="Accent Color"
              value={branding.accent_color || '#22c55e'}
              onChange={(value) => setBranding(prev => ({ ...prev, accent_color: value }))}
              description="Used for highlights and success states"
            />
          </div>

          {/* Color Preview */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">Preview</h4>
            <div className="flex items-center gap-4">
              <button
                className="px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: branding.secondary_color }}
              >
                Secondary Button
              </button>
              <button
                className="px-4 py-2 rounded-md text-white font-medium"
                style={{ backgroundColor: branding.accent_color }}
              >
                Accent Button
              </button>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setPrimaryColor('#6366f1');
              setBranding(prev => ({
                ...prev,
                secondary_color: '#8b5cf6',
                accent_color: '#22c55e',
              }));
            }}
          >
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>

      {/* Email Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Branding
          </CardTitle>
          <CardDescription>
            Customize how your emails look
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Header Logo Position</Label>
            <Select
              value={branding.email_header_position || 'center'}
              onValueChange={(value: 'left' | 'center' | 'right') =>
                setBranding(prev => ({ ...prev, email_header_position: value }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_address">Company Address</Label>
            <Textarea
              id="company_address"
              value={branding.company_address || ''}
              onChange={(e) => setBranding(prev => ({ ...prev, company_address: e.target.value }))}
              placeholder="123 Main St, City, State 12345"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_footer">Email Footer Text</Label>
            <Textarea
              id="email_footer"
              value={branding.email_footer_text || ''}
              onChange={(e) => setBranding(prev => ({ ...prev, email_footer_text: e.target.value }))}
              placeholder="© 2025 Your Company. All rights reserved."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_signature">Email Signature</Label>
            <Textarea
              id="email_signature"
              value={branding.email_signature || ''}
              onChange={(e) => setBranding(prev => ({ ...prev, email_signature: e.target.value }))}
              placeholder="Best regards,&#10;The Support Team"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Links
          </CardTitle>
          <CardDescription>
            Add social media links to your email footer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                type="url"
                value={branding.social_links?.facebook || ''}
                onChange={(e) => updateSocialLink('facebook', e.target.value)}
                placeholder="https://facebook.com/yourcompany"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                type="url"
                value={branding.social_links?.twitter || ''}
                onChange={(e) => updateSocialLink('twitter', e.target.value)}
                placeholder="https://twitter.com/yourcompany"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                value={branding.social_links?.linkedin || ''}
                onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                type="url"
                value={branding.social_links?.instagram || ''}
                onChange={(e) => updateSocialLink('instagram', e.target.value)}
                placeholder="https://instagram.com/yourcompany"
              />
            </div>
          </div>
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
