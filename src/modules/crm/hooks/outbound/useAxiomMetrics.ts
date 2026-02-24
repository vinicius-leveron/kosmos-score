import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth/AuthContextOptimized';
import type { OutboundFilters, AxiomDayMetric, AxiomMetrics } from '../../types/outbound';

// Flag para habilitar dados mockados durante desenvolvimento
const USE_MOCK_DATA = true;

// Types que correspondem às views SQL (quando implementadas)
interface AxiomDailyRow {
  organization_id: string;
  tenant: string;
  activity_date: string;
  follows: number;
  unfollows: number;
  likes: number;
  dms_sent: number;
  dms_replied: number;
  stories_viewed: number;
  comments: number;
  accounts_warming: number;
}

interface AxiomTotalsRow {
  organization_id: string;
  tenant: string;
  total_follows: number;
  total_likes: number;
  total_dms: number;
  total_replies: number;
  dm_reply_rate: number | null;
  accounts_in_warmup: number;
  avg_warmup_days: number;
}

export interface AxiomData {
  daily: AxiomDayMetric[];
  totals: AxiomMetrics['totals'] | null;
  warmupProgress: AxiomMetrics['warmupProgress'] | null;
  isLoading: boolean;
  error: Error | null;
}

// Mock data generator para visualizacao de desenvolvimento
const generateMockDailyData = (): AxiomDayMetric[] => {
  const days: AxiomDayMetric[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Gerar numeros realistas com variacao
    // Axiom faz warmup gradual, entao contas mais antigas fazem mais acoes
    const warmupFactor = Math.min(1, (30 - i) / 14); // Warmup completo em ~14 dias
    const baseFollows = Math.floor((15 + Math.random() * 10) * warmupFactor);
    const baseLikes = Math.floor((30 + Math.random() * 20) * warmupFactor);
    const baseDMs = Math.floor((5 + Math.random() * 5) * warmupFactor);

    days.push({
      activity_date: date.toISOString().split('T')[0],
      follows: baseFollows,
      unfollows: Math.floor(baseFollows * (0.05 + Math.random() * 0.1)), // 5-15% unfollow
      likes: baseLikes,
      dmsSent: baseDMs,
      dmsReplied: Math.floor(baseDMs * (0.15 + Math.random() * 0.1)), // 15-25% reply rate
      storiesViewed: Math.floor((10 + Math.random() * 15) * warmupFactor),
      comments: Math.floor((2 + Math.random() * 3) * warmupFactor),
      accountsWarming: Math.max(0, 5 - Math.floor(i / 7)), // Diminui conforme warmup completa
    });
  }

  return days;
};

const MOCK_DAILY = generateMockDailyData();

// Calcular totais dos dados mockados
const calculateMockTotals = (
  daily: AxiomDayMetric[]
): { totals: AxiomMetrics['totals']; warmupProgress: AxiomMetrics['warmupProgress'] } => {
  const totalFollows = daily.reduce((sum, d) => sum + d.follows, 0);
  const totalLikes = daily.reduce((sum, d) => sum + d.likes, 0);
  const totalDMs = daily.reduce((sum, d) => sum + d.dmsSent, 0);
  const totalReplies = daily.reduce((sum, d) => sum + d.dmsReplied, 0);
  const accountsInWarmup = daily[daily.length - 1]?.accountsWarming || 0;

  return {
    totals: {
      totalFollows,
      totalLikes,
      totalDMs,
      totalReplies,
      dmReplyRate: totalDMs > 0 ? (totalReplies / totalDMs) * 100 : 0,
    },
    warmupProgress: {
      accountsInWarmup,
      avgWarmupDays: 8.5, // Mock average
    },
  };
};

const MOCK_CALCULATED = calculateMockTotals(MOCK_DAILY);

