import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyStage } from '../types';
import { KOSMOS_ORG_ID } from '@/core/auth';

export function useJourneyStages(organizationId: string = KOSMOS_ORG_ID) {
  return useQuery({
    queryKey: ['journey-stages', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_stages')
        .select('*')
        .eq('organization_id', organizationId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as JourneyStage[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateContactStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactOrgId,
      stageId,
    }: {
      contactOrgId: string;
      stageId: string;
    }) => {
      const { data, error } = await supabase
        .from('contact_orgs')
        .update({ journey_stage_id: stageId })
        .eq('id', contactOrgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-detail'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });
}
