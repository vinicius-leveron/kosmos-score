import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth/AuthContextOptimized';
import type { OutboundFilters, RevenueMetrics, RevenueSourceMetric } from '../../types/outbound';

// Flag para habilitar dados mockados durante desenvolvimento
const USE_MOCK_DATA = true;

// Mock data para receita por fonte
const MOCK_REVENUE_BY_SOURCE: RevenueSourceMetric[] = [
  { source: 'referral', dealsCount: 23, pipelineValue: 145000, revenue: 89000, avgDealSize: 5870, winRate: 61.2 },
  { source: 'form', dealsCount: 45, pipelineValue: 234000, revenue: 156000, avgDealSize: 5200, winRate: 52.3 },
  { source: 'whatsapp', dealsCount: 18, pipelineValue: 95000, revenue: 67000, avgDealSize: 5280, winRate: 48.5 },
  { source: 'dm', dealsCount: 12, pipelineValue: 62000, revenue: 38000, avgDealSize: 5170, winRate: 45.0 },
  { source: 'scraper', dealsCount: 67, pipelineValue: 312000, revenue: 189000, avgDealSize: 4660, winRate: 38.2 },
  { source: 'comment', dealsCount: 34, pipelineValue: 156000, revenue: 78000, avgDealSize: 4590, winRate: 35.8 },
  { source: 'manychat', dealsCount: 28, pipelineValue: 134000, revenue: 92000, avgDealSize: 4790, winRate: 42.1 },
  { source: 'ad', dealsCount: 56, pipelineValue: 267000, revenue: 134000, avgDealSize: 4770, winRate: 32.5 },
  { source: 'story', dealsCount: 15, pipelineValue: 78000, revenue: 45000, avgDealSize: 5200, winRate: 40.0 },
  { source: 'import', dealsCount: 21, pipelineValue: 89000, revenue: 34000, avgDealSize: 4240, winRate: 28.6 },
];

// Mock para métricas totais do CRM (para comparação)
const MOCK_TOTAL_CRM_REVENUE = 1300000;
const MOCK_TOTAL_CRM_PIPELINE = 2100000;

export interface RevenueMetricsData {
  bySource: RevenueSourceMetric[];
  totals: {
    totalPipeline: number;
    totalRevenue: number;
    avgDealSize: number;
    winRate: number;
  };
  comparison: {
    totalCrmRevenue: number;
    totalCrmPipeline: number;
    outboundPercentage: number;
  };
  topRevenueSource: string;
  bestRoiSource: string;
  isLoading: boolean;
  error: Error | null;
}

