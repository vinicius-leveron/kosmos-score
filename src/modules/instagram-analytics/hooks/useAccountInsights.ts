import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';
import type { AccountDailyInsights, DateRange } from '../types';

export function useAccountInsights(accountId?: string, dateRange: DateRange = '30d') {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['instagram-account-insights', organizationId, accountId, dateRange],
    queryFn: async () => {
      const sinceDate = new Date();
      switch (dateRange) {
        case '7d': sinceDate.setDate(sinceDate.getDate() - 7); break;
        case '30d': sinceDate.setDate(sinceDate.getDate() - 30); break;
        case '90d': sinceDate.setDate(sinceDate.getDate() - 90); break;
        case '6m': sinceDate.setMonth(sinceDate.getMonth() - 6); break;
        case '1y': sinceDate.setFullYear(sinceDate.getFullYear() - 1); break;
      }

      let query = supabase
        .from('instagram_account_insights')
        .select('*')
        .eq('organization_id', organizationId!)
        .gte('date', sinceDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as AccountDailyInsights[]) || [];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}
