import { http, HttpResponse } from 'msw';

const SUPABASE_URL = 'https://test.supabase.co';

// Mock data
export const mockUser = {
  id: 'test-user-123',
  email: 'test@kosmos.com',
  user_metadata: {
    full_name: 'Test User',
  },
};

export const mockProfile = {
  id: 'test-user-123',
  email: 'test@kosmos.com',
  full_name: 'Test User',
  avatar_url: null,
  phone: null,
  preferences: {},
};

export const mockOrganization = {
  id: 'org-123',
  name: 'Test Organization',
  slug: 'test-org',
  type: 'client',
};

export const mockWorkspace = {
  id: 'workspace-123',
  organization_id: 'org-123',
  name: 'Test Workspace',
  is_active: true,
};

export const mockContact = {
  id: 'contact-123',
  email: 'contact@example.com',
  full_name: 'John Doe',
  phone: '+1234567890',
  source: 'manual',
};

export const handlers = [
  // Auth endpoints
  http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const body = await request.json() as any;
    
    if (body.grant_type === 'password') {
      if (body.email === 'test@kosmos.com' && body.password === 'password123') {
        return HttpResponse.json({
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: mockUser,
        });
      }
      return HttpResponse.json(
        { error: 'Invalid credentials', error_description: 'Invalid email or password' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUser,
    });
  }),

  http.get(`${SUPABASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      id: mockUser.id,
      email: mockUser.email,
      user_metadata: mockUser.user_metadata,
    });
  }),

  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    return HttpResponse.json({});
  }),

  // Profile endpoints
  http.get(`${SUPABASE_URL}/rest/v1/profiles`, ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id === `eq.${mockUser.id}`) {
      return HttpResponse.json([mockProfile]);
    }
    
    return HttpResponse.json([]);
  }),

  // Organization endpoints
  http.get(`${SUPABASE_URL}/rest/v1/organizations`, () => {
    return HttpResponse.json([mockOrganization]);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/organizations`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id: 'new-org-123',
      ...body,
    });
  }),

  // Workspace endpoints
  http.get(`${SUPABASE_URL}/rest/v1/workspaces`, () => {
    return HttpResponse.json([mockWorkspace]);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/workspaces`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id: 'new-workspace-123',
      ...body,
    });
  }),

  // Contacts endpoints
  http.get(`${SUPABASE_URL}/rest/v1/contacts`, () => {
    return HttpResponse.json([mockContact]);
  }),

  http.post(`${SUPABASE_URL}/rest/v1/contacts`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id: 'new-contact-123',
      ...body,
    });
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/contacts`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      ...mockContact,
      ...body,
    });
  }),

  http.delete(`${SUPABASE_URL}/rest/v1/contacts`, () => {
    return HttpResponse.json({});
  }),

  // Contact orgs endpoints (multi-tenant)
  http.get(`${SUPABASE_URL}/rest/v1/contact_orgs`, ({ request }) => {
    const url = new URL(request.url);
    const orgId = url.searchParams.get('organization_id');
    
    if (orgId) {
      return HttpResponse.json([
        {
          id: 'contact-org-123',
          contact_id: mockContact.id,
          organization_id: orgId,
          status: 'active',
          score: 85,
          contacts: mockContact,
        },
      ]);
    }
    
    return HttpResponse.json([]);
  }),

  // Pipeline endpoints
  http.get(`${SUPABASE_URL}/rest/v1/pipelines`, () => {
    return HttpResponse.json([
      {
        id: 'pipeline-123',
        organization_id: mockOrganization.id,
        name: 'Sales Pipeline',
        type: 'sales',
        is_default: true,
      },
    ]);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/pipeline_stages`, () => {
    return HttpResponse.json([
      {
        id: 'stage-1',
        pipeline_id: 'pipeline-123',
        name: 'New',
        color: '#3B82F6',
        position: 0,
      },
      {
        id: 'stage-2',
        pipeline_id: 'pipeline-123',
        name: 'Qualified',
        color: '#10B981',
        position: 1,
      },
    ]);
  }),

  http.patch(`${SUPABASE_URL}/rest/v1/contact_pipeline_positions`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id: 'position-123',
      stage_id: body.stage_id,
      entered_stage_at: new Date().toISOString(),
    });
  }),

  // Audit results (public form)
  http.post(`${SUPABASE_URL}/rest/v1/audit_results`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id: 'audit-123',
      ...body,
      score: Math.floor(Math.random() * 100),
      created_at: new Date().toISOString(),
    });
  }),

  // RLS check endpoint
  http.post(`${SUPABASE_URL}/rest/v1/rpc/get_current_workspace_id`, () => {
    return HttpResponse.json(mockWorkspace.id);
  }),
];
