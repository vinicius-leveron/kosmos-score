import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';

export interface DashboardMetrics {
  // Contact metrics
  contacts_today: number;
  contacts_week: number;
  contacts_month: number;
  contacts_total: number;
  avg_contact_score: number;
  
  // Deal metrics
  deals_created_today: number;
  deals_created_week: number;
  deals_created_month: number;
  deals_open: number;
  deals_won_month: number;
  deals_lost_month: number;
  pipeline_value: number;
  revenue_month: number;
  avg_sales_cycle_days: number;
  
  // Task metrics
  tasks_pending: number;
  tasks_overdue: number;
  tasks_completed_today: number;
  tasks_completed_week: number;
  
  // Conversion rates
  win_rate_month: number;
  lead_to_deal_rate: number;
}

// Hook principal para métricas do dashboard
export function useDashboardMetrics() {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['dashboard-metrics', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      // Get metrics from the view
      const { data, error } = await supabase
        .from('crm_dashboard_metrics')
        .select('*')
        .eq('organization_id', organizationId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Return default values if no data
      return (data as DashboardMetrics) || {
        contacts_today: 0,
        contacts_week: 0,
        contacts_month: 0,
        contacts_total: 0,
        avg_contact_score: 0,
        deals_created_today: 0,
        deals_created_week: 0,
        deals_created_month: 0,
        deals_open: 0,
        deals_won_month: 0,
        deals_lost_month: 0,
        pipeline_value: 0,
        revenue_month: 0,
        avg_sales_cycle_days: 0,
        tasks_pending: 0,
        tasks_overdue: 0,
        tasks_completed_today: 0,
        tasks_completed_week: 0,
        win_rate_month: 0,
        lead_to_deal_rate: 0,
      };
    },
    enabled: !!organizationId,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// Hook para métricas de funil AIOS
export function useAIOSFunnelMetrics() {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['aios-funnel', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      // Get funnel data for AIOS structure
      const [
        acquisitionData,
        interactionData,
        opportunityData,
        salesData,
      ] = await Promise.all([
        // Acquisition: New leads
        supabase
          .from('contact_orgs')
          .select('source', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Interaction: Engaged contacts
        supabase
          .from('crm_activities')
          .select('contact_org_id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Opportunity: Active deals
        supabase
          .from('deals')
          .select('status', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', 'open'),
        
        // Sales: Closed won
        supabase
          .from('deals')
          .select('status', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', 'won')
          .gte('closed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);
      
      return {
        acquisition: acquisitionData.count || 0,
        interaction: interactionData.count || 0,
        opportunity: opportunityData.count || 0,
        sales: salesData.count || 0,
        // Conversion rates
        acquisitionToInteraction: acquisitionData.count 
          ? ((interactionData.count || 0) / acquisitionData.count) * 100 
          : 0,
        interactionToOpportunity: interactionData.count 
          ? ((opportunityData.count || 0) / (interactionData.count || 1)) * 100 
          : 0,
        opportunityToSales: opportunityData.count 
          ? ((salesData.count || 0) / opportunityData.count) * 100 
          : 0,
      };
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook para top performers
export function useTopPerformers() {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['top-performers', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      // Get top performing sales reps
      const { data, error } = await supabase
        .from('deals')
        .select(`
          owner_id,
          amount,
          status,
          owner:owner_id(id, full_name, email)
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'won')
        .gte('closed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      
      // Aggregate by owner
      const performersMap = new Map();
      
      (data || []).forEach(deal => {
        if (!deal.owner_id) return;
        
        const existing = performersMap.get(deal.owner_id) || {
          id: deal.owner_id,
          name: deal.owner?.full_name || deal.owner?.email || 'Unknown',
          deals_won: 0,
          total_revenue: 0,
        };
        
        existing.deals_won += 1;
        existing.total_revenue += deal.amount || 0;
        
        performersMap.set(deal.owner_id, existing);
      });
      
      // Sort by revenue and return top 5
      return Array.from(performersMap.values())
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5);
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook para pipeline por estágio
export function usePipelineByStage() {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['pipeline-by-stage', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('pipeline_summary')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('pipeline_type', 'deal')
        .order('stage_position');
      
      if (error) throw error;
      
      return (data || []).map(stage => ({
        stage: stage.stage_name,
        color: stage.stage_color,
        deals: stage.deal_count,
        value: stage.total_value,
        probability: stage.avg_probability,
      }));
    },
    enabled: !!organizationId,
    staleTime: 60 * 1000, // 1 minute
  });
}