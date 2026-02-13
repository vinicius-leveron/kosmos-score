import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { KOSMOS_ORG_ID } from '@/core/auth';
import type { DreLineItem, DreReport } from '../types';
import { calculateDre } from '../lib/dre-calculator';

interface UseDreParams {
  organizationId?: string;
  startDate: string;
  endDate: string;
  useCompetence?: boolean;
}

export function useDre({
  organizationId,
  startDate,
  endDate,
  useCompetence = true,
}: UseDreParams) {
  const orgId = organizationId || KOSMOS_ORG_ID;

  return useQuery({
    queryKey: ['financial-dre', orgId, startDate, endDate, useCompetence],
    queryFn: async (): Promise<DreReport> => {
      const { data, error } = await supabase.rpc('get_dre_report', {
        p_organization_id: orgId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_use_competence: useCompetence,
      });

      if (error) {
        console.error('[Financial] Error fetching DRE:', error);
        throw error;
      }

      const items: DreLineItem[] = (data || []).map((row: any) => ({
        dre_group_name: row.dre_group_name,
        category_id: row.category_id,
        category_name: row.category_name,
        total_amount: Number(row.total_amount || 0),
      }));

      return calculateDre(items);
    },
    staleTime: 60 * 1000,
    enabled: !!startDate && !!endDate,
  });
}
