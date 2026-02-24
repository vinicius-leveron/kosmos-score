import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth/AuthContextOptimized';
import type { OutboundFilters, CadenceStatus, Classificacao } from '../../types/outbound';

// Flag para habilitar dados mockados durante desenvolvimento
const USE_MOCK_DATA = true;

// Types que correspondem às views SQL
interface FunnelMetricRow {
  organization_id: string;
  tenant: string;
  cadence_status: CadenceStatus;
  classificacao: Classificacao | null;
  count: number;
  avg_days_in_stage: number | null;
  new_last_7_days: number;
  new_last_30_days: number;
}

interface FunnelTotalsRow {
  organization_id: string;
  tenant: string;
  total_leads: number;
  new_leads: number;
  ready: number;
  in_sequence: number;
  paused: number;
  replied: number;
  in_nurture: number;
  bounced: number;
  unsubscribed: number;
  reply_rate: number | null;
  avg_days_to_reply: number | null;
}

export interface FunnelData {
  stages: FunnelMetricRow[];
  totals: FunnelTotalsRow | null;
  isLoading: boolean;
  error: Error | null;
}

// Mock data para visualização de desenvolvimento
const MOCK_STAGES: FunnelMetricRow[] = [
  // Classe A
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'new', classificacao: 'A', count: 45, avg_days_in_stage: 2.3, new_last_7_days: 12, new_last_30_days: 45 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'ready', classificacao: 'A', count: 38, avg_days_in_stage: 1.5, new_last_7_days: 8, new_last_30_days: 38 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'in_sequence', classificacao: 'A', count: 127, avg_days_in_stage: 5.2, new_last_7_days: 15, new_last_30_days: 127 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'paused', classificacao: 'A', count: 12, avg_days_in_stage: 8.0, new_last_7_days: 2, new_last_30_days: 12 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'replied', classificacao: 'A', count: 67, avg_days_in_stage: 3.8, new_last_7_days: 18, new_last_30_days: 67 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'nurture', classificacao: 'A', count: 89, avg_days_in_stage: 12.5, new_last_7_days: 5, new_last_30_days: 89 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'bounced', classificacao: 'A', count: 8, avg_days_in_stage: null, new_last_7_days: 1, new_last_30_days: 8 },
  // Classe B
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'new', classificacao: 'B', count: 156, avg_days_in_stage: 3.1, new_last_7_days: 42, new_last_30_days: 156 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'ready', classificacao: 'B', count: 98, avg_days_in_stage: 2.0, new_last_7_days: 25, new_last_30_days: 98 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'in_sequence', classificacao: 'B', count: 345, avg_days_in_stage: 6.8, new_last_7_days: 45, new_last_30_days: 345 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'paused', classificacao: 'B', count: 34, avg_days_in_stage: 9.2, new_last_7_days: 8, new_last_30_days: 34 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'replied', classificacao: 'B', count: 112, avg_days_in_stage: 4.5, new_last_7_days: 28, new_last_30_days: 112 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'nurture', classificacao: 'B', count: 234, avg_days_in_stage: 15.0, new_last_7_days: 12, new_last_30_days: 234 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'bounced', classificacao: 'B', count: 23, avg_days_in_stage: null, new_last_7_days: 5, new_last_30_days: 23 },
  // Classe C
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'new', classificacao: 'C', count: 289, avg_days_in_stage: 4.5, new_last_7_days: 78, new_last_30_days: 289 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'ready', classificacao: 'C', count: 145, avg_days_in_stage: 2.8, new_last_7_days: 35, new_last_30_days: 145 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'in_sequence', classificacao: 'C', count: 512, avg_days_in_stage: 8.2, new_last_7_days: 65, new_last_30_days: 512 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'paused', classificacao: 'C', count: 67, avg_days_in_stage: 11.0, new_last_7_days: 15, new_last_30_days: 67 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'replied', classificacao: 'C', count: 78, avg_days_in_stage: 6.2, new_last_7_days: 15, new_last_30_days: 78 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'nurture', classificacao: 'C', count: 456, avg_days_in_stage: 18.0, new_last_7_days: 22, new_last_30_days: 456 },
  { organization_id: 'mock', tenant: 'kosmos', cadence_status: 'bounced', classificacao: 'C', count: 45, avg_days_in_stage: null, new_last_7_days: 12, new_last_30_days: 45 },
];

