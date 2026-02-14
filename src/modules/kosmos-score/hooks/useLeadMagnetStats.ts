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
  completion_rate: number;
  avg_time_spent: number;
  score_distribution: {
    low: number;
    medium: number;
    good: number;
    high: number;
  };
  status_distribution: {
    completed: number;
    in_progress: number;
    abandoned: number;
  };
  recent_submissions: Array<{
    id: string;
    email: string;
    score: number;
    created_at: string;
    result_profile: string | null;
    status?: string;
  }>;
  daily_submissions: Array<{
    date: string;
    count: number;
  }>;
}

// KOSMOS Score stats from audit_results
async function fetchKosmosScoreStats(): Promise<LeadMagnetStats> {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: results, error } = await supabase
    .from('audit_results')
    .select('id, email, kosmos_asset_score, lucro_oculto, is_beginner, created_at, result_profile')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[LeadMagnetStats] Error fetching KOSMOS Score:', error);
    throw error;
  }

  const data = results || [];
  const total = data.length;

  if (total === 0) {
    return getEmptyStats();
  }

  const last7DaysCount = data.filter(r => r.created_at >= last7Days).length;
  const last30DaysCount = data.filter(r => r.created_at >= last30Days).length;

  const scores = data.map(r => r.kosmos_asset_score || 0);
  const avgScore = scores.reduce((a, b) => a + b, 0) / total;

  const totalLucro = data.reduce((sum, r) => sum + (r.lucro_oculto || 0), 0);

  const beginners = data.filter(r => r.is_beginner).length;
  const experienced = total - beginners;

  const scoreDistribution = {
    low: data.filter(r => (r.kosmos_asset_score || 0) <= 25).length,
    medium: data.filter(r => (r.kosmos_asset_score || 0) > 25 && (r.kosmos_asset_score || 0) <= 50).length,
    good: data.filter(r => (r.kosmos_asset_score || 0) > 50 && (r.kosmos_asset_score || 0) <= 75).length,
    high: data.filter(r => (r.kosmos_asset_score || 0) > 75).length,
  };

  const recentSubmissions = data.slice(0, 10).map(r => ({
    id: r.id,
    email: r.email || 'Anônimo',
    score: r.kosmos_asset_score || 0,
    created_at: r.created_at,
    result_profile: r.result_profile,
  }));

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
    completion_rate: 100, // All audit_results are completed
    avg_time_spent: 0,
    score_distribution: scoreDistribution,
    status_distribution: { completed: total, in_progress: 0, abandoned: 0 },
    recent_submissions: recentSubmissions,
    daily_submissions: dailySubmissions,
  };
}

// Application form stats from form_submissions
async function fetchApplicationStats(): Promise<LeadMagnetStats> {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // First get the aplicacao-kosmos form ID
  const { data: form } = await supabase
    .from('forms')
    .select('id')
    .eq('slug', 'aplicacao-kosmos')
    .single();

  if (!form) {
    console.log('[LeadMagnetStats] Aplicacao form not found');
    return getEmptyStats();
  }

  // Fetch submissions for this form
  const { data: submissions, error } = await supabase
    .from('form_submissions')
    .select('id, respondent_email, score, status, created_at, completed_at, time_spent_seconds, answers')
    .eq('form_id', form.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[LeadMagnetStats] Error fetching application submissions:', error);
    throw error;
  }

  const data = submissions || [];
  const total = data.length;

  if (total === 0) {
    return getEmptyStats();
  }

  const completed = data.filter(r => r.status === 'completed');
  const inProgress = data.filter(r => r.status === 'in_progress');
  const abandoned = data.filter(r => r.status === 'abandoned');

  const last7DaysCount = data.filter(r => r.created_at >= last7Days).length;
  const last30DaysCount = data.filter(r => r.created_at >= last30Days).length;

  // Calculate average score from completed submissions
  const completedWithScore = completed.filter(r => r.score != null);
  const avgScore = completedWithScore.length > 0
    ? completedWithScore.reduce((sum, r) => sum + (r.score || 0), 0) / completedWithScore.length
    : 0;

  // Score distribution
  const scoreDistribution = {
    low: completedWithScore.filter(r => (r.score || 0) <= 25).length,
    medium: completedWithScore.filter(r => (r.score || 0) > 25 && (r.score || 0) <= 50).length,
    good: completedWithScore.filter(r => (r.score || 0) > 50 && (r.score || 0) <= 75).length,
    high: completedWithScore.filter(r => (r.score || 0) > 75).length,
  };

  // Average time spent
  const avgTimeSpent = completed.length > 0
    ? completed.reduce((sum, r) => sum + (r.time_spent_seconds || 0), 0) / completed.length
    : 0;

  // Completion rate
  const completionRate = total > 0 ? (completed.length / total) * 100 : 0;

  // Recent submissions
  const recentSubmissions = data.slice(0, 10).map(r => ({
    id: r.id,
    email: r.respondent_email || 'Anônimo',
    score: r.score || 0,
    created_at: r.created_at,
    result_profile: null,
    status: r.status,
  }));

  // Daily submissions
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

  // Conversion rate (high score / total completed)
  const conversionRate = completedWithScore.length > 0
    ? (scoreDistribution.high / completedWithScore.length) * 100
    : 0;

  return {
    total_submissions: total,
    submissions_last_7_days: last7DaysCount,
    submissions_last_30_days: last30DaysCount,
    average_score: Math.round(avgScore * 10) / 10,
    total_lucro_oculto: 0, // Not applicable for application form
    beginners_count: 0,
    experienced_count: completed.length,
    conversion_rate: Math.round(conversionRate * 10) / 10,
    completion_rate: Math.round(completionRate * 10) / 10,
    avg_time_spent: Math.round(avgTimeSpent),
    score_distribution: scoreDistribution,
    status_distribution: {
      completed: completed.length,
      in_progress: inProgress.length,
      abandoned: abandoned.length,
    },
    recent_submissions: recentSubmissions,
    daily_submissions: dailySubmissions,
  };
}

