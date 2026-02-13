import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KOSMOS_ORG_ID } from '@/core/auth';
import type {
  TransactionListItem,
  TransactionFormData,
  TransactionFilters,
  FinancialTransaction,
  PaginationParams,
  PaginatedResult,
} from '../types';

const DEFAULT_PER_PAGE = 20;

interface UseTransactionsParams {
  organizationId?: string;
  filters?: TransactionFilters;
  pagination?: PaginationParams;
}

export function useTransactions({
  organizationId,
  filters = {},
  pagination = { page: 1, per_page: DEFAULT_PER_PAGE },
}: UseTransactionsParams = {}) {
  const orgId = organizationId || KOSMOS_ORG_ID;

  return useQuery({
    queryKey: ['financial-transactions', orgId, filters, pagination],
    queryFn: async (): Promise<PaginatedResult<TransactionListItem>> => {
      let query = supabase
        .from('financial_transactions')
        .select(`
          *,
          financial_categories (
            id, name, color
          ),
          financial_accounts (
            id, name
          ),
          financial_cost_centers (
            id, name
          )
        `, { count: 'exact' })
        .eq('organization_id', orgId);

      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.account_id) {
        query = query.eq('account_id', filters.account_id);
      }
      if (filters.cost_center_id) {
        query = query.eq('cost_center_id', filters.cost_center_id);
      }
      if (filters.date_from) {
        query = query.gte('due_date', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('due_date', filters.date_to);
      }
      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      query = query.order('due_date', { ascending: true });

      const from = (pagination.page - 1) * pagination.per_page;
      const to = from + pagination.per_page - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('[Financial] Error fetching transactions:', error);
        throw error;
      }

      const items: TransactionListItem[] = (data || []).map((t: any) => ({
        ...t,
        category_name: t.financial_categories?.name || null,
        category_color: t.financial_categories?.color || null,
        account_name: t.financial_accounts?.name || null,
        cost_center_name: t.financial_cost_centers?.name || null,
      }));

      return {
        data: items,
        total: count || 0,
        page: pagination.page,
        per_page: pagination.per_page,
        total_pages: Math.ceil((count || 0) / pagination.per_page),
      };
    },
    staleTime: 15 * 1000,
  });
}

export function useTransactionDetail(transactionId: string) {
  return useQuery({
    queryKey: ['financial-transaction-detail', transactionId],
    queryFn: async (): Promise<TransactionListItem> => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          *,
          financial_categories (id, name, color),
          financial_accounts (id, name),
          financial_cost_centers (id, name)
        `)
        .eq('id', transactionId)
        .single();

      if (error) throw error;

      return {
        ...data,
        category_name: (data as any).financial_categories?.name || null,
        category_color: (data as any).financial_categories?.color || null,
        account_name: (data as any).financial_accounts?.name || null,
        cost_center_name: (data as any).financial_cost_centers?.name || null,
      } as TransactionListItem;
    },
    enabled: !!transactionId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      organizationId = KOSMOS_ORG_ID,
    }: {
      data: TransactionFormData;
      organizationId?: string;
    }) => {
      const { data: transaction, error } = await supabase
        .from('financial_transactions')
        .insert({
          organization_id: organizationId,
          type: data.type,
          description: data.description,
          amount: data.amount,
          due_date: data.due_date,
          competence_date: data.competence_date,
          category_id: data.category_id || null,
          account_id: data.account_id || null,
          cost_center_id: data.cost_center_id || null,
          counterparty_name: data.counterparty_name || null,
          counterparty_document: data.counterparty_document || null,
          document_number: data.document_number || null,
          document_type: data.document_type || null,
          notes: data.notes || null,
          tags: data.tags || [],
        })
        .select()
        .single();

      if (error) throw error;
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: Partial<TransactionFormData>;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (data.description !== undefined) updateData.description = data.description;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.due_date !== undefined) updateData.due_date = data.due_date;
      if (data.competence_date !== undefined) updateData.competence_date = data.competence_date;
      if (data.category_id !== undefined) updateData.category_id = data.category_id || null;
      if (data.account_id !== undefined) updateData.account_id = data.account_id || null;
      if (data.cost_center_id !== undefined) updateData.cost_center_id = data.cost_center_id || null;
      if (data.counterparty_name !== undefined) updateData.counterparty_name = data.counterparty_name || null;
      if (data.counterparty_document !== undefined) updateData.counterparty_document = data.counterparty_document || null;
      if (data.document_number !== undefined) updateData.document_number = data.document_number || null;
      if (data.notes !== undefined) updateData.notes = data.notes || null;
      if (data.tags !== undefined) updateData.tags = data.tags || [];

      const { data: transaction, error } = await supabase
        .from('financial_transactions')
        .update(updateData)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return transaction;
    },
    onSuccess: (transaction) => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-transaction-detail', (transaction as FinancialTransaction).id] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
    },
  });
}

export function useRegisterPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      amount,
      date,
      accountId,
    }: {
      transactionId: string;
      amount: number;
      date: string;
      accountId: string;
    }) => {
      // Get current transaction
      const { data: current, error: fetchError } = await supabase
        .from('financial_transactions')
        .select('paid_amount')
        .eq('id', transactionId)
        .single();

      if (fetchError) throw fetchError;

      const newPaidAmount = (current.paid_amount || 0) + amount;

      const { data: transaction, error } = await supabase
        .from('financial_transactions')
        .update({
          paid_amount: newPaidAmount,
          paid_date: date,
          account_id: accountId,
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-transaction-detail'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
    },
  });
}

export function useCancelTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from('financial_transactions')
        .update({ status: 'canceled' })
        .eq('id', transactionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-dashboard'] });
    },
  });
}
