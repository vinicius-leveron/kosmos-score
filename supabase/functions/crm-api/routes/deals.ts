/**
 * Deals API Routes
 *
 * GET /v1/deals - List deals
 * POST /v1/deals - Create deal
 * GET /v1/deals/:id - Get deal details
 * PATCH /v1/deals/:id - Update deal
 * PATCH /v1/deals/:id/stage - Move deal to stage
 */

import { getSupabaseAdmin, hasPermission } from '../auth.ts';
import { errors, errorResponse } from '../errors.ts';
import type { AuthResult, DealInput, PaginatedResponse } from '../types.ts';

export async function handleDeals(
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
): Promise<Response> {
  const method = req.method;
  const dealId = pathParts[1];
  const subResource = pathParts[2];

  // GET /v1/deals - List deals
  if (method === 'GET' && !dealId) {
    if (!hasPermission(auth.permissions, 'deals', 'read')) {
      return errorResponse(errors.forbidden('No permission to read deals'), corsHeaders);
    }
    return listDeals(req, auth, corsHeaders);
  }

  // POST /v1/deals - Create deal
  if (method === 'POST' && !dealId) {
    if (!hasPermission(auth.permissions, 'deals', 'write')) {
      return errorResponse(errors.forbidden('No permission to create deals'), corsHeaders);
    }
    return createDeal(req, auth, corsHeaders);
  }

  // GET /v1/deals/:id - Get deal details
  if (method === 'GET' && dealId && !subResource) {
    if (!hasPermission(auth.permissions, 'deals', 'read')) {
      return errorResponse(errors.forbidden('No permission to read deals'), corsHeaders);
    }
    return getDeal(dealId, auth, corsHeaders);
  }

  // PATCH /v1/deals/:id - Update deal
  if (method === 'PATCH' && dealId && !subResource) {
    if (!hasPermission(auth.permissions, 'deals', 'write')) {
      return errorResponse(errors.forbidden('No permission to update deals'), corsHeaders);
    }
    return updateDeal(req, dealId, auth, corsHeaders);
  }

  // PATCH /v1/deals/:id/stage - Move deal to stage
  if (method === 'PATCH' && dealId && subResource === 'stage') {
    if (!hasPermission(auth.permissions, 'deals', 'write')) {
      return errorResponse(errors.forbidden('No permission to update deals'), corsHeaders);
    }
    return moveDealStage(req, dealId, auth, corsHeaders);
  }

  return errorResponse(
    errors.methodNotAllowed(method, `/v1/deals${dealId ? '/' + dealId : ''}`),
    corsHeaders
  );
}

