/**
 * Tags API Routes
 *
 * GET /v1/tags - List available tags
 */

import { getSupabaseAdmin, hasPermission } from '../auth.ts';
import { errors, errorResponse } from '../errors.ts';
import type { AuthResult } from '../types.ts';

export async function handleTags(
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
): Promise<Response> {
  const method = req.method;

  // GET /v1/tags - List tags
  if (method === 'GET') {
    if (!hasPermission(auth.permissions, 'tags', 'read')) {
      return errorResponse(errors.forbidden('No permission to read tags'), corsHeaders);
    }
    return listTags(auth, corsHeaders);
  }

  return errorResponse(
    errors.methodNotAllowed(method, '/v1/tags'),
    corsHeaders
  );
}

async function listTags(
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('tags')
    .select('id, name, color, description')
    .eq('organization_id', auth.organizationId!)
    .order('name');

  if (error) {
    console.error('List tags error:', error);
    return errorResponse(errors.internalError('Failed to fetch tags'), corsHeaders);
  }

  return new Response(JSON.stringify({ data: data || [] }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
