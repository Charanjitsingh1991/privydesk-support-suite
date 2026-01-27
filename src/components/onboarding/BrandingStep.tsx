import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { OnboardingData } from '@/hooks/useOnboardingState';

const colorPresets = [
  '#6366f1', // Indigo (default)
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
  '#1e293b', // Slate
];

interface BrandingStepProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function BrandingStep({ data, onUpdate, onNext, onPrev }: BrandingStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${data.slug || 'temp'}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('organization-logos')
        .getPublicUrl(filePath);

      onUpdate({ logoUrl: urlData.publicUrl });
      toast({
        title: 'Logo uploaded',
        description: 'Your logo has been uploaded successfully',
      });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload logo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [data.slug, onUpdate, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/svg+xml': ['.svg'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const removeLogo = () => {
    onUpdate({ logoUrl: null });
  };

  const handleSocialLinkChange = (platform: 'twitter' | 'linkedin' | 'facebook', value: string) => {
    onUpdate({
      socialLinks: {
        ...data.socialLinks,
        [platform]: value,
      },
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Palette className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Customize your brand</CardTitle>
        <CardDescription>
          Make PRIVYDESK feel like your own
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Logo Upload */}
        <div className="space-y-4">
          <Label>Company Logo</Label>
          {data.logoUrl ? (
            <div className="relative w-48 h-24 border rounded-lg overflow-hidden group">
              <img
                src={data.logoUrl}
                alt="Company logo"
                className="w-full h-full object-contain p-2"
              />
              <button
                onClick={removeLogo}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary'
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? 'Drop your logo here'
                      : 'Drag & drop your logo, or click to select'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, or SVG (max 2MB)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Color */}
        <div className="space-y-4">
          <Label>Primary Color</Label>
          <div className="flex flex-wrap gap-2">
            {colorPresets.map((color) => (
              <button
                key={color}
                onClick={() => onUpdate({ primaryColor: color })}
                className={`w-10 h-10 rounded-full border-2 transition-all ${
                  data.primaryColor === color
                    ? 'border-foreground scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={data.primaryColor}
              onChange={(e) => onUpdate({ primaryColor: e.target.value })}
              className="w-12 h-10 p-1 cursor-pointer"
            />
            <Input
              value={data.primaryColor}
              onChange={(e) => onUpdate({ primaryColor: e.target.value })}
              placeholder="#6366f1"
              className="w-28 font-mono"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="border rounded-lg p-4 bg-background">
            <div className="flex items-center gap-3 mb-4">
              {data.logoUrl && (
                <img src={data.logoUrl} alt="Logo" className="h-8 w-auto" />
              )}
              <span className="font-semibold">{data.organizationName || 'Your Company'}</span>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-md text-white text-sm"
                style={{ backgroundColor: data.primaryColor }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-md text-sm"
                style={{ color: data.primaryColor, border: `1px solid ${data.primaryColor}` }}
              >
                Secondary Button
              </button>
            </div>
          </div>
        </div>

        {/* Email Footer Customization */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Email Footer</Label>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="companyAddress" className="text-sm">Company Address</Label>
              <Textarea
                id="companyAddress"
                value={data.companyAddress}
                onChange={(e) => onUpdate({ companyAddress: e.target.value })}
                placeholder="123 Business Street, City, Country"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="twitter" className="text-sm">Twitter/X</Label>
                <Input
                  id="twitter"
                  value={data.socialLinks.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={data.socialLinks.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div>
                <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                <Input
                  id="facebook"
                  value={data.socialLinks.facebook || ''}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="footerText" className="text-sm">Custom Footer Text</Label>
              <Textarea
                id="footerText"
                value={data.footerText}
                onChange={(e) => onUpdate({ footerText: e.target.value })}
                placeholder="© 2024 Your Company. All rights reserved."
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onPrev}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button type="button" className="ml-auto" onClick={onNext}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
