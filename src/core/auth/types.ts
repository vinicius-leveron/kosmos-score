import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Database types
export type OrgRole = Database['public']['Enums']['org_role'];
export type OrgType = Database['public']['Enums']['org_type'];

// Profile from database
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  preferences: Record<string, unknown>;
}

// Organization membership
export interface OrgMembership {
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  organization_type: OrgType;
  role: OrgRole;
}

// Auth state
export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  memberships: OrgMembership[];
  currentOrg: OrgMembership | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth context type with methods
export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  setCurrentOrg: (orgId: string) => void;
  hasRole: (role: OrgRole, orgId?: string) => boolean;
  isKosmosMaster: () => boolean;
  canAccessAdmin: () => boolean;
  refreshSession: () => Promise<void>;
}

// Role hierarchy - higher index = more permissions
export const ROLE_HIERARCHY: OrgRole[] = ['viewer', 'member', 'admin', 'owner'];

// KOSMOS master org ID
export const KOSMOS_ORG_ID = 'c0000000-0000-0000-0000-000000000001';
