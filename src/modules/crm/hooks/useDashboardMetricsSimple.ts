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

// Hook para receita por mês (últimos 6 meses)
export function useRevenueTimeline(organizationId?: string) {
  const { organizationId: authOrgId } = useOrganization();
  const orgId = organizationId || authOrgId;

  return useQuery({
    queryKey: ['dashboard', 'revenue-timeline', orgId],
    queryFn: async () => {
      if (!orgId) return [];

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data, error } = await supabase
        .from('deals')
        .select('amount, closed_at')
        .eq('organization_id', orgId)
        .eq('status', 'won')
        .gte('closed_at', sixMonthsAgo.toISOString())
        .order('closed_at', { ascending: true });

      if (error) throw error;

      // Agrupar por mês
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthlyData: Record<string, { revenue: number; deals: number }> = {};

      // Inicializar últimos 6 meses
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyData[key] = { revenue: 0, deals: 0 };
      }

      // Preencher com dados reais
      (data || []).forEach((deal) => {
        if (deal.closed_at) {
          const date = new Date(deal.closed_at);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          if (monthlyData[key]) {
            monthlyData[key].revenue += deal.amount || 0;
            monthlyData[key].deals += 1;
          }
        }
      });

      // Converter para array no formato esperado
      return Object.entries(monthlyData).map(([key, value]) => {
        const [, month] = key.split('-').map(Number);
        return {
          month: monthNames[month],
          revenue: value.revenue,
          deals: value.deals,
        };
      });
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
}

// Hook para estatísticas do pipeline por estágio
export function usePipelineStats(pipelineId?: string) {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ['dashboard', 'pipeline-stats', organizationId, pipelineId],
    queryFn: async () => {
      if (!organizationId) return [];

      // Buscar deals abertos com info do estágio
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('stage_id, amount, pipeline_stages!inner(id, name, display_name, color, position)')
        .eq('organization_id', organizationId)
        .eq('status', 'open');

      if (dealsError) throw dealsError;

      // Agrupar deals por estágio
      const stageStats: Record<string, { name: string; displayName: string; count: number; value: number; color: string; position: number }> = {};

      (deals || []).forEach((deal: any) => {
        const stageId = deal.stage_id;
        const stage = deal.pipeline_stages;
        if (stage) {
          if (!stageStats[stageId]) {
            stageStats[stageId] = {
              name: stage.name,
              displayName: stage.display_name || stage.name,
              count: 0,
              value: 0,
              color: stage.color || '#64748B',
              position: stage.position,
            };
          }
          stageStats[stageId].count += 1;
          stageStats[stageId].value += deal.amount || 0;
        }
      });

      // Converter para array e ordenar por position
      return Object.values(stageStats).sort((a, b) => a.position - b.position);
    },
    enabled: !!organizationId,
    staleTime: 60 * 1000,
  });
}

// Hook para top deals por valor
export function useTopDeals(organizationId?: string, limit = 5) {
  const { organizationId: authOrgId } = useOrganization();
  const orgId = organizationId || authOrgId;

  return useQuery({
    queryKey: ['dashboard', 'top-deals', orgId, limit],
    queryFn: async () => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from('deals')
        .select(`
          id,
          name,
          amount,
          probability,
          entered_stage_at,
          companies!inner(name),
          pipeline_stages(name, display_name, color)
        `)
        .eq('organization_id', orgId)
        .eq('status', 'open')
        .not('amount', 'is', null)
        .order('amount', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((deal: any) => {
        const daysInStage = Math.floor(
          (Date.now() - new Date(deal.entered_stage_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: deal.id,
          title: deal.name,
          company: deal.companies?.name || 'Sem empresa',
          amount: deal.amount || 0,
          stage: deal.pipeline_stages?.display_name || deal.pipeline_stages?.name || 'Sem estagio',
          stageColor: deal.pipeline_stages?.color || '#64748B',
          probability: deal.probability || 0,
          daysInStage,
        };
      });
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
}

// Hook para performance da equipe
export function useTeamPerformance(organizationId?: string) {
  const { organizationId: authOrgId } = useOrganization();
  const orgId = organizationId || authOrgId;

  return useQuery({
    queryKey: ['dashboard', 'team-performance', orgId],
    queryFn: async () => {
      if (!orgId) return [];

      // Buscar deals fechados (won) com owner
      const { data: wonDeals, error: wonError } = await supabase
        .from('deals')
        .select('owner_id, amount, profiles!inner(full_name)')
        .eq('organization_id', orgId)
        .eq('status', 'won')
        .not('owner_id', 'is', null);

      if (wonError) throw wonError;

      // Buscar total de deals por owner (para calcular win rate)
      const { data: allDeals, error: allError } = await supabase
        .from('deals')
        .select('owner_id, status')
        .eq('organization_id', orgId)
        .not('owner_id', 'is', null)
        .in('status', ['won', 'lost']);

      if (allError) throw allError;

      // Agrupar por vendedor
      const teamStats: Record<string, { name: string; deals: number; revenue: number; totalDeals: number }> = {};

      (wonDeals || []).forEach((deal: any) => {
        const ownerId = deal.owner_id;
        const ownerName = deal.profiles?.full_name || 'Desconhecido';

        if (!teamStats[ownerId]) {
          teamStats[ownerId] = { name: ownerName, deals: 0, revenue: 0, totalDeals: 0 };
        }
        teamStats[ownerId].deals += 1;
        teamStats[ownerId].revenue += deal.amount || 0;
      });

      // Contar total de deals para win rate
      (allDeals || []).forEach((deal: any) => {
        const ownerId = deal.owner_id;
        if (teamStats[ownerId]) {
          teamStats[ownerId].totalDeals += 1;
        }
      });

      // Converter e calcular win rate
      return Object.values(teamStats)
        .map((member) => ({
          name: member.name,
          deals: member.deals,
          revenue: member.revenue,
          winRate: member.totalDeals > 0 ? Math.round((member.deals / member.totalDeals) * 100) : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue);
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
}

// Hook para atividades recentes
export function useRecentActivities(organizationId?: string, limit = 10) {
  const { organizationId: authOrgId } = useOrganization();
  const orgId = organizationId || authOrgId;

  return useQuery({
    queryKey: ['dashboard', 'recent-activities', orgId, limit],
    queryFn: async () => {
      if (!orgId) return [];

      const { data, error } = await supabase
        .from('deal_activities')
        .select(`
          id,
          type,
          title,
          description,
          created_at,
          deals!inner(
            name,
            organization_id,
            companies(name)
          )
        `)
        .eq('deals.organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        contactName: activity.deals?.companies?.name || activity.deals?.name || '',
        contactEmail: '',
        created_at: activity.created_at,
      }));
    },
    enabled: !!orgId,
    staleTime: 30 * 1000,
  });
}

// Export stubs para compatibilidade
export function useTopPerformers() {
  return { data: null, isLoading: false };
}

export function usePipelineByStage() {
  return { data: [], isLoading: false };
}