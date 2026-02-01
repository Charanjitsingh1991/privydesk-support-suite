/**
 * Subdomain Guard Component
 * Protects routes that should only be accessible via organization subdomains
 */

import { useOrganization } from '@/contexts/OrganizationContext';
import { Navigate } from 'react-router-dom';
import { AlertCircle, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface SubdomainGuardProps {
  children: React.ReactNode;
  requireOrganization?: boolean;
}

export function SubdomainGuard({ children, requireOrganization = true }: SubdomainGuardProps) {
  const { organization, loading, error, isSubdomain, subdomain } = useOrganization();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </Card>
      </div>
    );
  }

  // If organization is required but not found
  if (requireOrganization && (!organization || error)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Organization Not Found</h2>
              <p className="text-muted-foreground">
                {subdomain ? (
                  <>
                    The organization <strong>"{subdomain}"</strong> does not exist or is not active.
                  </>
                ) : (
                  <>
                    This page requires access via an organization subdomain.
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={() => window.location.href = window.location.protocol + '//' + window.location.hostname.split('.').slice(-2).join('.')}
                className="w-full"
              >
                Go to Main Site
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // If not on subdomain but organization is required
  if (requireOrganization && !isSubdomain) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Organization Required</h2>
              <p className="text-muted-foreground">
                This page requires access via an organization subdomain.
                <br />
                Please use your organization's subdomain URL.
              </p>
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go to Main Site
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}
