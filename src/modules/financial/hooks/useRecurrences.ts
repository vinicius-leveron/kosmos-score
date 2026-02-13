import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KOSMOS_ORG_ID } from '@/core/auth';
import type { FinancialRecurrence, RecurrenceFormData } from '../types';

interface UseRecurrencesParams {
  organizationId?: string;
}

export function useRecurrences({ organizationId }: UseRecurrencesParams = {}) {
  const orgId = organizationId || KOSMOS_ORG_ID;

  return useQuery({
    queryKey: ['financial-recurrences', orgId],
    queryFn: async (): Promise<FinancialRecurrence[]> => {
      const { data, error } = await supabase
        .from('financial_recurrences')
        .select('*')
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('next_due_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateRecurrence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      organizationId = KOSMOS_ORG_ID,
    }: {
      data: RecurrenceFormData;
      organizationId?: string;
    }) => {
      const { data: recurrence, error } = await supabase
        .from('financial_recurrences')
        .insert({
          organization_id: organizationId,
          description: data.description,
          type: data.type,
          amount: data.amount,
          frequency: data.frequency,
          start_date: data.start_date,
          end_date: data.end_date || null,
          day_of_month: data.day_of_month || null,
          next_due_date: data.start_date,
          category_id: data.category_id || null,
          account_id: data.account_id || null,
          cost_center_id: data.cost_center_id || null,
          counterparty_name: data.counterparty_name || null,
        })
        .select()
        .single();

      if (error) throw error;
      return recurrence;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-recurrences'] });
    },
  });
}

export function useDeleteRecurrence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recurrenceId: string) => {
      const { error } = await supabase
        .from('financial_recurrences')
        .update({ is_active: false })
        .eq('id', recurrenceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-recurrences'] });
    },
  });
}
