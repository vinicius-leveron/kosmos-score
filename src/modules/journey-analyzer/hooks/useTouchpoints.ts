import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  JourneyTouchpoint,
  JourneyTouchpointInsert,
  JourneyTouchpointUpdate
} from '../types';

const PROJECTS_KEY = 'journey-projects';

export function useCreateTouchpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, ...input }: JourneyTouchpointInsert & { projectId: string }) => {
      const { data, error } = await supabase
        .from('journey_touchpoints')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return { ...data, projectId } as JourneyTouchpoint & { projectId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.projectId] });
    },
  });
}

export function useUpdateTouchpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId, ...updates }: JourneyTouchpointUpdate & { id: string; projectId: string }) => {
      const { data, error } = await supabase
        .from('journey_touchpoints')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, projectId } as JourneyTouchpoint & { projectId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.projectId] });
    },
  });
}

export function useDeleteTouchpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ touchpointId, projectId }: { touchpointId: string; projectId: string }) => {
      const { error } = await supabase
        .from('journey_touchpoints')
        .delete()
        .eq('id', touchpointId);

      if (error) throw error;
      return { projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.projectId] });
    },
  });
}

export function useEvaluateTouchpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      score,
      notes,
      is_critical,
    }: {
      id: string;
      projectId: string;
      score: number;
      notes?: string;
      is_critical?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('journey_touchpoints')
        .update({ score, notes, is_critical })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, projectId } as JourneyTouchpoint & { projectId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROJECTS_KEY, data.projectId] });
    },
  });
}
