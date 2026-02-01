/**
 * Organization Context
 * Manages organization state based on subdomain detection
 * Automatically loads organization data when subdomain is detected
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSubdomain } from '@/hooks/useSubdomain';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  domain_verified: boolean;
  primary_color: string;
  logo_url: string | null;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  metadata: any;
}

interface OrganizationContextType {
  organization: Organization | null;
  loading: boolean;
  error: string | null;
  subdomain: string | null;
  isSubdomain: boolean;
  refreshOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { subdomain, isSubdomain } = useSubdomain();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadOrganization = async () => {
    if (!subdomain || !isSubdomain) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Look up organization by slug (subdomain)
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', subdomain)
        .eq('status', 'active')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        setError(`Organization "${subdomain}" not found`);
        toast({
          title: 'Organization Not Found',
          description: `The organization "${subdomain}" does not exist or is not active.`,
          variant: 'destructive',
        });
        setOrganization(null);
        return;
      }

      setOrganization(data);

      // Apply organization branding
      if (data.primary_color) {
        document.documentElement.style.setProperty('--organization-primary', data.primary_color);
      }

      // Update page title
      if (data.name) {
        document.title = `${data.name} - PrivyDesk`;
      }

    } catch (err) {
      console.error('Failed to load organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to load organization');
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();
  }, [subdomain, isSubdomain]);

  const refreshOrganization = async () => {
    await loadOrganization();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        loading,
        error,
        subdomain,
        isSubdomain,
        refreshOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
}
