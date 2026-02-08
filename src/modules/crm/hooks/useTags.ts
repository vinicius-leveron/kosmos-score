import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tag } from '../types';
import { KOSMOS_ORG_ID } from '@/core/auth';

export function useTags(organizationId: string = KOSMOS_ORG_ID) {
  return useQuery({
    queryKey: ['tags', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Tag[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      color,
      description,
      organizationId = KOSMOS_ORG_ID,
    }: {
      name: string;
      color: string;
      description?: string;
      organizationId?: string;
    }) => {
      const { data, error } = await supabase
        .from('tags')
        .insert({
          organization_id: organizationId,
          name: name.trim(),
          color,
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      color,
      description,
    }: {
      id: string;
      name?: string;
      color?: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('tags')
        .update({
          ...(name !== undefined && { name: name.trim() }),
          ...(color !== undefined && { color }),
          ...(description !== undefined && { description }),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tags').delete().eq('id', id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useAddTagToContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactOrgId,
      tagId,
    }: {
      contactOrgId: string;
      tagId: string;
    }) => {
      const { error } = await supabase.from('contact_tags').insert({
        contact_org_id: contactOrgId,
        tag_id: tagId,
      });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({
        queryKey: ['contact-detail', variables.contactOrgId],
      });
      queryClient.invalidateQueries({
        queryKey: ['activities', variables.contactOrgId],
      });
    },
  });
}

export function useRemoveTagFromContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactOrgId,
      tagId,
    }: {
      contactOrgId: string;
      tagId: string;
    }) => {
      const { error } = await supabase
        .from('contact_tags')
        .delete()
        .eq('contact_org_id', contactOrgId)
        .eq('tag_id', tagId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({
        queryKey: ['contact-detail', variables.contactOrgId],
      });
      queryClient.invalidateQueries({
        queryKey: ['activities', variables.contactOrgId],
      });
    },
  });
}
