import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes common providers
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

interface WrapperProps {
  children: React.ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockTicket = (overrides = {}) => ({
  id: 'ticket-123',
  subject: 'Test Ticket',
  description: 'Test description',
  status: 'open' as const,
  priority: 'medium' as const,
  category: 'general',
  created_by: 'user-123',
  organization_id: 'org-123',
  assigned_to: null,
  tags: [],
  due_date: null,
  first_response_at: null,
  resolved_at: null,
  metadata: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'agent' as const,
  organization_id: 'org-123',
  avatar_url: null,
  email_verified: true,
  is_active: true,
  preferences: null,
  last_login_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockOrganization = (overrides = {}) => ({
  id: 'org-123',
  name: 'Test Organization',
  slug: 'test-org',
  plan: 'free' as const,
  status: 'active' as const,
  logo_url: null,
  primary_color: '#6366f1',
  branding: null,
  email_config: null,
  security_settings: null,
  metadata: null,
  custom_domain: null,
  domain_verified: false,
  domain_verification_token: null,
  domain_verification_method: null,
  industry: null,
  company_size: null,
  timezone: 'UTC',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  id: 'msg-123',
  ticket_id: 'ticket-123',
  user_id: 'user-123',
  content: 'Test message content',
  is_internal: false,
  attachments: [],
  read_by: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Wait utilities
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock console utilities
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeAll(() => {
    console.error = vi.fn();
    console.warn = vi.fn();
    console.log = vi.fn();
  });
  
  afterAll(() => {
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.log = originalConsole.log;
  });
};
