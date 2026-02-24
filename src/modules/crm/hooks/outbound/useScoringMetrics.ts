import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth/AuthContextOptimized';
import type { OutboundFilters, Classificacao, ScoreBucketMetric, ScoringMetrics } from '../../types/outbound';

// Flag para habilitar dados mockados durante desenvolvimento
const USE_MOCK_DATA = true;

// Score buckets
export type ScoreBucket = '0-20' | '21-40' | '41-60' | '61-80' | '81-100';

export const SCORE_BUCKETS: ScoreBucket[] = ['0-20', '21-40', '41-60', '61-80', '81-100'];

// Mock data para visualizacao de desenvolvimento
const MOCK_DISTRIBUTION: ScoreBucketMetric[] = [
  // Bucket 0-20 (Classe C)
  { scoreBucket: '0-20', classificacao: 'C', total: 342, replied: 12, replyRate: 3.5 },
  // Bucket 21-40 (Classe C)
  { scoreBucket: '21-40', classificacao: 'C', total: 456, replied: 32, replyRate: 7.0 },
  // Bucket 41-60 (Classe B)
  { scoreBucket: '41-60', classificacao: 'B', total: 523, replied: 68, replyRate: 13.0 },
  // Bucket 61-80 (Classe B)
  { scoreBucket: '61-80', classificacao: 'B', total: 412, replied: 82, replyRate: 19.9 },
  // Bucket 81-100 (Classe A)
  { scoreBucket: '81-100', classificacao: 'A', total: 289, replied: 98, replyRate: 33.9 },
];

const MOCK_SCORING_METRICS: ScoringMetrics = {
  distribution: MOCK_DISTRIBUTION,
  classificationBreakdown: {
    A: 289,
    B: 935,
    C: 798,
  },
  validationMetrics: {
    avgScoreReplied: 72.4,
    avgScoreNotReplied: 38.6,
    falsePositiveRate: 12.3, // Class A que nunca respondeu
    falseNegativeRate: 5.5, // Class C que converteu
  },
};

export interface ScoringData {
  metrics: ScoringMetrics | null;
  isLoading: boolean;
  error: Error | null;
}

