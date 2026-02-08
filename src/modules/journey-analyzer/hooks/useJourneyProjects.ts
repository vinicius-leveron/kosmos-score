import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  JourneyProject,
  JourneyProjectInsert,
  JourneyProjectUpdate,
  JourneyProjectWithStages
} from '../types';

const QUERY_KEY = 'journey-projects';

export function useJourneyProjects(organizationId?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, organizationId],
    queryFn: async () => {
      let query = supabase
        .from('journey_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as JourneyProject[];
    },
  });
}

export function useJourneyProject(projectId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from('journey_projects')
        .select(`
          *,
          stages:journey_project_stages(
            *,
            touchpoints:journey_touchpoints(*)
          )
        `)
        .eq('id', projectId)
        .order('position', { referencedTable: 'journey_project_stages', ascending: true })
        .single();

      if (error) throw error;
      return data as JourneyProjectWithStages;
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: JourneyProjectInsert) => {
      const { data, error } = await supabase
        .from('journey_projects')
        .insert(input)
        .select()
        .single();

      if (error) throw error;

      // Create default stages
      await supabase.rpc('create_default_journey_stages', { p_project_id: data.id });

      return data as JourneyProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: JourneyProjectUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('journey_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyProject;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('journey_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