async function listDeals(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();
  const url = new URL(req.url);

  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '20'), 100);
  const offset = (page - 1) * perPage;
  const status = url.searchParams.get('status');
  const pipelineId = url.searchParams.get('pipeline_id');
  const stageId = url.searchParams.get('stage_id');

  let query = supabase
    .from('deals')
    .select(`
      id,
      name,
      description,
      amount,
      currency,
      probability,
      expected_revenue,
      expected_close_date,
      status,
      created_at,
      updated_at,
      pipeline_stages (
        id,
        name,
        display_name,
        color
      ),
      companies (
        id,
        name
      )
    `, { count: 'exact' })
    .eq('organization_id', auth.organizationId!);

  if (status) {
    query = query.eq('status', status);
  }
  if (pipelineId) {
    query = query.eq('pipeline_id', pipelineId);
  }
  if (stageId) {
    query = query.eq('stage_id', stageId);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('List deals error:', error);
    return errorResponse(errors.internalError('Failed to fetch deals'), corsHeaders);
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

async function createDeal(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: DealInput;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  if (!body.name) {
    return errorResponse(errors.badRequest('name is required'), corsHeaders);
  }

  // Get default pipeline if not specified
  let pipelineId = body.pipeline_id;
  let stageId = body.stage_id;

  if (!pipelineId) {
    const { data: defaultPipeline } = await supabase
      .from('pipelines')
      .select('id')
      .eq('organization_id', auth.organizationId!)
      .eq('is_default', true)
      .eq('pipeline_type', 'deal')
      .single();

    if (defaultPipeline) {
      pipelineId = defaultPipeline.id;
    }
  }

  if (pipelineId && !stageId) {
    const { data: firstStage } = await supabase
      .from('pipeline_stages')
      .select('id')
      .eq('pipeline_id', pipelineId)
      .eq('is_entry_stage', true)
      .single();

    if (firstStage) {
      stageId = firstStage.id;
    }
  }

  const { data, error } = await supabase
    .from('deals')
    .insert({
      organization_id: auth.organizationId,
      name: body.name,
      description: body.description,
      amount: body.amount,
      currency: body.currency || 'BRL',
      probability: body.probability,
      expected_close_date: body.expected_close_date,
      company_id: body.company_id,
      primary_contact_id: body.primary_contact_id,
      pipeline_id: pipelineId,
      stage_id: stageId,
      source: body.source || 'api',
      custom_fields: body.custom_fields,
      status: 'open',
    })
    .select('id, name')
    .single();

  if (error) {
    console.error('Create deal error:', error);
    return errorResponse(errors.internalError('Failed to create deal'), corsHeaders);
  }

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getDeal(
  dealId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('deals')
    .select(`
      *,
      pipeline_stages (
        id,
        name,
        display_name,
        color
      ),
      pipelines (
        id,
        name,
        display_name
      ),
      companies (
        id,
        name,
        domain
      )
    `)
    .eq('id', dealId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (error || !data) {
    return errorResponse(errors.notFound('Deal'), corsHeaders);
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateDeal(
  req: Request,
  dealId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: Partial<DealInput>;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  const { data: existing } = await supabase
    .from('deals')
    .select('id')
    .eq('id', dealId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (!existing) {
    return errorResponse(errors.notFound('Deal'), corsHeaders);
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.amount !== undefined) updateData.amount = body.amount;
  if (body.currency !== undefined) updateData.currency = body.currency;
  if (body.probability !== undefined) updateData.probability = body.probability;
  if (body.expected_close_date !== undefined) updateData.expected_close_date = body.expected_close_date;
  if (body.company_id !== undefined) updateData.company_id = body.company_id;
  if (body.primary_contact_id !== undefined) updateData.primary_contact_id = body.primary_contact_id;
  if (body.custom_fields !== undefined) updateData.custom_fields = body.custom_fields;

  const { error } = await supabase
    .from('deals')
    .update(updateData)
    .eq('id', dealId);

  if (error) {
    console.error('Update deal error:', error);
    return errorResponse(errors.internalError('Failed to update deal'), corsHeaders);
  }

  return new Response(JSON.stringify({ data: { id: dealId, updated: true } }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function moveDealStage(
  req: Request,
  dealId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: { stage_id: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  if (!body.stage_id) {
    return errorResponse(errors.badRequest('stage_id is required'), corsHeaders);
  }

  const { data: existing } = await supabase
    .from('deals')
    .select('id, pipeline_id')
    .eq('id', dealId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (!existing) {
    return errorResponse(errors.notFound('Deal'), corsHeaders);
  }

  // Verify stage belongs to the same pipeline
  const { data: stage } = await supabase
    .from('pipeline_stages')
    .select('id')
    .eq('id', body.stage_id)
    .eq('pipeline_id', existing.pipeline_id)
    .single();

  if (!stage) {
    return errorResponse(errors.badRequest('Invalid stage_id for this pipeline'), corsHeaders);
  }

  const { error } = await supabase
    .from('deals')
    .update({
      stage_id: body.stage_id,
      entered_stage_at: new Date().toISOString(),
    })
    .eq('id', dealId);

  if (error) {
    console.error('Move deal stage error:', error);
    return errorResponse(errors.internalError('Failed to move deal'), corsHeaders);
  }

  return new Response(JSON.stringify({ data: { id: dealId, stage_id: body.stage_id, moved: true } }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
