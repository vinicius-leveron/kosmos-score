/**
 * Contacts API Routes
 *
 * GET /v1/contacts - List contacts
 * POST /v1/contacts - Create/upsert contact
 * GET /v1/contacts/:id - Get contact details
 * PATCH /v1/contacts/:id - Update contact
 * POST /v1/contacts/:id/activities - Add activity
 * POST /v1/contacts/:id/tags - Add tag
 * DELETE /v1/contacts/:id/tags/:tagId - Remove tag
 */

import { getSupabaseAdmin, hasPermission } from '../auth.ts';
import { errors, errorResponse } from '../errors.ts';
import type { AuthResult, ContactInput, PaginatedResponse, ContactResponse } from '../types.ts';

export async function handleContacts(
  req: Request,
  auth: AuthResult,
  pathParts: string[],
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();
  const method = req.method;

  // pathParts: ['contacts'] or ['contacts', ':id'] or ['contacts', ':id', 'activities']
  const contactId = pathParts[1];
  const subResource = pathParts[2];

  // GET /v1/contacts - List contacts
  if (method === 'GET' && !contactId) {
    if (!hasPermission(auth.permissions, 'contacts', 'read')) {
      return errorResponse(errors.forbidden('No permission to read contacts'), corsHeaders);
    }
    return listContacts(req, auth, corsHeaders);
  }

  // POST /v1/contacts - Create contact
  if (method === 'POST' && !contactId) {
    if (!hasPermission(auth.permissions, 'contacts', 'write')) {
      return errorResponse(errors.forbidden('No permission to create contacts'), corsHeaders);
    }
    return createContact(req, auth, corsHeaders);
  }

  // GET /v1/contacts/:id - Get contact details
  if (method === 'GET' && contactId && !subResource) {
    if (!hasPermission(auth.permissions, 'contacts', 'read')) {
      return errorResponse(errors.forbidden('No permission to read contacts'), corsHeaders);
    }
    return getContact(contactId, auth, corsHeaders);
  }

  // PATCH /v1/contacts/:id - Update contact
  if (method === 'PATCH' && contactId && !subResource) {
    if (!hasPermission(auth.permissions, 'contacts', 'write')) {
      return errorResponse(errors.forbidden('No permission to update contacts'), corsHeaders);
    }
    return updateContact(req, contactId, auth, corsHeaders);
  }

  // POST /v1/contacts/:id/activities - Add activity
  if (method === 'POST' && contactId && subResource === 'activities') {
    if (!hasPermission(auth.permissions, 'activities', 'write')) {
      return errorResponse(errors.forbidden('No permission to create activities'), corsHeaders);
    }
    return addActivity(req, contactId, auth, corsHeaders);
  }

  // POST /v1/contacts/:id/tags - Add tag
  if (method === 'POST' && contactId && subResource === 'tags') {
    if (!hasPermission(auth.permissions, 'tags', 'write')) {
      return errorResponse(errors.forbidden('No permission to manage tags'), corsHeaders);
    }
    return addTag(req, contactId, auth, corsHeaders);
  }

  // DELETE /v1/contacts/:id/tags/:tagId - Remove tag
  if (method === 'DELETE' && contactId && subResource === 'tags' && pathParts[3]) {
    if (!hasPermission(auth.permissions, 'tags', 'delete')) {
      return errorResponse(errors.forbidden('No permission to remove tags'), corsHeaders);
    }
    return removeTag(contactId, pathParts[3], auth, corsHeaders);
  }

  return errorResponse(
    errors.methodNotAllowed(method, `/v1/contacts${contactId ? '/' + contactId : ''}`),
    corsHeaders
  );
}

