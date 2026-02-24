import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth/AuthContextOptimized';
import type { OutboundFilters, Channel, Classificacao, ChannelDayMetric, ChannelMetrics } from '../../types/outbound';

// Flag para habilitar dados mockados durante desenvolvimento
const USE_MOCK_DATA = true;

// Gerar datas dos ultimos 14 dias
function generateLast14Days(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

// Mock data para visualizacao de desenvolvimento
const MOCK_DATES = generateLast14Days();

const MOCK_DAILY: ChannelDayMetric[] = [
  // Email - tendencia crescente
  ...MOCK_DATES.map((date, i) => ({
    channel: 'email' as Channel,
    activity_date: date,
    sent: 120 + Math.floor(Math.random() * 40) + i * 5,
    delivered: 110 + Math.floor(Math.random() * 35) + i * 4,
    engaged: 25 + Math.floor(Math.random() * 15) + i,
    classificacao: null as Classificacao | null,
  })),
  // Instagram DM - mais variavel
  ...MOCK_DATES.map((date, i) => ({
    channel: 'instagram_dm' as Channel,
    activity_date: date,
    sent: 80 + Math.floor(Math.random() * 30) + Math.floor(i * 2),
    delivered: 75 + Math.floor(Math.random() * 25) + Math.floor(i * 1.8),
    engaged: 35 + Math.floor(Math.random() * 20) + Math.floor(i * 1.2),
    classificacao: null as Classificacao | null,
  })),
  // WhatsApp - mais estavel, alta conversao
  ...MOCK_DATES.map((date, i) => ({
    channel: 'whatsapp' as Channel,
    activity_date: date,
    sent: 50 + Math.floor(Math.random() * 15) + Math.floor(i * 1.5),
    delivered: 49 + Math.floor(Math.random() * 14) + Math.floor(i * 1.4),
    engaged: 30 + Math.floor(Math.random() * 12) + Math.floor(i * 1.1),
    classificacao: null as Classificacao | null,
  })),
];

function calculateTotals(daily: ChannelDayMetric[]): ChannelMetrics['totals'] {
  const channels: Channel[] = ['email', 'instagram_dm', 'whatsapp'];
  const totals: ChannelMetrics['totals'] = {
    email: { sent: 0, delivered: 0, engaged: 0, rate: 0 },
    instagram_dm: { sent: 0, delivered: 0, engaged: 0, rate: 0 },
    whatsapp: { sent: 0, delivered: 0, engaged: 0, rate: 0 },
  };

  for (const channel of channels) {
    const channelData = daily.filter((d) => d.channel === channel);
    const sent = channelData.reduce((sum, d) => sum + d.sent, 0);
    const delivered = channelData.reduce((sum, d) => sum + d.delivered, 0);
    const engaged = channelData.reduce((sum, d) => sum + d.engaged, 0);
    const rate = delivered > 0 ? (engaged / delivered) * 100 : 0;

    totals[channel] = { sent, delivered, engaged, rate };
  }

  return totals;
}

function determineBestChannel(totals: ChannelMetrics['totals']): Channel {
  const channels: Channel[] = ['email', 'instagram_dm', 'whatsapp'];
  let bestChannel: Channel = 'email';
  let bestRate = 0;

  for (const channel of channels) {
    if (totals[channel].rate > bestRate) {
      bestRate = totals[channel].rate;
      bestChannel = channel;
    }
  }

  return bestChannel;
}

export function useChannelMetrics(filters: OutboundFilters) {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['outbound-channel', organization?.id, filters.tenant, filters.dateRange],
    queryFn: async (): Promise<ChannelMetrics> => {
      // Retorna dados mockados para desenvolvimento
      if (USE_MOCK_DATA) {
        // Filtrar por data se especificado
        let filteredDaily = MOCK_DAILY;
        if (filters.dateRange) {
          const startDate = filters.dateRange.start.toISOString().split('T')[0];
          const endDate = filters.dateRange.end.toISOString().split('T')[0];
          filteredDaily = MOCK_DAILY.filter(
            (d) => d.activity_date >= startDate && d.activity_date <= endDate
          );
        }

        const totals = calculateTotals(filteredDaily);
        const bestChannel = determineBestChannel(totals);

        return {
          daily: filteredDaily,
          totals,
          bestChannel,
        };
      }

      if (!organization?.id) {
        return {
          daily: [],
          totals: {
            email: { sent: 0, delivered: 0, engaged: 0, rate: 0 },
            instagram_dm: { sent: 0, delivered: 0, engaged: 0, rate: 0 },
            whatsapp: { sent: 0, delivered: 0, engaged: 0, rate: 0 },
          },
          bestChannel: 'email',
        };
      }

      // Build query for daily channel metrics
      let dailyQuery = supabase
        .from('outbound_channel_metrics')
        .select('*')
        .eq('organization_id', organization.id);

      // Filter by tenant if not 'all'
      if (filters.tenant !== 'all') {
        dailyQuery = dailyQuery.eq('tenant', filters.tenant);
      }

      // Filter by date range
      if (filters.dateRange) {
        dailyQuery = dailyQuery
          .gte('activity_date', filters.dateRange.start.toISOString().split('T')[0])
          .lte('activity_date', filters.dateRange.end.toISOString().split('T')[0]);
      }

      const { data, error } = await dailyQuery;

      if (error) {
        throw error;
      }

      const daily = (data || []) as ChannelDayMetric[];
      const totals = calculateTotals(daily);
      const bestChannel = determineBestChannel(totals);

      return {
        daily,
        totals,
        bestChannel,
      };
    },
    enabled: !!organization?.id,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 1 minute
  });

  return {
    daily: query.data?.daily || [],
    totals: query.data?.totals || {
      email: { sent: 0, delivered: 0, engaged: 0, rate: 0 },
      instagram_dm: { sent: 0, delivered: 0, engaged: 0, rate: 0 },
      whatsapp: { sent: 0, delivered: 0, engaged: 0, rate: 0 },
    },
    bestChannel: query.data?.bestChannel || 'email',
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Helper para agregar dados diarios por canal para grafico de linha
export function aggregateByDate(daily: ChannelDayMetric[]) {
  const dateMap = new Map<string, { email: number; instagram_dm: number; whatsapp: number }>();

  for (const item of daily) {
    const existing = dateMap.get(item.activity_date) || { email: 0, instagram_dm: 0, whatsapp: 0 };
    existing[item.channel] = item.sent;
    dateMap.set(item.activity_date, existing);
  }

  return Array.from(dateMap.entries())
    .map(([date, channels]) => ({
      date,
      email: channels.email,
      instagram_dm: channels.instagram_dm,
      whatsapp: channels.whatsapp,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
