import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyPersona, CreatePersonaInput } from '../types';

const QUERY_KEY = 'journey-personas';

export function usePersonas(projectId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_personas')
        .select('*')
        .eq('project_id', projectId!)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as JourneyPersona[];
    },
    enabled: !!projectId,
  });
}

export function useCreatePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePersonaInput) => {
      const { data, error } = await supabase
        .from('journey_personas')
        .insert({
          project_id: input.project_id,
          name: input.name,
          role: input.role || null,
          age_range: input.age_range || null,
          bio: input.bio || null,
          goals: input.goals || [],
          pain_points: input.pain_points || [],
          behaviors: input.behaviors || [],
          motivations: input.motivations || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as JourneyPersona;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useUpdatePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JourneyPersona> & { id: string }) => {
      const { data, error } = await supabase
        .from('journey_personas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyPersona;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useDeletePersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('journey_personas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });
}
