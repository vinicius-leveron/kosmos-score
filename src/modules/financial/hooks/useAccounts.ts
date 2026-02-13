import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KOSMOS_ORG_ID } from '@/core/auth';
import type { FinancialAccount, AccountFormData, AccountFilters } from '../types';

interface UseAccountsParams {
  organizationId?: string;
  filters?: AccountFilters;
}

export function useAccounts({
  organizationId,
  filters = {},
}: UseAccountsParams = {}) {
  const orgId = organizationId || KOSMOS_ORG_ID;

  return useQuery({
    queryKey: ['financial-accounts', orgId, filters],
    queryFn: async (): Promise<FinancialAccount[]> => {
      let query = supabase
        .from('financial_accounts')
        .select('*')
        .eq('organization_id', orgId)
        .order('name', { ascending: true });

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[Financial] Error fetching accounts:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      organizationId = KOSMOS_ORG_ID,
    }: {
      data: AccountFormData;
      organizationId?: string;
    }) => {
      const initialBalance = data.initial_balance || 0;

      const { data: account, error } = await supabase
        .from('financial_accounts')
        .insert({
          organization_id: organizationId,
          name: data.name,
          type: data.type,
          bank_name: data.bank_name || null,
          bank_branch: data.bank_branch || null,
          account_number: data.account_number || null,
          initial_balance: initialBalance,
          current_balance: initialBalance,
          currency: data.currency || 'BRL',
          color: data.color || '#3B82F6',
          description: data.description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      data,
    }: {
      accountId: string;
      data: Partial<AccountFormData>;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.bank_name !== undefined) updateData.bank_name = data.bank_name || null;
      if (data.bank_branch !== undefined) updateData.bank_branch = data.bank_branch || null;
      if (data.account_number !== undefined) updateData.account_number = data.account_number || null;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.description !== undefined) updateData.description = data.description || null;

      const { data: account, error } = await supabase
        .from('financial_accounts')
        .update(updateData)
        .eq('id', accountId)
        .select()
        .single();

      if (error) throw error;
      return account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from('financial_accounts')
        .update({ is_active: false })
        .eq('id', accountId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
    },
  });
}
