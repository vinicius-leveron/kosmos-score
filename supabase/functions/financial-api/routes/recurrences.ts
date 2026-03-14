/**
 * Recurrences Routes
 *
 * GET /v1/recurrences - List active recurrences
 * POST /v1/recurrences - Create recurrence
 * PATCH /v1/recurrences/:id - Update recurrence (propagates to pending transactions)
 * POST /v1/recurrences/:id/generate - Generate transactions up to a date
 * DELETE /v1/recurrences/:id - Deactivate recurrence
 */

import { getSupabaseAdmin } from '../auth.ts';
import { errors, errorResponse } from '../errors.ts';
import type {
  AuthResult,
  RecurrenceInput,
  RecurrenceResponse,
  GenerateRecurrenceInput,
} from '../types.ts';

const VALID_FREQUENCIES = ['daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual'];

export async function handleRecurrences(
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
): Promise<Response> {
  const method = req.method;
  const recurrenceId = pathParts[1];
  const subResource = pathParts[2];

  // GET /v1/recurrences - List
  if (method === 'GET' && !recurrenceId) {
    return listRecurrences(auth, corsHeaders);
  }

  // POST /v1/recurrences - Create
  if (method === 'POST' && !recurrenceId) {
    return createRecurrence(req, auth, corsHeaders);
  }

  // GET /v1/recurrences/:id - Get detail
  if (method === 'GET' && recurrenceId && !subResource) {
    return getRecurrence(recurrenceId, auth, corsHeaders);
  }

  // PATCH /v1/recurrences/:id - Update
  if (method === 'PATCH' && recurrenceId && !subResource) {
    return updateRecurrence(req, recurrenceId, auth, corsHeaders);
  }

  // POST /v1/recurrences/:id/generate - Generate transactions
  if (method === 'POST' && recurrenceId && subResource === 'generate') {
    return generateTransactions(req, recurrenceId, auth, corsHeaders);
  }

  // DELETE /v1/recurrences/:id - Deactivate
  if (method === 'DELETE' && recurrenceId && !subResource) {
    return deactivateRecurrence(recurrenceId, auth, corsHeaders);
  }

  return errorResponse(
    errors.methodNotAllowed(method, `/v1/recurrences${recurrenceId ? '/' + recurrenceId : ''}`),
    corsHeaders
  );
}

