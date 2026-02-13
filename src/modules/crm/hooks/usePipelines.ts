import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Pipeline, PipelineFormData, PipelineWithStages } from '../types';

export function usePipelines(organizationId?: string | null) {
  return useQuery({
    queryKey: ['pipelines', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('organization_id', organizationId!)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) {
        console.error('[Pipelines] Error fetching:', error);
        throw error;
      }

      console.log('[Pipelines] Fetched:', data?.length || 0, 'pipelines for org:', organizationId);
      return data as Pipeline[];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
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

export function useDefaultPipeline(organizationId?: string | null) {
  return useQuery({
    queryKey: ['default-pipeline', organizationId],
    queryFn: async () => {
      // Try to get default pipeline
      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('organization_id', organizationId!)
        .eq('is_default', true)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        console.log('[Pipeline] Found default pipeline:', data.name);
        return data as Pipeline;
      }

      // If no default found, get the first active pipeline
      console.log('[Pipeline] No default found, getting first active');
      const { data: firstPipeline, error: firstError } = await supabase
        .from('pipelines')
        .select('*')
        .eq('organization_id', organizationId!)
        .eq('is_active', true)
        .order('position', { ascending: true })
        .limit(1)
        .single();

      if (firstError) {
        console.error('[Pipeline] Error getting first pipeline:', firstError);

        // If still no pipeline, create a default one
        if (firstError.code === 'PGRST116') {
          console.log('[Pipeline] No pipelines found, creating default');
          const { data: newPipeline, error: createError } = await supabase
            .from('pipelines')
            .insert({
              organization_id: organizationId!,
              name: 'Pipeline de Vendas',
              description: 'Pipeline padrão para gerenciar vendas',
              position: 0,
              is_default: true,
              is_active: true,
            })
            .select()
            .single();

          if (createError) throw createError;

          // Create default stages
          const defaultStages = [
            { name: 'Novo', color: '#3B82F6', position: 0 },
            { name: 'Qualificação', color: '#F59E0B', position: 1 },
            { name: 'Proposta', color: '#8B5CF6', position: 2 },
            { name: 'Negociação', color: '#EC4899', position: 3 },
            { name: 'Fechado', color: '#10B981', position: 4 },
          ];

          await supabase
            .from('pipeline_stages')
            .insert(
              defaultStages.map(stage => ({
                pipeline_id: newPipeline.id,
                organization_id: organizationId!,
                ...stage,
              }))
            );

          return newPipeline as Pipeline;
        }

        throw firstError;
      }

      return firstPipeline as Pipeline;
    },
    enabled: !!organizationId,
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
      data: any;
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

      // Create the pipeline
      const { data: pipeline, error } = await supabase
        .from('pipelines')
        .insert({
          organization_id: organizationId,
          name: data.name,
          description: data.description || null,
          position,
          is_default: data.is_default || false,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Create the stages if provided
      if (data.stages && data.stages.length > 0) {
        const stagesToInsert = data.stages.map((stage: any, index: number) => ({
          pipeline_id: pipeline.id,
          organization_id: organizationId,
          name: stage.name,
          color: stage.color,
          position: index,
        }));

        const { error: stagesError } = await supabase
          .from('pipeline_stages')
          .insert(stagesToInsert);

        if (stagesError) throw stagesError;
      }

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
