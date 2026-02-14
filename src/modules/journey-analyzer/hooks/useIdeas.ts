import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyIdea, CreateIdeaInput, IdeaStatus } from '../types';

const QUERY_KEY = 'journey-ideas';

export function useIdeas(projectId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_ideas')
        .select('*')
        .eq('project_id', projectId!)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as JourneyIdea[];
    },
    enabled: !!projectId,
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateIdeaInput) => {
      const { data, error } = await supabase
        .from('journey_ideas')
        .insert({
          project_id: input.project_id,
          title: input.title,
          description: input.description || null,
          category: input.category || null,
          problem_statement_id: input.problem_statement_id || null,
          touchpoint_id: input.touchpoint_id || null,
          stage_id: input.stage_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as JourneyIdea;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JourneyIdea> & { id: string }) => {
      const { data, error } = await supabase
        .from('journey_ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyIdea;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useVoteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      // Increment votes
      const { data: current, error: fetchError } = await supabase
        .from('journey_ideas')
        .select('votes')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('journey_ideas')
        .update({ votes: (current.votes || 0) + 1 })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyIdea;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useMoveIdeaStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: IdeaStatus }) => {
      const { data, error } = await supabase
        .from('journey_ideas')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyIdea;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('journey_ideas')
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
