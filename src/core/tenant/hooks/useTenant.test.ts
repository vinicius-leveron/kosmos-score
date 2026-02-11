import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@/test/utils/test-utils';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = 'https://test.supabase.co';

describe('Organization and Workspace Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Organization Creation', () => {
    it('should create a new organization', async () => {
      const orgData = {
        name: 'New Test Org',
        slug: 'new-test-org',
        type: 'client' as const,
      };

      const { data, error } = await supabase
        .from('organizations')
        .insert(orgData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.name).toBe(orgData.name);
      expect(data?.slug).toBe(orgData.slug);
      expect(data?.id).toBeTruthy();
    });

    it('should enforce unique organization slug', async () => {
      // Mock duplicate slug error
      server.use(
        http.post(`${SUPABASE_URL}/rest/v1/organizations`, () => {
          return HttpResponse.json(
            {
              error: 'duplicate key value violates unique constraint',
              details: 'Key (slug)=(existing-org) already exists.',
            },
            { status: 409 }
          );
        })
      );

      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: 'Duplicate Org',
          slug: 'existing-org',
          type: 'client' as const,
        })
        .select()
        .single();

      expect(error).toBeTruthy();
      expect(data).toBeNull();
      expect(error?.message).toContain('duplicate');
    });

    it('should create organization with owner membership', async () => {
      // Create org
      const { data: org } = await supabase
        .from('organizations')
        .insert({
          name: 'Org with Owner',
          slug: 'org-with-owner',
          type: 'client' as const,
        })
        .select()
        .single();

      // Add owner membership
      const { data: membership, error } = await supabase
        .from('org_members')
        .insert({
          organization_id: org!.id,
          profile_id: 'test-user-123',
          role: 'owner',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(membership).toBeTruthy();
      expect(membership?.role).toBe('owner');
    });
  });

  describe('Workspace Management', () => {
    it('should create a workspace for an organization', async () => {
      const workspaceData = {
        organization_id: 'org-123',
        name: 'Development Workspace',
        is_active: true,
      };

      const { data, error } = await supabase
        .from('workspaces')
        .insert(workspaceData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.name).toBe(workspaceData.name);
      expect(data?.organization_id).toBe(workspaceData.organization_id);
      expect(data?.is_active).toBe(true);
    });

    it('should list workspaces for an organization', async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('organization_id', 'org-123');

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(Array.isArray(data)).toBe(true);
      expect(data!.length).toBeGreaterThan(0);
      expect(data![0].organization_id).toBe('org-123');
    });

    it('should activate/deactivate workspace', async () => {
      const workspaceId = 'workspace-123';
      
      // Deactivate
      const { error: deactivateError } = await supabase
        .from('workspaces')
        .update({ is_active: false })
        .eq('id', workspaceId);

      expect(deactivateError).toBeNull();

      // Reactivate
      const { error: activateError } = await supabase
        .from('workspaces')
        .update({ is_active: true })
        .eq('id', workspaceId);

      expect(activateError).toBeNull();
    });

    it('should switch between workspaces', async () => {
      const workspace1 = {
        id: 'workspace-1',
        name: 'Workspace 1',
        organization_id: 'org-123',
      };

      const workspace2 = {
        id: 'workspace-2',
        name: 'Workspace 2',
        organization_id: 'org-123',
      };

      // Mock workspace switching via RLS function
      let currentWorkspace = workspace1.id;
      
      server.use(
        http.post(`${SUPABASE_URL}/rest/v1/rpc/get_current_workspace_id`, () => {
          return HttpResponse.json(currentWorkspace);
        })
      );

      // Get current workspace
      const { data: current1 } = await supabase
        .rpc('get_current_workspace_id');

      expect(current1).toBe(workspace1.id);

      // Switch workspace
      currentWorkspace = workspace2.id;

      const { data: current2 } = await supabase
        .rpc('get_current_workspace_id');

      expect(current2).toBe(workspace2.id);
    });
  });

  describe('Multi-tenant Data Isolation', () => {
    it('should only return data for current workspace', async () => {
      const workspaceId = 'workspace-123';
      
      // Mock RLS filtering
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/contact_orgs`, ({ request }) => {
          const url = new URL(request.url);
          const orgId = url.searchParams.get('organization_id');
          
          if (orgId === 'org-123') {
            return HttpResponse.json([
              {
                id: 'contact-1',
                organization_id: 'org-123',
                workspace_id: workspaceId,
              },
            ]);
          }
          
          return HttpResponse.json([]);
        })
      );

      // Query with correct org
      const { data: correctData } = await supabase
        .from('contact_orgs')
        .select('*')
        .eq('organization_id', 'org-123');

      expect(correctData?.length).toBe(1);
      expect(correctData![0].workspace_id).toBe(workspaceId);

      // Query with wrong org should return empty
      const { data: wrongData } = await supabase
        .from('contact_orgs')
        .select('*')
        .eq('organization_id', 'wrong-org');

      expect(wrongData?.length).toBe(0);
    });

    it('should prevent cross-tenant data access', async () => {
      // Mock RLS rejection
      server.use(
        http.patch(`${SUPABASE_URL}/rest/v1/contacts`, ({ request }) => {
          const url = new URL(request.url);
          const id = url.searchParams.get('id');
          
          if (id === 'eq.protected-contact') {
            return HttpResponse.json(
              {
                error: 'new row violates row-level security policy',
                details: 'Failing row contains...',
              },
              { status: 403 }
            );
          }
          
          return HttpResponse.json({});
        })
      );

      const { error } = await supabase
        .from('contacts')
        .update({ full_name: 'Hacker' })
        .eq('id', 'protected-contact');

      expect(error).toBeTruthy();
      expect(error?.message).toContain('security policy');
    });
  });

  describe('Organization Invitations', () => {
    it('should invite user to organization', async () => {
      const invitation = {
        organization_id: 'org-123',
        email: 'newuser@example.com',
        role: 'member' as const,
      };

      server.use(
        http.post(`${SUPABASE_URL}/rest/v1/org_invitations`, async ({ request }) => {
          const body = await request.json() as any;
          return HttpResponse.json({
            id: 'invite-123',
            ...body,
            token: 'invite-token-123',
            status: 'pending',
            created_at: new Date().toISOString(),
          });
        })
      );

      const { data, error } = await supabase
        .from('org_invitations')
        .insert(invitation)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.email).toBe(invitation.email);
      expect(data?.status).toBe('pending');
    });

    it('should accept organization invitation', async () => {
      const inviteToken = 'invite-token-123';

      server.use(
        http.patch(`${SUPABASE_URL}/rest/v1/org_invitations`, async ({ request }) => {
          return HttpResponse.json({
            id: 'invite-123',
            status: 'accepted',
            accepted_at: new Date().toISOString(),
          });
        })
      );

      const { data, error } = await supabase
        .from('org_invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('token', inviteToken)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.status).toBe('accepted');
    });
  });
});
