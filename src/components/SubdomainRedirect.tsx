/**
 * Subdomain Redirect Component
 * Redirects users to appropriate pages based on subdomain context
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrganization } from '@/contexts/OrganizationContext';

export function SubdomainRedirect() {
  const { isSubdomain, organization, loading } = useOrganization();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    // If on subdomain with valid organization and on homepage, redirect to login/dashboard
    if (isSubdomain && organization && location.pathname === '/') {
      // Check if user is already authenticated (you can add auth check here)
      navigate('/auth/login');
    }
  }, [isSubdomain, organization, loading, location.pathname, navigate]);

  return null;
}
