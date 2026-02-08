/**
 * useForms - Hook for form CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Form, FormWithRelations, FormStatus } from '../types/form.types';
import { KOSMOS_ORG_ID } from '@/core/auth';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const formKeys = {
  all: ['forms'] as const,
  lists: () => [...formKeys.all, 'list'] as const,
  list: (orgId: string) => [...formKeys.lists(), orgId] as const,
  details: () => [...formKeys.all, 'detail'] as const,
  detail: (id: string) => [...formKeys.details(), id] as const,
  bySlug: (orgId: string, slug: string) => [...formKeys.all, 'slug', orgId, slug] as const,
};

// ============================================================================
// FETCH FORMS LIST
// ============================================================================

export function useForms(organizationId: string = KOSMOS_ORG_ID) {
  return useQuery({
    queryKey: formKeys.list(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Form[];
    },
  });
}

// ============================================================================
// FETCH SINGLE FORM WITH RELATIONS
// ============================================================================

export function useForm(formId: string) {
  return useQuery({
    queryKey: formKeys.detail(formId),
    queryFn: async () => {
      // Fetch form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;

      // Fetch related data in parallel
      const [blocksResult, fieldsResult, classificationsResult] = await Promise.all([
        supabase
          .from('form_blocks')
          .select('*')
          .eq('form_id', formId)
          .order('position'),
        supabase
          .from('form_fields')
          .select('*')
          .eq('form_id', formId)
          .order('position'),
        supabase
          .from('form_classifications')
          .select('*')
          .eq('form_id', formId)
          .order('position'),
      ]);

      if (blocksResult.error) throw blocksResult.error;
      if (fieldsResult.error) throw fieldsResult.error;
      if (classificationsResult.error) throw classificationsResult.error;

      return {
        ...form,
        blocks: blocksResult.data,
        fields: fieldsResult.data,
        classifications: classificationsResult.data,
      } as FormWithRelations;
    },
    enabled: !!formId,
  });
}

// ============================================================================
// FETCH FORM BY SLUG (for public access)
// ============================================================================

export function useFormBySlug(organizationId: string, slug: string) {
  return useQuery({
    queryKey: formKeys.bySlug(organizationId, slug),
    queryFn: async () => {
      // Fetch form by slug
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (formError) throw formError;

      // Fetch related data in parallel
      const [blocksResult, fieldsResult, classificationsResult] = await Promise.all([
        supabase
          .from('form_blocks')
          .select('*')
          .eq('form_id', form.id)
          .order('position'),
        supabase
          .from('form_fields')
          .select('*')
          .eq('form_id', form.id)
          .order('position'),
        supabase
          .from('form_classifications')
          .select('*')
          .eq('form_id', form.id)
          .order('position'),
      ]);

      if (blocksResult.error) throw blocksResult.error;
      if (fieldsResult.error) throw fieldsResult.error;
      if (classificationsResult.error) throw classificationsResult.error;

      return {
        ...form,
        blocks: blocksResult.data,
        fields: fieldsResult.data,
        classifications: classificationsResult.data,
      } as FormWithRelations;
    },
    enabled: !!organizationId && !!slug,
  });
}

// ============================================================================
// CREATE FORM
// ============================================================================

interface CreateFormInput {
  name: string;
  slug: string;
  description?: string;
  organization_id?: string;
}

export function useCreateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFormInput) => {
      const { data, error } = await supabase
        .from('forms')
        .insert({
          ...input,
          organization_id: input.organization_id || KOSMOS_ORG_ID,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Form;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: formKeys.list(data.organization_id) });
    },
  });
}

// ============================================================================
// UPDATE FORM
// ============================================================================

interface UpdateFormInput {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  status?: FormStatus;
  settings?: Form['settings'];
  theme?: Form['theme'];
  scoring_enabled?: boolean;
  scoring_config?: Form['scoring_config'];
  welcome_screen?: Form['welcome_screen'];
  thank_you_screen?: Form['thank_you_screen'];
  crm_config?: Form['crm_config'];
}

export function useUpdateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateFormInput) => {
      const { data, error } = await supabase
        .from('forms')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Form;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: formKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: formKeys.list(data.organization_id) });
    },
  });
}

// ============================================================================
// PUBLISH FORM
// ============================================================================

export function usePublishForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formId: string) => {
      const { data, error } = await supabase
        .from('forms')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', formId)
        .select()
        .single();

      if (error) throw error;
      return data as Form;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: formKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: formKeys.list(data.organization_id) });
    },
  });
}

// ============================================================================
// DELETE FORM
// ============================================================================

export function useDeleteForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const { error } = await supabase.from('forms').delete().eq('id', id);

      if (error) throw error;
      return { id, organizationId };
    },
    onSuccess: ({ organizationId }) => {
      queryClient.invalidateQueries({ queryKey: formKeys.list(organizationId) });
    },
  });
}
