import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RaioXResult, RaioXOutputs, RaioXScoreBreakdown } from '../lib/types';

export function useRaioXResult(resultId: string | undefined) {
  return useQuery({
    queryKey: ['raio-x-result', resultId],
    queryFn: async (): Promise<RaioXResult> => {
      const { data, error } = await supabase
        .from('lead_magnet_results')
        .select('id, respondent_name, respondent_email, inputs, outputs, score_breakdown, total_score, created_at')
        .eq('id', resultId!)
        .eq('lead_magnet_type', 'raio-x-kosmos')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Result not found');

      return {
        id: data.id,
        respondent_name: data.respondent_name || 'Anônimo',
        respondent_email: data.respondent_email || '',
        instagram: (data.inputs as Record<string, unknown>)?.contact
          ? ((data.inputs as Record<string, Record<string, string>>).contact.instagram || '')
          : '',
        score: data.score_breakdown as unknown as RaioXScoreBreakdown,
        outputs: data.outputs as unknown as RaioXOutputs,
        created_at: data.created_at,
      };
    },
    enabled: !!resultId,
    staleTime: 5 * 60 * 1000, // 5 minutes - results don't change
  });
}
