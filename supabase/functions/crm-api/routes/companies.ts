/**
 * Companies API Routes
 *
 * GET /v1/companies - List companies
 * POST /v1/companies - Create company
 * GET /v1/companies/:id - Get company details
 * PATCH /v1/companies/:id - Update company
 */

import { getSupabaseAdmin, hasPermission } from '../auth.ts';
import { errors, errorResponse } from '../errors.ts';
import type { AuthResult, CompanyInput, PaginatedResponse } from '../types.ts';

export async function handleCompanies(
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
): Promise<Response> {
  const method = req.method;
  const companyId = pathParts[1];

  // GET /v1/companies - List companies
  if (method === 'GET' && !companyId) {
    if (!hasPermission(auth.permissions, 'companies', 'read')) {
      return errorResponse(errors.forbidden('No permission to read companies'), corsHeaders);
    }
    return listCompanies(req, auth, corsHeaders);
  }

  // POST /v1/companies - Create company
  if (method === 'POST' && !companyId) {
    if (!hasPermission(auth.permissions, 'companies', 'write')) {
      return errorResponse(errors.forbidden('No permission to create companies'), corsHeaders);
    }
    return createCompany(req, auth, corsHeaders);
  }

  // GET /v1/companies/:id - Get company details
  if (method === 'GET' && companyId) {
    if (!hasPermission(auth.permissions, 'companies', 'read')) {
      return errorResponse(errors.forbidden('No permission to read companies'), corsHeaders);
    }
    return getCompany(companyId, auth, corsHeaders);
  }

  // PATCH /v1/companies/:id - Update company
  if (method === 'PATCH' && companyId) {
    if (!hasPermission(auth.permissions, 'companies', 'write')) {
      return errorResponse(errors.forbidden('No permission to update companies'), corsHeaders);
    }
    return updateCompany(req, companyId, auth, corsHeaders);
  }

  return errorResponse(
    errors.methodNotAllowed(method, `/v1/companies${companyId ? '/' + companyId : ''}`),
    corsHeaders
  );
}

async function listCompanies(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();
  const url = new URL(req.url);

  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '20'), 100);
  const offset = (page - 1) * perPage;
  const search = url.searchParams.get('search');
  const status = url.searchParams.get('status');

  let query = supabase
    .from('companies')
    .select('*', { count: 'exact' })
    .eq('organization_id', auth.organizationId!);

  if (search) {
    query = query.or(`name.ilike.%${search}%,domain.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('List companies error:', error);
    return errorResponse(errors.internalError('Failed to fetch companies'), corsHeaders);
  }

  const response: PaginatedResponse<any> = {
    data: data || [],
    meta: {
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createCompany(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: CompanyInput;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  if (!body.name) {
    return errorResponse(errors.badRequest('name is required'), corsHeaders);
  }

  const { data, error } = await supabase
    .from('companies')
    .insert({
      organization_id: auth.organizationId,
      name: body.name,
      domain: body.domain,
      website: body.website,
      industry: body.industry,
      size: body.size,
      employee_count: body.employee_count,
      description: body.description,
      status: body.status || 'prospect',
      linkedin_url: body.linkedin_url,
      custom_fields: body.custom_fields,
    })
    .select('id, name')
    .single();

  if (error) {
    console.error('Create company error:', error);
    return errorResponse(errors.internalError('Failed to create company'), corsHeaders);
  }

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getCompany(
  companyId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (error || !data) {
    return errorResponse(errors.notFound('Company'), corsHeaders);
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateCompany(
  req: Request,
  companyId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: Partial<CompanyInput>;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (!existing) {
    return errorResponse(errors.notFound('Company'), corsHeaders);
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.domain !== undefined) updateData.domain = body.domain;
  if (body.website !== undefined) updateData.website = body.website;
  if (body.industry !== undefined) updateData.industry = body.industry;
  if (body.size !== undefined) updateData.size = body.size;
  if (body.employee_count !== undefined) updateData.employee_count = body.employee_count;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.linkedin_url !== undefined) updateData.linkedin_url = body.linkedin_url;
  if (body.custom_fields !== undefined) updateData.custom_fields = body.custom_fields;

  const { error } = await supabase
    .from('companies')
    .update(updateData)
    .eq('id', companyId);

  if (error) {
    console.error('Update company error:', error);
    return errorResponse(errors.internalError('Failed to update company'), corsHeaders);
  }

  return new Response(JSON.stringify({ data: { id: companyId, updated: true } }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
