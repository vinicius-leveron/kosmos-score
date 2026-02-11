import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';

interface PipelineSummaryData {
  pipeline_id: string;
  organization_id: string;
  pipeline_name: string;
  pipeline_type: 'contact' | 'deal' | 'custom';
  stage_id: string;
  stage_name: string;
  stage_color: string;
  stage_position: number;
  contact_count: number;
  deal_count: number;
  total_value: number;
  avg_probability: number;
}

interface StageWithMetrics {
  id: string;
  name: string;
  color: string;
  position: number;
  contact_count: number;
  deal_count: number;
  total_value: number;
  avg_probability: number;
  items: any[];
}

// Hook optimizado que usa a materialized view para performance
export function usePipelineData(pipelineId: string | undefined) {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['pipeline-data', pipelineId, organizationId],
    queryFn: async () => {
      if (!pipelineId || !organizationId) return null;
      
      // Get summary data from materialized view (muito rápido)
      const { data: summaryData, error: summaryError } = await supabase
        .from('pipeline_summary')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .eq('organization_id', organizationId)
        .order('stage_position');
        
      if (summaryError) throw summaryError;
      
      // Group by stage
      const stagesMap = new Map<string, StageWithMetrics>();
      
      for (const row of summaryData as PipelineSummaryData[]) {
        if (!stagesMap.has(row.stage_id)) {
          stagesMap.set(row.stage_id, {
            id: row.stage_id,
            name: row.stage_name,
            color: row.stage_color,
            position: row.stage_position,
            contact_count: row.contact_count,
            deal_count: row.deal_count,
            total_value: row.total_value,
            avg_probability: row.avg_probability,
            items: [],
          });
        }
      }
      
      return {
        pipeline_id: pipelineId,
        pipeline_type: summaryData?.[0]?.pipeline_type || 'deal',
        stages: Array.from(stagesMap.values()).sort((a, b) => a.position - b.position),
        totalContacts: summaryData?.reduce((sum, row) => sum + row.contact_count, 0) || 0,
        totalDeals: summaryData?.reduce((sum, row) => sum + row.deal_count, 0) || 0,
        totalValue: summaryData?.reduce((sum, row) => sum + row.total_value, 0) || 0,
      };
    },
    enabled: !!pipelineId && !!organizationId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook para buscar os items de cada stage (lazy loading)
export function usePipelineStageItems(
  pipelineType: 'contact' | 'deal',
  stageId: string,
  enabled: boolean = true
) {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['pipeline-stage-items', pipelineType, stageId, organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      if (pipelineType === 'deal') {
        const { data, error } = await supabase
          .from('deals')
          .select(`
            *,
            company:companies(id, name),
            contacts:deal_contacts(
              contact:contacts(id, full_name, email)
            )
          `)
          .eq('organization_id', organizationId)
          .eq('stage_id', stageId)
          .eq('status', 'open')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data || [];
      } else {
        const { data, error } = await supabase
          .from('contact_pipeline_positions')
          .select(`
            *,
            contact:contact_orgs(
              *,
              contact:contacts(*)
            )
          `)
          .eq('stage_id', stageId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data?.map(item => item.contact) || [];
      }
    },
    enabled: enabled && !!stageId && !!organizationId,
    staleTime: 10 * 1000, // 10 seconds
  });
}

// Hook para refresh manual do pipeline summary
export function useRefreshPipelineSummary() {
  const queryClient = useQueryClient();
  
  return async () => {
    // Call the refresh function
    const { error } = await supabase.rpc('refresh_pipeline_summary');
    
    if (!error) {
      // Invalidate all pipeline queries
      queryClient.invalidateQueries({ queryKey: ['pipeline-data'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-stage-items'] });
    }
    
    return !error;
  };
}

// Hook para prefetch de dados do pipeline (melhora UX)
export function usePrefetchPipeline() {
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();
  
  return async (pipelineId: string) => {
    if (!organizationId) return;
    
    // Prefetch pipeline data
    await queryClient.prefetchQuery({
      queryKey: ['pipeline-data', pipelineId, organizationId],
      queryFn: async () => {
        const { data } = await supabase
          .from('pipeline_summary')
          .select('*')
          .eq('pipeline_id', pipelineId)
          .eq('organization_id', organizationId);
        return data;
      },
      staleTime: 30 * 1000,
    });
  };
}