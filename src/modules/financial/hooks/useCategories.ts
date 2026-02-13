import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KOSMOS_ORG_ID } from '@/core/auth';
import type { FinancialCategory, CategoryFormData, CategoryFilters } from '../types';

interface UseCategoriesParams {
  organizationId?: string;
  filters?: CategoryFilters;
}

export function useCategories({
  organizationId,
  filters = {},
}: UseCategoriesParams = {}) {
  const orgId = organizationId || KOSMOS_ORG_ID;

  return useQuery({
    queryKey: ['financial-categories', orgId, filters],
    queryFn: async (): Promise<FinancialCategory[]> => {
      let query = supabase
        .from('financial_categories')
        .select('*')
        .eq('organization_id', orgId)
        .order('position', { ascending: true })
        .order('name', { ascending: true });

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.dre_group) {
        query = query.eq('dre_group', filters.dre_group);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[Financial] Error fetching categories:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useCategoryTree(organizationId?: string) {
  const orgId = organizationId || KOSMOS_ORG_ID;

  return useQuery({
    queryKey: ['financial-categories-tree', orgId],
    queryFn: async (): Promise<FinancialCategory[]> => {
      const { data, error } = await supabase
        .from('financial_categories')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('position', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      const categories = data || [];
      const rootCategories = categories.filter(c => !c.parent_id);

      return rootCategories.map(root => ({
        ...root,
        children: categories.filter(c => c.parent_id === root.id),
      }));
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      organizationId = KOSMOS_ORG_ID,
    }: {
      data: CategoryFormData;
      organizationId?: string;
    }) => {
      const { data: category, error } = await supabase
        .from('financial_categories')
        .insert({
          organization_id: organizationId,
          name: data.name,
          description: data.description || null,
          type: data.type,
          dre_group: data.dre_group,
          parent_id: data.parent_id || null,
          color: data.color || '#6B7280',
          icon: data.icon || 'folder',
        })
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      data,
    }: {
      categoryId: string;
      data: Partial<CategoryFormData>;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.dre_group !== undefined) updateData.dre_group = data.dre_group;
      if (data.parent_id !== undefined) updateData.parent_id = data.parent_id || null;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.icon !== undefined) updateData.icon = data.icon;

      const { data: category, error } = await supabase
        .from('financial_categories')
        .update(updateData)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('financial_categories')
        .update({ is_active: false })
        .eq('id', categoryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-categories'] });
    },
  });
}

export function useSeedCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationId: string) => {
      const { error } = await supabase.rpc('seed_financial_categories', {
        p_organization_id: organizationId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-categories'] });
    },
  });
}
