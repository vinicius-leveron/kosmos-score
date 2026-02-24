/**
 * Contacts API Routes
 *
 * GET /v1/contacts - List contacts
 * POST /v1/contacts - Create/upsert contact
 * GET /v1/contacts/:id - Get contact details
 * PATCH /v1/contacts/:id - Update contact
 * PATCH /v1/contacts/:id/cadence - Update cadence status
 * PATCH /v1/contacts/:id/score-icp - Update ICP score
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

  // PATCH /v1/contacts/:id/cadence - Update cadence status
  if (method === 'PATCH' && contactId && subResource === 'cadence') {
    if (!hasPermission(auth.permissions, 'contacts', 'write')) {
      return errorResponse(errors.forbidden('No permission to update contacts'), corsHeaders);
    }
    return updateCadence(req, contactId, auth, corsHeaders);
  }

  // PATCH /v1/contacts/:id/score-icp - Update ICP score
  if (method === 'PATCH' && contactId && subResource === 'score-icp') {
    if (!hasPermission(auth.permissions, 'contacts', 'write')) {
      return errorResponse(errors.forbidden('No permission to update contacts'), corsHeaders);
    }
    return updateScoreIcp(req, contactId, auth, corsHeaders);
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
  // Outbound filters
  const cadenceStatus = url.searchParams.get('cadence_status');
  const classificacao = url.searchParams.get('classificacao');
  const tenant = url.searchParams.get('tenant');
  const channelIn = url.searchParams.get('channel_in');
  const doNotContact = url.searchParams.get('do_not_contact');

  // Build query with outbound fields
  let query = supabase
    .from('contact_orgs')
    .select(`
      id,
      contact_id,
      score,
      score_icp,
      score_engagement,
      classificacao,
      cadence_status,
      cadence_step,
      channel_in,
      tenant,
      do_not_contact,
      axiom_status,
      ig_handler,
      last_contacted,
      next_action_date,
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
        instagram,
        linkedin_url,
        website,
        fontes
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
  // Outbound filters
  if (cadenceStatus) {
    query = query.eq('cadence_status', cadenceStatus);
  }
  if (classificacao) {
    query = query.eq('classificacao', classificacao);
  }
  if (tenant) {
    query = query.eq('tenant', tenant);
  }
  if (channelIn) {
    query = query.eq('channel_in', channelIn);
  }
  if (doNotContact === 'true') {
    query = query.eq('do_not_contact', true);
  } else if (doNotContact === 'false') {
    query = query.eq('do_not_contact', false);
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
    // Social handles
    instagram: contact.contacts.instagram,
    linkedin_url: contact.contacts.linkedin_url,
    website: contact.contacts.website,
    fontes: contact.contacts.fontes,
    // Outbound fields
    score_icp: contact.score_icp,
    score_engagement: contact.score_engagement,
    classificacao: contact.classificacao,
    cadence_status: contact.cadence_status,
    cadence_step: contact.cadence_step,
    channel_in: contact.channel_in,
    tenant: contact.tenant,
    do_not_contact: contact.do_not_contact,
    axiom_status: contact.axiom_status,
    ig_handler: contact.ig_handler,
    last_contacted: contact.last_contacted,
    next_action_date: contact.next_action_date,
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

    const contactUpdateData: Record<string, unknown> = {};
    if (body.full_name) contactUpdateData.full_name = body.full_name;
    if (body.phone) contactUpdateData.phone = body.phone;
    if (body.instagram !== undefined) contactUpdateData.instagram = body.instagram;
    if (body.linkedin_url !== undefined) contactUpdateData.linkedin_url = body.linkedin_url;
    if (body.website !== undefined) contactUpdateData.website = body.website;
    if (body.fontes !== undefined) contactUpdateData.fontes = body.fontes;

    if (Object.keys(contactUpdateData).length > 0) {
      await supabase
        .from('contacts')
        .update(contactUpdateData)
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
        instagram: body.instagram,
        linkedin_url: body.linkedin_url,
        website: body.website,
        fontes: body.fontes || [],
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

    // Update contact_org with outbound fields
    const contactOrgUpdateData: Record<string, unknown> = {};
    if (body.stage_id) contactOrgUpdateData.journey_stage_id = body.stage_id;
    if (body.score !== undefined) contactOrgUpdateData.score = body.score;
    if (body.notes) contactOrgUpdateData.notes = body.notes;
    if (body.custom_fields) contactOrgUpdateData.custom_fields = body.custom_fields;
    // Outbound fields
    if (body.score_icp !== undefined) contactOrgUpdateData.score_icp = body.score_icp;
    if (body.score_engagement !== undefined) contactOrgUpdateData.score_engagement = body.score_engagement;
    if (body.classificacao !== undefined) contactOrgUpdateData.classificacao = body.classificacao;
    if (body.cadence_status !== undefined) contactOrgUpdateData.cadence_status = body.cadence_status;
    if (body.cadence_step !== undefined) contactOrgUpdateData.cadence_step = body.cadence_step;
    if (body.cadence_id !== undefined) contactOrgUpdateData.cadence_id = body.cadence_id;
    if (body.channel_in !== undefined) contactOrgUpdateData.channel_in = body.channel_in;
    if (body.tenant !== undefined) contactOrgUpdateData.tenant = body.tenant;
    if (body.do_not_contact !== undefined) contactOrgUpdateData.do_not_contact = body.do_not_contact;
    if (body.axiom_status !== undefined) contactOrgUpdateData.axiom_status = body.axiom_status;
    if (body.ig_handler !== undefined) contactOrgUpdateData.ig_handler = body.ig_handler;

    if (Object.keys(contactOrgUpdateData).length > 0) {
      await supabase
        .from('contact_orgs')
        .update(contactOrgUpdateData)
        .eq('id', contactOrgId);
    }
  } else {
    // Create contact_org with outbound fields
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
        // Outbound fields
        score_icp: body.score_icp,
        score_engagement: body.score_engagement,
        classificacao: body.classificacao,
        cadence_status: body.cadence_status || 'new',
        cadence_step: body.cadence_step || 0,
        cadence_id: body.cadence_id,
        channel_in: body.channel_in,
        tenant: body.tenant || 'kosmos',
        do_not_contact: body.do_not_contact || false,
        axiom_status: body.axiom_status,
        ig_handler: body.ig_handler || 'manual',
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
      score_icp,
      score_engagement,
      classificacao,
      cadence_status,
      cadence_step,
      channel_in,
      tenant,
      do_not_contact,
      axiom_status,
      ig_handler,
      last_contacted,
      next_action_date,
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
        source_detail,
        instagram,
        linkedin_url,
        website,
        fontes
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
    // Social handles
    instagram: contact.contacts.instagram,
    linkedin_url: contact.contacts.linkedin_url,
    website: contact.contacts.website,
    fontes: contact.contacts.fontes,
    // Outbound fields
    score_icp: contact.score_icp,
    score_engagement: contact.score_engagement,
    classificacao: contact.classificacao,
    cadence_status: contact.cadence_status,
    cadence_step: contact.cadence_step,
    channel_in: contact.channel_in,
    tenant: contact.tenant,
    do_not_contact: contact.do_not_contact,
    axiom_status: contact.axiom_status,
    ig_handler: contact.ig_handler,
    last_contacted: contact.last_contacted,
    next_action_date: contact.next_action_date,
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

  // Update contact table if name/phone/social handles provided
  const contactUpdateData: Record<string, unknown> = {};
  if (body.full_name !== undefined) contactUpdateData.full_name = body.full_name;
  if (body.phone !== undefined) contactUpdateData.phone = body.phone;
  if (body.instagram !== undefined) contactUpdateData.instagram = body.instagram;
  if (body.linkedin_url !== undefined) contactUpdateData.linkedin_url = body.linkedin_url;
  if (body.website !== undefined) contactUpdateData.website = body.website;
  if (body.fontes !== undefined) contactUpdateData.fontes = body.fontes;

  if (Object.keys(contactUpdateData).length > 0) {
    await supabase
      .from('contacts')
      .update(contactUpdateData)
      .eq('id', contactOrg.contact_id);
  }

  // Update contact_org with outbound fields
  const updateData: Record<string, unknown> = {};
  if (body.stage_id !== undefined) updateData.journey_stage_id = body.stage_id;
  if (body.score !== undefined) updateData.score = body.score;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.custom_fields !== undefined) updateData.custom_fields = body.custom_fields;
  // Outbound fields
  if (body.score_icp !== undefined) updateData.score_icp = body.score_icp;
  if (body.score_engagement !== undefined) updateData.score_engagement = body.score_engagement;
  if (body.classificacao !== undefined) updateData.classificacao = body.classificacao;
  if (body.cadence_status !== undefined) updateData.cadence_status = body.cadence_status;
  if (body.cadence_step !== undefined) updateData.cadence_step = body.cadence_step;
  if (body.cadence_id !== undefined) updateData.cadence_id = body.cadence_id;
  if (body.channel_in !== undefined) updateData.channel_in = body.channel_in;
  if (body.tenant !== undefined) updateData.tenant = body.tenant;
  if (body.do_not_contact !== undefined) updateData.do_not_contact = body.do_not_contact;
  if (body.axiom_status !== undefined) updateData.axiom_status = body.axiom_status;
  if (body.ig_handler !== undefined) updateData.ig_handler = body.ig_handler;

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

// Update cadence status
async function updateCadence(
  req: Request,
  contactOrgId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: {
    cadence_status?: string;
    cadence_step?: number;
    cadence_id?: string | null;
    next_action_date?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  // Verify contact belongs to organization
  const { data: contactOrg, error: verifyError } = await supabase
    .from('contact_orgs')
    .select('id, contact_id, cadence_status, cadence_step')
    .eq('id', contactOrgId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (verifyError || !contactOrg) {
    return errorResponse(errors.notFound('Contact'), corsHeaders);
  }

  const updateData: Record<string, unknown> = {};
  if (body.cadence_status !== undefined) updateData.cadence_status = body.cadence_status;
  if (body.cadence_step !== undefined) updateData.cadence_step = body.cadence_step;
  if (body.cadence_id !== undefined) updateData.cadence_id = body.cadence_id;
  if (body.next_action_date !== undefined) updateData.next_action_date = body.next_action_date;

  if (Object.keys(updateData).length === 0) {
    return errorResponse(errors.badRequest('No fields to update'), corsHeaders);
  }

  const { error: updateError } = await supabase
    .from('contact_orgs')
    .update(updateData)
    .eq('id', contactOrgId);

  if (updateError) {
    console.error('Update cadence error:', updateError);
    return errorResponse(errors.internalError('Failed to update cadence'), corsHeaders);
  }

  // Log activity for cadence change
  if (body.cadence_status && body.cadence_status !== contactOrg.cadence_status) {
    await supabase
      .from('activities')
      .insert({
        contact_org_id: contactOrgId,
        type: 'stage_changed',
        title: `Cadence status changed to ${body.cadence_status}`,
        metadata: {
          source: 'api',
          old_status: contactOrg.cadence_status,
          new_status: body.cadence_status,
        },
        actor_name: 'API Integration',
      });
  }

  return new Response(JSON.stringify({
    data: {
      id: contactOrg.contact_id,
      contact_org_id: contactOrgId,
      cadence_status: body.cadence_status || contactOrg.cadence_status,
      cadence_step: body.cadence_step ?? contactOrg.cadence_step,
      updated: true,
    },
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Update ICP score
async function updateScoreIcp(
  req: Request,
  contactOrgId: string,
  auth: AuthResult,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const supabase = getSupabaseAdmin();

  let body: {
    score_icp?: number;
    score_engagement?: number;
    classificacao?: 'A' | 'B' | 'C';
  };
  try {
    body = await req.json();
  } catch {
    return errorResponse(errors.badRequest('Invalid JSON body'), corsHeaders);
  }

  // Verify contact belongs to organization
  const { data: contactOrg, error: verifyError } = await supabase
    .from('contact_orgs')
    .select('id, contact_id, score_icp, classificacao')
    .eq('id', contactOrgId)
    .eq('organization_id', auth.organizationId!)
    .single();

  if (verifyError || !contactOrg) {
    return errorResponse(errors.notFound('Contact'), corsHeaders);
  }

  const updateData: Record<string, unknown> = {};
  if (body.score_icp !== undefined) updateData.score_icp = body.score_icp;
  if (body.score_engagement !== undefined) updateData.score_engagement = body.score_engagement;
  if (body.classificacao !== undefined) updateData.classificacao = body.classificacao;

  if (Object.keys(updateData).length === 0) {
    return errorResponse(errors.badRequest('No fields to update'), corsHeaders);
  }

  // Validate score ranges
  if (body.score_icp !== undefined && (body.score_icp < 0 || body.score_icp > 100)) {
    return errorResponse(errors.badRequest('score_icp must be between 0 and 100'), corsHeaders);
  }
  if (body.score_engagement !== undefined && (body.score_engagement < 0 || body.score_engagement > 100)) {
    return errorResponse(errors.badRequest('score_engagement must be between 0 and 100'), corsHeaders);
  }

  const { error: updateError } = await supabase
    .from('contact_orgs')
    .update(updateData)
    .eq('id', contactOrgId);

  if (updateError) {
    console.error('Update score ICP error:', updateError);
    return errorResponse(errors.internalError('Failed to update score'), corsHeaders);
  }

  // Log activity for score change
  if (body.score_icp !== undefined && body.score_icp !== contactOrg.score_icp) {
    await supabase
      .from('activities')
      .insert({
        contact_org_id: contactOrgId,
        type: 'score_changed',
        title: `ICP score updated to ${body.score_icp}`,
        metadata: {
          source: 'api',
          old_score: contactOrg.score_icp,
          new_score: body.score_icp,
          classificacao: body.classificacao,
        },
        actor_name: 'API Integration',
      });
  }

  return new Response(JSON.stringify({
    data: {
      id: contactOrg.contact_id,
      contact_org_id: contactOrgId,
      score_icp: body.score_icp ?? contactOrg.score_icp,
      classificacao: body.classificacao || contactOrg.classificacao,
      updated: true,
    },
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
