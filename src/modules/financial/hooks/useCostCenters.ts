import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KOSMOS_ORG_ID } from '@/core/auth';

export interface CostCenter {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UseCostCentersParams {
  organizationId?: string;
}

export function useCostCenters({ organizationId }: UseCostCentersParams = {}) {
  const orgId = organizationId || KOSMOS_ORG_ID;

  return useQuery({
    queryKey: ['financial-cost-centers', orgId],
    queryFn: async (): Promise<CostCenter[]> => {
      const { data, error } = await supabase
        .from('financial_cost_centers')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      organizationId = KOSMOS_ORG_ID,
    }: {
      name: string;
      description?: string;
      organizationId?: string;
    }) => {
      const { data, error } = await supabase
        .from('financial_cost_centers')
        .insert({
          organization_id: organizationId,
          name,
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-cost-centers'] });
    },
  });
}

export function useUpdateCostCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      costCenterId,
      name,
      description,
    }: {
      costCenterId: string;
      name: string;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from('financial_cost_centers')
        .update({ name, description: description || null })
        .eq('id', costCenterId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-cost-centers'] });
    },
  });
}

export function useDeleteCostCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (costCenterId: string) => {
      const { error } = await supabase
        .from('financial_cost_centers')
        .update({ is_active: false })
        .eq('id', costCenterId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-cost-centers'] });
    },
  });
}
