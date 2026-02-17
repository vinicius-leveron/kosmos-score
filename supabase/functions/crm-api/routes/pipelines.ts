/**
 * Pipelines API Routes
 *
 * GET /v1/pipelines - List pipelines
 * GET /v1/pipelines/:id - Get pipeline details
 * GET /v1/pipelines/:id/stages - Get pipeline stages
 */

import { getSupabaseAdmin, hasPermission } from '../auth.ts';
import { errors, errorResponse } from '../errors.ts';
import type { AuthResult } from '../types.ts';

export async function handlePipelines(
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
): Promise<Response> {
  const method = req.method;
  const pipelineId = pathParts[1];
  const subResource = pathParts[2];

  if (method !== 'GET') {
    return errorResponse(
      errors.methodNotAllowed(method, '/v1/pipelines'),
      corsHeaders
    );
  }

  if (!hasPermission(auth.permissions, 'pipelines', 'read')) {
    return errorResponse(errors.forbidden('No permission to read pipelines'), corsHeaders);
  }

  // GET /v1/pipelines - List pipelines
  if (!pipelineId) {
    return listPipelines(auth, corsHeaders);
  }

  // GET /v1/pipelines/:id/stages - Get pipeline stages
  if (pipelineId && subResource === 'stages') {
    return getPipelineStages(pipelineId, auth, corsHeaders);
  }

  // GET /v1/pipelines/:id - Get pipeline details
  if (pipelineId) {
    return getPipeline(pipelineId, auth, corsHeaders);
  }

  return errorResponse(errors.notFound('Endpoint'), corsHeaders);
}

async function listPipelines(
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('pipelines')
    .select(`
      id,
      name,
      display_name,
      description,
      icon,
      color,
      position,
      is_default,
      pipeline_type
    `)
    .eq('organization_id', auth.organizationId!)
    .eq('is_active', true)
    .order('position');

  if (error) {
    console.error('List pipelines error:', error);
    return errorResponse(errors.internalError('Failed to fetch pipelines'), corsHeaders);
  }

  return new Response(JSON.stringify({ data: data || [] }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getPipeline(
  pipelineId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('pipelines')
    .select(`
      id,
      name,
      display_name,
      description,
      icon,
      color,
      position,
      is_default,
      pipeline_type,
      settings,
      pipeline_stages (
        id,
        name,
        display_name,
        position,
        color,
        is_entry_stage,
        is_exit_stage,
        exit_type
      )
    `)
    .eq('id', pipelineId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (error || !data) {
    return errorResponse(errors.notFound('Pipeline'), corsHeaders);
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getPipelineStages(
  pipelineId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  // Verify pipeline belongs to organization
  const { data: pipeline } = await supabase
    .from('pipelines')
    .select('id')
    .eq('id', pipelineId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (!pipeline) {
    return errorResponse(errors.notFound('Pipeline'), corsHeaders);
  }

  const { data, error } = await supabase
    .from('pipeline_stages')
    .select(`
      id,
      name,
      display_name,
      position,
      color,
      is_entry_stage,
      is_exit_stage,
      exit_type
    `)
    .eq('pipeline_id', pipelineId)
    .order('position');

  if (error) {
    console.error('List pipeline stages error:', error);
    return errorResponse(errors.internalError('Failed to fetch stages'), corsHeaders);
  }

  return new Response(JSON.stringify({ data: data || [] }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
