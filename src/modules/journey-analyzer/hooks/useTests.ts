import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyTest, CreateTestInput, TestStatus, TestResult } from '../types';

const QUERY_KEY = 'journey-tests';

export function useTests(projectId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_tests')
        .select('*')
        .eq('project_id', projectId!)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as JourneyTest[];
    },
    enabled: !!projectId,
  });
}

export function useCreateTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTestInput) => {
      const { data, error } = await supabase
        .from('journey_tests')
        .insert({
          project_id: input.project_id,
          hypothesis: input.hypothesis,
          method: input.method || null,
          success_metric: input.success_metric || null,
          target_audience: input.target_audience || null,
          idea_id: input.idea_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as JourneyTest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JourneyTest> & { id: string }) => {
      const { data, error } = await supabase
        .from('journey_tests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyTest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useUpdateTestResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      result,
      findings,
    }: {
      id: string;
      status: TestStatus;
      result?: TestResult;
      findings?: string;
    }) => {
      const { data, error } = await supabase
        .from('journey_tests')
        .update({ status, result: result || null, findings: findings || null })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyTest;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useDeleteTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('journey_tests')
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
