import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  ContactListItem,
  ContactFilters,
  ContactSort,
  PaginationParams,
  PaginatedResult,
  ContactFormData,
} from '../types';

const KOSMOS_ORG_ID = 'c0000000-0000-0000-0000-000000000001';
const DEFAULT_PER_PAGE = 20;

interface UseContactsParams {
  organizationId?: string;
  filters?: ContactFilters;
  sort?: ContactSort;
  pagination?: PaginationParams;
}

export function useContacts({
  organizationId = KOSMOS_ORG_ID,
  filters = {},
  sort = { field: 'created_at', direction: 'desc' },
  pagination = { page: 1, per_page: DEFAULT_PER_PAGE },
}: UseContactsParams = {}) {
  return useQuery({
    queryKey: ['contacts', organizationId, filters, sort, pagination],
    queryFn: async (): Promise<PaginatedResult<ContactListItem>> => {
      // Build the query
      let query = supabase
        .from('contact_orgs')
        .select(
          `
          id,
          contact_id,
          score,
          status,
          created_at,
          updated_at,
          journey_stage_id,
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
          )
        `,
          { count: 'exact' }
        )
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.stage_id) {
        query = query.eq('journey_stage_id', filters.stage_id);
      }

      if (filters.score_min !== undefined) {
        query = query.gte('score', filters.score_min);
      }

      if (filters.score_max !== undefined) {
        query = query.lte('score', filters.score_max);
      }

      if (filters.search) {
        // Search by email or name in contacts table
        query = query.or(
          `contacts.email.ilike.%${filters.search}%,contacts.full_name.ilike.%${filters.search}%`
        );
      }

      if (filters.source) {
        query = query.eq('contacts.source', filters.source);
      }

      // Apply sorting
      const sortField =
        sort.field === 'email' || sort.field === 'full_name'
          ? `contacts.${sort.field}`
          : sort.field;

      query = query.order(sortField, { ascending: sort.direction === 'asc' });

      // Apply pagination
      const from = (pagination.page - 1) * pagination.per_page;
      const to = from + pagination.per_page - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to ContactListItem format
      const items: ContactListItem[] = (data || []).map((row: any) => ({
        id: row.id,
        contact_id: row.contact_id,
        email: row.contacts.email,
        full_name: row.contacts.full_name,
        phone: row.contacts.phone,
        score: row.score,
        stage_name: row.journey_stages?.display_name || null,
        stage_color: row.journey_stages?.color || null,
        status: row.status,
        tags: [], // Tags will be loaded separately or via a join
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      // If we have items, load their tags
      if (items.length > 0) {
        const contactOrgIds = items.map((i) => i.id);
        const { data: tagsData } = await supabase
          .from('contact_tags')
          .select(
            `
            contact_org_id,
            tags (
              id,
              name,
              color
            )
          `
          )
          .in('contact_org_id', contactOrgIds);

        if (tagsData) {
          const tagsByContactOrg = new Map<
            string,
            { id: string; name: string; color: string }[]
          >();
          tagsData.forEach((row: any) => {
            const existing = tagsByContactOrg.get(row.contact_org_id) || [];
            if (row.tags) {
              existing.push({
                id: row.tags.id,
                name: row.tags.name,
                color: row.tags.color,
              });
            }
            tagsByContactOrg.set(row.contact_org_id, existing);
          });

          items.forEach((item) => {
            item.tags = tagsByContactOrg.get(item.id) || [];
          });
        }
      }

      return {
        data: items,
        total: count || 0,
        page: pagination.page,
        per_page: pagination.per_page,
        total_pages: Math.ceil((count || 0) / pagination.per_page),
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      organizationId = KOSMOS_ORG_ID,
    }: {
      data: ContactFormData;
      organizationId?: string;
    }) => {
      // First, upsert the contact
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .upsert(
          {
            email: data.email.toLowerCase().trim(),
            full_name: data.full_name || null,
            phone: data.phone || null,
            source: 'manual' as const,
          },
          { onConflict: 'email' }
        )
        .select()
        .single();

      if (contactError) throw contactError;

      // Then, upsert the contact_org
      const { data: contactOrg, error: orgError } = await supabase
        .from('contact_orgs')
        .upsert(
          {
            contact_id: contact.id,
            organization_id: organizationId,
            journey_stage_id: data.journey_stage_id || null,
            notes: data.notes || null,
            status: 'active' as const,
          },
          { onConflict: 'contact_id,organization_id' }
        )
        .select()
        .single();

      if (orgError) throw orgError;

      // Add tags if provided
      if (data.tag_ids && data.tag_ids.length > 0) {
        const tagInserts = data.tag_ids.map((tagId) => ({
          contact_org_id: contactOrg.id,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from('contact_tags')
          .upsert(tagInserts, { onConflict: 'contact_org_id,tag_id' });

        if (tagError) throw tagError;
      }

      return { contact, contactOrg };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      contactOrgId,
      data,
    }: {
      contactId: string;
      contactOrgId: string;
      data: Partial<ContactFormData>;
    }) => {
      // Update contact if name/phone provided
      if (data.full_name !== undefined || data.phone !== undefined) {
        const { error: contactError } = await supabase
          .from('contacts')
          .update({
            ...(data.full_name !== undefined && { full_name: data.full_name }),
            ...(data.phone !== undefined && { phone: data.phone }),
          })
          .eq('id', contactId);

        if (contactError) throw contactError;
      }

      // Update contact_org if stage/notes provided
      if (
        data.journey_stage_id !== undefined ||
        data.notes !== undefined
      ) {
        const { error: orgError } = await supabase
          .from('contact_orgs')
          .update({
            ...(data.journey_stage_id !== undefined && {
              journey_stage_id: data.journey_stage_id,
            }),
            ...(data.notes !== undefined && { notes: data.notes }),
          })
          .eq('id', contactOrgId);

        if (orgError) throw orgError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-detail'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactOrgId: string) => {
      // Archive instead of delete (soft delete via status)
      const { error } = await supabase
        .from('contact_orgs')
        .update({ status: 'archived' })
        .eq('id', contactOrgId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });
}
