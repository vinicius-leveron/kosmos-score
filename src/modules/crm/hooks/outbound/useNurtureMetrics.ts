import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth/AuthContextOptimized';
import type { OutboundFilters, CadenceStatus, Classificacao, NurtureMetrics, NurtureStatusMetric } from '../../types/outbound';

// Flag para habilitar dados mockados durante desenvolvimento
const USE_MOCK_DATA = true;

// Triggers de reativação
export type ReactivationTrigger = 'event' | 'sequence_complete' | 'manual' | 'time_based';

export const REACTIVATION_TRIGGER_LABELS: Record<ReactivationTrigger, string> = {
  event: 'Evento/Webinar',
  sequence_complete: 'Sequência Completada',
  manual: 'Manual',
  time_based: 'Tempo Decorrido',
};

// Mock data para visualização de desenvolvimento
const MOCK_POOL: NurtureStatusMetric[] = [
  // Classe A em nurture
  { cadence_status: 'nurture' as CadenceStatus, classificacao: 'A', count: 89, avgDaysDormant: 45.2 },
  // Classe B em nurture
  { cadence_status: 'nurture' as CadenceStatus, classificacao: 'B', count: 234, avgDaysDormant: 62.8 },
  // Classe C em nurture
  { cadence_status: 'nurture' as CadenceStatus, classificacao: 'C', count: 456, avgDaysDormant: 78.5 },
  // Também pausados que poderiam voltar
  { cadence_status: 'paused' as CadenceStatus, classificacao: 'A', count: 12, avgDaysDormant: 15.3 },
  { cadence_status: 'paused' as CadenceStatus, classificacao: 'B', count: 34, avgDaysDormant: 22.1 },
  { cadence_status: 'paused' as CadenceStatus, classificacao: 'C', count: 67, avgDaysDormant: 28.7 },
];

const MOCK_REACTIVATIONS: { trigger: ReactivationTrigger; count: number }[] = [
  { trigger: 'event', count: 45 },
  { trigger: 'sequence_complete', count: 28 },
  { trigger: 'manual', count: 67 },
  { trigger: 'time_based', count: 32 },
];

interface UseNurtureMetricsReturn {
  pool: NurtureStatusMetric[];
  totals: {
    totalInNurture: number;
    totalPaused: number;
    reactivationRate: number;
    avgDaysDormant: number;
    avgTimeToReactivation: number;
  };
  reactivationsByTrigger: { trigger: ReactivationTrigger; count: number; label: string }[];
  poolByClassification: {
    classificacao: Classificacao;
    count: number;
    avgDaysDormant: number;
    percentage: number;
  }[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useNurtureMetrics(filters: OutboundFilters): UseNurtureMetricsReturn {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['outbound-nurture', organization?.id, filters.tenant, filters.classificacao],
    queryFn: async (): Promise<NurtureMetrics> => {
      // Retorna dados mockados para desenvolvimento
      if (USE_MOCK_DATA) {
        // Filtrar por classificação se especificado
        let filteredPool = MOCK_POOL;
        if (filters.classificacao.length > 0) {
          filteredPool = MOCK_POOL.filter(
            (s) => s.classificacao && filters.classificacao.includes(s.classificacao as Classificacao)
          );
        }

        const totalInNurture = filteredPool
          .filter((p) => p.cadence_status === 'nurture')
          .reduce((sum, p) => sum + p.count, 0);

        const totalReactivations = MOCK_REACTIVATIONS.reduce((sum, r) => sum + r.count, 0);
        const reactivationRate = totalInNurture > 0 ? (totalReactivations / (totalInNurture + totalReactivations)) * 100 : 0;

        return {
          pool: filteredPool,
          totalInNurture,
          reactivationRate,
          reactivationsByTrigger: MOCK_REACTIVATIONS,
          avgTimeToReactivation: 35.5,
        };
      }

      if (!organization?.id) {
        return {
          pool: [],
          totalInNurture: 0,
          reactivationRate: 0,
          reactivationsByTrigger: [],
          avgTimeToReactivation: 0,
        };
      }

      // Build query for nurture pool
      let poolQuery = supabase
        .from('outbound_nurture_metrics')
        .select('*')
        .eq('organization_id', organization.id);

      // Filter by tenant if not 'all'
      if (filters.tenant !== 'all') {
        poolQuery = poolQuery.eq('tenant', filters.tenant);
      }

      // Filter by classificacao if specified
      if (filters.classificacao.length > 0) {
        poolQuery = poolQuery.in('classificacao', filters.classificacao);
      }

      const poolResult = await poolQuery;

      if (poolResult.error) {
        throw poolResult.error;
      }

      const pool = (poolResult.data || []) as NurtureStatusMetric[];
      const totalInNurture = pool
        .filter((p) => p.cadence_status === 'nurture')
        .reduce((sum, p) => sum + p.count, 0);

      // Para a versão real, buscaríamos de outra view/tabela
      return {
        pool,
        totalInNurture,
        reactivationRate: 18.5, // Placeholder
        reactivationsByTrigger: [],
        avgTimeToReactivation: 0,
      };
    },
    enabled: !!organization?.id,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 1 minute
  });

