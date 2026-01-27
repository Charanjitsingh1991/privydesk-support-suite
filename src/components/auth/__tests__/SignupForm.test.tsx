import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { SignupForm } from '../SignupForm';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the AuthContext
const mockSignUp = vi.fn();
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      signUp: mockSignUp,
      user: null,
      session: null,
      profile: null,
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    }),
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

function renderSignupForm() {
  return render(
    <BrowserRouter>
      <SignupForm />
    </BrowserRouter>
  );
}

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders all required fields', () => {
      renderSignupForm();

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('renders password strength meter', async () => {
      renderSignupForm();

      const passwordInput = screen.getByLabelText(/password/i);
      await userEvent.type(passwordInput, 'TestPassword123!');

      // Password strength meter should be visible
      expect(screen.getByText(/password strength/i)).toBeInTheDocument();
    });

    it('renders login link', () => {
      renderSignupForm();

      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
    });
  });

  describe('password visibility toggle', () => {
    it('toggles password visibility when clicking eye icon', async () => {
      renderSignupForm();

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Find and click the toggle button
      const toggleButton = passwordInput.parentElement?.querySelector('button');
      expect(toggleButton).toBeInTheDocument();
      
      await userEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await userEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('validation', () => {
    it('requires full name field', async () => {
      renderSignupForm();

      const fullNameInput = screen.getByLabelText(/full name/i);
      expect(fullNameInput).toHaveAttribute('required');
    });

    it('requires email field', async () => {
      renderSignupForm();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('requires password to be at least 12 characters', async () => {
      renderSignupForm();

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('minLength', '12');
    });

    it('disables submit button when password is too weak', async () => {
      renderSignupForm();

      const passwordInput = screen.getByLabelText(/password/i);
      await userEvent.type(passwordInput, 'weak');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('submission', () => {
    it('calls signUp with correct data on valid submission', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      renderSignupForm();

      await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
      await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'SuperSecure123!@#Password');

      // Submit the form
      fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!);

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          'john@example.com',
          'SuperSecure123!@#Password',
          'John Doe'
        );
      });
    });

    it('navigates to dashboard on successful signup', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      renderSignupForm();

      await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
      await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'SuperSecure123!@#Password');

      fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows loading state during submission', async () => {
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100)));
      renderSignupForm();

      await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
      await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'SuperSecure123!@#Password');

      fireEvent.submit(screen.getByRole('button', { name: /create account/i }).closest('form')!);

      await waitFor(() => {
        expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      });
    });
  });
});