const MOCK_TOTALS: FunnelTotalsRow = {
  organization_id: 'mock',
  tenant: 'kosmos',
  total_leads: 2979,
  new_leads: 490,
  ready: 281,
  in_sequence: 984,
  paused: 113,
  replied: 257,
  in_nurture: 779,
  bounced: 76,
  unsubscribed: 0,
  reply_rate: 20.7,
  avg_days_to_reply: 4.8,
};

export function useFunnelMetrics(filters: OutboundFilters) {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['outbound-funnel', organization?.id, filters.tenant, filters.classificacao],
    queryFn: async (): Promise<{ stages: FunnelMetricRow[]; totals: FunnelTotalsRow | null }> => {
      // Retorna dados mockados para desenvolvimento
      if (USE_MOCK_DATA) {
        // Filtrar por classificação se especificado
        let filteredStages = MOCK_STAGES;
        if (filters.classificacao.length > 0) {
          filteredStages = MOCK_STAGES.filter(
            (s) => s.classificacao && filters.classificacao.includes(s.classificacao as Classificacao)
          );
        }
        return { stages: filteredStages, totals: MOCK_TOTALS };
      }

      if (!organization?.id) {
        return { stages: [], totals: null };
      }

      // Build query for stages
      let stagesQuery = supabase
        .from('outbound_funnel_metrics')
        .select('*')
        .eq('organization_id', organization.id);

      // Filter by tenant if not 'all'
      if (filters.tenant !== 'all') {
        stagesQuery = stagesQuery.eq('tenant', filters.tenant);
      }

      // Filter by classificacao if specified
      if (filters.classificacao.length > 0) {
        stagesQuery = stagesQuery.in('classificacao', filters.classificacao);
      }

      // Build query for totals
      let totalsQuery = supabase
        .from('outbound_funnel_totals')
        .select('*')
        .eq('organization_id', organization.id);

      if (filters.tenant !== 'all') {
        totalsQuery = totalsQuery.eq('tenant', filters.tenant);
      }

      // Execute both queries in parallel
      const [stagesResult, totalsResult] = await Promise.all([
        stagesQuery,
        totalsQuery.maybeSingle(),
      ]);

      if (stagesResult.error) {
        throw stagesResult.error;
      }

      return {
        stages: (stagesResult.data || []) as FunnelMetricRow[],
        totals: (totalsResult.data as FunnelTotalsRow) || null,
      };
    },
    enabled: !!organization?.id,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 1 minute
  });

  return {
    stages: query.data?.stages || [],
    totals: query.data?.totals,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Helper para agregar métricas por status (ignorando classificação)
export function aggregateByStatus(stages: FunnelMetricRow[]) {
  const aggregated: Record<CadenceStatus, { count: number; avgDays: number | null }> = {
    new: { count: 0, avgDays: null },
    ready: { count: 0, avgDays: null },
    in_sequence: { count: 0, avgDays: null },
    paused: { count: 0, avgDays: null },
    replied: { count: 0, avgDays: null },
    nurture: { count: 0, avgDays: null },
    unsubscribed: { count: 0, avgDays: null },
    bounced: { count: 0, avgDays: null },
  };

  const avgDaysSum: Record<CadenceStatus, { sum: number; count: number }> = {
    new: { sum: 0, count: 0 },
    ready: { sum: 0, count: 0 },
    in_sequence: { sum: 0, count: 0 },
    paused: { sum: 0, count: 0 },
    replied: { sum: 0, count: 0 },
    nurture: { sum: 0, count: 0 },
    unsubscribed: { sum: 0, count: 0 },
    bounced: { sum: 0, count: 0 },
  };

  for (const row of stages) {
    aggregated[row.cadence_status].count += row.count;
    if (row.avg_days_in_stage !== null) {
      avgDaysSum[row.cadence_status].sum += row.avg_days_in_stage * row.count;
      avgDaysSum[row.cadence_status].count += row.count;
    }
  }

  // Calculate averages
  for (const status of Object.keys(aggregated) as CadenceStatus[]) {
    if (avgDaysSum[status].count > 0) {
      aggregated[status].avgDays = avgDaysSum[status].sum / avgDaysSum[status].count;
    }
  }

  return aggregated;
}
