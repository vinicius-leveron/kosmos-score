import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth/AuthContextOptimized';
import type { OutboundFilters, ChannelIn, SourceMetric, SourceMetrics } from '../../types/outbound';

// Flag para habilitar dados mockados durante desenvolvimento
const USE_MOCK_DATA = true;

// Mock data para cada source/channel_in
const MOCK_SOURCE_METRICS: SourceMetric[] = [
  {
    source: 'scraper',
    totalLeads: 1245,
    avgIcpScore: 72.5,
    classACount: 187,
    classBCount: 436,
    classCCount: 622,
    repliedCount: 156,
    replyRate: 12.5,
  },
  {
    source: 'comment',
    totalLeads: 876,
    avgIcpScore: 68.3,
    classACount: 131,
    classBCount: 306,
    classCCount: 439,
    repliedCount: 140,
    replyRate: 16.0,
  },
  {
    source: 'story',
    totalLeads: 543,
    avgIcpScore: 71.2,
    classACount: 108,
    classBCount: 190,
    classCCount: 245,
    repliedCount: 103,
    replyRate: 19.0,
  },
  {
    source: 'form',
    totalLeads: 312,
    avgIcpScore: 85.4,
    classACount: 156,
    classBCount: 109,
    classCCount: 47,
    repliedCount: 94,
    replyRate: 30.1,
  },
  {
    source: 'dm',
    totalLeads: 234,
    avgIcpScore: 78.9,
    classACount: 70,
    classBCount: 94,
    classCCount: 70,
    repliedCount: 61,
    replyRate: 26.1,
  },
  {
    source: 'whatsapp',
    totalLeads: 189,
    avgIcpScore: 82.1,
    classACount: 76,
    classBCount: 68,
    classCCount: 45,
    repliedCount: 64,
    replyRate: 33.9,
  },
  {
    source: 'ad',
    totalLeads: 678,
    avgIcpScore: 65.7,
    classACount: 68,
    classBCount: 203,
    classCCount: 407,
    repliedCount: 61,
    replyRate: 9.0,
  },
  {
    source: 'referral',
    totalLeads: 156,
    avgIcpScore: 88.2,
    classACount: 94,
    classBCount: 47,
    classCCount: 15,
    repliedCount: 55,
    replyRate: 35.3,
  },
  {
    source: 'manychat',
    totalLeads: 423,
    avgIcpScore: 74.6,
    classACount: 85,
    classBCount: 169,
    classCCount: 169,
    repliedCount: 93,
    replyRate: 22.0,
  },
  {
    source: 'import',
    totalLeads: 567,
    avgIcpScore: 62.3,
    classACount: 57,
    classBCount: 170,
    classCCount: 340,
    repliedCount: 51,
    replyRate: 9.0,
  },
];

export interface SourceMetricsData {
  sources: SourceMetric[];
  topSource: string;
  bestConvertingSource: string;
  totalLeads: number;
  avgReplyRate: number;
  isLoading: boolean;
  error: Error | null;
}

export function useSourceMetrics(filters: OutboundFilters): SourceMetricsData & { refetch: () => void } {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['outbound-source-metrics', organization?.id, filters.tenant, filters.sources],
    queryFn: async (): Promise<SourceMetrics & { totalLeads: number; avgReplyRate: number }> => {
      // Retorna dados mockados para desenvolvimento
      if (USE_MOCK_DATA) {
        // Filtrar por sources se especificado
        let filteredSources = MOCK_SOURCE_METRICS;
        if (filters.sources.length > 0) {
          filteredSources = MOCK_SOURCE_METRICS.filter((s) =>
            filters.sources.includes(s.source as ChannelIn)
          );
        }

        // Calcular totais
        const totalLeads = filteredSources.reduce((sum, s) => sum + s.totalLeads, 0);
        const totalReplied = filteredSources.reduce((sum, s) => sum + s.repliedCount, 0);
        const avgReplyRate = totalLeads > 0 ? (totalReplied / totalLeads) * 100 : 0;

        // Encontrar top source (maior volume)
        const topSource = [...filteredSources].sort((a, b) => b.totalLeads - a.totalLeads)[0]?.source || '';

        // Encontrar best converting source (maior reply rate)
        const bestConvertingSource =
          [...filteredSources].sort((a, b) => b.replyRate - a.replyRate)[0]?.source || '';

        return {
          sources: filteredSources,
          topSource,
          bestConvertingSource,
          totalLeads,
          avgReplyRate,
        };
      }

      if (!organization?.id) {
        return {
          sources: [],
          topSource: '',
          bestConvertingSource: '',
          totalLeads: 0,
          avgReplyRate: 0,
        };
      }

      // Build query for source metrics
      let sourceQuery = supabase
        .from('outbound_source_metrics')
        .select('*')
        .eq('organization_id', organization.id);

      // Filter by tenant if not 'all'
      if (filters.tenant !== 'all') {
        sourceQuery = sourceQuery.eq('tenant', filters.tenant);
      }

      // Filter by sources if specified
      if (filters.sources.length > 0) {
        sourceQuery = sourceQuery.in('source', filters.sources);
      }

      const { data, error } = await sourceQuery;

      if (error) {
        throw error;
      }

      const sources = (data || []) as SourceMetric[];

      // Calcular totais
      const totalLeads = sources.reduce((sum, s) => sum + s.totalLeads, 0);
      const totalReplied = sources.reduce((sum, s) => sum + s.repliedCount, 0);
      const avgReplyRate = totalLeads > 0 ? (totalReplied / totalLeads) * 100 : 0;

      // Encontrar top source e best converting
      const topSource = [...sources].sort((a, b) => b.totalLeads - a.totalLeads)[0]?.source || '';
      const bestConvertingSource = [...sources].sort((a, b) => b.replyRate - a.replyRate)[0]?.source || '';

      return {
        sources,
        topSource,
        bestConvertingSource,
        totalLeads,
        avgReplyRate,
      };
    },
    enabled: !!organization?.id,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 1 minute
  });

  return {
    sources: query.data?.sources || [],
    topSource: query.data?.topSource || '',
    bestConvertingSource: query.data?.bestConvertingSource || '',
    totalLeads: query.data?.totalLeads || 0,
    avgReplyRate: query.data?.avgReplyRate || 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Helper para obter cor do source
export function getSourceColor(source: string): string {
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
