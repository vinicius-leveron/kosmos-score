import type { MediaInsights, AdInsights, DerivedMetrics, HookQuadrant } from '../types';
import { SKIP_RATE_THRESHOLD, COMPLETION_RATE_THRESHOLD } from './constants';

export function calculateDerivedMetrics(
  insights: MediaInsights | null,
  durationSeconds: number | null,
): DerivedMetrics {
  if (!insights) {
    return {
      engagement_rate: 0,
      retention_pct: null,
      virality_rate: 0,
      repost_rate: 0,
      completion_rate: null,
    };
  }

  const reach = insights.reach || 1;

  const engagement_rate =
    ((insights.likes + insights.comments + insights.shares + insights.saves) / reach) * 100;

  const retention_pct =
    insights.avg_watch_time_ms != null && durationSeconds
      ? (insights.avg_watch_time_ms / 1000 / durationSeconds) * 100
      : null;

  const virality_rate = (insights.shares / reach) * 100;
  const repost_rate = (insights.reposts / reach) * 100;

  const completion_rate = retention_pct != null ? Math.min(retention_pct, 100) : null;

  return { engagement_rate, retention_pct, virality_rate, repost_rate, completion_rate };
}

export function classifyHookQuadrant(
  skipRate: number | null,
  completionRate: number | null,
): HookQuadrant | null {
  if (skipRate == null || completionRate == null) return null;

  const lowSkip = skipRate < SKIP_RATE_THRESHOLD;
  const highCompletion = completionRate >= COMPLETION_RATE_THRESHOLD;

  if (lowSkip && highCompletion) return 'ideal';
  if (lowSkip && !highCompletion) return 'weak_middle';
  if (!lowSkip && highCompletion) return 'weak_hook';
  return 'rethink_all';
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString('pt-BR');
}

export function formatPercentage(value: number | null): string {
  if (value == null) return '—';
  return `${value.toFixed(1)}%`;
}

export function formatCurrency(value: number | null): string {
  if (value == null) return '—';
  return `R$ ${value.toFixed(2)}`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export function formatWatchTime(ms: number | null): string {
  if (ms == null) return '—';
  return formatDuration(ms / 1000);
}

export function calculateIncrementalCost(
  adInsights: AdInsights | null,
  organicViews: number,
): number | null {
  if (!adInsights || !adInsights.spend) return null;
  const paidViews = adInsights.thru_plays || 0;
  if (paidViews === 0) return null;
  return adInsights.spend / paidViews;
}

export function getDurationBucket(seconds: number | null): string {
  if (seconds == null) return 'N/A';
  if (seconds < 15) return '< 15s';
  if (seconds < 30) return '15-30s';
  if (seconds < 60) return '30-60s';
  return '60s+';
}
