import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth/AuthContextOptimized';
import type { OutboundFilters, EngagementHeatmapCell, EngagementMetrics } from '../../types/outbound';

// Flag para habilitar dados mockados durante desenvolvimento
const USE_MOCK_DATA = true;

// Types que correspondem às views SQL
interface EngagementHeatmapRow {
  organization_id: string;
  tenant: string;
  day_of_week: number;
  hour_of_day: number;
  messages_sent: number;
  messages_replied: number;
  reply_rate: number | null;
}

interface EngagementSummaryRow {
  organization_id: string;
  tenant: string;
  best_day: number;
  best_hour: number;
  best_rate: number;
  worst_day: number;
  worst_hour: number;
  worst_rate: number;
}

export interface EngagementData {
  heatmap: EngagementHeatmapCell[];
  bestTimeSlot: { day: number; hour: number; rate: number } | null;
  worstTimeSlot: { day: number; hour: number; rate: number } | null;
  isLoading: boolean;
  error: Error | null;
}

// Generate realistic mock heatmap data
// Higher engagement during business hours (9-18) on weekdays (Mon-Fri)
// Lower engagement on weekends and early morning/late night
const generateMockHeatmapData = (): EngagementHeatmapCell[] => {
  const heatmap: EngagementHeatmapCell[] = [];

  for (let day = 0; day <= 6; day++) {
    for (let hour = 0; hour <= 23; hour++) {
      // Base probability factors
      const isWeekday = day >= 1 && day <= 5;
      const isBusinessHours = hour >= 9 && hour <= 18;
      const isPeakHours = hour >= 10 && hour <= 12 || hour >= 14 && hour <= 16;
      const isEarlyMorning = hour >= 6 && hour <= 8;
      const isEvening = hour >= 19 && hour <= 21;
      const isNight = hour >= 22 || hour <= 5;

      // Calculate base messages sent (more during business hours)
      let baseSent = 5;
      if (isWeekday) {
        if (isPeakHours) baseSent = 80 + Math.floor(Math.random() * 40);
        else if (isBusinessHours) baseSent = 50 + Math.floor(Math.random() * 30);
        else if (isEarlyMorning) baseSent = 15 + Math.floor(Math.random() * 15);
        else if (isEvening) baseSent = 20 + Math.floor(Math.random() * 15);
        else if (isNight) baseSent = Math.floor(Math.random() * 5);
      } else {
        // Weekend - lower volume
        if (isBusinessHours) baseSent = 15 + Math.floor(Math.random() * 15);
        else if (isEvening) baseSent = 10 + Math.floor(Math.random() * 10);
        else baseSent = Math.floor(Math.random() * 5);
      }

      // Calculate reply rate based on time
      // Best reply rates: weekday mornings (9-11) and early afternoon (14-16)
      let baseReplyRate = 0.05; // 5% base
      if (isWeekday) {
        if (hour >= 9 && hour <= 11) baseReplyRate = 0.35 + Math.random() * 0.15; // 35-50%
        else if (hour >= 14 && hour <= 16) baseReplyRate = 0.30 + Math.random() * 0.12; // 30-42%
        else if (isBusinessHours) baseReplyRate = 0.18 + Math.random() * 0.12; // 18-30%
        else if (isEarlyMorning) baseReplyRate = 0.12 + Math.random() * 0.08; // 12-20%
        else if (isEvening) baseReplyRate = 0.08 + Math.random() * 0.07; // 8-15%
        else baseReplyRate = 0.02 + Math.random() * 0.05; // 2-7%
      } else {
        // Weekend - lower reply rates
        if (isBusinessHours) baseReplyRate = 0.08 + Math.random() * 0.08; // 8-16%
        else if (isEvening) baseReplyRate = 0.05 + Math.random() * 0.05; // 5-10%
        else baseReplyRate = 0.01 + Math.random() * 0.03; // 1-4%
      }

      const messagesSent = baseSent;
      const messagesReplied = Math.floor(messagesSent * baseReplyRate);
      const replyRate = messagesSent > 0 ? (messagesReplied / messagesSent) * 100 : 0;

      heatmap.push({
        dayOfWeek: day,
        hourOfDay: hour,
        messagesSent,
        messagesReplied,
        replyRate: Math.round(replyRate * 10) / 10, // Round to 1 decimal
      });
    }
  }

  return heatmap;
};

