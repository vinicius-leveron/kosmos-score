import { useAuth } from '../AuthContextOptimized';

/**
 * Hook for user-specific data
 */
export function useUser() {
  const { user, profile, isLoading } = useAuth();
  const isAuthenticated = !!user;

  return {
    user,
    profile,
    isAuthenticated,
    isLoading,
    userId: user?.id ?? null,
    email: profile?.email ?? user?.email ?? null,
    fullName: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  };
}
