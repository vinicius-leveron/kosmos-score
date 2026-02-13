import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KOSMOS_ORG_ID } from '@/core/auth';

export interface DashboardMetrics {
  revenue_month: number;
  expenses_month: number;
  profit_month: number;
  receivables_pending: number;
  receivables_overdue: number;
  receivables_overdue_count: number;
  payables_pending: number;
  payables_overdue: number;
  payables_overdue_count: number;
}

interface UseFinancialDashboardParams {
  organizationId?: string;
  month?: string;
}

export function useFinancialDashboard({
  organizationId,
  month,
}: UseFinancialDashboardParams = {}) {
  const orgId = organizationId || KOSMOS_ORG_ID;

  return useQuery({
    queryKey: ['financial-dashboard', orgId, month],
    queryFn: async (): Promise<DashboardMetrics> => {
      const params: Record<string, unknown> = {
        p_organization_id: orgId,
      };
      if (month) {
        params.p_month = month;
      }

      const { data, error } = await supabase.rpc('get_financial_dashboard_metrics', params);

      if (error) {
        console.error('[Financial] Error fetching dashboard metrics:', error);
        throw error;
      }

      const row = Array.isArray(data) ? data[0] : data;

      return {
        revenue_month: Number(row?.revenue_month || 0),
        expenses_month: Number(row?.expenses_month || 0),
        profit_month: Number(row?.profit_month || 0),
        receivables_pending: Number(row?.receivables_pending || 0),
        receivables_overdue: Number(row?.receivables_overdue || 0),
        receivables_overdue_count: Number(row?.receivables_overdue_count || 0),
        payables_pending: Number(row?.payables_pending || 0),
        payables_overdue: Number(row?.payables_overdue || 0),
        payables_overdue_count: Number(row?.payables_overdue_count || 0),
      };
    },
    staleTime: 30 * 1000,
  });
}
