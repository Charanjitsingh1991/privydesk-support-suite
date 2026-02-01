/**
 * Subdomain Banner Component
 * Displays organization branding when accessing via subdomain
 */

import { useOrganization } from '@/contexts/OrganizationContext';
import { Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export function SubdomainBanner() {
  const { organization, loading, error, isSubdomain, subdomain } = useOrganization();

  // Don't show banner if not on a subdomain
  if (!isSubdomain) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-48 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !organization) {
    return (
      <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Organization Not Found:</strong> The subdomain "{subdomain}" does not exist or is not active.
        </AlertDescription>
      </Alert>
    );
  }

  // Success state - show organization branding
  return (
    <div 
      className="border-b transition-colors"
      style={{
        backgroundColor: `${organization.primary_color}10`,
        borderColor: `${organization.primary_color}30`,
      }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {organization.logo_url ? (
            <img
              src={organization.logo_url}
              alt={organization.name}
              className="h-10 w-10 rounded-full object-cover border-2"
              style={{ borderColor: organization.primary_color }}
            />
          ) : (
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: organization.primary_color }}
            >
              <Building2 className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-semibold text-lg" style={{ color: organization.primary_color }}>
              {organization.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {subdomain}.privydesk.com
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Plan: <span className="font-medium capitalize">{organization.plan}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
