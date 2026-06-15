import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/useSession';
import type {
  OrganizationSettings,
  BrandingSettings,
  EmailConfig,
  BusinessHours,
  NotificationSettings,
  DEFAULT_BUSINESS_HOURS,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '@/types/settings';

export function useOrganizationSettings() {
  const { organizationId } = useUser();
  const { toast } = useToast();
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      setSettings(data as unknown as OrganizationSettings);
    } catch (error) {
      toast({
        title: 'Error loading settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<OrganizationSettings>) => {
      if (!organizationId) return false;
      setSaving(true);

      try {
        const { error } = await supabase
          .from('organizations')
          .update(updates as Record<string, unknown>)
          .eq('id', organizationId);

        if (error) throw error;

        setSettings((prev) => (prev ? { ...prev, ...updates } : null));
        toast({ title: 'Settings saved successfully' });
        return true;
      } catch (error) {
        toast({
          title: 'Error saving settings',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [organizationId, toast]
  );

  const updateBranding = useCallback(
    async (branding: Partial<BrandingSettings>) => {
      const currentBranding = (settings?.branding as BrandingSettings) || {};
      return updateSettings({
        branding: { ...currentBranding, ...branding } as Record<string, unknown>,
      });
    },
    [settings, updateSettings]
  );

  const updateEmailConfig = useCallback(
    async (emailConfig: Partial<EmailConfig>) => {
      const currentConfig = (settings?.email_config as EmailConfig) || {};
      return updateSettings({
        email_config: { ...currentConfig, ...emailConfig } as Record<string, unknown>,
      });
    },
    [settings, updateSettings]
  );

  const uploadLogo = useCallback(
    async (file: File): Promise<string | null> => {
      if (!organizationId) return null;

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${organizationId}/logo.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('organization-logos')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('organization-logos')
          .getPublicUrl(fileName);

        await updateSettings({ logo_url: data.publicUrl });
        return data.publicUrl;
      } catch (error) {
        toast({
          title: 'Error uploading logo',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }
    },
    [organizationId, updateSettings, toast]
  );

  const uploadFavicon = useCallback(
    async (file: File): Promise<string | null> => {
      if (!organizationId) return null;

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${organizationId}/favicon.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('organization-logos')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('organization-logos')
          .getPublicUrl(fileName);

        await updateBranding({ favicon_url: data.publicUrl });
        return data.publicUrl;
      } catch (error) {
        toast({
          title: 'Error uploading favicon',
          description: error.message,
          variant: 'destructive',
        });
        return null;
      }
    },
    [organizationId, updateBranding, toast]
  );

  return {
    settings,
    loading,
    saving,
    fetchSettings,
    updateSettings,
    updateBranding,
    updateEmailConfig,
    uploadLogo,
    uploadFavicon,
  };
}
