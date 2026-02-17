/**
 * Tasks API Routes
 *
 * GET /v1/tasks - List tasks
 * POST /v1/tasks - Create task
 * PATCH /v1/tasks/:id - Update task
 * PATCH /v1/tasks/:id/complete - Complete task
 */

import { getSupabaseAdmin, hasPermission } from '../auth.ts';
import { errors, errorResponse } from '../errors.ts';
import type { AuthResult, TaskInput, PaginatedResponse } from '../types.ts';

export async function handleTasks(
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
): Promise<Response> {
  const method = req.method;
  const taskId = pathParts[1];
  const subResource = pathParts[2];

  // GET /v1/tasks - List tasks
  if (method === 'GET' && !taskId) {
    if (!hasPermission(auth.permissions, 'tasks', 'read')) {
      return errorResponse(errors.forbidden('No permission to read tasks'), corsHeaders);
    }
    return listTasks(req, auth, corsHeaders);
  }

  // POST /v1/tasks - Create task
  if (method === 'POST' && !taskId) {
    if (!hasPermission(auth.permissions, 'tasks', 'write')) {
      return errorResponse(errors.forbidden('No permission to create tasks'), corsHeaders);
    }
    return createTask(req, auth, corsHeaders);
  }

  // PATCH /v1/tasks/:id - Update task
  if (method === 'PATCH' && taskId && !subResource) {
    if (!hasPermission(auth.permissions, 'tasks', 'write')) {
      return errorResponse(errors.forbidden('No permission to update tasks'), corsHeaders);
    }
    return updateTask(req, taskId, auth, corsHeaders);
  }

  // PATCH /v1/tasks/:id/complete - Complete task
  if (method === 'PATCH' && taskId && subResource === 'complete') {
    if (!hasPermission(auth.permissions, 'tasks', 'write')) {
      return errorResponse(errors.forbidden('No permission to update tasks'), corsHeaders);
    }
    return completeTask(taskId, auth, corsHeaders);
  }

  return errorResponse(
    errors.methodNotAllowed(method, `/v1/tasks${taskId ? '/' + taskId : ''}`),
    corsHeaders
  );
}

async function listTasks(
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
  const contactOrgId = url.searchParams.get('contact_org_id');
  const dealId = url.searchParams.get('deal_id');

  let query = supabase
    .from('crm_tasks')
    .select('*', { count: 'exact' })
    .eq('organization_id', auth.organizationId!);

  if (status) {
    query = query.eq('status', status);
  }
  if (contactOrgId) {
    query = query.eq('contact_org_id', contactOrgId);
  }
  if (dealId) {
    query = query.eq('deal_id', dealId);
  }

  query = query
    .order('due_at', { ascending: true, nullsFirst: false })
    .range(offset, offset + perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('List tasks error:', error);
    return errorResponse(errors.internalError('Failed to fetch tasks'), corsHeaders);
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

async function createTask(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: TaskInput;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  if (!body.title) {
    return errorResponse(errors.badRequest('title is required'), corsHeaders);
  }

  const { data, error } = await supabase
    .from('crm_tasks')
    .insert({
      organization_id: auth.organizationId,
      title: body.title,
      description: body.description,
      type: body.type || 'follow_up',
      priority: body.priority || 'medium',
      status: 'pending',
      due_at: body.due_at,
      contact_org_id: body.contact_org_id,
      deal_id: body.deal_id,
      company_id: body.company_id,
    })
    .select('id, title, status')
    .single();

  if (error) {
    console.error('Create task error:', error);
    return errorResponse(errors.internalError('Failed to create task'), corsHeaders);
  }

  return new Response(JSON.stringify({ data }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateTask(
  req: Request,
  taskId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: Partial<TaskInput & { status: string }>;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  const { data: existing } = await supabase
    .from('crm_tasks')
    .select('id')
    .eq('id', taskId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (!existing) {
    return errorResponse(errors.notFound('Task'), corsHeaders);
  }

  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.type !== undefined) updateData.type = body.type;
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.due_at !== undefined) updateData.due_at = body.due_at;

  const { error } = await supabase
    .from('crm_tasks')
    .update(updateData)
    .eq('id', taskId);

  if (error) {
    console.error('Update task error:', error);
    return errorResponse(errors.internalError('Failed to update task'), corsHeaders);
  }

  return new Response(JSON.stringify({ data: { id: taskId, updated: true } }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function completeTask(
  taskId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from('crm_tasks')
    .select('id')
    .eq('id', taskId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (!existing) {
    return errorResponse(errors.notFound('Task'), corsHeaders);
  }

  const { error } = await supabase
    .from('crm_tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) {
    console.error('Complete task error:', error);
    return errorResponse(errors.internalError('Failed to complete task'), corsHeaders);
  }

  return new Response(JSON.stringify({ data: { id: taskId, completed: true } }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
