import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeadMagnetStats {
  total_submissions: number;
  submissions_last_7_days: number;
  submissions_last_30_days: number;
  average_score: number;
  total_lucro_oculto: number;
  beginners_count: number;
  experienced_count: number;
  conversion_rate: number;
  score_distribution: {
    low: number;    // 0-25
    medium: number; // 26-50
    good: number;   // 51-75
    high: number;   // 76-100
  };
  recent_submissions: Array<{
    id: string;
    email: string;
    score: number;
    created_at: string;
    result_profile: string | null;
  }>;
  daily_submissions: Array<{
    date: string;
    count: number;
  }>;
}

export function useLeadMagnetStats(leadMagnetType: 'kosmos_score' | 'application' | 'forms' = 'kosmos_score') {
  return useQuery({
    queryKey: ['lead-magnet-stats', leadMagnetType],
    queryFn: async (): Promise<LeadMagnetStats> => {
      // For now, we only have KOSMOS Score data
      if (leadMagnetType !== 'kosmos_score') {
        return getEmptyStats();
      }

      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all audit results
      const { data: results, error } = await supabase
        .from('audit_results')
        .select('id, email, kosmos_asset_score, lucro_oculto, is_beginner, created_at, result_profile')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[LeadMagnetStats] Error fetching:', error);
        throw error;
      }

      const data = results || [];
      const total = data.length;

      if (total === 0) {
        return getEmptyStats();
      }

      // Calculate stats
      const last7DaysCount = data.filter(r => r.created_at >= last7Days).length;
      const last30DaysCount = data.filter(r => r.created_at >= last30Days).length;

      const scores = data.map(r => r.kosmos_asset_score || 0);
      const avgScore = scores.reduce((a, b) => a + b, 0) / total;

      const totalLucro = data.reduce((sum, r) => sum + (r.lucro_oculto || 0), 0);

      const beginners = data.filter(r => r.is_beginner).length;
      const experienced = total - beginners;

      // Score distribution
      const scoreDistribution = {
        low: data.filter(r => (r.kosmos_asset_score || 0) <= 25).length,
        medium: data.filter(r => (r.kosmos_asset_score || 0) > 25 && (r.kosmos_asset_score || 0) <= 50).length,
        good: data.filter(r => (r.kosmos_asset_score || 0) > 50 && (r.kosmos_asset_score || 0) <= 75).length,
        high: data.filter(r => (r.kosmos_asset_score || 0) > 75).length,
      };

      // Recent submissions (last 10)
      const recentSubmissions = data.slice(0, 10).map(r => ({
        id: r.id,
        email: r.email || 'Anônimo',
        score: r.kosmos_asset_score || 0,
        created_at: r.created_at,
        result_profile: r.result_profile,
      }));

      // Daily submissions (last 30 days)
      const dailyMap = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap.set(dateStr, 0);
      }

      data.forEach(r => {
        const dateStr = r.created_at.split('T')[0];
        if (dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
        }
      });

      const dailySubmissions = Array.from(dailyMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));

      // Conversion rate (high score leads / total)
      const conversionRate = total > 0 ? (scoreDistribution.high / total) * 100 : 0;

      return {
        total_submissions: total,
        submissions_last_7_days: last7DaysCount,
        submissions_last_30_days: last30DaysCount,
        average_score: Math.round(avgScore * 10) / 10,
        total_lucro_oculto: totalLucro,
        beginners_count: beginners,
        experienced_count: experienced,
        conversion_rate: Math.round(conversionRate * 10) / 10,
        score_distribution: scoreDistribution,
        recent_submissions: recentSubmissions,
        daily_submissions: dailySubmissions,
      };
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

function getEmptyStats(): LeadMagnetStats {
  return {
    total_submissions: 0,
    submissions_last_7_days: 0,
    submissions_last_30_days: 0,
    average_score: 0,
    total_lucro_oculto: 0,
    beginners_count: 0,
    experienced_count: 0,
    conversion_rate: 0,
    score_distribution: { low: 0, medium: 0, good: 0, high: 0 },
    recent_submissions: [],
    daily_submissions: [],
  };
}

export function useLeadMagnetSummary() {
  return useQuery({
    queryKey: ['lead-magnet-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_results')
        .select('id, kosmos_asset_score, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const results = data || [];
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      return {
        kosmos_score: {
          total: results.length,
          recent: results.filter(r => r.created_at >= last7Days).length,
          avgScore: results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + (r.kosmos_asset_score || 0), 0) / results.length)
            : 0,
        },
        application: { total: 0, recent: 0, avgScore: 0 },
        forms: { total: 0, recent: 0, avgScore: 0 },
      };
    },
    staleTime: 60 * 1000,
  });
}
