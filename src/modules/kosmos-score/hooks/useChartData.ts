import { useMemo } from 'react';
import type { Tables } from '@/integrations/supabase/types';

type AuditResult = Tables<'audit_results'>;

export interface LeadTypeData {
  beginners: number;
  experienced: number;
  total: number;
}

export interface PillarAverages {
  causa: number;
  cultura: number;
  economia: number;
}

export interface ScoreDistributionItem {
  range: string;
  count: number;
  percentage: number;
  min: number;
  max: number;
}

export interface TimelineDataItem {
  date: string;
  count: number;
  label: string;
}

export interface TopBaseItem {
  email: string;
  baseSize: number;
  score: number;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function groupByDate(results: AuditResult[]): TimelineDataItem[] {
  const groups: Record<string, number> = {};

  results.forEach((r) => {
    const date = new Date(r.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    groups[key] = (groups[key] || 0) + 1;
  });

  const sortedDates = Object.keys(groups).sort();

  return sortedDates.map((date) => {
    const [year, month, day] = date.split('-');
    return {
      date,
      count: groups[date],
      label: `${day}/${month}`,
    };
  });
}

export function useChartData(results: AuditResult[]) {
  const leadTypeData = useMemo<LeadTypeData>(() => {
    const beginners = results.filter((r) => r.is_beginner).length;
    const experienced = results.filter((r) => !r.is_beginner).length;
    return {
      beginners,
      experienced,
      total: results.length,
    };
  }, [results]);

  const pillarAverages = useMemo<PillarAverages>(() => {
    return {
      causa: average(results.map((r) => r.score_causa)),
      cultura: average(results.map((r) => r.score_cultura)),
      economia: average(results.map((r) => r.score_economia)),
    };
  }, [results]);

  const scoreDistribution = useMemo<ScoreDistributionItem[]>(() => {
    const total = results.length;
    const ranges = [
      { range: '0-25', min: 0, max: 25 },
      { range: '26-50', min: 26, max: 50 },
      { range: '51-75', min: 51, max: 75 },
      { range: '76-100', min: 76, max: 100 },
    ];

    return ranges.map(({ range, min, max }) => {
      const count = results.filter(
        (r) => r.kosmos_asset_score >= min && r.kosmos_asset_score <= max
      ).length;
      return {
        range,
        min,
        max,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      };
    });
  }, [results]);

  const timelineData = useMemo<TimelineDataItem[]>(() => {
    return groupByDate(results);
  }, [results]);

  const topBases = useMemo<TopBaseItem[]>(() => {
    return results
      .filter((r) => r.base_size && !r.is_beginner)
      .sort((a, b) => {
        const aSize = parseInt(String(a.base_size).replace(/\D/g, '')) || 0;
        const bSize = parseInt(String(b.base_size).replace(/\D/g, '')) || 0;
        return bSize - aSize;
      })
      .slice(0, 10)
      .map((r) => ({
        email: r.email,
        baseSize: parseInt(String(r.base_size).replace(/\D/g, '')) || 0,
        score: r.kosmos_asset_score,
      }));
  }, [results]);

  const averageScore = useMemo<number>(() => {
    return average(results.map((r) => r.kosmos_asset_score));
  }, [results]);

  const totalLucroOculto = useMemo<number>(() => {
    return results.reduce((sum, r) => sum + r.lucro_oculto, 0);
  }, [results]);

  return {
    leadTypeData,
    pillarAverages,
    scoreDistribution,
    timelineData,
    topBases,
    averageScore,
    totalLucroOculto,
  };
}