// GET /v1/recurrences
async function listRecurrences(
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('financial_recurrences')
    .select(`
      id,
      description,
      type,
      amount,
      frequency,
      start_date,
      end_date,
      day_of_month,
      next_due_date,
      last_generated_date,
      category_id,
      account_id,
      counterparty_name,
      is_active,
      created_at,
      financial_categories (id, name),
      financial_accounts (id, name)
    `)
    .eq('organization_id', auth.organizationId!)
    .eq('is_active', true)
    .order('next_due_date', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('List recurrences error:', error);
    return errorResponse(errors.internalError('Failed to fetch recurrences'), corsHeaders);
  }

  const recurrences: RecurrenceResponse[] = (data || []).map((rec) => ({
    id: rec.id,
    description: rec.description,
    type: rec.type,
    amount: Number(rec.amount) || 0,
    frequency: rec.frequency,
    start_date: rec.start_date,
    end_date: rec.end_date,
    day_of_month: rec.day_of_month,
    next_due_date: rec.next_due_date,
    last_generated_date: rec.last_generated_date,
    category_id: rec.category_id,
    category_name: rec.financial_categories?.name || null,
    account_id: rec.account_id,
    account_name: rec.financial_accounts?.name || null,
    counterparty_name: rec.counterparty_name,
    is_active: rec.is_active,
    created_at: rec.created_at,
  }));

  return new Response(JSON.stringify({ data: recurrences }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// GET /v1/recurrences/:id
async function getRecurrence(
  recurrenceId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('financial_recurrences')
    .select(`
      *,
      financial_categories (id, name),
      financial_accounts (id, name)
    `)
    .eq('id', recurrenceId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (error || !data) {
    return errorResponse(errors.notFound('Recurrence'), corsHeaders);
  }

  const rec: RecurrenceResponse = {
    id: data.id,
    description: data.description,
    type: data.type,
    amount: Number(data.amount) || 0,
    frequency: data.frequency,
    start_date: data.start_date,
    end_date: data.end_date,
    day_of_month: data.day_of_month,
    next_due_date: data.next_due_date,
    last_generated_date: data.last_generated_date,
    category_id: data.category_id,
    category_name: data.financial_categories?.name || null,
    account_id: data.account_id,
    account_name: data.financial_accounts?.name || null,
    counterparty_name: data.counterparty_name,
    is_active: data.is_active,
    created_at: data.created_at,
  };

  return new Response(JSON.stringify({ data: rec }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// POST /v1/recurrences
async function createRecurrence(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: RecurrenceInput;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  // Validate required fields
  if (!body.description) {
    return errorResponse(errors.badRequest('description is required'), corsHeaders);
  }
  if (!body.type || !['receivable', 'payable'].includes(body.type)) {
    return errorResponse(errors.badRequest('type must be receivable or payable'), corsHeaders);
  }
  if (!body.amount || body.amount <= 0) {
    return errorResponse(errors.badRequest('amount must be greater than 0'), corsHeaders);
  }
  if (!body.frequency || !VALID_FREQUENCIES.includes(body.frequency)) {
    return errorResponse(errors.badRequest(`frequency must be one of: ${VALID_FREQUENCIES.join(', ')}`), corsHeaders);
  }
  if (!body.start_date) {
    return errorResponse(errors.badRequest('start_date is required'), corsHeaders);
  }
  if (body.day_of_month !== undefined && body.day_of_month !== null) {
    if (body.day_of_month < 1 || body.day_of_month > 31) {
      return errorResponse(errors.badRequest('day_of_month must be between 1 and 31'), corsHeaders);
    }
  }

  const { data, error } = await supabase
    .from('financial_recurrences')
    .insert({
      organization_id: auth.organizationId,
      description: body.description,
      type: body.type,
      amount: body.amount,
      frequency: body.frequency,
      start_date: body.start_date,
      end_date: body.end_date || null,
      day_of_month: body.day_of_month || null,
      next_due_date: body.start_date,
      category_id: body.category_id || null,
      account_id: body.account_id || null,
      cost_center_id: body.cost_center_id || null,
      counterparty_name: body.counterparty_name || null,
      is_active: true,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Create recurrence error:', error);
    return errorResponse(errors.internalError('Failed to create recurrence'), corsHeaders);
  }

  return new Response(JSON.stringify({
    data: { id: data.id, created: true },
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// PATCH /v1/recurrences/:id
async function updateRecurrence(
  req: Request,
  recurrenceId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: Partial<RecurrenceInput>;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('financial_recurrences')
    .select('id, is_active')
    .eq('id', recurrenceId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (!existing) {
    return errorResponse(errors.notFound('Recurrence'), corsHeaders);
  }

  // Build update object
  const updateData: Record<string, unknown> = {};
  if (body.description !== undefined) updateData.description = body.description;
  if (body.amount !== undefined) updateData.amount = body.amount;
  if (body.frequency !== undefined) {
    if (!VALID_FREQUENCIES.includes(body.frequency)) {
      return errorResponse(errors.badRequest(`frequency must be one of: ${VALID_FREQUENCIES.join(', ')}`), corsHeaders);
    }
    updateData.frequency = body.frequency;
  }
  if (body.start_date !== undefined) updateData.start_date = body.start_date;
  if (body.end_date !== undefined) updateData.end_date = body.end_date || null;
  if (body.day_of_month !== undefined) updateData.day_of_month = body.day_of_month || null;
  if (body.category_id !== undefined) updateData.category_id = body.category_id || null;
  if (body.account_id !== undefined) updateData.account_id = body.account_id || null;
  if (body.cost_center_id !== undefined) updateData.cost_center_id = body.cost_center_id || null;
  if (body.counterparty_name !== undefined) updateData.counterparty_name = body.counterparty_name || null;

  if (Object.keys(updateData).length === 0) {
    return errorResponse(errors.badRequest('No fields to update'), corsHeaders);
  }

  // Update recurrence
  const { error: updateError } = await supabase
    .from('financial_recurrences')
    .update(updateData)
    .eq('id', recurrenceId);

  if (updateError) {
    console.error('Update recurrence error:', updateError);
    return errorResponse(errors.internalError('Failed to update recurrence'), corsHeaders);
  }

  // Propagate changes to pending transactions
  let propagatedCount = 0;
  try {
    const { data: propagateResult, error: propagateError } = await supabase.rpc('propagate_recurrence_changes', {
      p_recurrence_id: recurrenceId,
    });

    if (propagateError) {
      console.error('Propagate changes error:', propagateError);
    } else {
      propagatedCount = propagateResult || 0;
    }
  } catch (err) {
    console.error('Propagate changes exception:', err);
  }

  return new Response(JSON.stringify({
    data: {
      id: recurrenceId,
      updated: true,
      propagated_transactions: propagatedCount,
    },
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// POST /v1/recurrences/:id/generate
async function generateTransactions(
  req: Request,
  recurrenceId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: GenerateRecurrenceInput = {};
  try {
    const text = await req.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('financial_recurrences')
    .select('id, is_active, organization_id')
    .eq('id', recurrenceId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (!existing) {
    return errorResponse(errors.notFound('Recurrence'), corsHeaders);
  }

  if (!existing.is_active) {
    return errorResponse(errors.badRequest('Cannot generate transactions for inactive recurrence'), corsHeaders);
  }

  // Calculate until_date (default: 3 months from now)
  const untilDate = body.until_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Call generation function
  const { data: generatedCount, error: generateError } = await supabase.rpc('generate_recurrence_transactions', {
    p_recurrence_id: recurrenceId,
    p_until_date: untilDate,
  });

  if (generateError) {
    console.error('Generate transactions error:', generateError);
    return errorResponse(errors.internalError('Failed to generate transactions'), corsHeaders);
  }

  return new Response(JSON.stringify({
    data: {
      recurrence_id: recurrenceId,
      generated_count: generatedCount || 0,
      until_date: untilDate,
    },
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// DELETE /v1/recurrences/:id
async function deactivateRecurrence(
  recurrenceId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  // Verify ownership
  const { data: existing } = await supabase
    .from('financial_recurrences')
    .select('id')
    .eq('id', recurrenceId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (!existing) {
    return errorResponse(errors.notFound('Recurrence'), corsHeaders);
  }

  const { error } = await supabase
    .from('financial_recurrences')
    .update({ is_active: false })
    .eq('id', recurrenceId);

  if (error) {
    console.error('Deactivate recurrence error:', error);
    return errorResponse(errors.internalError('Failed to deactivate recurrence'), corsHeaders);
  }

  return new Response(JSON.stringify({
    data: { id: recurrenceId, deactivated: true },
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
