import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PipelineStage, PipelineStageFormData } from '../types';

export function usePipelineStages(pipelineId: string | undefined) {
  return useQuery({
    queryKey: ['pipeline-stages', pipelineId],
    queryFn: async () => {
      if (!pipelineId) return [];

      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as PipelineStage[];
    },
    enabled: !!pipelineId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePipelineStagesWithCount(pipelineId: string | undefined) {
  return useQuery({
    queryKey: ['pipeline-stages-with-count', pipelineId],
    queryFn: async () => {
      if (!pipelineId) return [];

      // Get stages
      const { data: stages, error: stagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('position', { ascending: true });

      if (stagesError) throw stagesError;

      // Get counts per stage
      const { data: counts, error: countsError } = await supabase
        .from('contact_pipeline_positions')
        .select('stage_id')
        .eq('pipeline_id', pipelineId);

      if (countsError) throw countsError;

      // Build count map
      const countMap = new Map<string, number>();
      (counts || []).forEach((c) => {
        countMap.set(c.stage_id, (countMap.get(c.stage_id) || 0) + 1);
      });

      return (stages || []).map((stage) => ({
        ...stage,
        contactCount: countMap.get(stage.id) || 0,
      }));
    },
    enabled: !!pipelineId,
    staleTime: 30 * 1000,
  });
}

export function useCreatePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pipelineId,
      organizationId,
      data,
    }: {
      pipelineId: string;
      organizationId: string;
      data: PipelineStageFormData;
    }) => {
      // Get max position
      const { data: maxPos } = await supabase
        .from('pipeline_stages')
        .select('position')
        .eq('pipeline_id', pipelineId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const position = (maxPos?.position ?? -1) + 1;

      const { data: stage, error } = await supabase
        .from('pipeline_stages')
        .insert({
          pipeline_id: pipelineId,
          organization_id: organizationId,
          name: data.name,
          display_name: data.display_name,
          description: data.description || null,
          color: data.color,
          position,
          is_entry_stage: data.is_entry_stage || false,
          is_exit_stage: data.is_exit_stage || false,
          exit_type: data.exit_type || null,
        })
        .select()
        .single();

      if (error) throw error;
      return stage as PipelineStage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pipeline-stages', variables.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-stages-with-count', variables.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-with-stages', variables.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-board', variables.pipelineId],
      });
    },
  });
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stageId,
      data,
    }: {
      stageId: string;
      data: Partial<PipelineStageFormData>;
    }) => {
      const { data: stage, error } = await supabase
        .from('pipeline_stages')
        .update({
          ...(data.display_name !== undefined && { display_name: data.display_name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.color !== undefined && { color: data.color }),
          ...(data.is_entry_stage !== undefined && { is_entry_stage: data.is_entry_stage }),
          ...(data.is_exit_stage !== undefined && { is_exit_stage: data.is_exit_stage }),
          ...(data.exit_type !== undefined && { exit_type: data.exit_type }),
        })
        .eq('id', stageId)
        .select()
        .single();

      if (error) throw error;
      return stage as PipelineStage;
    },
    onSuccess: (stage) => {
      queryClient.invalidateQueries({
        queryKey: ['pipeline-stages', stage.pipeline_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-stages-with-count', stage.pipeline_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-with-stages', stage.pipeline_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-board', stage.pipeline_id],
      });
    },
  });
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stageId,
      moveToStageId,
    }: {
      stageId: string;
      moveToStageId?: string;
    }) => {
      // First, get the stage info
      const { data: stage, error: stageError } = await supabase
        .from('pipeline_stages')
        .select('pipeline_id')
        .eq('id', stageId)
        .single();

      if (stageError) throw stageError;

      // If moveToStageId is provided, move contacts first
      if (moveToStageId) {
        const { error: moveError } = await supabase
          .from('contact_pipeline_positions')
          .update({ stage_id: moveToStageId })
          .eq('stage_id', stageId);

        if (moveError) throw moveError;
      }

      // Delete the stage
      const { error } = await supabase
        .from('pipeline_stages')
        .delete()
        .eq('id', stageId);

      if (error) throw error;

      return { pipelineId: stage.pipeline_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['pipeline-stages', result.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-stages-with-count', result.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-with-stages', result.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-board', result.pipelineId],
      });
    },
  });
}

export function useReorderPipelineStages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pipelineId,
      stageIds,
    }: {
      pipelineId: string;
      stageIds: string[];
    }) => {
      // Update positions for each stage
      const updates = stageIds.map((id, index) =>
        supabase
          .from('pipeline_stages')
          .update({ position: index })
          .eq('id', id)
      );

      await Promise.all(updates);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pipeline-stages', variables.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-stages-with-count', variables.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-with-stages', variables.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-board', variables.pipelineId],
      });
    },
  });
}
