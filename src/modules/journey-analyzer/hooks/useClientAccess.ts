import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ClientProjectData, JourneyTest } from '../types';

const CLIENT_QUERY_KEY = 'journey-client';

export function useJourneyProjectByToken(token: string | undefined) {
  return useQuery({
    queryKey: [CLIENT_QUERY_KEY, token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_journey_by_token', {
        p_token: token!,
      });

      if (error) throw error;
      return data as unknown as ClientProjectData;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClientCreateTest(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      hypothesis: string;
      method?: string;
      success_metric?: string;
      target_audience?: string;
      idea_id?: string;
    }) => {
      const { data, error } = await supabase.rpc('client_create_test', {
        p_token: token,
        p_hypothesis: input.hypothesis,
        p_method: input.method || null,
        p_success_metric: input.success_metric || null,
        p_target_audience: input.target_audience || null,
        p_idea_id: input.idea_id || null,
      });

      if (error) throw error;
      return data as unknown as JourneyTest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY, token] });
    },
  });
}

export function useClientUpdateTest(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      hypothesis?: string;
      method?: string;
      success_metric?: string;
      target_audience?: string;
      status?: string;
      result?: string;
      findings?: string;
      evidence_url?: string;
    }) => {
      const { data, error } = await supabase.rpc('client_update_test', {
        p_token: token,
        p_test_id: input.id,
        p_hypothesis: input.hypothesis || null,
        p_method: input.method || null,
        p_success_metric: input.success_metric || null,
        p_target_audience: input.target_audience || null,
        p_status: input.status || null,
        p_result: input.result || null,
        p_findings: input.findings || null,
        p_evidence_url: input.evidence_url || null,
      });

      if (error) throw error;
      return data as unknown as JourneyTest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY, token] });
    },
  });
}

export function useClientDeleteTest(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testId: string) => {
      const { data, error } = await supabase.rpc('client_delete_test', {
        p_token: token,
        p_test_id: testId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY, token] });
    },
  });
}

export function useClientVoteIdea(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ideaId: string) => {
      const { data, error } = await supabase.rpc('client_vote_idea', {
        p_token: token,
        p_idea_id: ideaId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY, token] });
    },
  });
}
