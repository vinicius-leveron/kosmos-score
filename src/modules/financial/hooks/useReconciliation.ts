import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KOSMOS_ORG_ID } from '@/core/auth';
import type { BankReconciliationImport, BankReconciliationEntry } from '../types';

interface UseReconciliationParams {
  organizationId?: string;
  accountId?: string;
}

export function useReconciliationImports({ organizationId, accountId }: UseReconciliationParams = {}) {
  const orgId = organizationId || KOSMOS_ORG_ID;

  return useQuery({
    queryKey: ['financial-reconciliation-imports', orgId, accountId],
    queryFn: async (): Promise<BankReconciliationImport[]> => {
      let query = supabase
        .from('bank_reconciliation_imports')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 1000,
  });
}

export function useReconciliationEntries(importId: string) {
  return useQuery({
    queryKey: ['financial-reconciliation-entries', importId],
    queryFn: async (): Promise<BankReconciliationEntry[]> => {
      const { data, error } = await supabase
        .from('bank_reconciliation_entries')
        .select('*')
        .eq('import_id', importId)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!importId,
    staleTime: 15 * 1000,
  });
}

export function useMatchEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      transactionId,
    }: {
      entryId: string;
      transactionId: string;
    }) => {
      const { error } = await supabase
        .from('bank_reconciliation_entries')
        .update({
          status: 'matched',
          matched_transaction_id: transactionId,
          match_confidence: 1.0,
        })
        .eq('id', entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-reconciliation-entries'] });
      queryClient.invalidateQueries({ queryKey: ['financial-reconciliation-imports'] });
    },
  });
}

export function useIgnoreEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('bank_reconciliation_entries')
        .update({ status: 'ignored' })
        .eq('id', entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-reconciliation-entries'] });
    },
  });
}
