import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CadenceStatus, Classificacao, ChannelIn } from '../types/outbound';

export interface OutboundInfo {
  cadence_status: CadenceStatus | null;
  classificacao: Classificacao | null;
  score_icp: number | null;
  score_engagement: number | null;
  cadence_step: number | null;
  channel_in: ChannelIn | null;
  last_contacted: string | null;
  next_action_date: string | null;
  tenant: 'kosmos' | 'oliveira-dev' | null;
  cadence_id: string | null;
  cadence_name: string | null;
  do_not_contact: boolean;
}

export function useOutboundInfo(contactOrgId: string | undefined) {
  return useQuery({
    queryKey: ['outbound-info', contactOrgId],
    queryFn: async (): Promise<OutboundInfo | null> => {
      if (!contactOrgId) return null;

      const { data, error } = await supabase
        .from('contact_orgs')
        .select(`
          cadence_status,
          classificacao,
          score_icp,
          score_engagement,
          cadence_step,
          channel_in,
          last_contacted,
          next_action_date,
          tenant,
          cadence_id,
          do_not_contact,
          outbound_cadences (
            name
          )
        `)
        .eq('id', contactOrgId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        cadence_status: data.cadence_status as CadenceStatus | null,
        classificacao: data.classificacao as Classificacao | null,
        score_icp: data.score_icp,
        score_engagement: data.score_engagement,
        cadence_step: data.cadence_step,
        channel_in: data.channel_in as ChannelIn | null,
        last_contacted: data.last_contacted,
        next_action_date: data.next_action_date,
        tenant: data.tenant as 'kosmos' | 'oliveira-dev' | null,
        cadence_id: data.cadence_id,
        cadence_name: (data.outbound_cadences as any)?.name || null,
        do_not_contact: data.do_not_contact || false,
      };
    },
    enabled: !!contactOrgId,
    staleTime: 30 * 1000,
  });
}

// Helper to check if contact is from Outbound
export function isOutboundContact(outboundInfo: OutboundInfo | null | undefined): boolean {
  if (!outboundInfo) return false;
  return outboundInfo.cadence_status !== null;
}

// Mutation to update cadence status
export function useUpdateCadenceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactOrgId,
      status,
    }: {
      contactOrgId: string;
      status: CadenceStatus;
    }) => {
      const { error } = await supabase
        .from('contact_orgs')
        .update({ cadence_status: status })
        .eq('id', contactOrgId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['outbound-info', variables.contactOrgId] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-board'] });
      queryClient.invalidateQueries({ queryKey: ['deal-board'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