export function useScoringMetrics(filters: OutboundFilters) {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['outbound-scoring', organization?.id, filters.tenant, filters.classificacao],
    queryFn: async (): Promise<ScoringMetrics | null> => {
      // Retorna dados mockados para desenvolvimento
      if (USE_MOCK_DATA) {
        // Filtrar por classificacao se especificado
        let filteredDistribution = MOCK_DISTRIBUTION;
        if (filters.classificacao.length > 0) {
          filteredDistribution = MOCK_DISTRIBUTION.filter((d) =>
            filters.classificacao.includes(d.classificacao as Classificacao)
          );
        }

        // Recalcular totais baseado nos filtros
        const breakdown = { A: 0, B: 0, C: 0 };
        for (const item of filteredDistribution) {
          breakdown[item.classificacao] += item.total;
        }

        return {
          ...MOCK_SCORING_METRICS,
          distribution: filteredDistribution,
          classificationBreakdown: breakdown,
        };
      }

      if (!organization?.id) {
        return null;
      }

      // Build query for score distribution
      let distributionQuery = supabase
        .from('outbound_score_distribution')
        .select('*')
        .eq('organization_id', organization.id);

      // Filter by tenant if not 'all'
      if (filters.tenant !== 'all') {
        distributionQuery = distributionQuery.eq('tenant', filters.tenant);
      }

      // Filter by classificacao if specified
      if (filters.classificacao.length > 0) {
        distributionQuery = distributionQuery.in('classificacao', filters.classificacao);
      }

      // Build query for validation metrics
      let validationQuery = supabase
        .from('outbound_scoring_validation')
        .select('*')
        .eq('organization_id', organization.id);

      if (filters.tenant !== 'all') {
        validationQuery = validationQuery.eq('tenant', filters.tenant);
      }

      // Execute both queries in parallel
      const [distributionResult, validationResult] = await Promise.all([
        distributionQuery,
        validationQuery.maybeSingle(),
      ]);

      if (distributionResult.error) {
        throw distributionResult.error;
      }

      // Aggregate distribution data
      const distribution: ScoreBucketMetric[] = (distributionResult.data || []).map((row) => ({
        scoreBucket: row.score_bucket,
        classificacao: row.classificacao,
        total: row.total,
        replied: row.replied,
        replyRate: row.reply_rate,
      }));

      // Calculate classification breakdown
      const breakdown = { A: 0, B: 0, C: 0 };
      for (const item of distribution) {
        breakdown[item.classificacao as Classificacao] += item.total;
      }

      // Get validation metrics
      const validation = validationResult.data || {
        avg_score_replied: 0,
        avg_score_not_replied: 0,
        false_positive_rate: 0,
        false_negative_rate: 0,
      };

      return {
        distribution,
        classificationBreakdown: breakdown,
        validationMetrics: {
          avgScoreReplied: validation.avg_score_replied || 0,
          avgScoreNotReplied: validation.avg_score_not_replied || 0,
          falsePositiveRate: validation.false_positive_rate || 0,
          falseNegativeRate: validation.false_negative_rate || 0,
        },
      };
    },
    enabled: !!organization?.id,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 1 minute
  });

  return {
    metrics: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Helper para calcular percentuais por bucket
export function calculateBucketPercentages(distribution: ScoreBucketMetric[]) {
  const total = distribution.reduce((sum, item) => sum + item.total, 0);
  return distribution.map((item) => ({
    ...item,
    percentage: total > 0 ? (item.total / total) * 100 : 0,
  }));
}

// Helper para obter cor do bucket baseado na classificacao
export function getBucketColor(classificacao: Classificacao): string {
  const colors = {
    A: '#22C55E', // Green
    B: '#F59E0B', // Amber
    C: '#64748B', // Slate
  };
  return colors[classificacao];
}

// Helper para calcular insights do scoring
export function getScoringInsights(metrics: ScoringMetrics) {
  const { validationMetrics } = metrics;
  const scoreDelta = validationMetrics.avgScoreReplied - validationMetrics.avgScoreNotReplied;

  const insights = [];

  // Insight sobre diferenca de score
  if (scoreDelta >= 30) {
    insights.push({
      type: 'success' as const,
      title: 'Score Preditivo',
      description: `A diferenca de ${scoreDelta.toFixed(1)} pontos entre respondidos e nao-respondidos indica que o ICP score esta correlacionado com conversao.`,
    });
  } else if (scoreDelta >= 15) {
    insights.push({
      type: 'warning' as const,
      title: 'Score Moderado',
      description: `A diferenca de ${scoreDelta.toFixed(1)} pontos sugere correlacao moderada. Considere refinar os criterios de scoring.`,
    });
  } else {
    insights.push({
      type: 'error' as const,
      title: 'Score Baixo Preditivo',
      description: `A diferenca de apenas ${scoreDelta.toFixed(1)} pontos indica que o scoring atual nao esta prevendo conversao efetivamente.`,
    });
  }

  // Insight sobre falsos positivos
  if (validationMetrics.falsePositiveRate > 20) {
    insights.push({
      type: 'error' as const,
      title: 'Alto Taxa de Falsos Positivos',
      description: `${validationMetrics.falsePositiveRate.toFixed(1)}% dos leads Classe A nunca responderam. Revise os criterios de classificacao A.`,
    });
  } else if (validationMetrics.falsePositiveRate > 10) {
    insights.push({
      type: 'warning' as const,
      title: 'Falsos Positivos Moderados',
      description: `${validationMetrics.falsePositiveRate.toFixed(1)}% dos leads Classe A nao responderam. Monitore e ajuste se necessario.`,
    });
  }

  // Insight sobre falsos negativos
  if (validationMetrics.falseNegativeRate > 10) {
    insights.push({
      type: 'warning' as const,
      title: 'Oportunidades Perdidas',
      description: `${validationMetrics.falseNegativeRate.toFixed(1)}% dos leads Classe C converteram. Considere expandir criterios de classificacao.`,
    });
  }

  return insights;
}
