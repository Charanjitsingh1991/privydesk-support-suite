import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, render } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { EmailVerificationStep } from '../EmailVerificationStep';
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

const defaultData: OnboardingData = {
  organizationName: 'Test Company',
  slug: 'test-company',
  industry: 'Technology',
  companySize: '1-10',
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

describe('EmailVerificationStep', () => {
  const mockOnUpdate = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderStep(data: Partial<OnboardingData> = {}) {
    return render(
      <EmailVerificationStep
        data={{ ...defaultData, ...data }}
        onUpdate={mockOnUpdate}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );
  }

  describe('email input step', () => {
    it('renders email input when no email is set', () => {
      renderStep();

      expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument();
    });

    it('shows back button', () => {
      renderStep();

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('calls onPrev when back button is clicked', async () => {
      renderStep();

      await userEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(mockOnPrev).toHaveBeenCalled();
    });

    it('validates email format', async () => {
      renderStep();

      const emailInput = screen.getByLabelText(/email address/i);
      await userEvent.type(emailInput, 'invalid-email');

      await userEvent.click(screen.getByRole('button', { name: /send code/i }));

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it('sends OTP on valid email submission', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
      renderStep();

      const emailInput = screen.getByLabelText(/email address/i);
      await userEvent.type(emailInput, 'test@example.com');

      await userEvent.click(screen.getByRole('button', { name: /send code/i }));

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('send-otp', {
          body: { email: 'test@example.com', type: 'onboarding' },
        });
      });
    });

    it('shows loading state while sending OTP', async () => {
      mockInvoke.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ data: { success: true }, error: null }), 100)
      ));
      renderStep();

      await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await userEvent.click(screen.getByRole('button', { name: /send code/i }));

      expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });

    it('shows error toast on send failure', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: new Error('Send failed') });
      renderStep();

      await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await userEvent.click(screen.getByRole('button', { name: /send code/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ variant: 'destructive' })
        );
      });
    });
  });

  describe('OTP input step', () => {
    it('shows OTP input when email is already set', () => {
      renderStep({ email: 'test@example.com' });

      expect(screen.getByText(/enter verification code/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });

    it('shows resend button with countdown', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
      renderStep();

      await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await userEvent.click(screen.getByRole('button', { name: /send code/i }));

      await waitFor(() => {
        expect(screen.getByText(/resend code in/i)).toBeInTheDocument();
      });
    });

    it('shows change email button', () => {
      renderStep({ email: 'test@example.com' });

      expect(screen.getByRole('button', { name: /change email/i })).toBeInTheDocument();
    });

    it('goes back to email input on change email click', async () => {
      renderStep({ email: 'test@example.com' });

      await userEvent.click(screen.getByRole('button', { name: /change email/i }));

      expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('verifies OTP when all digits are entered', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
      renderStep({ email: 'test@example.com' });

      // Wait for OTP input to be rendered
      await waitFor(() => {
        expect(screen.getByText(/enter verification code/i)).toBeInTheDocument();
      });

      // Find the hidden input that handles the OTP value
      const otpInput = document.querySelector('input[data-input-otp="true"]') as HTMLInputElement;
      if (otpInput) {
        await userEvent.type(otpInput, '123456');
      }

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('verify-otp', {
          body: { 
            email: 'test@example.com', 
            code: '123456',
            type: 'onboarding' 
          },
        });
      }, { timeout: 3000 });
    });

    it('calls onNext after successful verification', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
      renderStep({ email: 'test@example.com' });

      const otpInputs = document.querySelectorAll('input[type="text"]');
      for (let i = 0; i < 6; i++) {
        await userEvent.type(otpInputs[i], String(i + 1));
      }

      await waitFor(() => {
        expect(screen.getByText(/enter verification code/i)).toBeInTheDocument();
      });

      const otpInput = document.querySelector('input[data-input-otp="true"]') as HTMLInputElement;
      if (otpInput) {
        await userEvent.type(otpInput, '123456');
      }

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith({ emailVerified: true });
        expect(mockOnNext).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
vrfcaion
    it('calls onNext after successful verification', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
      renderStep({ emaido:um'etsqu@raSelector.cinpuo[da a-input-)tp="true"] as HTMLInputElement
      if (otpInput) {
  
      }
      await waitFor(() => {
        expect(screen.getByText(/enter verification code/i)).toBeInTheDocument();
      });

      const otpInput = document.querySelector('input[data-input-otp="true"]') as HTMLInputElement;
      if (otpInput) {
        await userEvent.type(otpInput, '123456');
      }

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith({ emailVerified: true });
        expect(mockOnNext).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('shows error on invalid OTP', async () => {
      mockInvoke.mockResolvedValue({ 
        data: { success: false, error: 'Invalid code' }, 
        error: null 
      });
      renderStep({ email: 'test@example.com' });

      await waitFor(() => {
        expect(screen.getByText(/enter the 6-digit code/i)).toBeInTheDocument();
      });

      const otpInput = screen.getByRole('textbox');
      await userEvent.type(otpInput, '000000');

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ variant: 'destructive' })
        );
      });
    });
  });

  describe('verified state', () => {
    it('shows verified message when email is verified', () => {
      renderStep({ email: 'test@example.com', emailVerified: true });

      expect(screen.getByText(/email verified/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });

    it('shows continue button when verified', () => {
      renderStep({ email: 'test@example.com', emailVerified: true });

      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('calls onNext when continue is clicked on verified state', async () => {
      renderStep({ email: 'test@example.com', emailVerified: true });

      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(mockOnNext).toHaveBeenCalled();
    });
  });
});
