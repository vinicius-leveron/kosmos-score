import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyProblemStatement, CreateProblemStatementInput } from '../types';

const QUERY_KEY = 'journey-problem-statements';

export function useProblemStatements(projectId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_problem_statements')
        .select('*')
        .eq('project_id', projectId!)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as JourneyProblemStatement[];
    },
    enabled: !!projectId,
  });
}

export function useCreateProblemStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProblemStatementInput) => {
      const { data, error } = await supabase
        .from('journey_problem_statements')
        .insert({
          project_id: input.project_id,
          persona_id: input.persona_id || null,
          statement: input.statement,
          context: input.context || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as JourneyProblemStatement;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useUpdateProblemStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JourneyProblemStatement> & { id: string }) => {
      const { data, error } = await supabase
        .from('journey_problem_statements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyProblemStatement;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useDeleteProblemStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('journey_problem_statements')
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
