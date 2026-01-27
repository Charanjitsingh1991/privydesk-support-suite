import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '../LoginForm';

// Helper to wait for async operations
const waitFor = async (callback: () => void, timeout = 1000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      callback();
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  callback();
};

// Mock the auth context
const mockSignIn = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

function renderLoginForm() {
  return render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({ error: null });
  });

  it('renders email and password fields', () => {
    const { getByLabelText } = renderLoginForm();
    
    expect(getByLabelText(/email/i)).toBeInTheDocument();
    expect(getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    const { getByRole } = renderLoginForm();
    
    expect(getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    const { getByText } = renderLoginForm();
    
    expect(getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('renders signup link', () => {
    const { getByText } = renderLoginForm();
    
    expect(getByText(/sign up/i)).toBeInTheDocument();
  });

  it('allows typing in email field', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = renderLoginForm();
    
    const emailInput = getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('allows typing in password field', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = renderLoginForm();
    
    const passwordInput = getByLabelText(/password/i);
    await user.type(passwordInput, 'mypassword123');
    
    expect(passwordInput).toHaveValue('mypassword123');
  });

  it('submits form with email and password', async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByRole } = renderLoginForm();
    
    await user.type(getByLabelText(/email/i), 'test@example.com');
    await user.type(getByLabelText(/password/i), 'password123');
    await user.click(getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('navigates to dashboard on successful login', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ error: null });
    
    const { getByLabelText, getByRole } = renderLoginForm();
    
    await user.type(getByLabelText(/email/i), 'test@example.com');
    await user.type(getByLabelText(/password/i), 'password123');
    await user.click(getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('account lockout', () => {
    it('increments failed attempts on login error', async () => {
      const user = userEvent.setup();
      mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
      
      const { getByLabelText, getByRole, findByText } = renderLoginForm();
      
      await user.type(getByLabelText(/email/i), 'test@example.com');
      await user.type(getByLabelText(/password/i), 'wrongpassword');
      await user.click(getByRole('button', { name: /sign in/i }));
      
      expect(await findByText(/4 attempts remaining/i)).toBeInTheDocument();
    });
  });
});