export function useLeadMagnetStats(leadMagnetType: 'kosmos_score' | 'application' | 'forms' = 'kosmos_score') {
  return useQuery({
    queryKey: ['lead-magnet-stats', leadMagnetType],
    queryFn: async (): Promise<LeadMagnetStats> => {
      switch (leadMagnetType) {
        case 'kosmos_score':
          return fetchKosmosScoreStats();
        case 'application':
          return fetchApplicationStats();
        default:
          return getEmptyStats();
      }
    },
    staleTime: 60 * 1000,
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
    completion_rate: 0,
    avg_time_spent: 0,
    score_distribution: { low: 0, medium: 0, good: 0, high: 0 },
    status_distribution: { completed: 0, in_progress: 0, abandoned: 0 },
    recent_submissions: [],
    daily_submissions: [],
  };
}

export function useLeadMagnetSummary() {
  return useQuery({
    queryKey: ['lead-magnet-summary'],
    queryFn: async () => {
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch KOSMOS Score data
      const { data: auditResults } = await supabase
        .from('audit_results')
        .select('id, kosmos_asset_score, created_at')
        .order('created_at', { ascending: false });

      const kosmosData = auditResults || [];

      // Fetch Aplicacao form ID
      const { data: form } = await supabase
        .from('forms')
        .select('id')
        .eq('slug', 'aplicacao-kosmos')
        .single();

      let applicationData: Array<{ id: string; score: number | null; status: string | null; created_at: string }> = [];
      if (form) {
        const { data: submissions } = await supabase
          .from('form_submissions')
          .select('id, score, status, created_at')
          .eq('form_id', form.id)
          .order('created_at', { ascending: false });
        applicationData = submissions || [];
      }

      const completedApplications = applicationData.filter(r => r.status === 'completed');

      return {
        kosmos_score: {
          total: kosmosData.length,
          recent: kosmosData.filter(r => r.created_at >= last7Days).length,
          avgScore: kosmosData.length > 0
            ? Math.round(kosmosData.reduce((sum, r) => sum + (r.kosmos_asset_score || 0), 0) / kosmosData.length)
            : 0,
        },
        application: {
          total: applicationData.length,
          recent: applicationData.filter(r => r.created_at >= last7Days).length,
          avgScore: completedApplications.length > 0
            ? Math.round(completedApplications.reduce((sum, r) => sum + (r.score || 0), 0) / completedApplications.length)
            : 0,
          completionRate: applicationData.length > 0
            ? Math.round((completedApplications.length / applicationData.length) * 100)
            : 0,
        },
        forms: { total: 0, recent: 0, avgScore: 0 },
      };
    },
    staleTime: 60 * 1000,
  });
}
