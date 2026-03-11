/**
 * Accounts Routes
 *
 * GET /v1/accounts - List accounts with balances
 */

import { getSupabaseAdmin } from '../auth.ts';
import { errors, errorResponse } from '../errors.ts';
import type { AuthResult, AccountResponse } from '../types.ts';

export async function handleAccounts(
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (req.method !== 'GET') {
    return errorResponse(errors.methodNotAllowed(req.method, '/v1/accounts'), corsHeaders);
  }

  return listAccounts(auth, corsHeaders);
}

// GET /v1/accounts
async function listAccounts(
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('financial_accounts')
    .select('id, name, type, initial_balance, current_balance, currency, color, is_active')
    .eq('organization_id', auth.organizationId!)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('List accounts error:', error);
    return errorResponse(errors.internalError('Failed to fetch accounts'), corsHeaders);
  }

  const accounts: AccountResponse[] = (data || []).map((acc) => ({
    id: acc.id,
    name: acc.name,
    type: acc.type,
    initial_balance: Number(acc.initial_balance) || 0,
    current_balance: Number(acc.current_balance) || 0,
    currency: acc.currency || 'BRL',
    color: acc.color || '#6366f1',
    is_active: acc.is_active,
  }));

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);

  return new Response(JSON.stringify({
    data: accounts,
    summary: {
      total_balance: totalBalance,
      account_count: accounts.length,
    },
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