export function useRevenueMetrics(filters: OutboundFilters): RevenueMetricsData & { refetch: () => void } {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['outbound-revenue-metrics', organization?.id, filters.tenant, filters.sources],
    queryFn: async (): Promise<RevenueMetrics & { comparison: { totalCrmRevenue: number; totalCrmPipeline: number; outboundPercentage: number }; topRevenueSource: string; bestRoiSource: string }> => {
      // Retorna dados mockados para desenvolvimento
      if (USE_MOCK_DATA) {
        // Filtrar por sources se especificado
        let filteredSources = MOCK_REVENUE_BY_SOURCE;
        if (filters.sources.length > 0) {
          filteredSources = MOCK_REVENUE_BY_SOURCE.filter((s) =>
            filters.sources.includes(s.source as any)
          );
        }

        // Calcular totais do outbound
        const totalPipeline = filteredSources.reduce((sum, s) => sum + s.pipelineValue, 0);
        const totalRevenue = filteredSources.reduce((sum, s) => sum + s.revenue, 0);
        const totalDeals = filteredSources.reduce((sum, s) => sum + s.dealsCount, 0);
        const avgDealSize = totalDeals > 0 ? (totalPipeline + totalRevenue) / (2 * totalDeals) : 0;

        // Calcular win rate ponderado
        const weightedWinRate = filteredSources.reduce((sum, s) => sum + s.winRate * s.dealsCount, 0) / totalDeals || 0;

        // Encontrar top revenue source
        const topRevenueSource = [...filteredSources].sort((a, b) => b.revenue - a.revenue)[0]?.source || '';

        // Encontrar best ROI source (maior win rate)
        const bestRoiSource = [...filteredSources].sort((a, b) => b.winRate - a.winRate)[0]?.source || '';

        // Calcular percentual de outbound vs total
        const outboundPercentage = MOCK_TOTAL_CRM_REVENUE > 0
          ? Math.round((totalRevenue / MOCK_TOTAL_CRM_REVENUE) * 100)
          : 0;

        return {
          bySource: filteredSources,
          totals: {
            totalPipeline,
            totalRevenue,
            avgDealSize,
            winRate: weightedWinRate,
          },
          comparison: {
            totalCrmRevenue: MOCK_TOTAL_CRM_REVENUE,
            totalCrmPipeline: MOCK_TOTAL_CRM_PIPELINE,
            outboundPercentage,
          },
          topRevenueSource,
          bestRoiSource,
        };
      }

      if (!organization?.id) {
        return {
          bySource: [],
          totals: { totalPipeline: 0, totalRevenue: 0, avgDealSize: 0, winRate: 0 },
          comparison: { totalCrmRevenue: 0, totalCrmPipeline: 0, outboundPercentage: 0 },
          topRevenueSource: '',
          bestRoiSource: '',
        };
      }

      // Query para métricas por fonte
      let sourceQuery = supabase
        .from('outbound_revenue_by_source')
        .select('*')
        .eq('organization_id', organization.id);

      if (filters.tenant !== 'all') {
        sourceQuery = sourceQuery.eq('tenant', filters.tenant);
      }

      if (filters.sources.length > 0) {
        sourceQuery = sourceQuery.in('source', filters.sources);
      }

      const { data: sourceData, error: sourceError } = await sourceQuery;

      if (sourceError) throw sourceError;

      // Query para totais de outbound
      const { data: totalsData } = await supabase
        .from('outbound_revenue_totals')
        .select('*')
        .eq('organization_id', organization.id)
        .maybeSingle();

      // Query para totais do CRM (para comparação)
      const { data: crmMetrics } = await supabase
        .from('crm_dashboard_metrics')
        .select('revenue_month, pipeline_value')
        .eq('organization_id', organization.id)
        .maybeSingle();

      const bySource: RevenueSourceMetric[] = (sourceData || []).map((row: any) => ({
        source: row.source,
        dealsCount: row.deals_count,
        pipelineValue: row.pipeline_value,
        revenue: row.revenue,
        avgDealSize: row.avg_deal_size,
        winRate: row.win_rate || 0,
      }));

      const totalRevenue = totalsData?.total_revenue || 0;
      const totalCrmRevenue = crmMetrics?.revenue_month || 0;
      const outboundPercentage = totalCrmRevenue > 0
        ? Math.round((totalRevenue / totalCrmRevenue) * 100)
        : 0;

      const topRevenueSource = [...bySource].sort((a, b) => b.revenue - a.revenue)[0]?.source || '';
      const bestRoiSource = [...bySource].sort((a, b) => b.winRate - a.winRate)[0]?.source || '';

      return {
        bySource,
        totals: {
          totalPipeline: totalsData?.total_pipeline || 0,
          totalRevenue,
          avgDealSize: totalsData?.avg_deal_size || 0,
          winRate: totalsData?.overall_win_rate || 0,
        },
        comparison: {
          totalCrmRevenue,
          totalCrmPipeline: crmMetrics?.pipeline_value || 0,
          outboundPercentage,
        },
        topRevenueSource,
        bestRoiSource,
      };
    },
    enabled: !!organization?.id,
    staleTime: 60_000, // 1 minute
    refetchInterval: 5 * 60_000, // 5 minutes
  });

  return {
    bySource: query.data?.bySource || [],
    totals: query.data?.totals || { totalPipeline: 0, totalRevenue: 0, avgDealSize: 0, winRate: 0 },
    comparison: query.data?.comparison || { totalCrmRevenue: 0, totalCrmPipeline: 0, outboundPercentage: 0 },
    topRevenueSource: query.data?.topRevenueSource || '',
    bestRoiSource: query.data?.bestRoiSource || '',
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Helper para formatar valor em moeda
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}K`;
  }
  return `R$ ${value.toFixed(0)}`;
}

// Helper para obter cor baseada no source
export function getRevenueSourceColor(source: string): string {
  const colors: Record<string, string> = {
    scraper: '#8B5CF6', // Purple
    comment: '#E1306C', // Instagram pink
    story: '#F59E0B', // Amber
    form: '#3B82F6', // Blue
    dm: '#EC4899', // Pink
    whatsapp: '#25D366', // WhatsApp green
    ad: '#EF4444', // Red
    referral: '#22C55E', // Green
    manychat: '#0084FF', // ManyChat blue
    import: '#64748B', // Slate
  };
  return colors[source] || '#64748B';
}
