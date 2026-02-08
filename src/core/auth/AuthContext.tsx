import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type {
  AuthContextType,
  AuthState,
  UserProfile,
  OrgMembership,
  OrgRole,
} from './types';
import { ROLE_HIERARCHY, KOSMOS_ORG_ID } from './types';

const CURRENT_ORG_KEY = 'kosmos_current_org';

const initialState: AuthState = {
  user: null,
  profile: null,
  memberships: [],
  currentOrg: null,
  isLoading: true,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  // Fetch user profile from profiles table
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log('[Auth] Fetching profile for:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, phone, preferences')
      .eq('id', userId)
      .single();

    console.log('[Auth] Profile result:', { data, error });
    if (error || !data) {
      console.error('[Auth] Error fetching profile:', error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      phone: data.phone,
      preferences: (data.preferences as Record<string, unknown>) || {},
    };
  }, []);

  // Fetch user's organization memberships
  const fetchMemberships = useCallback(async (userId: string): Promise<OrgMembership[]> => {
    console.log('[Auth] Fetching memberships for:', userId);
    const { data, error } = await supabase
      .from('org_members')
      .select(`
        role,
        organization:organizations (
          id,
          name,
          slug,
          type
        )
      `)
      .eq('profile_id', userId);

    console.log('[Auth] Memberships result:', { data, error });
    if (error || !data) {
      console.error('[Auth] Error fetching memberships:', error);
      return [];
    }

    return data
      .filter((m) => m.organization)
      .map((m) => ({
        organization_id: (m.organization as any).id,
        organization_name: (m.organization as any).name,
        organization_slug: (m.organization as any).slug,
        organization_type: (m.organization as any).type,
        role: m.role,
      }));
  }, []);

  // Load saved current org from localStorage
  const loadSavedCurrentOrg = useCallback((memberships: OrgMembership[]): OrgMembership | null => {
    const savedOrgId = localStorage.getItem(CURRENT_ORG_KEY);
    if (savedOrgId) {
      const savedOrg = memberships.find((m) => m.organization_id === savedOrgId);
      if (savedOrg) return savedOrg;
    }
    // Default to first org (prefer KOSMOS master if available)
    const kosmosOrg = memberships.find((m) => m.organization_id === KOSMOS_ORG_ID);
    return kosmosOrg || memberships[0] || null;
  }, []);

  // Initialize auth state from session
  const initializeAuth = useCallback(async (user: User | null) => {
    console.log('[Auth] initializeAuth called with user:', user?.email);
    if (!user) {
      console.log('[Auth] No user, setting initial state');
      setState({
        ...initialState,
        isLoading: false,
      });
      return;
    }

    try {
      console.log('[Auth] Fetching profile and memberships...');
      const [profile, memberships] = await Promise.all([
        fetchProfile(user.id),
        fetchMemberships(user.id),
      ]);
      console.log('[Auth] Got profile:', profile, 'memberships:', memberships.length);

      const currentOrg = loadSavedCurrentOrg(memberships);

      setState({
        user,
        profile,
        memberships,
        currentOrg,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Still set authenticated but with empty memberships
      setState({
        user,
        profile: null,
        memberships: [],
        currentOrg: null,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  }, [fetchProfile, fetchMemberships, loadSavedCurrentOrg]);

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        initializeAuth(session?.user ?? null);
      })
      .catch((error) => {
        console.error('Error getting session:', error);
        setState({ ...initialState, isLoading: false });
      });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await initializeAuth(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem(CURRENT_ORG_KEY);
          setState({ ...initialState, isLoading: false });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Set current organization
  const setCurrentOrg = (orgId: string) => {
    const org = state.memberships.find((m) => m.organization_id === orgId);
    if (org) {
      localStorage.setItem(CURRENT_ORG_KEY, orgId);
      setState((prev) => ({ ...prev, currentOrg: org }));
    }
  };

  // Check if user has at least the specified role (in any org or specific org)
  const hasRole = (role: OrgRole, orgId?: string): boolean => {
    const targetOrgId = orgId || state.currentOrg?.organization_id;
    if (!targetOrgId) return false;

    const membership = state.memberships.find((m) => m.organization_id === targetOrgId);
    if (!membership) return false;

    const requiredIndex = ROLE_HIERARCHY.indexOf(role);
    const userIndex = ROLE_HIERARCHY.indexOf(membership.role);
    return userIndex >= requiredIndex;
  };

  // Check if user is member of KOSMOS master org
  const isKosmosMaster = (): boolean => {
    return state.memberships.some((m) => m.organization_id === KOSMOS_ORG_ID);
  };

  // Check if user can access admin portal
  const canAccessAdmin = (): boolean => {
    // KOSMOS master members always have admin access
    if (isKosmosMaster()) return true;

    // Check if user is admin/owner in any org
    return state.memberships.some((m) =>
      ROLE_HIERARCHY.indexOf(m.role) >= ROLE_HIERARCHY.indexOf('admin')
    );
  };

  // Refresh session data
  const refreshSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await initializeAuth(session?.user ?? null);
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signOut,
    setCurrentOrg,
    hasRole,
    isKosmosMaster,
    canAccessAdmin,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
