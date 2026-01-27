import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { DomainVerificationStep } from '../DomainVerificationStep';
import type { OnboardingData } from '@/hooks/useOnboardingState';

// Mock Supabase client
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockInvoke(...args),
    },
  },
}));

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234',
});

const defaultData: OnboardingData = {
  organizationName: 'Test Company',
  slug: 'test-company',
  industry: 'Technology',
  companySize: '1-10',
  timezone: 'UTC',
  email: 'test@example.com',
  emailVerified: true,
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

describe('DomainVerificationStep', () => {
  const mockOnUpdate = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderStep(data: Partial<OnboardingData> = {}) {
    return render(
      <DomainVerificationStep
        data={{ ...defaultData, ...data }}
        onUpdate={mockOnUpdate}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );
  }

  describe('rendering', () => {
    it('renders custom domain input', () => {
      renderStep();

      expect(screen.getByText(/set up your custom domain/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/support.yourcompany.com/i)).toBeInTheDocument();
    });

    it('shows optional indicator', () => {
      renderStep();

      expect(screen.getByText(/optional/i)).toBeInTheDocument();
    });

    it('renders back, skip, and continue buttons', () => {
      renderStep();

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });
  });

  describe('verification methods', () => {
    it('shows DNS and file tabs when domain is entered', async () => {
      renderStep();

      const domainInput = screen.getByPlaceholderText(/support.yourcompany.com/i);
      await userEvent.type(domainInput, 'support.test.com');

      expect(screen.getByRole('tab', { name: /dns record/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /file upload/i })).toBeInTheDocument();
    });

    it('shows DNS verification instructions by default', async () => {
      renderStep();

      const domainInput = screen.getByPlaceholderText(/support.yourcompany.com/i);
      await userEvent.type(domainInput, 'support.test.com');

      expect(screen.getByText(/add this txt record/i)).toBeInTheDocument();
      expect(screen.getByText(/_privydesk-verify/i)).toBeInTheDocument();
    });

    it('shows file verification instructions when file tab is selected', async () => {
      renderStep();

      const domainInput = screen.getByPlaceholderText(/support.yourcompany.com/i);
      await userEvent.type(domainInput, 'support.test.com');

      await userEvent.click(screen.getByRole('tab', { name: /file upload/i }));

      expect(screen.getByText(/upload verification file/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download file/i })).toBeInTheDocument();
    });
  });

  describe('copy to clipboard', () => {
    it('copies token to clipboard when copy button is clicked', async () => {
      renderStep({ domainVerificationToken: 'test-token' });

      const domainInput = screen.getByPlaceholderText(/support.yourcompany.com/i);
      await userEvent.type(domainInput, 'support.test.com');

      // Find and click the copy button
      const copyButtons = screen.getAllByRole('button');
      const copyButton = copyButtons.find(btn => btn.querySelector('svg'));
      
      if (copyButton) {
        await userEvent.click(copyButton);
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      }
    });
  });

  describe('domain verification', () => {
    it('calls verify-domain function when verify button is clicked', async () => {
      mockInvoke.mockResolvedValue({ data: { verified: true }, error: null });
      renderStep({ domainVerificationToken: 'test-token' });

      const domainInput = screen.getByPlaceholderText(/support.yourcompany.com/i);
      await userEvent.type(domainInput, 'support.test.com');

      await userEvent.click(screen.getByRole('button', { name: /verify domain/i }));

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('verify-domain', {
          body: {
            domain: 'support.test.com',
            method: 'dns',
            token: 'test-token',
          },
        });
      });
    });

    it('shows success on verified domain', async () => {
      mockInvoke.mockResolvedValue({ data: { verified: true }, error: null });
      renderStep({ domainVerificationToken: 'test-token' });

      const domainInput = screen.getByPlaceholderText(/support.yourcompany.com/i);
      await userEvent.type(domainInput, 'support.test.com');

      await userEvent.click(screen.getByRole('button', { name: /verify domain/i }));

      await waitFor(() => {
        expect(screen.getByText(/verified/i)).toBeInTheDocument();
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ domainVerified: true })
        );
      });
    });

    it('shows error on verification failure', async () => {
      mockInvoke.mockResolvedValue({ 
        data: { verified: false, error: 'TXT record not found' }, 
        error: null 
      });
      renderStep({ domainVerificationToken: 'test-token' });

      const domainInput = screen.getByPlaceholderText(/support.yourcompany.com/i);
      await userEvent.type(domainInput, 'support.test.com');

      await userEvent.click(screen.getByRole('button', { name: /verify domain/i }));

      await waitFor(() => {
        expect(screen.getByText(/not verified/i)).toBeInTheDocument();
      });
    });
  });

  describe('skip functionality', () => {
    it('calls onUpdate with skipDomain and onNext when skip is clicked', async () => {
      renderStep();

      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));

      expect(mockOnUpdate).toHaveBeenCalledWith({ skipDomain: true });
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('calls onPrev when back button is clicked', async () => {
      renderStep();

      await userEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(mockOnPrev).toHaveBeenCalled();
    });

    it('calls onNext when continue is clicked and domain is verified', async () => {
      renderStep({ domainVerified: true, customDomain: 'support.test.com' });

      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(mockOnNext).toHaveBeenCalled();
    });
  });
});
