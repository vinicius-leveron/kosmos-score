/**
 * Transactions Routes
 *
 * GET /v1/transactions - List transactions (paginated, filtered)
 * GET /v1/transactions/:id - Get transaction detail
 * POST /v1/transactions - Create transaction
 * PATCH /v1/transactions/:id - Update transaction
 * POST /v1/transactions/:id/pay - Register payment
 * DELETE /v1/transactions/:id - Cancel transaction
 */

import { getSupabaseAdmin } from '../auth.ts';
import { errors, errorResponse } from '../errors.ts';
import type {
  AuthResult,
  TransactionInput,
  TransactionResponse,
  PaymentInput,
  PaginatedResponse,
} from '../types.ts';

export async function handleTransactions(
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
): Promise<Response> {
  const method = req.method;
  const transactionId = pathParts[1];
  const subResource = pathParts[2];

  // GET /v1/transactions - List
  if (method === 'GET' && !transactionId) {
    return listTransactions(req, auth, corsHeaders);
  }

  // POST /v1/transactions - Create
  if (method === 'POST' && !transactionId) {
    return createTransaction(req, auth, corsHeaders);
  }

  // GET /v1/transactions/:id - Get detail
  if (method === 'GET' && transactionId && !subResource) {
    return getTransaction(transactionId, auth, corsHeaders);
  }

  // PATCH /v1/transactions/:id - Update
  if (method === 'PATCH' && transactionId && !subResource) {
    return updateTransaction(req, transactionId, auth, corsHeaders);
  }

  // POST /v1/transactions/:id/pay - Register payment
  if (method === 'POST' && transactionId && subResource === 'pay') {
    return registerPayment(req, transactionId, auth, corsHeaders);
  }

  // DELETE /v1/transactions/:id - Cancel
  if (method === 'DELETE' && transactionId && !subResource) {
    return cancelTransaction(transactionId, auth, corsHeaders);
  }

  return errorResponse(
    errors.methodNotAllowed(method, `/v1/transactions${transactionId ? '/' + transactionId : ''}`),
    corsHeaders
  );
}

