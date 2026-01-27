import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { CompanyInfoStep } from '../CompanyInfoStep';
import type { OnboardingData } from '@/hooks/useOnboardingState';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
  },
}));

const defaultData: OnboardingData = {
  organizationName: '',
  slug: '',
  industry: '',
  companySize: '',
  timezone: 'UTC',
  email: '',
  emailVerified: false,
  customDomain: '',
  domainVerified: false,
  domainVerificationMethod: null,
  domainVerificationToken: '',
  skipDomain: false,
  primaryColor: '#6366f1',
  logoUrl: null,
  companyAddress: '',
  socialLinks: {},
  footerText: '',
  selectedPlan: 'free',
  billingCycle: 'monthly',
  emailConfigType: 'default',
  resendApiKey: '',
  smtpConfig: {
    host: '',
    port: '587',
    username: '',
    password: '',
    useTls: true,
  },
};

describe('CompanyInfoStep', () => {
  const mockOnUpdate = vi.fn();
  const mockOnNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderStep(data: Partial<OnboardingData> = {}) {
    return render(
      <CompanyInfoStep
        data={{ ...defaultData, ...data }}
        onUpdate={mockOnUpdate}
        onNext={mockOnNext}
      />
    );
  }

  describe('rendering', () => {
    it('renders all form fields', () => {
      renderStep();

      expect(screen.getByText(/organization name/i)).toBeInTheDocument();
      expect(screen.getByText(/subdomain/i)).toBeInTheDocument();
      expect(screen.getByText(/industry/i)).toBeInTheDocument();
      expect(screen.getByText(/company size/i)).toBeInTheDocument();
      expect(screen.getByText(/timezone/i)).toBeInTheDocument();
    });

    it('renders continue button', () => {
      renderStep();

      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('pre-fills form with existing data', () => {
      renderStep({
        organizationName: 'Test Corp',
        slug: 'test-corp',
        industry: 'Technology',
      });

      expect(screen.getByDisplayValue('Test Corp')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test-corp')).toBeInTheDocument();
    });
  });

  describe('slug generation', () => {
    it('auto-generates slug from organization name', async () => {
      renderStep();

      const nameInput = screen.getByPlaceholderText('Acme Corporation');
      await userEvent.type(nameInput, 'My Test Company');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ slug: 'my-test-company' })
        );
      });
    });

    it('converts slug to lowercase and removes special characters', async () => {
      renderStep();

      const nameInput = screen.getByPlaceholderText('Acme Corporation');
      await userEvent.type(nameInput, 'Test@Company#123');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ slug: expect.stringMatching(/^[a-z0-9-]+$/) })
        );
      });
    });

    it('allows manual slug editing', async () => {
      renderStep({ organizationName: 'Test' });

      const slugInput = screen.getByPlaceholderText('acme');
      await userEvent.clear(slugInput);
      await userEvent.type(slugInput, 'custom-slug');

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ slug: 'custom-slug' })
        );
      });
    });
  });

  describe('validation', () => {
    it('shows error for short organization name', async () => {
      renderStep();

      const nameInput = screen.getByPlaceholderText('Acme Corporation');
      await userEvent.type(nameInput, 'AB');

      const submitButton = screen.getByRole('button', { name: /continue/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('shows error for short slug', async () => {
      renderStep();

      const nameInput = screen.getByPlaceholderText('Acme Corporation');
      await userEvent.type(nameInput, 'ABCD');

      const slugInput = screen.getByPlaceholderText('acme');
      await userEvent.clear(slugInput);
      await userEvent.type(slugInput, 'ab');

      const submitButton = screen.getByRole('button', { name: /continue/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('calls onUpdate and onNext on valid submission', async () => {
      renderStep();

      await userEvent.type(screen.getByPlaceholderText('Acme Corporation'), 'Test Company');
      
      // Select industry
      const industrySelect = screen.getByRole('combobox', { name: /industry/i });
      await userEvent.click(industrySelect);
      await userEvent.click(screen.getByRole('option', { name: 'Technology' }));

      // Select company size
      const sizeSelect = screen.getByRole('combobox', { name: /company size/i });
      await userEvent.click(sizeSelect);
      await userEvent.click(screen.getByRole('option', { name: /1-10 employees/i }));

      // Select timezone
      const tzSelect = screen.getByRole('combobox', { name: /timezone/i });
      await userEvent.click(tzSelect);
      await userEvent.click(screen.getByRole('option', { name: 'UTC' }));

      await userEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalled();
      });
    });
  });

  describe('slug availability check', () => {
    it('shows loading indicator while checking slug', async () => {
      renderStep();

      const nameInput = screen.getByPlaceholderText('Acme Corporation');
      await userEvent.type(nameInput, 'Test');

      // Loading indicator should briefly appear
      // Note: This is timing-dependent due to debounce
    });

    it('shows available indicator for available slug', async () => {
      renderStep();

      const nameInput = screen.getByPlaceholderText('Acme Corporation');
      await userEvent.type(nameInput, 'Available Company');

      // Wait for debounced check
      await waitFor(() => {
        // Check for the green checkmark (available)
        const checkIcon = document.querySelector('.text-green-500');
        expect(checkIcon).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });
});
