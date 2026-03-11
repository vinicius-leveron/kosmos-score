/**
 * Categories Routes
 *
 * GET /v1/categories - List categories
 */

import { getSupabaseAdmin } from '../auth.ts';
import { errors, errorResponse } from '../errors.ts';
import type { AuthResult, CategoryResponse } from '../types.ts';

export async function handleCategories(
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
): Promise<Response> {
  if (req.method !== 'GET') {
    return errorResponse(errors.methodNotAllowed(req.method, '/v1/categories'), corsHeaders);
  }

  return listCategories(req, auth, corsHeaders);
}

// GET /v1/categories
async function listCategories(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();
  const url = new URL(req.url);

  // Optional type filter
  const type = url.searchParams.get('type');

  let query = supabase
    .from('financial_categories')
    .select('id, name, type, color, icon, parent_id')
    .eq('organization_id', auth.organizationId!)
    .eq('is_active', true)
    .order('position');

  if (type && ['revenue', 'expense', 'cost'].includes(type)) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('List categories error:', error);
    return errorResponse(errors.internalError('Failed to fetch categories'), corsHeaders);
  }

  const categories: CategoryResponse[] = (data || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    type: cat.type,
    color: cat.color || '#6366f1',
    icon: cat.icon || 'folder',
    parent_id: cat.parent_id,
  }));

  return new Response(JSON.stringify({ data: categories }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
