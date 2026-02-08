import { useAuthContext } from '../AuthContext';

/**
 * Main auth hook - returns full auth context
 */
export function useAuth() {
  return useAuthContext();
}
