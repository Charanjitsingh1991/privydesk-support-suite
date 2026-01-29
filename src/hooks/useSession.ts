import { useAuth } from "@/contexts/AuthContext";

export function useSession() {
  const { session, loading } = useAuth();
  
  return {
    session,
    isLoading: loading,
    isAuthenticated: !!session,
  };
}

export function useUser() {
  const { user, profile, loading } = useAuth();
  
  return {
    user,
    profile,
    isLoading: loading,
    email: user?.email,
    userId: user?.id,
    role: profile?.role,
    organizationId: profile?.organization_id,
    fullName: profile?.full_name,
    avatarUrl: profile?.avatar_url,
  };
}
