import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';

export function useInstagramSync() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const res = await supabase.functions.invoke('instagram-sync', {
        body: { account_id: accountId },
      });

      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-accounts', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['instagram-media'] });
      queryClient.invalidateQueries({ queryKey: ['instagram-media-insights'] });
      queryClient.invalidateQueries({ queryKey: ['instagram-ad-insights'] });
      queryClient.invalidateQueries({ queryKey: ['instagram-account-insights'] });
      queryClient.invalidateQueries({ queryKey: ['instagram-reels-with-insights'] });
    },
  });
}
