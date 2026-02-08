import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  Pipeline,
  PipelineStage,
  PipelineBoardData,
  PipelineBoardContact,
  PipelineBoardColumn,
} from '../types';

export function usePipelineBoard(pipelineId: string | undefined) {
  return useQuery({
    queryKey: ['pipeline-board', pipelineId],
    queryFn: async (): Promise<PipelineBoardData | null> => {
      if (!pipelineId) return null;

      // Get pipeline
      const { data: pipeline, error: pipelineError } = await supabase
        .from('pipelines')
        .select('*')
        .eq('id', pipelineId)
        .single();

      if (pipelineError) throw pipelineError;

      // Get stages
      const { data: stages, error: stagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('position', { ascending: true });

      if (stagesError) throw stagesError;

      // Get contacts in this pipeline with their positions
      const { data: positions, error: positionsError } = await supabase
        .from('contact_pipeline_positions')
        .select(`
          id,
          contact_org_id,
          stage_id,
          entered_stage_at,
          contact_orgs!inner (
            id,
            score,
            status,
            contacts!inner (
              email,
              full_name
            )
          )
        `)
        .eq('pipeline_id', pipelineId)
        .eq('contact_orgs.status', 'active');

      if (positionsError) throw positionsError;

      // Get tags for all contacts
      const contactOrgIds = (positions || []).map((p: any) => p.contact_org_id);
      let tagsByContactOrg = new Map<string, { id: string; name: string; color: string }[]>();

      if (contactOrgIds.length > 0) {
        const { data: tagsData } = await supabase
          .from('contact_tags')
          .select(`
            contact_org_id,
            tags (
              id,
              name,
              color
            )
          `)
          .in('contact_org_id', contactOrgIds);

        if (tagsData) {
          tagsData.forEach((row: any) => {
            const existing = tagsByContactOrg.get(row.contact_org_id) || [];
            if (row.tags) {
              existing.push({
                id: row.tags.id,
                name: row.tags.name,
                color: row.tags.color,
              });
            }
            tagsByContactOrg.set(row.contact_org_id, existing);
          });
        }
      }

      // Build columns
      const columns: PipelineBoardColumn[] = (stages || []).map((stage) => {
        const stagePositions = (positions || []).filter((p: any) => p.stage_id === stage.id);

        const contacts: PipelineBoardContact[] = stagePositions.map((p: any) => ({
          id: p.id,
          contact_org_id: p.contact_org_id,
          email: p.contact_orgs.contacts.email,
          full_name: p.contact_orgs.contacts.full_name,
          score: p.contact_orgs.score,
          entered_stage_at: p.entered_stage_at,
          tags: tagsByContactOrg.get(p.contact_org_id) || [],
        }));

        return {
          stage: stage as PipelineStage,
          contacts,
          count: contacts.length,
        };
      });

      const totalContacts = columns.reduce((sum, col) => sum + col.count, 0);

      return {
        pipeline: pipeline as Pipeline,
        columns,
        totalContacts,
      };
    },
    enabled: !!pipelineId,
    staleTime: 30 * 1000,
  });
}

export function useMoveContactInPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      positionId,
      newStageId,
      pipelineId,
    }: {
      positionId: string;
      newStageId: string;
      pipelineId: string;
    }) => {
      const { data, error } = await supabase
        .from('contact_pipeline_positions')
        .update({
          stage_id: newStageId,
          entered_stage_at: new Date().toISOString(),
        })
        .eq('id', positionId)
        .select()
        .single();

      if (error) throw error;
      return { ...data, pipelineId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['pipeline-board', result.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pipeline-stages-with-count', result.pipelineId],
      });
    },
  });
}

export function useAddContactToPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactOrgId,
      pipelineId,
      stageId,
    }: {
      contactOrgId: string;
      pipelineId: string;
      stageId: string;
    }) => {
      const { data, error } = await supabase
        .from('contact_pipeline_positions')
        .insert({
          contact_org_id: contactOrgId,
          pipeline_id: pipelineId,
          stage_id: stageId,
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, pipelineId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['pipeline-board', result.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['contact-pipelines'],
      });
    },
  });
}

export function useRemoveContactFromPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      positionId,
      pipelineId,
    }: {
      positionId: string;
      pipelineId: string;
    }) => {
      const { error } = await supabase
        .from('contact_pipeline_positions')
        .delete()
        .eq('id', positionId);

      if (error) throw error;
      return { pipelineId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['pipeline-board', result.pipelineId],
      });
      queryClient.invalidateQueries({
        queryKey: ['contact-pipelines'],
      });
    },
  });
}
