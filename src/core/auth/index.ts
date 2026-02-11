// Context and Provider - Using optimized version
export { 
  AuthProvider, 
  useAuth,
  useOrganization,
  KOSMOS_ORG_ID,
} from './AuthContextOptimized';

// Alias for compatibility
export { useAuth as useAuthContext } from './AuthContextOptimized';

// Types
export * from './types';

// Hooks
export * from './hooks';

// Guards
export * from './guards';
