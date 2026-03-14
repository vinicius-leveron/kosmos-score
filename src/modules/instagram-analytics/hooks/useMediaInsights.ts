import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';
import type { MediaInsights, ReelWithInsights, AdInsights, InstagramMedia } from '../types';
import { calculateDerivedMetrics, classifyHookQuadrant } from '../lib/metrics';

export function useMediaInsights(mediaIds: string[]) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['instagram-media-insights', organizationId, mediaIds],
    queryFn: async () => {
      if (mediaIds.length === 0) return [];

      const { data, error } = await supabase
        .from('instagram_media_insights')
        .select('*')
        .eq('organization_id', organizationId!)
        .in('media_id', mediaIds);

      if (error) throw error;
      return (data as unknown as MediaInsights[]) || [];
    },
    enabled: !!organizationId && mediaIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdInsights(mediaIds: string[]) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['instagram-ad-insights', organizationId, mediaIds],
    queryFn: async () => {
      if (mediaIds.length === 0) return [];

      const { data, error } = await supabase
        .from('instagram_ad_insights')
        .select('*')
        .eq('organization_id', organizationId!)
        .in('media_id', mediaIds);

      if (error) throw error;
      return (data as unknown as AdInsights[]) || [];
    },
    enabled: !!organizationId && mediaIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReelsWithInsights(accountId?: string, dateRange: '7d' | '30d' | '90d' | '6m' | '1y' = '30d') {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['instagram-reels-with-insights', organizationId, accountId, dateRange],
    queryFn: async () => {
      const sinceDate = new Date();
      switch (dateRange) {
        case '7d': sinceDate.setDate(sinceDate.getDate() - 7); break;
        case '30d': sinceDate.setDate(sinceDate.getDate() - 30); break;
        case '90d': sinceDate.setDate(sinceDate.getDate() - 90); break;
        case '6m': sinceDate.setMonth(sinceDate.getMonth() - 6); break;
        case '1y': sinceDate.setFullYear(sinceDate.getFullYear() - 1); break;
      }

      let mediaQuery = supabase
        .from('instagram_media')
        .select('*')
        .eq('organization_id', organizationId!)
        .eq('media_type', 'REELS')
        .gte('timestamp', sinceDate.toISOString())
        .order('timestamp', { ascending: false });

      if (accountId) {
        mediaQuery = mediaQuery.eq('account_id', accountId);
      }

      const { data: mediaData, error: mediaError } = await mediaQuery;
      if (mediaError) throw mediaError;

      const media = (mediaData as unknown as InstagramMedia[]) || [];
      if (media.length === 0) return [];

      const mediaIds = media.map(m => m.id);

      const [insightsRes, adInsightsRes] = await Promise.all([
        supabase
          .from('instagram_media_insights')
          .select('*')
          .eq('organization_id', organizationId!)
          .in('media_id', mediaIds),
        supabase
          .from('instagram_ad_insights')
          .select('*')
          .eq('organization_id', organizationId!)
          .in('media_id', mediaIds),
      ]);

      const insightsMap = new Map<string, MediaInsights>();
      for (const insight of (insightsRes.data as unknown as MediaInsights[]) || []) {
        insightsMap.set(insight.media_id, insight);
      }

      const adInsightsMap = new Map<string, AdInsights>();
      for (const adInsight of (adInsightsRes.data as unknown as AdInsights[]) || []) {
        adInsightsMap.set(adInsight.media_id, adInsight);
      }

      return media.map((m): ReelWithInsights => {
        const insights = insightsMap.get(m.id) || null;
        const ad_insights = adInsightsMap.get(m.id) || null;
        const derived = calculateDerivedMetrics(insights, m.duration_seconds);
        const hook_quadrant = classifyHookQuadrant(insights?.skip_rate ?? null, derived.completion_rate);

        return { ...m, insights, ad_insights, derived, hook_quadrant };
      });
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}
