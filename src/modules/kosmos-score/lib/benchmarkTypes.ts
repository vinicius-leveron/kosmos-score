/**
 * Types for automatic benchmark calculation
 */

export interface PillarStats {
  avg: number;
  median: number;
  stddev: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

/** Market benchmarks with sufficient data (>= 5 results) */
interface MarketBenchmarksWithData {
  is_reliable: boolean;
  total_count: number;
  min_required: number;
  causa: PillarStats;
  cultura: PillarStats;
  economia: PillarStats;
  total: PillarStats;
}

/** Market benchmarks with insufficient data (< 5 results) */
interface MarketBenchmarksInsufficient {
  is_reliable: false;
  total_count: number;
  min_required: number;
  message: string;
}

export type MarketBenchmarks = MarketBenchmarksWithData | MarketBenchmarksInsufficient;

/** Type guard to check if benchmarks have full pillar data */
export function hasMarketData(data: MarketBenchmarks): data is MarketBenchmarksWithData {
  return 'causa' in data;
}

export interface IndividualPercentile {
  is_reliable: boolean;
  total_count: number;
  percentile_causa: number;
  percentile_cultura: number;
  percentile_economia: number;
  percentile_total: number;
}
