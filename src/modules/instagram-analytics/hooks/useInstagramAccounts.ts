import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';
import type { InstagramAccount } from '../types';

export function useInstagramAccounts() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['instagram-accounts', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('organization_id', organizationId!)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as unknown as InstagramAccount[]) || [];
    },
    enabled: !!organizationId,
    staleTime: 60 * 1000,
  });
}

export function useConnectInstagram() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, redirectUri }: { code: string; redirectUri: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await supabase.functions.invoke('instagram-auth', {
        body: {
          code,
          redirect_uri: redirectUri,
          organization_id: organizationId,
        },
      });

      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-accounts', organizationId] });
    },
  });
}

export function useDisconnectInstagram() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from('instagram_accounts')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', accountId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-accounts', organizationId] });
    },
  });
}
