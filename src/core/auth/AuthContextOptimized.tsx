import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Constants - Must match the UUID in database RLS policies
export const KOSMOS_ORG_ID = 'c0000000-0000-0000-0000-000000000001';
const CURRENT_ORG_KEY = 'kosmos_current_org';

// Types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: 'admin' | 'member' | 'viewer';
  created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'master' | 'client';
}

export interface OrgMembership {
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  organization_type: 'master' | 'client';
  role: 'admin' | 'member' | 'viewer';
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  organizations: OrgMembership[];
  currentOrg: OrgMembership | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  refreshSession: () => Promise<void>;
  canAccessAdmin: () => boolean;
  organizationId: string | null;
  organizationName: string | null;
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  organizations: [],
  currentOrg: null,
  isLoading: true,
  isAuthenticated: false,
};

// Create default KOSMOS organization
const DEFAULT_KOSMOS_ORG: OrgMembership = {
  organization_id: KOSMOS_ORG_ID,
  organization_name: 'KOSMOS',
  organization_slug: 'kosmos',
  organization_type: 'master',
  role: 'member',
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  switchOrganization: () => {},
  refreshSession: async () => {},
  organizationId: null,
  organizationName: null,
});

// Optimized provider that doesn't block on timeouts
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  // Load saved current org from localStorage
  const loadSavedCurrentOrg = useCallback((memberships: OrgMembership[]): OrgMembership | null => {
    const savedOrgId = localStorage.getItem(CURRENT_ORG_KEY);
    if (savedOrgId) {
      const savedOrg = memberships.find((m) => m.organization_id === savedOrgId);
      if (savedOrg) return savedOrg;
    }
    // Default to KOSMOS or first org
    const kosmosOrg = memberships.find((m) => m.organization_id === KOSMOS_ORG_ID);
    return kosmosOrg || memberships[0] || null;
  }, []);

  // Fetch profile without blocking
  const fetchProfileAsync = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setState(prev => ({
          ...prev,
          profile: {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            role: data.role,
            created_at: data.created_at,
          },
        }));
      }
    } catch (err) {
      console.warn('[Auth] Profile fetch error:', err);
    }
  }, []);

  // Fetch memberships without blocking
  const fetchMembershipsAsync = useCallback(async (userId: string) => {
    try {
      // Try to get memberships
      const { data: memberData, error: memberError } = await supabase
        .from('org_members')
        .select('organization_id, role')
        .eq('profile_id', userId);

      if (!memberError && memberData && memberData.length > 0) {
        // Get organization details
        const orgIds = memberData.map(m => m.organization_id);
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id, name, slug, type')
          .in('id', orgIds);

        if (orgData) {
          const memberships = memberData.map(m => {
            const org = orgData.find(o => o.id === m.organization_id);
            return {
              organization_id: m.organization_id,
              organization_name: org?.name || 'Unknown',
              organization_slug: org?.slug || '',
              organization_type: (org?.type || 'client') as 'master' | 'client',
              role: m.role,
            };
          });

          const currentOrg = loadSavedCurrentOrg(memberships);
          
          setState(prev => ({
            ...prev,
            organizations: memberships,
            currentOrg,
          }));
          
          return;
        }
      }
    } catch (err) {
      console.warn('[Auth] Memberships fetch error:', err);
    }

    // If fetch failed or no memberships, use default KOSMOS
    setState(prev => ({
      ...prev,
      organizations: [DEFAULT_KOSMOS_ORG],
      currentOrg: DEFAULT_KOSMOS_ORG,
    }));
  }, [loadSavedCurrentOrg]);

  // Initialize auth state from session
  const initializeAuth = useCallback(async (user: User | null) => {
    console.log('[Auth] Initializing for user:', user?.email);
    
    if (!user) {
      setState({
        ...initialState,
        isLoading: false,
      });
      return;
    }

    // Set user immediately and use defaults
    setState({
      user,
      session: null,
      profile: {
        id: user.id,
        email: user.email!,
        full_name: user.email?.split('@')[0],
      },
      organizations: [DEFAULT_KOSMOS_ORG],
      currentOrg: DEFAULT_KOSMOS_ORG,
      isLoading: false,
      isAuthenticated: true,
    });

    // Then fetch real data in background
    fetchProfileAsync(user.id);
    fetchMembershipsAsync(user.id);
  }, [fetchProfileAsync, fetchMembershipsAsync]);

  // Set up auth listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState(prev => ({ ...prev, session, isAuthenticated: true }));
        initializeAuth(session.user);
      } else {
        setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state change:', event);
      
      if (session) {
        setState(prev => ({ ...prev, session, isAuthenticated: true }));
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          initializeAuth(session.user);
        }
      } else {
        setState({
          ...initialState,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [initializeAuth]);

  // Auth methods
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (!error && data.user) {
        // Create profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
        });
      }

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(CURRENT_ORG_KEY);
  }, []);

  const switchOrganization = useCallback((orgId: string) => {
    const org = state.organizations.find((o) => o.organization_id === orgId);
    if (org) {
      setState(prev => ({ ...prev, currentOrg: org }));
      localStorage.setItem(CURRENT_ORG_KEY, orgId);
    }
  }, [state.organizations]);

  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.refreshSession();
    if (session) {
      setState(prev => ({ ...prev, session, isAuthenticated: true }));
    }
  }, []);

  const canAccessAdmin = useCallback((): boolean => {
    // KOSMOS master users always have admin access
    if (state.currentOrg?.organization_id === KOSMOS_ORG_ID) return true;
    
    // Check if user has admin or owner role in current org
    const role = state.currentOrg?.role;
    return role === 'admin' || role === 'owner';
  }, [state.currentOrg]);

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    switchOrganization,
    refreshSession,
    canAccessAdmin,
    organizationId: state.currentOrg?.organization_id || KOSMOS_ORG_ID,
    organizationName: state.currentOrg?.organization_name || 'KOSMOS',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for organization context
export function useOrganization() {
  const { organizationId, organizationName, currentOrg } = useAuth();
  const isKosmosMaster = currentOrg?.organization_type === 'master';
  return { 
    organizationId, 
    organizationName,
    isKosmosMaster,
  };
}