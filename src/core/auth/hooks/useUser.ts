import { useAuthContext } from '../AuthContext';

/**
 * Hook for user-specific data
 */
export function useUser() {
  const { user, profile, isAuthenticated, isLoading } = useAuthContext();

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