// GET /v1/transactions
async function listTransactions(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();
  const url = new URL(req.url);

  // Pagination
  const page = parseInt(url.searchParams.get('page') || '1');
  const perPage = Math.min(parseInt(url.searchParams.get('per_page') || '20'), 100);
  const offset = (page - 1) * perPage;

  // Filters
  const type = url.searchParams.get('type');
  const status = url.searchParams.get('status');
  const categoryId = url.searchParams.get('category_id');
  const dateFrom = url.searchParams.get('date_from');
  const dateTo = url.searchParams.get('date_to');
  const search = url.searchParams.get('search');

  let query = supabase
    .from('financial_transactions')
    .select(`
      id,
      type,
      status,
      description,
      amount,
      paid_amount,
      due_date,
      paid_date,
      competence_date,
      category_id,
      account_id,
      counterparty_name,
      created_at,
      updated_at,
      financial_categories (id, name),
      financial_accounts (id, name)
    `, { count: 'exact' })
    .eq('organization_id', auth.organizationId!);

  // Apply filters
  if (type) query = query.eq('type', type);
  if (status) query = query.eq('status', status);
  if (categoryId) query = query.eq('category_id', categoryId);
  if (dateFrom) query = query.gte('due_date', dateFrom);
  if (dateTo) query = query.lte('due_date', dateTo);
  if (search) query = query.ilike('description', `%${search}%`);

  // Pagination and ordering
  query = query
    .order('due_date', { ascending: false })
    .range(offset, offset + perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('List transactions error:', error);
    return errorResponse(errors.internalError('Failed to fetch transactions'), corsHeaders);
  }

  const transactions: TransactionResponse[] = (data || []).map((tx) => ({
    id: tx.id,
    type: tx.type,
    status: tx.status,
    description: tx.description,
    amount: Number(tx.amount) || 0,
    paid_amount: Number(tx.paid_amount) || 0,
    due_date: tx.due_date,
    paid_date: tx.paid_date,
    competence_date: tx.competence_date,
    category_id: tx.category_id,
    category_name: tx.financial_categories?.name || null,
    account_id: tx.account_id,
    account_name: tx.financial_accounts?.name || null,
    counterparty_name: tx.counterparty_name,
    created_at: tx.created_at,
    updated_at: tx.updated_at,
  }));

  const response: PaginatedResponse<TransactionResponse> = {
    data: transactions,
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

// GET /v1/transactions/:id
async function getTransaction(
  transactionId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('financial_transactions')
    .select(`
      *,
      financial_categories (id, name, type, color),
      financial_accounts (id, name, type)
    `)
    .eq('id', transactionId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (error || !data) {
    return errorResponse(errors.notFound('Transaction'), corsHeaders);
  }

  const tx: TransactionResponse = {
    id: data.id,
    type: data.type,
    status: data.status,
    description: data.description,
    amount: Number(data.amount) || 0,
    paid_amount: Number(data.paid_amount) || 0,
    due_date: data.due_date,
    paid_date: data.paid_date,
    competence_date: data.competence_date,
    category_id: data.category_id,
    category_name: data.financial_categories?.name || null,
    account_id: data.account_id,
    account_name: data.financial_accounts?.name || null,
    counterparty_name: data.counterparty_name,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  return new Response(JSON.stringify({ data: tx }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// POST /v1/transactions
async function createTransaction(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: TransactionInput;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  // Validate required fields
  if (!body.type || !['receivable', 'payable'].includes(body.type)) {
    return errorResponse(errors.badRequest('type must be receivable or payable'), corsHeaders);
  }
  if (!body.description) {
    return errorResponse(errors.badRequest('description is required'), corsHeaders);
  }
  if (!body.amount || body.amount <= 0) {
    return errorResponse(errors.badRequest('amount must be greater than 0'), corsHeaders);
  }
  if (!body.due_date) {
    return errorResponse(errors.badRequest('due_date is required'), corsHeaders);
  }

  const { data, error } = await supabase
    .from('financial_transactions')
    .insert({
      organization_id: auth.organizationId,
      type: body.type,
      status: 'pending',
      description: body.description,
      amount: body.amount,
      paid_amount: 0,
      due_date: body.due_date,
      competence_date: body.competence_date || body.due_date,
      category_id: body.category_id || null,
      account_id: body.account_id || null,
      cost_center_id: body.cost_center_id || null,
      counterparty_name: body.counterparty_name || null,
      counterparty_document: body.counterparty_document || null,
      document_number: body.document_number || null,
      notes: body.notes || null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Create transaction error:', error);
    return errorResponse(errors.internalError('Failed to create transaction'), corsHeaders);
  }

  return new Response(JSON.stringify({
    data: { id: data.id, created: true },
  }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// PATCH /v1/transactions/:id
async function updateTransaction(
  req: Request,
  transactionId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: Partial<TransactionInput>;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('financial_transactions')
    .select('id, status')
    .eq('id', transactionId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (!existing) {
    return errorResponse(errors.notFound('Transaction'), corsHeaders);
  }

  if (existing.status === 'canceled') {
    return errorResponse(errors.badRequest('Cannot update canceled transaction'), corsHeaders);
  }

  // Build update object
  const updateData: Record<string, unknown> = {};
  if (body.description !== undefined) updateData.description = body.description;
  if (body.amount !== undefined) updateData.amount = body.amount;
  if (body.due_date !== undefined) updateData.due_date = body.due_date;
  if (body.competence_date !== undefined) updateData.competence_date = body.competence_date;
  if (body.category_id !== undefined) updateData.category_id = body.category_id || null;
  if (body.account_id !== undefined) updateData.account_id = body.account_id || null;
  if (body.counterparty_name !== undefined) updateData.counterparty_name = body.counterparty_name || null;
  if (body.notes !== undefined) updateData.notes = body.notes || null;

  if (Object.keys(updateData).length === 0) {
    return errorResponse(errors.badRequest('No fields to update'), corsHeaders);
  }

  const { error } = await supabase
    .from('financial_transactions')
    .update(updateData)
    .eq('id', transactionId);

  if (error) {
    console.error('Update transaction error:', error);
    return errorResponse(errors.internalError('Failed to update transaction'), corsHeaders);
  }

  return new Response(JSON.stringify({
    data: { id: transactionId, updated: true },
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// POST /v1/transactions/:id/pay
async function registerPayment(
  req: Request,
  transactionId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: PaymentInput;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  // Validate
  if (!body.amount || body.amount <= 0) {
    return errorResponse(errors.badRequest('amount must be greater than 0'), corsHeaders);
  }
  if (!body.date) {
    return errorResponse(errors.badRequest('date is required'), corsHeaders);
  }
  if (!body.account_id) {
    return errorResponse(errors.badRequest('account_id is required'), corsHeaders);
  }

  // Get transaction
  const { data: tx, error: txError } = await supabase
    .from('financial_transactions')
    .select('id, type, amount, paid_amount, status')
    .eq('id', transactionId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (txError || !tx) {
    return errorResponse(errors.notFound('Transaction'), corsHeaders);
  }

  if (tx.status === 'canceled' || tx.status === 'paid') {
    return errorResponse(
      errors.badRequest(`Cannot register payment for ${tx.status} transaction`),
      corsHeaders
    );
  }

  const newPaidAmount = Number(tx.paid_amount) + body.amount;
  const remaining = Number(tx.amount) - newPaidAmount;

  // Update transaction
  const updateData: Record<string, unknown> = {
    paid_amount: newPaidAmount,
    account_id: body.account_id,
  };

  // Set status and paid_date if fully paid
  if (remaining <= 0) {
    updateData.status = 'paid';
    updateData.paid_date = body.date;
  } else {
    updateData.status = 'partially_paid';
  }

  const { error: updateError } = await supabase
    .from('financial_transactions')
    .update(updateData)
    .eq('id', transactionId);

  if (updateError) {
    console.error('Register payment error:', updateError);
    return errorResponse(errors.internalError('Failed to register payment'), corsHeaders);
  }

  // Update account balance
  const balanceChange = tx.type === 'receivable' ? body.amount : -body.amount;

  const { error: accountError } = await supabase.rpc('update_account_balance', {
    p_account_id: body.account_id,
    p_amount: balanceChange,
  });

  if (accountError) {
    console.error('Update account balance error:', accountError);
    // Don't fail the request, just log
  }

  return new Response(JSON.stringify({
    data: {
      id: transactionId,
      paid_amount: newPaidAmount,
      remaining: remaining > 0 ? remaining : 0,
      status: remaining <= 0 ? 'paid' : 'partially_paid',
    },
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// DELETE /v1/transactions/:id
async function cancelTransaction(
  transactionId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  // Verify ownership
  const { data: existing } = await supabase
    .from('financial_transactions')
    .select('id, status')
    .eq('id', transactionId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (!existing) {
    return errorResponse(errors.notFound('Transaction'), corsHeaders);
  }

  if (existing.status === 'canceled') {
    return errorResponse(errors.badRequest('Transaction already canceled'), corsHeaders);
  }

  const { error } = await supabase
    .from('financial_transactions')
    .update({ status: 'canceled' })
    .eq('id', transactionId);

  if (error) {
    console.error('Cancel transaction error:', error);
    return errorResponse(errors.internalError('Failed to cancel transaction'), corsHeaders);
  }

  return new Response(JSON.stringify({
    data: { id: transactionId, canceled: true },
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