  const pool = query.data?.pool || [];

  // Calcular totais
  const totalInNurture = pool
    .filter((p) => p.cadence_status === 'nurture')
    .reduce((sum, p) => sum + p.count, 0);

  const totalPaused = pool
    .filter((p) => p.cadence_status === 'paused')
    .reduce((sum, p) => sum + p.count, 0);

  // Calcular média ponderada de dias dormentes
  const avgDaysDormant = calculateWeightedAverage(
    pool.filter((p) => p.cadence_status === 'nurture'),
    (p) => p.avgDaysDormant,
    (p) => p.count
  );

  // Agregar por classificação (apenas nurture)
  const poolByClassification = aggregateByClassification(
    pool.filter((p) => p.cadence_status === 'nurture')
  );

  // Reativações com labels
  const reactivationsByTrigger = (query.data?.reactivationsByTrigger || []).map((r) => ({
    ...r,
    trigger: r.trigger as ReactivationTrigger,
    label: REACTIVATION_TRIGGER_LABELS[r.trigger as ReactivationTrigger] || r.trigger,
  }));

  return {
    pool,
    totals: {
      totalInNurture,
      totalPaused,
      reactivationRate: query.data?.reactivationRate || 0,
      avgDaysDormant,
      avgTimeToReactivation: query.data?.avgTimeToReactivation || 0,
    },
    reactivationsByTrigger,
    poolByClassification,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Helper para calcular média ponderada
function calculateWeightedAverage<T>(
  items: T[],
  getValue: (item: T) => number,
  getWeight: (item: T) => number
): number {
  if (items.length === 0) return 0;

  const totalWeight = items.reduce((sum, item) => sum + getWeight(item), 0);
  if (totalWeight === 0) return 0;

  const weightedSum = items.reduce(
    (sum, item) => sum + getValue(item) * getWeight(item),
    0
  );

  return weightedSum / totalWeight;
}

// Helper para agregar por classificação
function aggregateByClassification(
  pool: NurtureStatusMetric[]
): { classificacao: Classificacao; count: number; avgDaysDormant: number; percentage: number }[] {
  const classifications: Classificacao[] = ['A', 'B', 'C'];
  const total = pool.reduce((sum, p) => sum + p.count, 0);

  return classifications.map((classificacao) => {
    const items = pool.filter((p) => p.classificacao === classificacao);
    const count = items.reduce((sum, p) => sum + p.count, 0);
    const avgDaysDormant = calculateWeightedAverage(items, (p) => p.avgDaysDormant, (p) => p.count);

    return {
      classificacao,
      count,
      avgDaysDormant,
      percentage: total > 0 ? (count / total) * 100 : 0,
    };
  });
}
