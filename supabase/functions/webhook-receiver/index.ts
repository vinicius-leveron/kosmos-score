/**
 * Webhook Receiver - Edge Function
 *
 * Receives data from external systems (Zapier, Typeform, etc.)
 * and creates contacts in the CRM.
 *
 * POST /webhook-receiver/:path
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as crypto from 'https://deno.land/std@0.208.0/crypto/mod.ts';

const ALLOWED_ORIGINS = ['*']; // Webhooks can come from anywhere

function getCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, x-webhook-signature',
    'Access-Control-Max-Age': '86400',
  };
}

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

interface WebhookConfig {
  id: string;
  organization_id: string;
  name: string;
  endpoint_path: string;
  secret_token: string;
  source: string;
  field_mapping: Record<string, string>;
  default_values: Record<string, unknown>;
  target_entity: string;
  target_pipeline_id: string | null;
  target_stage_id: string | null;
  default_tags: string[] | null;
  is_active: boolean;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders() });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const corsHeaders = getCorsHeaders();
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Expected format: /webhook-receiver/wh_xxxxx or /wh_xxxxx
  let webhookPath = pathParts[pathParts.length - 1];

  // Validate path format
  if (!webhookPath || !webhookPath.startsWith('wh_')) {
    return new Response(JSON.stringify({ error: 'Invalid webhook path' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = getSupabaseAdmin();

  // Get webhook configuration
  const { data: webhook, error: webhookError } = await supabase
    .from('webhooks')
    .select('*')
    .eq('endpoint_path', webhookPath)
    .eq('is_active', true)
    .single();

  if (webhookError || !webhook) {
    return new Response(JSON.stringify({ error: 'Webhook not found or inactive' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const config = webhook as WebhookConfig;

  // Parse request body
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Log the incoming webhook
  const { data: logEntry } = await supabase
    .from('webhook_logs')
    .insert({
      webhook_id: config.id,
      request_headers: Object.fromEntries(req.headers),
      request_payload: payload,
      source_ip: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for'),
      status: 'processing',
    })
    .select('id')
    .single();

  const logId = logEntry?.id;

  try {
    // Extract data using field mapping
    const mappedData = extractMappedData(payload, config.field_mapping, config.source);

    // Merge with default values
    const finalData = { ...config.default_values, ...mappedData };

    // Validate required fields
    if (!finalData.email) {
      await updateLog(supabase, logId, 'failed', 'Missing required field: email', mappedData);
      return new Response(JSON.stringify({ error: 'Missing required field: email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create/update contact
    const result = await createOrUpdateContact(supabase, config, finalData);

    // Update log with success
    await updateLog(supabase, logId, 'processed', null, mappedData, result.entity_type, result.entity_id);

    // Update webhook stats
    await supabase
      .from('webhooks')
      .update({
        last_received_at: new Date().toISOString(),
        total_received: webhook.total_received + 1,
        total_processed: webhook.total_processed + 1,
      })
      .eq('id', config.id);

    return new Response(JSON.stringify({
      success: true,
      data: {
        id: result.entity_id,
        type: result.entity_type,
        created: result.created,
      },
    }), {
      status: result.created ? 201 : 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Webhook processing error:', err);

    // Update log with error
    await updateLog(supabase, logId, 'failed', String(err));

    // Update webhook error count
    await supabase
      .from('webhooks')
      .update({
        last_received_at: new Date().toISOString(),
        total_received: webhook.total_received + 1,
        total_errors: webhook.total_errors + 1,
      })
      .eq('id', config.id);

    return new Response(JSON.stringify({ error: 'Failed to process webhook' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Extract data from payload using field mapping
function extractMappedData(
  payload: Record<string, unknown>,
  mapping: Record<string, string>,
  source: string
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Source-specific payload parsing
  let normalizedPayload = payload;

  if (source === 'typeform') {
    normalizedPayload = parseTypeformPayload(payload);
  } else if (source === 'zapier') {
    normalizedPayload = payload; // Zapier sends flat data
  } else if (source === 'hubspot') {
    normalizedPayload = parseHubspotPayload(payload);
  }

  // Apply field mapping
  for (const [targetField, sourceExpression] of Object.entries(mapping)) {
    const value = extractValue(normalizedPayload, sourceExpression);
    if (value !== undefined && value !== null && value !== '') {
      // Handle nested target fields (e.g., "custom_fields.company")
      if (targetField.includes('.')) {
        const [parent, child] = targetField.split('.');
        if (!result[parent]) result[parent] = {};
        (result[parent] as Record<string, unknown>)[child] = value;
      } else {
        result[targetField] = value;
      }
    }
  }

  return result;
}

// Extract value from payload using dot notation or template syntax
function extractValue(payload: Record<string, unknown>, expression: string): unknown {
  // Handle template syntax: {{field.path}}
  if (expression.startsWith('{{') && expression.endsWith('}}')) {
    expression = expression.slice(2, -2).trim();
  }

  // Handle dot notation: answers.email
  const parts = expression.split('.');
  let value: unknown = payload;

  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    if (typeof value !== 'object') return undefined;
    value = (value as Record<string, unknown>)[part];
  }

  return value;
}

// Parse Typeform webhook payload
function parseTypeformPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const formResponse = payload.form_response as Record<string, unknown> | undefined;

  if (!formResponse) return payload;

  const answers = formResponse.answers as Array<Record<string, unknown>> | undefined;
  if (!answers) return payload;

  for (const answer of answers) {
    const field = answer.field as Record<string, unknown>;
    const ref = field?.ref as string;
    if (!ref) continue;

    // Get the answer value based on type
    const type = answer.type as string;
    let value: unknown;

    switch (type) {
      case 'email':
        value = answer.email;
        break;
      case 'text':
      case 'short_text':
      case 'long_text':
        value = answer.text;
        break;
      case 'phone_number':
        value = answer.phone_number;
        break;
      case 'number':
        value = answer.number;
        break;
      case 'choice':
        value = (answer.choice as Record<string, unknown>)?.label;
        break;
      case 'choices':
        value = (answer.choices as Record<string, unknown>)?.labels;
        break;
      default:
        value = answer[type];
    }

    result[ref] = value;
  }

  return result;
}

// Parse HubSpot webhook payload
function parseHubspotPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const properties = payload.properties as Record<string, Record<string, unknown>> | undefined;
  if (!properties) return payload;

  const result: Record<string, unknown> = {};
  for (const [key, prop] of Object.entries(properties)) {
    result[key] = prop.value;
  }

  return result;
}

// Create or update contact in CRM
async function createOrUpdateContact(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  config: WebhookConfig,
  data: Record<string, unknown>
): Promise<{ entity_type: string; entity_id: string; created: boolean }> {
  const email = (data.email as string).toLowerCase();

  // Check if contact exists
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('email', email)
    .single();

  let contactId: string;
  let isNew = false;

  if (existingContact) {
    contactId = existingContact.id;

    // Update contact if name/phone provided
    if (data.full_name || data.phone) {
      await supabase
        .from('contacts')
        .update({
          ...(data.full_name && { full_name: data.full_name }),
          ...(data.phone && { phone: data.phone }),
        })
        .eq('id', contactId);
    }
  } else {
    // Create new contact
    const { data: newContact, error } = await supabase
      .from('contacts')
      .insert({
        email,
        full_name: data.full_name || null,
        phone: data.phone || null,
        source: 'webhook',
        source_detail: {
          webhook_id: config.id,
          webhook_name: config.name,
          source: config.source,
        },
      })
      .select('id')
      .single();

    if (error || !newContact) {
      throw new Error('Failed to create contact');
    }

    contactId = newContact.id;
    isNew = true;
  }

  // Check if contact_org exists
  const { data: existingContactOrg } = await supabase
    .from('contact_orgs')
    .select('id')
    .eq('contact_id', contactId)
    .eq('organization_id', config.organization_id)
    .single();

  let contactOrgId: string;

  if (existingContactOrg) {
    contactOrgId = existingContactOrg.id;

    // Update contact_org
    const updateData: Record<string, unknown> = {};
    if (config.target_stage_id) updateData.journey_stage_id = config.target_stage_id;
    if (data.score) updateData.score = data.score;
    if (data.notes) updateData.notes = data.notes;
    if (data.custom_fields) updateData.custom_fields = data.custom_fields;

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('contact_orgs')
        .update(updateData)
        .eq('id', contactOrgId);
    }
  } else {
    // Create contact_org
    const { data: newContactOrg, error } = await supabase
      .from('contact_orgs')
      .insert({
        contact_id: contactId,
        organization_id: config.organization_id,
        journey_stage_id: config.target_stage_id,
        score: data.score || null,
        notes: data.notes || null,
        custom_fields: data.custom_fields || null,
        status: 'active',
      })
      .select('id')
      .single();

    if (error || !newContactOrg) {
      throw new Error('Failed to create contact_org');
    }

    contactOrgId = newContactOrg.id;
    isNew = true;
  }

  // Add default tags if specified
  if (config.default_tags && config.default_tags.length > 0) {
    for (const tagName of config.default_tags) {
      // Find tag by name
      const { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('organization_id', config.organization_id)
        .eq('name', tagName)
        .single();

      if (tag) {
        await supabase
          .from('contact_tags')
          .upsert({
            contact_org_id: contactOrgId,
            tag_id: tag.id,
          }, { onConflict: 'contact_org_id,tag_id' });
      }
    }
  }

  // Add activity for the webhook
  await supabase
    .from('activities')
    .insert({
      contact_org_id: contactOrgId,
      type: 'form_submitted',
      title: `Recebido via ${config.name}`,
      description: `Dados recebidos do webhook ${config.source}`,
      metadata: {
        webhook_id: config.id,
        webhook_name: config.name,
        source: config.source,
      },
      actor_name: 'Webhook',
    });

  return {
    entity_type: 'contact',
    entity_id: contactOrgId,
    created: isNew,
  };
}

// Update webhook log
async function updateLog(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  logId: string | undefined,
  status: string,
  errorMessage?: string | null,
  mappedData?: Record<string, unknown>,
  entityType?: string,
  entityId?: string
) {
  if (!logId) return;

  await supabase
    .from('webhook_logs')
    .update({
      status,
      error_message: errorMessage,
      mapped_data: mappedData,
      processed_at: new Date().toISOString(),
      created_entity_type: entityType,
      created_entity_id: entityId,
    })
    .eq('id', logId);
}
