/**
 * Financial API
 *
 * Endpoints:
 * GET /v1/dashboard - Dashboard metrics
 * GET /v1/accounts - List accounts with balances
 * GET /v1/cashflow - Cashflow projection
 * GET /v1/dre - DRE (income statement)
 * GET /v1/transactions - List transactions
 * GET /v1/transactions/:id - Get transaction detail
 * POST /v1/transactions - Create transaction
 * PATCH /v1/transactions/:id - Update transaction
 * POST /v1/transactions/:id/pay - Register payment
 * DELETE /v1/transactions/:id - Cancel transaction
 * GET /v1/categories - List categories
 */

import { getCorsHeaders, handleCors } from './cors.ts';
import { authenticateRequest, getSupabaseAdmin } from './auth.ts';
import { errors, errorResponse } from './errors.ts';
import { handleDashboard } from './routes/dashboard.ts';
import { handleAccounts } from './routes/accounts.ts';
import { handleTransactions } from './routes/transactions.ts';
import { handleCategories } from './routes/categories.ts';
import { handleRecurrences } from './routes/recurrences.ts';
import type { AuthResult } from './types.ts';

type RouteHandler = (
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
) => Promise<Response>;

const routes: Record<string, RouteHandler> = {
  dashboard: handleDashboard,
  accounts: handleAccounts,
  transactions: handleTransactions,
  categories: handleCategories,
  recurrences: handleRecurrences,
  cashflow: handleDashboard,
  dre: handleDashboard,
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Remove function name prefix if present
  if (pathParts[0] === 'financial-api') pathParts.shift();

  // Validate API version
  if (pathParts[0] !== 'v1') {
    // Root endpoint - return API info
    if (pathParts.length === 0) {
      return new Response(JSON.stringify({
        name: 'KOSMOS Financial API',
        version: '1.0.0',
        endpoints: [
          '/v1/dashboard',
          '/v1/accounts',
          '/v1/cashflow',
          '/v1/dre',
          '/v1/transactions',
          '/v1/categories',
          '/v1/recurrences',
        ],
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return errorResponse(errors.badRequest('Invalid API version. Use /v1/'), corsHeaders);
  }
  pathParts.shift(); // Remove 'v1'

  const resource = pathParts[0];
  if (!resource) {
    return errorResponse(errors.badRequest('Resource not specified'), corsHeaders);
  }

  // Authenticate request
  const auth = await authenticateRequest(req);
  if (!auth.success) {
    return errorResponse(
      errors.unauthorized(auth.error || 'Authentication failed'),
      corsHeaders
    );
  }

  const supabase = getSupabaseAdmin();
  const startTime = Date.now();

  try {
    const handler = routes[resource];
    if (!handler) {
      return errorResponse(
        errors.notFound(`Endpoint /v1/${resource}`),
        corsHeaders
      );
    }

    const response = await handler(req, auth, pathParts, corsHeaders);

    // Log request
    try {
      await supabase.from('api_request_logs').insert({
        api_key_id: auth.apiKeyId,
        organization_id: auth.organizationId,
        method: req.method,
        path: url.pathname,
        query_params: Object.fromEntries(url.searchParams),
        source_ip: req.headers.get('cf-connecting-ip') ||
          req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        user_agent: req.headers.get('user-agent'),
        response_status: response.status,
        response_time_ms: Date.now() - startTime,
      });
    } catch {
      // Don't fail the main request if logging fails
    }

    return response;
  } catch (err) {
    console.error('Financial API Error:', err);

    // Log error
    try {
      await supabase.from('api_request_logs').insert({
        api_key_id: auth.apiKeyId,
        organization_id: auth.organizationId,
        method: req.method,
        path: url.pathname,
        response_status: 500,
        response_time_ms: Date.now() - startTime,
        error_message: String(err),
      });
    } catch {
      // Don't fail
    }

    return errorResponse(errors.internalError('Internal server error'), corsHeaders);
  }
});