// List contacts with pagination and filters
async function listContacts(
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
  const search = url.searchParams.get('search');
  const status = url.searchParams.get('status');
  const stageId = url.searchParams.get('stage_id');
  const tagId = url.searchParams.get('tag_id');

  // Build query
  let query = supabase
    .from('contact_orgs')
    .select(`
      id,
      contact_id,
      score,
      status,
      notes,
      custom_fields,
      created_at,
      updated_at,
      contacts!inner (
        id,
        email,
        full_name,
        phone,
        source
      ),
      journey_stages (
        id,
        name,
        display_name,
        color
      ),
      contact_tags (
        tags (
          id,
          name,
          color
        )
      )
    `, { count: 'exact' })
    .eq('organization_id', auth.organizationId!);

  // Apply filters
  if (search) {
    query = query.or(`contacts.email.ilike.%${search}%,contacts.full_name.ilike.%${search}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (stageId) {
    query = query.eq('journey_stage_id', stageId);
  }

  // Pagination
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('List contacts error:', error);
    return errorResponse(errors.internalError('Failed to fetch contacts'), corsHeaders);
  }

  // Filter by tag if specified (post-query filter due to join complexity)
  let filteredData = data || [];
  if (tagId) {
    filteredData = filteredData.filter((contact: any) =>
      contact.contact_tags?.some((ct: any) => ct.tags?.id === tagId)
    );
  }

  // Transform response
  const contacts: ContactResponse[] = filteredData.map((contact: any) => ({
    id: contact.contacts.id,
    contact_org_id: contact.id,
    email: contact.contacts.email,
    full_name: contact.contacts.full_name,
    phone: contact.contacts.phone,
    score: contact.score,
    status: contact.status,
    stage: contact.journey_stages ? {
      id: contact.journey_stages.id,
      name: contact.journey_stages.name,
      display_name: contact.journey_stages.display_name,
      color: contact.journey_stages.color,
    } : null,
    tags: (contact.contact_tags || [])
      .filter((ct: any) => ct.tags)
      .map((ct: any) => ({
        id: ct.tags.id,
        name: ct.tags.name,
        color: ct.tags.color,
      })),
    created_at: contact.created_at,
    updated_at: contact.updated_at,
  }));

  const response: PaginatedResponse<ContactResponse> = {
    data: contacts,
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

// Create or upsert contact
async function createContact(
  req: Request,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: ContactInput;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  // Validate required fields
  if (!body.email) {
    return errorResponse(errors.badRequest('email is required'), corsHeaders);
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return errorResponse(errors.badRequest('Invalid email format'), corsHeaders);
  }

  // Check if contact exists (by email)
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id')
    .eq('email', body.email.toLowerCase())
    .single();

  let contactId: string;
  let isNew = false;

  if (existingContact) {
    // Update existing contact
    contactId = existingContact.id;

    if (body.full_name || body.phone) {
      await supabase
        .from('contacts')
        .update({
          ...(body.full_name && { full_name: body.full_name }),
          ...(body.phone && { phone: body.phone }),
        })
        .eq('id', contactId);
    }
  } else {
    // Create new contact
    const { data: newContact, error: createError } = await supabase
      .from('contacts')
      .insert({
        email: body.email.toLowerCase(),
        full_name: body.full_name,
        phone: body.phone,
        source: body.source || 'api',
        source_detail: body.source_detail || { api_version: 'v1' },
      })
      .select('id')
      .single();

    if (createError || !newContact) {
      console.error('Create contact error:', createError);
      return errorResponse(errors.internalError('Failed to create contact'), corsHeaders);
    }

    contactId = newContact.id;
    isNew = true;
  }

  // Check if contact_org exists for this organization
  const { data: existingContactOrg } = await supabase
    .from('contact_orgs')
    .select('id')
    .eq('contact_id', contactId)
    .eq('organization_id', auth.organizationId!)
    .single();

  let contactOrgId: string;

  if (existingContactOrg) {
    contactOrgId = existingContactOrg.id;

    // Update contact_org
    await supabase
      .from('contact_orgs')
      .update({
        ...(body.stage_id && { journey_stage_id: body.stage_id }),
        ...(body.score !== undefined && { score: body.score }),
        ...(body.notes && { notes: body.notes }),
        ...(body.custom_fields && { custom_fields: body.custom_fields }),
      })
      .eq('id', contactOrgId);
  } else {
    // Create contact_org
    const { data: newContactOrg, error: orgError } = await supabase
      .from('contact_orgs')
      .insert({
        contact_id: contactId,
        organization_id: auth.organizationId,
        journey_stage_id: body.stage_id,
        score: body.score,
        notes: body.notes,
        custom_fields: body.custom_fields,
        status: 'active',
      })
      .select('id')
      .single();

    if (orgError || !newContactOrg) {
      console.error('Create contact_org error:', orgError);
      return errorResponse(errors.internalError('Failed to link contact to organization'), corsHeaders);
    }

    contactOrgId = newContactOrg.id;
    isNew = true;
  }

  // Add tags if specified
  if (body.tag_ids && body.tag_ids.length > 0) {
    for (const tagId of body.tag_ids) {
      await supabase
        .from('contact_tags')
        .upsert({
          contact_org_id: contactOrgId,
          tag_id: tagId,
        }, { onConflict: 'contact_org_id,tag_id' });
    }
  }

  return new Response(JSON.stringify({
    data: {
      id: contactId,
      contact_org_id: contactOrgId,
      email: body.email.toLowerCase(),
      created: isNew,
    },
  }), {
    status: isNew ? 201 : 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Get single contact
async function getContact(
  contactOrgId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('contact_orgs')
    .select(`
      id,
      contact_id,
      score,
      score_breakdown,
      status,
      notes,
      custom_fields,
      created_at,
      updated_at,
      contacts!inner (
        id,
        email,
        full_name,
        phone,
        source,
        source_detail
      ),
      journey_stages (
        id,
        name,
        display_name,
        color
      ),
      contact_tags (
        tags (
          id,
          name,
          color
        )
      )
    `)
    .eq('id', contactOrgId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (error || !data) {
    return errorResponse(errors.notFound('Contact'), corsHeaders);
  }

  const contact: any = data;
  const response: ContactResponse = {
    id: contact.contacts.id,
    contact_org_id: contact.id,
    email: contact.contacts.email,
    full_name: contact.contacts.full_name,
    phone: contact.contacts.phone,
    score: contact.score,
    status: contact.status,
    stage: contact.journey_stages ? {
      id: contact.journey_stages.id,
      name: contact.journey_stages.name,
      display_name: contact.journey_stages.display_name,
      color: contact.journey_stages.color,
    } : null,
    tags: (contact.contact_tags || [])
      .filter((ct: any) => ct.tags)
      .map((ct: any) => ({
        id: ct.tags.id,
        name: ct.tags.name,
        color: ct.tags.color,
      })),
    created_at: contact.created_at,
    updated_at: contact.updated_at,
  };

  return new Response(JSON.stringify({ data: response }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Update contact
async function updateContact(
  req: Request,
  contactOrgId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: Partial<ContactInput>;
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  // Verify contact belongs to organization
  const { data: contactOrg, error: verifyError } = await supabase
    .from('contact_orgs')
    .select('id, contact_id')
    .eq('id', contactOrgId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (verifyError || !contactOrg) {
    return errorResponse(errors.notFound('Contact'), corsHeaders);
  }

  // Update contact table if name/phone provided
  if (body.full_name || body.phone) {
    await supabase
      .from('contacts')
      .update({
        ...(body.full_name && { full_name: body.full_name }),
        ...(body.phone && { phone: body.phone }),
      })
      .eq('id', contactOrg.contact_id);
  }

  // Update contact_org
  const updateData: Record<string, unknown> = {};
  if (body.stage_id !== undefined) updateData.journey_stage_id = body.stage_id;
  if (body.score !== undefined) updateData.score = body.score;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.custom_fields !== undefined) updateData.custom_fields = body.custom_fields;

  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await supabase
      .from('contact_orgs')
      .update(updateData)
      .eq('id', contactOrgId);

    if (updateError) {
      console.error('Update contact error:', updateError);
      return errorResponse(errors.internalError('Failed to update contact'), corsHeaders);
    }
  }

  return new Response(JSON.stringify({
    data: { id: contactOrg.contact_id, contact_org_id: contactOrgId, updated: true },
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Add activity to contact
async function addActivity(
  req: Request,
  contactOrgId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: { type: string; title: string; description?: string; metadata?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  if (!body.type || !body.title) {
    return errorResponse(errors.badRequest('type and title are required'), corsHeaders);
  }

  // Verify contact belongs to organization
  const { data: contactOrg, error: verifyError } = await supabase
    .from('contact_orgs')
    .select('id')
    .eq('id', contactOrgId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (verifyError || !contactOrg) {
    return errorResponse(errors.notFound('Contact'), corsHeaders);
  }

  // Create activity
  const { data: activity, error: createError } = await supabase
    .from('activities')
    .insert({
      contact_org_id: contactOrgId,
      type: body.type,
      title: body.title,
      description: body.description,
      metadata: { ...body.metadata, source: 'api' },
      actor_name: 'API Integration',
    })
    .select('id, type, title, created_at')
    .single();

  if (createError || !activity) {
    console.error('Create activity error:', createError);
    return errorResponse(errors.internalError('Failed to create activity'), corsHeaders);
  }

  return new Response(JSON.stringify({ data: activity }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Add tag to contact
async function addTag(
  req: Request,
  contactOrgId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: { tag_id: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  if (!body.tag_id) {
    return errorResponse(errors.badRequest('tag_id is required'), corsHeaders);
  }

  // Verify contact belongs to organization
  const { data: contactOrg, error: verifyError } = await supabase
    .from('contact_orgs')
    .select('id')
    .eq('id', contactOrgId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (verifyError || !contactOrg) {
    return errorResponse(errors.notFound('Contact'), corsHeaders);
  }

  // Verify tag belongs to organization
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .select('id')
    .eq('id', body.tag_id)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (tagError || !tag) {
    return errorResponse(errors.notFound('Tag'), corsHeaders);
  }

  // Add tag
  const { error: addError } = await supabase
    .from('contact_tags')
    .upsert({
      contact_org_id: contactOrgId,
      tag_id: body.tag_id,
    }, { onConflict: 'contact_org_id,tag_id' });

  if (addError) {
    console.error('Add tag error:', addError);
    return errorResponse(errors.internalError('Failed to add tag'), corsHeaders);
  }

  return new Response(JSON.stringify({ data: { added: true } }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Remove tag from contact
async function removeTag(
  contactOrgId: string,
  tagId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  // Verify contact belongs to organization
  const { data: contactOrg, error: verifyError } = await supabase
    .from('contact_orgs')
    .select('id')
    .eq('id', contactOrgId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (verifyError || !contactOrg) {
    return errorResponse(errors.notFound('Contact'), corsHeaders);
  }

  // Remove tag
  const { error: removeError } = await supabase
    .from('contact_tags')
    .delete()
    .eq('contact_org_id', contactOrgId)
    .eq('tag_id', tagId);

  if (removeError) {
    console.error('Remove tag error:', removeError);
    return errorResponse(errors.internalError('Failed to remove tag'), corsHeaders);
  }

  return new Response(JSON.stringify({ data: { removed: true } }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
