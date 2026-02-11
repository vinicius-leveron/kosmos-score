import { useAuth as useAuthFromContext } from '../AuthContextOptimized';

/**
 * Main auth hook - returns full auth context
 */
export function useAuth() {
  return useAuthFromContext();
}
