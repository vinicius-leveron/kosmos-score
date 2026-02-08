import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  JourneyProjectStage,
  JourneyProjectStageInsert,
  JourneyProjectStageUpdate
} from '../types';

const PROJECTS_KEY = 'journey-projects';

export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: JourneyProjectStageInsert) => {
      const { data, error } = await supabase
        .from('journey_project_stages')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyProjectStage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.project_id] });
    },
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId, ...updates }: JourneyProjectStageUpdate & { id: string; projectId: string }) => {
      const { data, error } = await supabase
        .from('journey_project_stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, projectId } as JourneyProjectStage & { projectId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.projectId] });
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stageId, projectId }: { stageId: string; projectId: string }) => {
      const { error } = await supabase
        .from('journey_project_stages')
        .delete()
        .eq('id', stageId);

      if (error) throw error;
      return { projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.projectId] });
    },
  });
}

export function useReorderStages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, stageIds }: { projectId: string; stageIds: string[] }) => {
      // Update positions in order
      const updates = stageIds.map((id, index) => ({
        id,
        position: index,
      }));

      for (const { id, position } of updates) {
        const { error } = await supabase
          .from('journey_project_stages')
          .update({ position })
          .eq('id', id);

        if (error) throw error;
      }

      return { projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.projectId] });
    },
  });
}
