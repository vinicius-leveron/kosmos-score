import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Pipeline, PipelineFormData, PipelineWithStages } from '../types';
import { KOSMOS_ORG_ID } from '@/core/auth';

export function usePipelines(organizationId: string = KOSMOS_ORG_ID) {
  return useQuery({
    queryKey: ['pipelines', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as Pipeline[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePipeline(pipelineId: string | undefined) {
  return useQuery({
    queryKey: ['pipeline', pipelineId],
    queryFn: async () => {
      if (!pipelineId) return null;

      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('id', pipelineId)
        .single();

      if (error) throw error;
      return data as Pipeline;
    },
    enabled: !!pipelineId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePipelineWithStages(pipelineId: string | undefined) {
  return useQuery({
    queryKey: ['pipeline-with-stages', pipelineId],
    queryFn: async () => {
      if (!pipelineId) return null;

      const { data: pipeline, error: pipelineError } = await supabase
        .from('pipelines')
        .select('*')
        .eq('id', pipelineId)
        .single();

      if (pipelineError) throw pipelineError;

      const { data: stages, error: stagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('position', { ascending: true });

      if (stagesError) throw stagesError;

      return {
        ...pipeline,
        stages: stages || [],
      } as PipelineWithStages;
    },
    enabled: !!pipelineId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDefaultPipeline(organizationId: string = KOSMOS_ORG_ID) {
  return useQuery({
    queryKey: ['default-pipeline', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (error) {
        // If no default found, get the first active pipeline
        const { data: firstPipeline, error: firstError } = await supabase
          .from('pipelines')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('is_active', true)
          .order('position', { ascending: true })
          .limit(1)
          .single();

        if (firstError) throw firstError;
        return firstPipeline as Pipeline;
      }

      return data as Pipeline;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: PipelineFormData;
    }) => {
      // Get max position
      const { data: maxPos } = await supabase
        .from('pipelines')
        .select('position')
        .eq('organization_id', organizationId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const position = (maxPos?.position ?? -1) + 1;

      const { data: pipeline, error } = await supabase
        .from('pipelines')
        .insert({
          organization_id: organizationId,
          name: data.name,
          display_name: data.display_name,
          description: data.description || null,
          icon: data.icon || null,
          color: data.color,
          position,
          is_default: data.is_default || false,
        })
        .select()
        .single();

      if (error) throw error;
      return pipeline as Pipeline;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pipelines', variables.organizationId],
      });
    },
  });
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pipelineId,
      data,
    }: {
      pipelineId: string;
      data: Partial<PipelineFormData>;
    }) => {
      const { data: pipeline, error } = await supabase
        .from('pipelines')
        .update({
          ...(data.display_name !== undefined && { display_name: data.display_name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.icon !== undefined && { icon: data.icon }),
          ...(data.color !== undefined && { color: data.color }),
          ...(data.is_default !== undefined && { is_default: data.is_default }),
        })
        .eq('id', pipelineId)
        .select()
        .single();

      if (error) throw error;
      return pipeline as Pipeline;
    },
    onSuccess: (pipeline) => {
      queryClient.invalidateQueries({
        queryKey: ['pipelines', pipeline.organization_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline', pipeline.id],
      });
    },
  });
}

export function useDeletePipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pipelineId: string) => {
      // Soft delete - just set is_active to false
      const { data: pipeline, error } = await supabase
        .from('pipelines')
        .update({ is_active: false })
        .eq('id', pipelineId)
        .select()
        .single();

      if (error) throw error;
      return pipeline as Pipeline;
    },
    onSuccess: (pipeline) => {
      queryClient.invalidateQueries({
        queryKey: ['pipelines', pipeline.organization_id],
      });
    },
  });
}

export function useReorderPipelines() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      pipelineIds,
    }: {
      organizationId: string;
      pipelineIds: string[];
    }) => {
      // Update positions for each pipeline
      const updates = pipelineIds.map((id, index) =>
        supabase
          .from('pipelines')
          .update({ position: index })
          .eq('id', id)
      );

      await Promise.all(updates);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pipelines', variables.organizationId],
      });
    },
  });
}
