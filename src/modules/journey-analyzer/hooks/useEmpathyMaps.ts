import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyEmpathyMap, CreateEmpathyMapInput, EmpathyQuadrant } from '../types';

const QUERY_KEY = 'journey-empathy-maps';

export function useEmpathyMaps(projectId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_empathy_maps')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as JourneyEmpathyMap[];
    },
    enabled: !!projectId,
  });
}

export function useCreateEmpathyMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEmpathyMapInput) => {
      const { data, error } = await supabase
        .from('journey_empathy_maps')
        .insert({
          project_id: input.project_id,
          persona_id: input.persona_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as JourneyEmpathyMap;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useUpdateEmpathyMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JourneyEmpathyMap> & { id: string }) => {
      const { data, error } = await supabase
        .from('journey_empathy_maps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyEmpathyMap;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useAddEmpathyMapItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      quadrant,
      item,
    }: {
      id: string;
      quadrant: EmpathyQuadrant;
      item: string;
    }) => {
      // Fetch current map
      const { data: current, error: fetchError } = await supabase
        .from('journey_empathy_maps')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const currentItems = (current[quadrant] as string[]) || [];
      const updatedItems = [...currentItems, item];

      const { data, error } = await supabase
        .from('journey_empathy_maps')
        .update({ [quadrant]: updatedItems })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyEmpathyMap;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useRemoveEmpathyMapItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      quadrant,
      index,
    }: {
      id: string;
      quadrant: EmpathyQuadrant;
      index: number;
    }) => {
      const { data: current, error: fetchError } = await supabase
        .from('journey_empathy_maps')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const currentItems = (current[quadrant] as string[]) || [];
      const updatedItems = currentItems.filter((_, i) => i !== index);

      const { data, error } = await supabase
        .from('journey_empathy_maps')
        .update({ [quadrant]: updatedItems })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as JourneyEmpathyMap;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.project_id] });
    },
  });
}

export function useDeleteEmpathyMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('journey_empathy_maps')
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
