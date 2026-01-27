import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock the AuthContext
const mockSession = {
  access_token: 'test-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
};

const mockProfile = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'agent' as const,
  organization_id: 'org-123',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  email_verified: true,
  is_active: true,
  last_login_at: '2024-01-15T00:00:00Z',
  preferences: null,
};

const mockUseAuth = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Import after mock setup
import { useSession, useUser } from '../useSession';

describe('useSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns session when authenticated', () => {
    mockUseAuth.mockReturnValue({
      session: mockSession,
      loading: false,
    });

    const { result } = renderHook(() => useSession());

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns null session when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: false,
    });

    const { result } = renderHook(() => useSession());

    expect(result.current.session).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('returns loading state correctly', () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: true,
    });

    const { result } = renderHook(() => useSession());

    expect(result.current.isLoading).toBe(true);
  });
});

describe('useUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user data when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockSession.user,
      profile: mockProfile,
      loading: false,
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.user).toEqual(mockSession.user);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.email).toBe('test@example.com');
    expect(result.current.userId).toBe('user-123');
    expect(result.current.role).toBe('agent');
    expect(result.current.organizationId).toBe('org-123');
    expect(result.current.fullName).toBe('Test User');
    expect(result.current.avatarUrl).toBe('https://example.com/avatar.jpg');
  });

  it('returns null values when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: false,
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.email).toBeUndefined();
    expect(result.current.role).toBeUndefined();
  });

  it('returns loading state correctly', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      loading: true,
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.isLoading).toBe(true);
  });
});
