import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';
import type { InstagramMedia, MediaType, DateRange } from '../types';

interface UseInstagramMediaOptions {
  accountId?: string;
  mediaType?: MediaType;
  dateRange?: DateRange;
  boostedOnly?: boolean;
}

function getDateFromRange(range: DateRange): Date {
  const now = new Date();
  switch (range) {
    case '7d': now.setDate(now.getDate() - 7); break;
    case '30d': now.setDate(now.getDate() - 30); break;
    case '90d': now.setDate(now.getDate() - 90); break;
    case '6m': now.setMonth(now.getMonth() - 6); break;
    case '1y': now.setFullYear(now.getFullYear() - 1); break;
  }
  return now;
}

export function useInstagramMedia(options: UseInstagramMediaOptions = {}) {
  const { organizationId } = useOrganization();
  const { accountId, mediaType, dateRange = '30d', boostedOnly } = options;

  return useQuery({
    queryKey: ['instagram-media', organizationId, accountId, mediaType, dateRange, boostedOnly],
    queryFn: async () => {
      let query = supabase
        .from('instagram_media')
        .select('*')
        .eq('organization_id', organizationId!);

      if (accountId) {
        query = query.eq('account_id', accountId);
      }

      if (mediaType) {
        query = query.eq('media_type', mediaType);
      }

      if (boostedOnly) {
        query = query.eq('is_boosted', true);
      }

      const sinceDate = getDateFromRange(dateRange);
      query = query.gte('timestamp', sinceDate.toISOString());

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;
      return (data as unknown as InstagramMedia[]) || [];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInstagramReels(accountId?: string, dateRange: DateRange = '30d') {
  return useInstagramMedia({ accountId, mediaType: 'REELS', dateRange });
}
