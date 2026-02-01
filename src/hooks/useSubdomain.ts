/**
 * Hook to detect and extract subdomain from current URL
 * Works with Vercel's automatic wildcard subdomain routing
 */

import { useMemo } from 'react';

interface SubdomainInfo {
  subdomain: string | null;
  isSubdomain: boolean;
  hostname: string;
  baseDomain: string;
}

export function useSubdomain(): SubdomainInfo {
  return useMemo(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Development/localhost handling
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168')) {
      return {
        subdomain: null,
        isSubdomain: false,
        hostname,
        baseDomain: hostname,
      };
    }

    // Vercel preview deployments (e.g., privydesk-abc123.vercel.app)
    if (hostname.includes('.vercel.app')) {
      return {
        subdomain: null,
        isSubdomain: false,
        hostname,
        baseDomain: hostname,
      };
    }

    // Production domain with subdomain (e.g., acme-corp.privydesk.com)
    if (parts.length >= 3) {
      const subdomain = parts[0];
      const baseDomain = parts.slice(1).join('.');

      // Exclude 'www' as a subdomain
      if (subdomain === 'www') {
        return {
          subdomain: null,
          isSubdomain: false,
          hostname,
          baseDomain,
        };
      }

      return {
        subdomain,
        isSubdomain: true,
        hostname,
        baseDomain,
      };
    }

    // Main domain (e.g., privydesk.com)
    return {
      subdomain: null,
      isSubdomain: false,
      hostname,
      baseDomain: hostname,
    };
  }, []);
}
