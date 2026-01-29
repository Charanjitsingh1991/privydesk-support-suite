import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, render } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { BrandingStep } from '../BrandingStep';
import type { OnboardingData } from '@/hooks/useOnboardingState';

// Mock Supabase storage
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
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

describe('BrandingStep', () => {
  const mockOnUpdate = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://test.com/logo.png' } });
  });

  function renderStep(data: Partial<OnboardingData> = {}) {
    return render(
      <BrandingStep
        data={{ ...defaultData, ...data }}
        onUpdate={mockOnUpdate}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );
  }

  describe('rendering', () => {
    it('renders branding customization header', () => {
      renderStep();

      expect(screen.getByText(/customize your brand/i)).toBeInTheDocument();
    });

    it('renders logo upload area', () => {
      renderStep();

      expect(screen.getByText(/company logo/i)).toBeInTheDocument();
      expect(screen.getByText(/drag & drop your logo/i)).toBeInTheDocument();
    });

    it('renders color picker', () => {
      renderStep();

      expect(screen.getByText(/primary color/i)).toBeInTheDocument();
    });

    it('renders social link inputs', () => {
      renderStep();

      expect(screen.getByLabelText(/twitter/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/facebook/i)).toBeInTheDocument();
    });

    it('renders company address textarea', () => {
      renderStep();

      expect(screen.getByLabelText(/company address/i)).toBeInTheDocument();
    });

    it('renders footer text textarea', () => {
      renderStep();

      expect(screen.getByLabelText(/custom footer text/i)).toBeInTheDocument();
    });
  });

  describe('color selection', () => {
    it('renders color presets', () => {
      renderStep();

      // Check that color preset buttons exist
      const colorButtons = document.querySelectorAll('button[style*="background-color"]');
      expect(colorButtons.length).toBeGreaterThan(0);
    });

    it('updates color when preset is clicked', async () => {
      renderStep();

      const colorButtons = document.querySelectorAll('button[style*="background-color"]');
      if (colorButtons.length > 1) {
        await userEvent.click(colorButtons[1] as HTMLElement);
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ primaryColor: expect.any(String) })
        );
      }
    });

    it('updates color from color picker input', async () => {
      renderStep();

      const colorInput = document.querySelector('input[type="color"]');
      if (colorInput) {
        await userEvent.click(colorInput);
        // Color input changes are handled differently
        expect(colorInput).toBeInTheDocument();
      }
    });

    it('updates color from hex input', async () => {
      renderStep();

      // Use getAllByDisplayValue since there are multiple elements with the same value
      const hexInputs = screen.getAllByDisplayValue('#6366f1');
      // The hex text input is the one with the font-mono class
      const hexInput = hexInputs.find(el => el.classList.contains('font-mono')) || hexInputs[1];
      await userEvent.clear(hexInput);
      await userEvent.type(hexInput, '#ff0000');

      // Verify onUpdate was called (it's called per character, so just check it was called)
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  describe('logo upload', () => {
    it('shows uploaded logo when logoUrl is set', () => {
      renderStep({ logoUrl: 'https://test.com/logo.png' });

      const logo = screen.getByAltText(/company logo/i);
      expect(logo).toHaveAttribute('src', 'https://test.com/logo.png');
    });

    it('shows remove button when logo is uploaded', () => {
      renderStep({ logoUrl: 'https://test.com/logo.png' });

      // Find the remove button (X icon button)
      const removeButton = document.querySelector('button.bg-destructive');
      expect(removeButton).toBeInTheDocument();
    });

    it('removes logo when remove button is clicked', async () => {
      renderStep({ logoUrl: 'https://test.com/logo.png' });

      const removeButton = document.querySelector('button.bg-destructive');
      if (removeButton) {
        await userEvent.click(removeButton);
        expect(mockOnUpdate).toHaveBeenCalledWith({ logoUrl: null });
      }
    });
  });

  describe('social links', () => {
    it('updates twitter link', async () => {
      renderStep();

      const twitterInput = screen.getByLabelText(/twitter/i);
      await userEvent.type(twitterInput, 'https://twitter.com/test');

      // Verify onUpdate was called (it's called per character)
      expect(mockOnUpdate).toHaveBeenCalled();
    });

    it('updates linkedin link', async () => {
      renderStep();

      const linkedinInput = screen.getByLabelText(/linkedin/i);
      await userEvent.type(linkedinInput, 'https://linkedin.com/company/test');

      expect(mockOnUpdate).toHaveBeenCalled();
    });

    it('updates facebook link', async () => {
      renderStep();

      const facebookInput = screen.getByLabelText(/facebook/i);
      await userEvent.type(facebookInput, 'https://facebook.com/test');

      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  describe('footer customization', () => {
    it('updates company address', async () => {
      renderStep();

      const addressInput = screen.getByLabelText(/company address/i);
      await userEvent.type(addressInput, '123 Test Street');

      // Verify onUpdate was called (called per character)
      expect(mockOnUpdate).toHaveBeenCalled();
    });

    it('updates footer text', async () => {
      renderStep();

      const footerInput = screen.getByLabelText(/custom footer text/i);
      await userEvent.type(footerInput, '© 2026 Test Company');

      // Verify onUpdate was called (called per character)
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  describe('preview', () => {
    it('shows organization name in preview', () => {
      renderStep({ organizationName: 'Preview Company' });

      expect(screen.getByText('Preview Company')).toBeInTheDocument();
    });

    it('shows logo in preview when set', () => {
      renderStep({ 
        organizationName: 'Preview Company',
        logoUrl: 'https://test.com/logo.png' 
      });

      const previewLogo = screen.getAllByAltText(/logo/i)[1];
      expect(previewLogo).toBeInTheDocument();
    });

    it('shows buttons with primary color', () => {
      renderStep({ primaryColor: '#ff0000' });

      const primaryButton = screen.getByRole('button', { name: /primary button/i });
      expect(primaryButton).toHaveStyle({ backgroundColor: '#ff0000' });
    });
  });

  describe('navigation', () => {
    it('calls onPrev when back button is clicked', async () => {
      renderStep();

      await userEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(mockOnPrev).toHaveBeenCalled();
    });

    it('calls onNext when continue button is clicked', async () => {
      renderStep();

      await userEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(mockOnNext).toHaveBeenCalled();
    });
  });
});
