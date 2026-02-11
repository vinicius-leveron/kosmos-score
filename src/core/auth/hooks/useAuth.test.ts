import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@/test/utils/test-utils';
import { useAuth } from './useAuth';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const SUPABASE_URL = 'https://test.supabase.co';

describe('useAuth', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should initialize as unauthenticated', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
    });

    it('should sign in with valid credentials', async () => {
      const { result } = renderHook(() => useAuth());
      
      const { error } = await result.current.signIn('test@kosmos.com', 'password123');
      
      expect(error).toBeNull();
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
      
      expect(result.current.user?.email).toBe('test@kosmos.com');
      expect(result.current.profile?.email).toBe('test@kosmos.com');
    });

    it('should reject invalid credentials', async () => {
      const { result } = renderHook(() => useAuth());
      
      const { error } = await result.current.signIn('wrong@email.com', 'wrongpass');
      
      expect(error).toBeTruthy();
      expect(error?.message).toContain('Invalid');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should sign out successfully', async () => {
      const { result } = renderHook(() => useAuth());
      
      // First sign in
      await result.current.signIn('test@kosmos.com', 'password123');
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
      
      // Then sign out
      await result.current.signOut();
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
      
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('kosmos_current_org')).toBeNull();
    });
  });

  describe('Organization Management', () => {
    it('should load user organizations and set default', async () => {
      const { result } = renderHook(() => useAuth());
      
      await result.current.signIn('test@kosmos.com', 'password123');
      
      await waitFor(() => {
        expect(result.current.memberships.length).toBeGreaterThan(0);
      });
      
      expect(result.current.currentOrg).toBeTruthy();
      expect(result.current.currentOrg?.organization_name).toBe('KOSMOS');
    });

    it('should switch current organization', async () => {
      const { result } = renderHook(() => useAuth());
      
      await result.current.signIn('test@kosmos.com', 'password123');
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
      
      // Mock another org in memberships
      const newOrgId = 'org-456';
      result.current.memberships.push({
        organization_id: newOrgId,
        organization_name: 'Test Org 2',
        organization_slug: 'test-org-2',
        organization_type: 'client',
        role: 'member',
      });
      
      result.current.setCurrentOrg(newOrgId);
      
      expect(result.current.currentOrg?.organization_id).toBe(newOrgId);
      expect(localStorage.setItem).toHaveBeenCalledWith('kosmos_current_org', newOrgId);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should check user roles correctly', async () => {
      const { result } = renderHook(() => useAuth());
      
      await result.current.signIn('test@kosmos.com', 'password123');
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
      
      // Test role hierarchy - owner has all permissions
      expect(result.current.hasRole('owner')).toBe(true);
      expect(result.current.hasRole('admin')).toBe(true);
      expect(result.current.hasRole('member')).toBe(true);
    });

    it('should identify KOSMOS master users', async () => {
      const { result } = renderHook(() => useAuth());
      
      await result.current.signIn('test@kosmos.com', 'password123');
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
      
      expect(result.current.isKosmosMaster()).toBe(true);
      expect(result.current.canAccessAdmin()).toBe(true);
    });

    it('should restrict admin access for non-admin users', async () => {
      // Mock a member-only user
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/org_members`, () => {
          return HttpResponse.json([
            {
              organization_id: 'org-789',
              role: 'member', // Not admin or owner
            },
          ]);
        })
      );

      const { result } = renderHook(() => useAuth());
      
      await result.current.signIn('member@test.com', 'password123');
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
      
      expect(result.current.canAccessAdmin()).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('should refresh session', async () => {
      const { result } = renderHook(() => useAuth());
      
      await result.current.signIn('test@kosmos.com', 'password123');
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
      
      const originalUser = result.current.user;
      
      await result.current.refreshSession();
      
      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
      });
      
      expect(result.current.user?.id).toBe(originalUser?.id);
    });

    it('should handle session timeout gracefully', async () => {
      const { result } = renderHook(() => useAuth());
      
      // Mock an expired session
      server.use(
        http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
          return HttpResponse.json(
            { error: 'Invalid token', error_description: 'Token expired' },
            { status: 401 }
          );
        })
      );
      
      await result.current.refreshSession();
      
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });
});