const MOCK_HEATMAP = generateMockHeatmapData();

// Find best and worst time slots from heatmap
const findBestAndWorstSlots = (heatmap: EngagementHeatmapCell[]) => {
  // Filter cells with at least some messages sent to avoid 0% cells
  const validCells = heatmap.filter((cell) => cell.messagesSent >= 10);

  if (validCells.length === 0) {
    return { best: null, worst: null };
  }

  const sorted = [...validCells].sort((a, b) => b.replyRate - a.replyRate);

  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return {
    best: { day: best.dayOfWeek, hour: best.hourOfDay, rate: best.replyRate },
    worst: { day: worst.dayOfWeek, hour: worst.hourOfDay, rate: worst.replyRate },
  };
};

const MOCK_SLOTS = findBestAndWorstSlots(MOCK_HEATMAP);

export function useEngagementMetrics(filters: OutboundFilters) {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['outbound-engagement', organization?.id, filters.tenant, filters.dateRange],
    queryFn: async (): Promise<{
      heatmap: EngagementHeatmapCell[];
      bestTimeSlot: { day: number; hour: number; rate: number } | null;
      worstTimeSlot: { day: number; hour: number; rate: number } | null;
    }> => {
      // Retorna dados mockados para desenvolvimento
      if (USE_MOCK_DATA) {
        return {
          heatmap: MOCK_HEATMAP,
          bestTimeSlot: MOCK_SLOTS.best,
          worstTimeSlot: MOCK_SLOTS.worst,
        };
      }

      if (!organization?.id) {
        return { heatmap: [], bestTimeSlot: null, worstTimeSlot: null };
      }

      // Build query for heatmap data
      let heatmapQuery = supabase
        .from('outbound_engagement_heatmap')
        .select('*')
        .eq('organization_id', organization.id);

      // Filter by tenant if not 'all'
      if (filters.tenant !== 'all') {
        heatmapQuery = heatmapQuery.eq('tenant', filters.tenant);
      }

      // Build query for summary (best/worst slots)
      let summaryQuery = supabase
        .from('outbound_engagement_summary')
        .select('*')
        .eq('organization_id', organization.id);

      if (filters.tenant !== 'all') {
        summaryQuery = summaryQuery.eq('tenant', filters.tenant);
      }

      // Execute both queries in parallel
      const [heatmapResult, summaryResult] = await Promise.all([
        heatmapQuery,
        summaryQuery.maybeSingle(),
      ]);

      if (heatmapResult.error) {
        throw heatmapResult.error;
      }

      const heatmapData: EngagementHeatmapCell[] = (heatmapResult.data || []).map(
        (row: EngagementHeatmapRow) => ({
          dayOfWeek: row.day_of_week,
          hourOfDay: row.hour_of_day,
          messagesSent: row.messages_sent,
          messagesReplied: row.messages_replied,
          replyRate: row.reply_rate || 0,
        })
      );

      const summary = summaryResult.data as EngagementSummaryRow | null;

      return {
        heatmap: heatmapData,
        bestTimeSlot: summary
          ? { day: summary.best_day, hour: summary.best_hour, rate: summary.best_rate }
          : null,
        worstTimeSlot: summary
          ? { day: summary.worst_day, hour: summary.worst_hour, rate: summary.worst_rate }
          : null,
      };
    },
    enabled: !!organization?.id,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 1 minute
  });

  return {
    heatmap: query.data?.heatmap || [],
    bestTimeSlot: query.data?.bestTimeSlot || null,
    worstTimeSlot: query.data?.worstTimeSlot || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Helper: Day of week labels in Portuguese
export const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'] as const;

// Helper: Full day names in Portuguese
export const DAY_FULL_LABELS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const;

// Helper: Get color for heatmap cell based on reply rate
export function getHeatmapColor(replyRate: number): string {
  if (replyRate >= 40) return '#22C55E'; // green
  if (replyRate >= 30) return '#84CC16'; // lime
  if (replyRate >= 20) return '#F59E0B'; // amber
  if (replyRate >= 10) return '#F97316'; // orange
  return '#EF4444'; // red
}

// Helper: Get cell intensity class based on messages sent
export function getCellIntensity(messagesSent: number, maxSent: number): number {
  if (maxSent === 0) return 0;
  return Math.min(1, messagesSent / maxSent);
}
