import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DTPhaseId, PhaseStatus, PhaseProgress } from '../types';

const QUERY_KEY = 'journey-projects';

export function useUpdatePhaseProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      phase,
      status,
    }: {
      projectId: string;
      phase: DTPhaseId;
      status: PhaseStatus;
    }) => {
      // Fetch current progress
      const { data: project, error: fetchError } = await supabase
        .from('journey_projects')
        .select('phase_progress')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      const currentProgress = (project.phase_progress as PhaseProgress) || {
        empathize: 'not_started',
        define: 'not_started',
        ideate: 'not_started',
        prototype: 'not_started',
        test: 'not_started',
      };

      const updatedProgress = { ...currentProgress, [phase]: status };

      const { data, error } = await supabase
        .from('journey_projects')
        .update({
          phase_progress: updatedProgress,
          current_phase: phase,
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
    },
  });
}
