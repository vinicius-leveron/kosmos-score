import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KOSMOS_ORG_ID } from '@/core/auth';
import type { CashFlowPeriod, CashFlowGranularity } from '../types';

interface UseCashFlowParams {
  organizationId?: string;
  startDate: string;
  endDate: string;
  granularity?: CashFlowGranularity;
}

export function useCashFlow({
  organizationId,
  startDate,
  endDate,
  granularity = 'daily',
}: UseCashFlowParams) {
  const orgId = organizationId || KOSMOS_ORG_ID;

  return useQuery({
    queryKey: ['financial-cashflow', orgId, startDate, endDate, granularity],
    queryFn: async (): Promise<CashFlowPeriod[]> => {
      const { data, error } = await supabase.rpc('get_cashflow_projection', {
        p_organization_id: orgId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_granularity: granularity,
      });

      if (error) {
        console.error('[Financial] Error fetching cashflow:', error);
        throw error;
      }

      return (data || []).map((row: any) => ({
        period_date: row.period_date,
        receivables: Number(row.receivables || 0),
        payables: Number(row.payables || 0),
        net: Number(row.net || 0),
        cumulative_balance: Number(row.cumulative_balance || 0),
      }));
    },
    staleTime: 30 * 1000,
    enabled: !!startDate && !!endDate,
  });
}
