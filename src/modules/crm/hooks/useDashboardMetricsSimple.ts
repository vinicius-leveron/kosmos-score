import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';

// Hook simplificado para métricas do dashboard (sem views)
export function useDashboardMetrics() {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['dashboard-metrics-simple', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      // Buscar métricas em paralelo
      const [
        contactsTotal,
        contactsMonth,
        dealsOpen,
        dealsMonth,
        dealsWonMonth,
        pipelineValue,
        tasksData,
      ] = await Promise.all([
        // Total de contatos
        supabase
          .from('contact_orgs')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
        
        // Contatos do mês
        supabase
          .from('contact_orgs')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('created_at', monthStart),
        
        // Deals abertos
        supabase
          .from('deals')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', 'open'),
        
        // Deals criados no mês
        supabase
          .from('deals')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('created_at', monthStart),
        
        // Deals ganhos no mês
        supabase
          .from('deals')
          .select('amount')
          .eq('organization_id', organizationId)
          .eq('status', 'won')
          .gte('closed_at', monthStart),
        
        // Valor total do pipeline
        supabase
          .from('deals')
          .select('amount')
          .eq('organization_id', organizationId)
          .eq('status', 'open'),
        
        // Tarefas
        supabase
          .from('crm_tasks')
          .select('status, completed_at')
          .eq('organization_id', organizationId),
      ]);
      
      // Calcular métricas
      const revenue_month = dealsWonMonth.data?.reduce((sum, deal) => sum + (deal.amount || 0), 0) || 0;
      const pipeline_value = pipelineValue.data?.reduce((sum, deal) => sum + (deal.amount || 0), 0) || 0;
      
      const tasks_pending = tasksData.data?.filter(t => t.status === 'pending').length || 0;
      const tasks_overdue = tasksData.data?.filter(t => t.status === 'overdue').length || 0;
      const tasks_completed_today = tasksData.data?.filter(
        t => t.completed_at && new Date(t.completed_at) >= new Date(todayStart)
      ).length || 0;
      
      const win_rate_month = dealsWonMonth.data?.length && dealsMonth.count
        ? (dealsWonMonth.data.length / dealsMonth.count) * 100
        : 0;
      
      return {
        contacts_today: 0, // TODO: implementar
        contacts_week: 0, // TODO: implementar
        contacts_month: contactsMonth.count || 0,
        contacts_total: contactsTotal.count || 0,
        avg_contact_score: 0, // TODO: implementar
        deals_created_today: 0, // TODO: implementar
        deals_created_week: 0, // TODO: implementar
        deals_created_month: dealsMonth.count || 0,
        deals_open: dealsOpen.count || 0,
        deals_won_month: dealsWonMonth.data?.length || 0,
        deals_lost_month: 0, // TODO: implementar
        pipeline_value,
        revenue_month,
        avg_sales_cycle_days: 0, // TODO: implementar
        tasks_pending,
        tasks_overdue,
        tasks_completed_today,
        tasks_completed_week: 0, // TODO: implementar
        win_rate_month,
        lead_to_deal_rate: 0, // TODO: implementar
      };
    },
    enabled: !!organizationId,
    staleTime: 60 * 1000, // 1 minute
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook para funil AIOS simplificado
export function useAIOSFunnelMetrics() {
  const { organizationId } = useOrganization();
  
  return useQuery({
    queryKey: ['aios-funnel-simple', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const [contacts, activities, dealsOpen, dealsWon] = await Promise.all([
        supabase
          .from('contact_orgs')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('created_at', monthAgo),
        
        supabase
          .from('crm_activities')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .gte('created_at', monthAgo),
        
        supabase
          .from('deals')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', 'open'),
        
        supabase
          .from('deals')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', 'won')
          .gte('closed_at', monthAgo),
      ]);
      
      return {
        acquisition: contacts.count || 0,
        interaction: activities.count || 0,
        opportunity: dealsOpen.count || 0,
        sales: dealsWon.count || 0,
        acquisitionToInteraction: 0,
        interactionToOpportunity: 0,
        opportunityToSales: 0,
      };
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
  });
}

// Export stubs para compatibilidade
export function useTopPerformers() {
  return { data: null, isLoading: false };
}

export function usePipelineByStage() {
  return { data: [], isLoading: false };
}