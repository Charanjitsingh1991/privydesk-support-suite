import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act, render } from '@/test/test-utils';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Mock Supabase client
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: any) => {
        mockOnAuthStateChange(callback);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      },
      signUp: (params: any) => mockSignUp(params),
      signInWithPassword: (params: any) => mockSignInWithPassword(params),
      signOut: () => mockSignOut(),
    },
    from: (table: string) => mockFrom(table),
  },
}));

// Test component to access context
function TestComponent() {
  const { user, session, profile, loading, signIn, signUp, signOut } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <div data-testid="profile">{profile?.full_name || 'no-profile'}</div>
      <button onClick={() => signIn('test@test.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('test@test.com', 'password', 'Test User')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });
  });

  describe('initialization', () => {
    it('starts with loading state', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initially loading
      expect(screen.getByTestId('loading').textContent).toBe('true');

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });
    });

    it('fetches initial session on mount', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockGetSession).toHaveBeenCalled();
      });
    });

    it('sets up auth state change listener', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockOnAuthStateChange).toHaveBeenCalled();
      });
    });
  });

  describe('session management', () => {
    it('updates state when session is present', async () => {
      const mockSession = {
        user: { id: '123', email: 'test@test.com' },
        access_token: 'token',
      };

      mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { full_name: 'Test User', role: 'client' },
              error: null,
            }),
          }),
        }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('test@test.com');
        expect(screen.getByTestId('session').textContent).toBe('has-session');
      });
    });

    it('shows no user when session is null', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('no-user');
        expect(screen.getByTestId('session').textContent).toBe('no-session');
      });
    });
  });

  describe('signIn', () => {
    it('calls Supabase signInWithPassword', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByText('Sign In').click();
      });

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@test.com',
          password: 'password',
        });
      });
    });
  });

  describe('signUp', () => {
    it('calls Supabase signUp with correct options', async () => {
      mockSignUp.mockResolvedValue({ error: null });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByText('Sign Up').click();
      });

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@test.com',
          password: 'password',
          options: {
            data: { full_name: 'Test User' },
            emailRedirectTo: window.location.origin,
          },
        });
      });
    });
  });

  describe('signOut', () => {
    it('calls Supabase signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });

      await act(async () => {
        screen.getByText('Sign Out').click();
      });

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('throws error when useAuth is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
});
