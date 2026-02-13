/**
 * Hook to fetch market benchmark data from audit_results
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MarketBenchmarks, IndividualPercentile } from '../lib/benchmarkTypes';

export function useMarketBenchmarks() {
  return useQuery({
    queryKey: ['market-benchmarks'],
    queryFn: async (): Promise<MarketBenchmarks> => {
      const { data, error } = await supabase.rpc('get_market_benchmarks');

      if (error) throw error;
      return data as unknown as MarketBenchmarks;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useIndividualPercentile(
  scoreCausa: number,
  scoreCultura: number,
  scoreEconomia: number,
  scoreTotal: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ['individual-percentile', scoreCausa, scoreCultura, scoreEconomia, scoreTotal],
    queryFn: async (): Promise<IndividualPercentile> => {
      const { data, error } = await supabase.rpc('calculate_individual_percentile', {
        p_score_causa: scoreCausa,
        p_score_cultura: scoreCultura,
        p_score_economia: scoreEconomia,
        p_score_total: scoreTotal,
      });

      if (error) throw error;
      return data as unknown as IndividualPercentile;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
