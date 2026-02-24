export { useOutboundFilters } from './useOutboundFilters';

// P0: Critical metric hooks
export { useFunnelMetrics, aggregateByStatus } from './useFunnelMetrics';
export { useEmailMetrics, calculateDailyRates, getHealthColor } from './useEmailMetrics';

// P0: Source attribution
export { useSourceMetrics, getSourceColor } from './useSourceMetrics';

// P1: Channel analytics
export { useChannelMetrics, aggregateByDate } from './useChannelMetrics';

// P1: Scoring health
export {
  useScoringMetrics,
  calculateBucketPercentages,
  getBucketColor,
  getScoringInsights,
  SCORE_BUCKETS,
} from './useScoringMetrics';

// P1: Engagement heatmap
export {
  useEngagementMetrics,
  getHeatmapColor,
  DAY_LABELS,
  DAY_FULL_LABELS,
  getCellIntensity,
} from './useEngagementMetrics';

// P1: Axiom operations
export { useAxiomMetrics, aggregateByWeek, AXIOM_COLORS } from './useAxiomMetrics';

// P2: Nurture & Re-entry
export { useNurtureMetrics, REACTIVATION_TRIGGER_LABELS } from './useNurtureMetrics';

// Metric hooks (to be implemented)
// export { useManyChatMetrics } from './useManyChatMetrics';
// export { useRevenueMetrics } from './useRevenueMetrics';
