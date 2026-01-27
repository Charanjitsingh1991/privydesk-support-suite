import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { PlanSelectionStep } from '../PlanSelectionStep';
import type { OnboardingData } from '@/hooks/useOnboardingState';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    }),
  },
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

describe('PlanSelectionStep', () => {
  const mockOnUpdate = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnPrev = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderStep(data: Partial<OnboardingData> = {}) {
    return render(
      <PlanSelectionStep
        data={{ ...defaultData, ...data }}
        onUpdate={mockOnUpdate}
        onNext={mockOnNext}
        onPrev={mockOnPrev}
      />
    );
  }

  describe('rendering', () => {
    it('renders plan selection header', () => {
      renderStep();

      expect(screen.getByText(/choose your plan/i)).toBeInTheDocument();
    });

    it('renders billing cycle toggle', () => {
      renderStep();

      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText('Annual')).toBeInTheDocument();
    });

    it('renders all default plans', async () => {
      renderStep();

      await waitFor(() => {
        expect(screen.getByText('Free')).toBeInTheDocument();
        expect(screen.getByText('Starter')).toBeInTheDocument();
        expect(screen.getByText('Pro')).toBeInTheDocument();
        expect(screen.getByText('Enterprise')).toBeInTheDocument();
      });
    });

    it('shows recommended badge on Pro plan', async () => {
      renderStep();

      await waitFor(() => {
        expect(screen.getByText('Recommended')).toBeInTheDocument();
      });
    });
  });

  describe('billing cycle', () => {
    it('shows monthly prices by default', async () => {
      renderStep({ billingCycle: 'monthly' });

      await waitFor(() => {
        expect(screen.getByText('$0')).toBeInTheDocument();
        expect(screen.getByText('$29')).toBeInTheDocument();
        expect(screen.getByText('$79')).toBeInTheDocument();
        expect(screen.getByText('$199')).toBeInTheDocument();
      });
    });

    it('updates billing cycle when toggle is clicked', async () => {
      renderStep({ billingCycle: 'monthly' });

      const toggle = screen.getByRole('switch');
      await userEvent.click(toggle);

      expect(mockOnUpdate).toHaveBeenCalledWith({ billingCycle: 'annual' });
    });

    it('shows savings badge when annual is selected', async () => {
      renderStep({ billingCycle: 'annual' });

      await waitFor(() => {
        expect(screen.getByText(/save up to 20%/i)).toBeInTheDocument();
      });
    });
  });

  describe('plan selection', () => {
    it('highlights selected plan', async () => {
      renderStep({ selectedPlan: 'pro' });

      await waitFor(() => {
        const proCard = screen.getByText('Pro').closest('div[class*="rounded-xl"]');
        expect(proCard).toHaveClass('border-primary');
      });
    });

    it('updates selected plan when plan card is clicked', async () => {
      renderStep({ selectedPlan: 'free' });

      await waitFor(() => {
        expect(screen.getByText('Starter')).toBeInTheDocument();
      });

      const starterCard = screen.getByText('Starter').closest('div[class*="cursor-pointer"]');
      if (starterCard) {
        await userEvent.click(starterCard);
      }

      expect(mockOnUpdate).toHaveBeenCalledWith({ selectedPlan: 'starter' });
    });

    it('shows "Selected" on selected plan button', async () => {
      renderStep({ selectedPlan: 'starter' });

      await waitFor(() => {
        const buttons = screen.getAllByRole('button', { name: /selected/i });
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('shows "Get Started" on free plan when not selected', async () => {
      renderStep({ selectedPlan: 'pro' });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
      });
    });

    it('shows "Start Free Trial" on paid plans when not selected', async () => {
      renderStep({ selectedPlan: 'free' });

      await waitFor(() => {
        const trialButtons = screen.getAllByRole('button', { name: /start free trial/i });
        expect(trialButtons.length).toBe(3); // Starter, Pro, Enterprise
      });
    });
  });

  describe('plan features', () => {
    it('shows features for each plan', async () => {
      renderStep();

      await waitFor(() => {
        expect(screen.getByText(/up to 3 team members/i)).toBeInTheDocument();
        expect(screen.getByText(/up to 10 team members/i)).toBeInTheDocument();
        expect(screen.getByText(/up to 50 team members/i)).toBeInTheDocument();
        expect(screen.getByText(/unlimited team members/i)).toBeInTheDocument();
      });
    });

    it('shows checkmarks for features', async () => {
      renderStep();

      await waitFor(() => {
        const checkmarks = document.querySelectorAll('.text-green-500');
        expect(checkmarks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('footer text', () => {
    it('shows "No credit card required" for free plan', async () => {
      renderStep({ selectedPlan: 'free' });

      await waitFor(() => {
        expect(screen.getByText(/no credit card required/i)).toBeInTheDocument();
      });
    });

    it('shows trial info for paid plans', async () => {
      renderStep({ selectedPlan: 'pro' });

      await waitFor(() => {
        expect(screen.getByText(/14-day free trial/i)).toBeInTheDocument();
      });
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
