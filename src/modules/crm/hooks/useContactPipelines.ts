import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ContactInPipeline } from '../types';

export function useContactPipelines(contactOrgId: string | undefined) {
  return useQuery({
    queryKey: ['contact-pipelines', contactOrgId],
    queryFn: async (): Promise<ContactInPipeline[]> => {
      if (!contactOrgId) return [];

      const { data, error } = await supabase
        .from('contact_pipeline_positions')
        .select(`
          id,
          contact_org_id,
          pipeline_id,
          stage_id,
          entered_stage_at,
          entered_pipeline_at,
          owner_id,
          custom_fields,
          created_at,
          updated_at,
          pipelines (
            id,
            organization_id,
            name,
            display_name,
            description,
            icon,
            color,
            position,
            is_default,
            is_active,
            settings,
            created_at,
            updated_at
          ),
          pipeline_stages (
            id,
            pipeline_id,
            organization_id,
            name,
            display_name,
            description,
            position,
            color,
            is_entry_stage,
            is_exit_stage,
            exit_type,
            automation_rules,
            created_at,
            updated_at
          )
        `)
        .eq('contact_org_id', contactOrgId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        position: {
          id: row.id,
          contact_org_id: row.contact_org_id,
          pipeline_id: row.pipeline_id,
          stage_id: row.stage_id,
          entered_stage_at: row.entered_stage_at,
          entered_pipeline_at: row.entered_pipeline_at,
          owner_id: row.owner_id,
          custom_fields: row.custom_fields || {},
          created_at: row.created_at,
          updated_at: row.updated_at,
        },
        stage: row.pipeline_stages,
        pipeline: row.pipelines,
      }));
    },
    enabled: !!contactOrgId,
    staleTime: 30 * 1000,
  });
}

export function useAvailablePipelinesForContact(
  contactOrgId: string | undefined,
  organizationId: string
) {
  return useQuery({
    queryKey: ['available-pipelines-for-contact', contactOrgId, organizationId],
    queryFn: async () => {
      // Get all active pipelines
      const { data: allPipelines, error: pipelinesError } = await supabase
        .from('pipelines')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (pipelinesError) throw pipelinesError;

      if (!contactOrgId) {
        return allPipelines || [];
      }

      // Get pipelines the contact is already in
      const { data: positions, error: positionsError } = await supabase
        .from('contact_pipeline_positions')
        .select('pipeline_id')
        .eq('contact_org_id', contactOrgId);

      if (positionsError) throw positionsError;

      const existingPipelineIds = new Set((positions || []).map((p) => p.pipeline_id));

      // Filter out pipelines the contact is already in
      return (allPipelines || []).filter((p) => !existingPipelineIds.has(p.id));
    },
    enabled: !!organizationId,
    staleTime: 30 * 1000,
  });
}
