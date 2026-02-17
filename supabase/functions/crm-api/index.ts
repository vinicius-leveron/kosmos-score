/**
 * CRM API - Edge Function
 *
 * REST API for external integrations with KOSMOS CRM.
 *
 * Authentication: Bearer token with API key
 * Format: Authorization: Bearer ks_live_xxxxx
 *
 * Endpoints:
 * - GET/POST/PATCH /v1/contacts
 * - GET/POST/PATCH /v1/companies
 * - GET/POST/PATCH /v1/deals
 * - GET /v1/tags
 * - GET /v1/pipelines
 * - POST /v1/tasks
 */

import { getCorsHeaders, handleCors } from './cors.ts';
import { authenticateRequest, hasPermission, getSupabaseAdmin } from './auth.ts';
import { errors, errorResponse } from './errors.ts';
import { handleContacts } from './routes/contacts.ts';
import { handleCompanies } from './routes/companies.ts';
import { handleDeals } from './routes/deals.ts';
import { handleTags } from './routes/tags.ts';
import { handlePipelines } from './routes/pipelines.ts';
import { handleTasks } from './routes/tasks.ts';
import type { AuthResult } from './types.ts';

// Router type
type RouteHandler = (
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
) => Promise<Response>;

// Route mapping
const routes: Record<string, RouteHandler> = {
  contacts: handleContacts,
  companies: handleCompanies,
  deals: handleDeals,
  tags: handleTags,
  pipelines: handlePipelines,
  tasks: handleTasks,
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Expected format: /crm-api/v1/resource or /v1/resource
  // Remove function name if present
  if (pathParts[0] === 'crm-api') {
    pathParts.shift();
  }

  // Check API version
  if (pathParts[0] !== 'v1') {
    return errorResponse(
      errors.badRequest('Invalid API version. Use /v1/'),
      corsHeaders
    );
  }
  pathParts.shift(); // Remove 'v1'

  // Get resource name
  const resource = pathParts[0];
  if (!resource) {
    return new Response(JSON.stringify({
      name: 'KOSMOS CRM API',
      version: '1.0.0',
      documentation: 'https://docs.kosmos.io/api',
      endpoints: Object.keys(routes).map(r => `/v1/${r}`),
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Authenticate request
  const auth = await authenticateRequest(req);
  if (!auth.success) {
    return errorResponse(
      errors.unauthorized(auth.error),
      corsHeaders
    );
  }

  // Log request for debugging
  const supabase = getSupabaseAdmin();
  const startTime = Date.now();

  try {
    // Find route handler
    const handler = routes[resource];
    if (!handler) {
      return errorResponse(
        errors.notFound(`Endpoint /v1/${resource}`),
        corsHeaders
      );
    }

    // Execute handler
    const response = await handler(req, auth, pathParts, corsHeaders);

    // Log successful request
    await logRequest(supabase, auth, req, url, response.status, Date.now() - startTime);

    return response;
  } catch (err) {
    console.error('API Error:', err);

    // Log failed request
    await logRequest(supabase, auth, req, url, 500, Date.now() - startTime, String(err));

    return errorResponse(
      errors.internalError(err instanceof Error ? err.message : 'Unknown error'),
      corsHeaders
    );
  }
});

// Log API request for analytics and debugging
async function logRequest(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  auth: AuthResult,
  req: Request,
  url: URL,
  status: number,
  responseTimeMs: number,
  errorMessage?: string
) {
  try {
    await supabase.from('api_request_logs').insert({
      api_key_id: auth.apiKeyId,
      organization_id: auth.organizationId,
      method: req.method,
      path: url.pathname,
      query_params: Object.fromEntries(url.searchParams),
      source_ip: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      user_agent: req.headers.get('user-agent'),
      response_status: status,
      response_time_ms: responseTimeMs,
      error_message: errorMessage,
    });
  } catch (err) {
    // Don't fail the request if logging fails
    console.error('Failed to log request:', err);
  }
}
