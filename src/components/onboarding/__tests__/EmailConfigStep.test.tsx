import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, render } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { EmailConfigStep } from '../EmailConfigStep';
import type { OnboardingData } from '@/hooks/useOnboardingState';

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

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
  skipDomain: true,
  primaryColor: '#6366f1',
  logoUrl: null,
  companyAddress: '',
  socialLinks: {},
  footerText: '',
  selectedPlan: 'starter',
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

describe('EmailConfigStep', () => {
  const mockOnUpdate = vi.fn();
  const mockOnComplete = vi.fn();
  const mockOnPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderStep(data: Partial<OnboardingData> = {}) {
    return render(
      <EmailConfigStep
        data={{ ...defaultData, ...data }}
        onUpdate={mockOnUpdate}
        onComplete={mockOnComplete}
        onPrev={mockOnPrev}
      />
    );
  }

  describe('free plan', () => {
    it('shows default email service message for free plan', () => {
      renderStep({ selectedPlan: 'free' });

      expect(screen.getByText(/using privydesk email service/i)).toBeInTheDocument();
      expect(screen.getByText(/noreply@privydesk.com/i)).toBeInTheDocument();
    });

    it('does not show email config options for free plan', () => {
      renderStep({ selectedPlan: 'free' });

      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });
  });

  describe('paid plans', () => {
    it('shows email config options for paid plans', () => {
      renderStep({ selectedPlan: 'starter' });

      expect(screen.getByText(/use privydesk email service/i)).toBeInTheDocument();
      expect(screen.getByText(/use resend api/i)).toBeInTheDocument();
      expect(screen.getByText(/custom smtp server/i)).toBeInTheDocument();
    });

    it('selects default option by default', () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'default' });

      const defaultRadio = screen.getByRole('radio', { name: /privydesk email service/i });
      expect(defaultRadio).toBeChecked();
    });
  });

  describe('resend configuration', () => {
    it('shows Resend API key input when Resend is selected', async () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'resend' });

      expect(screen.getByLabelText(/resend api key/i)).toBeInTheDocument();
    });

    it('updates Resend API key on input', async () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'resend' });

      const apiKeyInput = screen.getByLabelText(/resend api key/i);
      await userEvent.type(apiKeyInput, 're_test_api_key');

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ resendApiKey: expect.stringContaining('re_') })
      );
    });

    it('shows link to Resend documentation', () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'resend' });

      const resendLink = screen.getByRole('link', { name: /resend.com/i });
      expect(resendLink).toHaveAttribute('href', 'https://resend.com/api-keys');
      expect(resendLink).toHaveAttribute('target', '_blank');
    });
  });

  describe('SMTP configuration', () => {
    it('shows SMTP fields when SMTP is selected', () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'smtp' });

      expect(screen.getByLabelText(/smtp host/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/port/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('shows TLS toggle', () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'smtp' });

      expect(screen.getByText(/use tls\/ssl/i)).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('pre-fills with default port 587', () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'smtp' });

      const portInput = screen.getByPlaceholderText('587');
      expect(portInput).toBeInTheDocument();
    });

    it('updates SMTP config on input', async () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'smtp' });

      const hostInput = screen.getByLabelText(/smtp host/i);
      await userEvent.type(hostInput, 'smtp.test.com');

      expect(mockOnUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          smtpConfig: expect.objectContaining({
            host: expect.stringContaining('smtp'),
          }),
        })
      );
    });
  });

  describe('test connection', () => {
    it('shows test connection button for Resend', () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'resend' });

      expect(screen.getByRole('button', { name: /test connection/i })).toBeInTheDocument();
    });

    it('shows test connection button for SMTP', () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'smtp' });

      expect(screen.getByRole('button', { name: /test connection/i })).toBeInTheDocument();
    });

    it('does not show test connection for default', () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'default' });

      expect(screen.queryByRole('button', { name: /test connection/i })).not.toBeInTheDocument();
    });

    it('shows loading state while testing', async () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'resend', resendApiKey: 're_test' });

      const testButton = screen.getByRole('button', { name: /test connection/i });
      await userEvent.click(testButton);

      expect(screen.getByText(/testing/i)).toBeInTheDocument();
    });

    it('shows success state after successful test', async () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'resend', resendApiKey: 're_test' });

      const testButton = screen.getByRole('button', { name: /test connection/i });
      await userEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText(/connection verified/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('config type selection', () => {
    it('updates config type when radio is selected', async () => {
      renderStep({ selectedPlan: 'pro', emailConfigType: 'default' });

      const smtpRadio = screen.getByRole('radio', { name: /custom smtp/i });
      await userEvent.click(smtpRadio);

      expect(mockOnUpdate).toHaveBeenCalledWith({ emailConfigType: 'smtp' });
    });
  });

  describe('navigation', () => {
    it('calls onPrev when back button is clicked', async () => {
      renderStep();

      await userEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(mockOnPrev).toHaveBeenCalled();
    });

    it('calls onComplete when complete setup is clicked', async () => {
      renderStep();

      await userEvent.click(screen.getByRole('button', { name: /complete setup/i }));
      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('updates SMTP config before completing for SMTP type', async () => {
      renderStep({ 
        selectedPlan: 'pro', 
        emailConfigType: 'smtp',
        smtpConfig: {
          host: 'smtp.test.com',
          port: '587',
          username: 'user',
          password: 'pass',
          useTls: true,
        }
      });

      await userEvent.click(screen.getByRole('button', { name: /complete setup/i }));

      expect(mockOnUpdate).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});