export function useAxiomMetrics(filters: OutboundFilters) {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['outbound-axiom', organization?.id, filters.tenant, filters.dateRange],
    queryFn: async (): Promise<{
      daily: AxiomDayMetric[];
      totals: AxiomMetrics['totals'] | null;
      warmupProgress: AxiomMetrics['warmupProgress'] | null;
    }> => {
      // Retorna dados mockados para desenvolvimento
      if (USE_MOCK_DATA) {
        return {
          daily: MOCK_DAILY,
          totals: MOCK_CALCULATED.totals,
          warmupProgress: MOCK_CALCULATED.warmupProgress,
        };
      }

      if (!organization?.id) {
        return { daily: [], totals: null, warmupProgress: null };
      }

      // Build query for daily metrics
      let dailyQuery = supabase
        .from('outbound_axiom_daily')
        .select('*')
        .eq('organization_id', organization.id)
        .order('activity_date', { ascending: true });

      // Filter by tenant if not 'all'
      if (filters.tenant !== 'all') {
        dailyQuery = dailyQuery.eq('tenant', filters.tenant);
      }

      // Build query for totals
      let totalsQuery = supabase
        .from('outbound_axiom_totals')
        .select('*')
        .eq('organization_id', organization.id);

      if (filters.tenant !== 'all') {
        totalsQuery = totalsQuery.eq('tenant', filters.tenant);
      }

      // Execute both queries in parallel
      const [dailyResult, totalsResult] = await Promise.all([
        dailyQuery,
        totalsQuery.maybeSingle(),
      ]);

      if (dailyResult.error) {
        throw dailyResult.error;
      }

      const rawDaily = (dailyResult.data || []) as AxiomDailyRow[];
      const rawTotals = totalsResult.data as AxiomTotalsRow | null;

      // Map to frontend types
      const daily: AxiomDayMetric[] = rawDaily.map((row) => ({
        activity_date: row.activity_date,
        follows: row.follows,
        unfollows: row.unfollows,
        likes: row.likes,
        dmsSent: row.dms_sent,
        dmsReplied: row.dms_replied,
        storiesViewed: row.stories_viewed,
        comments: row.comments,
        accountsWarming: row.accounts_warming,
      }));

      const totals: AxiomMetrics['totals'] | null = rawTotals
        ? {
            totalFollows: rawTotals.total_follows,
            totalLikes: rawTotals.total_likes,
            totalDMs: rawTotals.total_dms,
            totalReplies: rawTotals.total_replies,
            dmReplyRate: rawTotals.dm_reply_rate || 0,
          }
        : null;

      const warmupProgress: AxiomMetrics['warmupProgress'] | null = rawTotals
        ? {
            accountsInWarmup: rawTotals.accounts_in_warmup,
            avgWarmupDays: rawTotals.avg_warmup_days,
          }
        : null;

      return { daily, totals, warmupProgress };
    },
    enabled: !!organization?.id,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 1 minute
  });

  return {
    daily: query.data?.daily || [],
    totals: query.data?.totals,
    warmupProgress: query.data?.warmupProgress,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Helper para calcular metricas agregadas por semana
export function aggregateByWeek(daily: AxiomDayMetric[]) {
  const weeks: Record<
    string,
    {
      follows: number;
      likes: number;
      dms: number;
      replies: number;
    }
  > = {};

  for (const day of daily) {
    const date = new Date(day.activity_date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeks[weekKey]) {
      weeks[weekKey] = { follows: 0, likes: 0, dms: 0, replies: 0 };
    }

    weeks[weekKey].follows += day.follows;
    weeks[weekKey].likes += day.likes;
    weeks[weekKey].dms += day.dmsSent;
    weeks[weekKey].replies += day.dmsReplied;
  }

  return Object.entries(weeks).map(([week, data]) => ({
    week,
    ...data,
    replyRate: data.dms > 0 ? (data.replies / data.dms) * 100 : 0,
  }));
}

// Cores para operacoes Axiom
export const AXIOM_COLORS = {
  follows: '#8B5CF6', // purple
  likes: '#EC4899', // pink
  dms: '#E1306C', // instagram pink
  stories: '#F59E0B', // amber
  comments: '#3B82F6', // blue
  warmup: '#22C55E', // green
} as const;
