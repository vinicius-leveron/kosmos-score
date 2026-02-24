import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth/AuthContextOptimized';
import type { OutboundFilters } from '../../types/outbound';

// Flag para habilitar dados mockados durante desenvolvimento
const USE_MOCK_DATA = true;

// Types que correspondem às views SQL
interface EmailDailyRow {
  organization_id: string;
  tenant: string;
  activity_date: string;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
}

interface EmailHealthRow {
  organization_id: string;
  tenant: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  bounce_rate: number | null;
  open_rate: number | null;
  click_rate: number | null;
  health_status: 'healthy' | 'warning' | 'critical';
}

export interface EmailData {
  daily: EmailDailyRow[];
  health: EmailHealthRow | null;
  isLoading: boolean;
  error: Error | null;
}

// Mock data para visualização de desenvolvimento
const generateMockDailyData = (): EmailDailyRow[] => {
  const days: EmailDailyRow[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Gerar números realistas com alguma variação
    const baseSent = 150 + Math.floor(Math.random() * 100);
    const openRate = 0.35 + Math.random() * 0.15; // 35-50% open rate
    const clickRate = 0.08 + Math.random() * 0.07; // 8-15% click rate
    const bounceRate = 0.01 + Math.random() * 0.02; // 1-3% bounce rate

    days.push({
      organization_id: 'mock',
      tenant: 'kosmos',
      activity_date: date.toISOString().split('T')[0],
      sent: baseSent,
      opened: Math.floor(baseSent * openRate),
      clicked: Math.floor(baseSent * clickRate),
      bounced: Math.floor(baseSent * bounceRate),
    });
  }

  return days;
};

const MOCK_DAILY = generateMockDailyData();

const MOCK_HEALTH: EmailHealthRow = {
  organization_id: 'mock',
  tenant: 'kosmos',
  total_sent: MOCK_DAILY.reduce((sum, d) => sum + d.sent, 0),
  total_opened: MOCK_DAILY.reduce((sum, d) => sum + d.opened, 0),
  total_clicked: MOCK_DAILY.reduce((sum, d) => sum + d.clicked, 0),
  total_bounced: MOCK_DAILY.reduce((sum, d) => sum + d.bounced, 0),
  bounce_rate: 1.8, // Healthy status
  open_rate: 42.5,
  click_rate: 11.2,
  health_status: 'healthy',
};

export function useEmailMetrics(filters: OutboundFilters) {
  const { organization } = useAuth();

  const query = useQuery({
    queryKey: ['outbound-email', organization?.id, filters.tenant, filters.dateRange],
    queryFn: async (): Promise<{ daily: EmailDailyRow[]; health: EmailHealthRow | null }> => {
      // Retorna dados mockados para desenvolvimento
      if (USE_MOCK_DATA) {
        return { daily: MOCK_DAILY, health: MOCK_HEALTH };
      }

      if (!organization?.id) {
        return { daily: [], health: null };
      }

      // Build query for daily metrics
      let dailyQuery = supabase
        .from('outbound_email_daily')
        .select('*')
        .eq('organization_id', organization.id)
        .order('activity_date', { ascending: true });

      // Filter by tenant if not 'all'
      if (filters.tenant !== 'all') {
        dailyQuery = dailyQuery.eq('tenant', filters.tenant);
      }

      // Build query for health totals
      let healthQuery = supabase
        .from('outbound_email_health')
        .select('*')
        .eq('organization_id', organization.id);

      if (filters.tenant !== 'all') {
        healthQuery = healthQuery.eq('tenant', filters.tenant);
      }

      // Execute both queries in parallel
      const [dailyResult, healthResult] = await Promise.all([
        dailyQuery,
        healthQuery.maybeSingle(),
      ]);

      if (dailyResult.error) {
        throw dailyResult.error;
      }

      return {
        daily: (dailyResult.data || []) as EmailDailyRow[],
        health: (healthResult.data as EmailHealthRow) || null,
      };
    },
    enabled: !!organization?.id,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // 1 minute
  });

  return {
    daily: query.data?.daily || [],
    health: query.data?.health,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Helper para calcular taxas diárias
export function calculateDailyRates(daily: EmailDailyRow[]) {
  return daily.map((row) => ({
    ...row,
    bounceRate: row.sent > 0 ? (row.bounced / row.sent) * 100 : 0,
    openRate: row.sent > 0 ? (row.opened / row.sent) * 100 : 0,
    clickRate: row.opened > 0 ? (row.clicked / row.opened) * 100 : 0,
  }));
}

// Helper para determinar cor do gauge baseado no health status
export function getHealthColor(status: 'healthy' | 'warning' | 'critical' | null): string {
  switch (status) {
    case 'healthy':
      return '#22C55E';
    case 'warning':
      return '#F59E0B';
    case 'critical':
      return '#DC2626';
    default:
      return '#64748B';
  }
}
