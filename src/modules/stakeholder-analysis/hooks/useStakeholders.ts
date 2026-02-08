/**
 * useStakeholders - Hooks for stakeholder CRUD operations
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  Stakeholder,
  StakeholderWithRelations,
  StakeholderStats,
  RelatedStakeholder,
  InteractionWithCreator,
  CreateStakeholderInput,
  UpdateStakeholderInput,
  CreateRelationshipInput,
  CreateInteractionInput,
  StakeholderRelationship,
  StakeholderInteraction,
  ScoreHistoryPoint,
} from '../types/stakeholder.types';

// ============================================================================
// TYPES
// ============================================================================

export interface ClientOrganization {
  id: string;
  name: string;
  slug: string;
  type: 'master' | 'client';
}

export interface StakeholderWithOrg extends Stakeholder {
  organization?: {
    id: string;
    name: string;
  };
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const stakeholderKeys = {
  all: ['stakeholders'] as const,
  lists: () => [...stakeholderKeys.all, 'list'] as const,
  list: (orgId: string | string[]) => [...stakeholderKeys.lists(), orgId] as const,
  listAll: () => [...stakeholderKeys.lists(), 'all'] as const,
  details: () => [...stakeholderKeys.all, 'detail'] as const,
  detail: (id: string) => [...stakeholderKeys.details(), id] as const,
  relationships: (id: string) => [...stakeholderKeys.all, 'relationships', id] as const,
  interactions: (id: string) => [...stakeholderKeys.all, 'interactions', id] as const,
  scoreTrend: (id: string) => [...stakeholderKeys.all, 'score-trend', id] as const,
  stats: (orgId: string) => [...stakeholderKeys.all, 'stats', orgId] as const,
  statsAll: () => [...stakeholderKeys.all, 'stats', 'all'] as const,
  clients: () => ['client-organizations'] as const,
};

// ============================================================================
// FETCH CLIENT ORGANIZATIONS (for consultants only)
// ============================================================================

interface UseClientOrganizationsParams {
  /** Only enable this query for KOSMOS master users */
  enabled?: boolean;
}

export function useClientOrganizations({ enabled = true }: UseClientOrganizationsParams = {}) {
  return useQuery({
    queryKey: stakeholderKeys.clients(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, type')
        .eq('type', 'client')
        .order('name');

      if (error) throw error;
      return data as ClientOrganization[];
    },
    enabled, // Should only be enabled for KOSMOS master users
  });
}

// ============================================================================
// FETCH STAKEHOLDERS LIST (single org)
// ============================================================================

export function useStakeholders(organizationId: string) {
  return useQuery({
    queryKey: stakeholderKeys.list(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('organization_id', organizationId)
        .order('contribution_score', { ascending: false });

      if (error) throw error;
      return data as Stakeholder[];
    },
    enabled: !!organizationId,
  });
}

// ============================================================================
// FETCH ALL STAKEHOLDERS (for consultants - all clients)
// ============================================================================

interface UseAllStakeholdersParams {
  organizationIds?: string[];
  enabled?: boolean;
}

export function useAllStakeholders({ organizationIds, enabled = true }: UseAllStakeholdersParams = {}) {
  return useQuery({
    queryKey: stakeholderKeys.list(organizationIds || 'all'),
    queryFn: async () => {
      let query = supabase
        .from('stakeholders')
        .select(`
          *,
          organization:organizations!inner (
            id,
            name
          )
        `)
        .order('contribution_score', { ascending: false });

      // Filter by specific orgs if provided
      if (organizationIds && organizationIds.length > 0) {
        query = query.in('organization_id', organizationIds);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as StakeholderWithOrg[];
    },
    enabled,
  });
}

// ============================================================================
// FETCH ALL STAKEHOLDER STATS (aggregated across orgs)
// ============================================================================

export function useAllStakeholderStats(organizationIds?: string[]) {
  return useQuery({
    queryKey: stakeholderKeys.statsAll(),
    queryFn: async () => {
      let query = supabase
        .from('stakeholders')
        .select('*');

      if (organizationIds && organizationIds.length > 0) {
        query = query.in('organization_id', organizationIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate stats from raw data
      const stakeholders = data || [];
      const activeStakeholders = stakeholders.filter(s => s.status === 'active');

      return {
        total_stakeholders: stakeholders.length,
        active_stakeholders: activeStakeholders.length,
        investors_count: stakeholders.filter(s => s.stakeholder_type === 'investor').length,
        partners_count: stakeholders.filter(s => s.stakeholder_type === 'partner').length,
        advisors_count: stakeholders.filter(s => s.stakeholder_type === 'advisor').length,
        cofounders_count: stakeholders.filter(s => s.stakeholder_type === 'co_founder').length,
        total_investment: stakeholders.reduce((sum, s) => sum + (s.investment_amount || 0), 0),
        total_participation: stakeholders.reduce((sum, s) => sum + (s.participation_pct || 0), 0),
        avg_score: stakeholders.length > 0
          ? stakeholders.reduce((sum, s) => sum + s.contribution_score, 0) / stakeholders.length
          : 0,
      } as StakeholderStats;
    },
  });
}

// ============================================================================
// FETCH SINGLE STAKEHOLDER
// ============================================================================

export function useStakeholder(stakeholderId: string) {
  return useQuery({
    queryKey: stakeholderKeys.detail(stakeholderId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('id', stakeholderId)
        .single();

      if (error) throw error;
      return data as Stakeholder;
    },
    enabled: !!stakeholderId,
  });
}

// ============================================================================
// FETCH STAKEHOLDER WITH RELATIONS
// ============================================================================

export function useStakeholderWithRelations(stakeholderId: string) {
  return useQuery({
    queryKey: [...stakeholderKeys.detail(stakeholderId), 'full'],
    queryFn: async () => {
      // Fetch stakeholder
      const { data: stakeholder, error: stakeholderError } = await supabase
        .from('stakeholders')
        .select('*')
        .eq('id', stakeholderId)
        .single();

      if (stakeholderError) throw stakeholderError;

      // Fetch relationships and interactions in parallel
      const [relationshipsResult, interactionsResult] = await Promise.all([
        supabase
          .from('stakeholder_relationships')
          .select('*')
          .or(`stakeholder_a_id.eq.${stakeholderId},stakeholder_b_id.eq.${stakeholderId}`),
        supabase
          .from('stakeholder_interactions')
          .select('*')
          .eq('stakeholder_id', stakeholderId)
          .order('occurred_at', { ascending: false }),
      ]);

      if (relationshipsResult.error) throw relationshipsResult.error;
      if (interactionsResult.error) throw interactionsResult.error;

      return {
        ...stakeholder,
        relationships: relationshipsResult.data,
        interactions: interactionsResult.data,
        relationships_count: relationshipsResult.data.length,
        interactions_count: interactionsResult.data.length,
        last_interaction_at: interactionsResult.data[0]?.occurred_at || null,
      } as StakeholderWithRelations;
    },
    enabled: !!stakeholderId,
  });
}

// ============================================================================
// FETCH STAKEHOLDER RELATIONSHIPS (with related stakeholder info)
// ============================================================================

export function useStakeholderRelationships(stakeholderId: string) {
  return useQuery({
    queryKey: stakeholderKeys.relationships(stakeholderId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_stakeholder_relationships', {
        p_stakeholder_id: stakeholderId,
      });

      if (error) throw error;
      return data as RelatedStakeholder[];
    },
    enabled: !!stakeholderId,
  });
}

// ============================================================================
// FETCH STAKEHOLDER INTERACTIONS (with creator info)
// ============================================================================

export function useStakeholderInteractions(
  stakeholderId: string,
  limit: number = 50,
  offset: number = 0
) {
  return useQuery({
    queryKey: [...stakeholderKeys.interactions(stakeholderId), limit, offset],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_stakeholder_interactions', {
        p_stakeholder_id: stakeholderId,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;
      return data as InteractionWithCreator[];
    },
    enabled: !!stakeholderId,
  });
}

// ============================================================================
// FETCH ORGANIZATION STATS
// ============================================================================

export function useStakeholderStats(organizationId: string) {
  return useQuery({
    queryKey: stakeholderKeys.stats(organizationId),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_org_stakeholder_overview', {
        p_organization_id: organizationId,
      });

      if (error) throw error;
      return (data?.[0] || {
        total_stakeholders: 0,
        active_stakeholders: 0,
        investors_count: 0,
        partners_count: 0,
        advisors_count: 0,
        cofounders_count: 0,
        total_investment: 0,
        total_participation: 0,
        avg_score: 0,
      }) as StakeholderStats;
    },
    enabled: !!organizationId,
  });
}

// ============================================================================
// CREATE STAKEHOLDER
// ============================================================================

export function useCreateStakeholder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStakeholderInput) => {
      const { data, error } = await supabase
        .from('stakeholders')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as Stakeholder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.list(data.organization_id) });
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.stats(data.organization_id) });
    },
  });
}

// ============================================================================
// UPDATE STAKEHOLDER
// ============================================================================

export function useUpdateStakeholder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateStakeholderInput) => {
      const { data, error } = await supabase
        .from('stakeholders')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Stakeholder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.list(data.organization_id) });
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.stats(data.organization_id) });
    },
  });
}

// ============================================================================
// DELETE STAKEHOLDER
// ============================================================================

export function useDeleteStakeholder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, organizationId }: { id: string; organizationId: string }) => {
      const { error } = await supabase.from('stakeholders').delete().eq('id', id);

      if (error) throw error;
      return { id, organizationId };
    },
    onSuccess: ({ id, organizationId }) => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.list(organizationId) });
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.stats(organizationId) });
      queryClient.removeQueries({ queryKey: stakeholderKeys.detail(id) });
    },
  });
}

// ============================================================================
// CREATE RELATIONSHIP
// ============================================================================

export function useCreateRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRelationshipInput) => {
      // Ensure stakeholder_a_id < stakeholder_b_id (database constraint)
      const orderedInput = {
        ...input,
        stakeholder_a_id:
          input.stakeholder_a_id < input.stakeholder_b_id
            ? input.stakeholder_a_id
            : input.stakeholder_b_id,
        stakeholder_b_id:
          input.stakeholder_a_id < input.stakeholder_b_id
            ? input.stakeholder_b_id
            : input.stakeholder_a_id,
      };

      const { data, error } = await supabase
        .from('stakeholder_relationships')
        .insert(orderedInput)
        .select()
        .single();

      if (error) throw error;
      return data as StakeholderRelationship;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.relationships(data.stakeholder_a_id) });
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.relationships(data.stakeholder_b_id) });
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.detail(data.stakeholder_a_id) });
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.detail(data.stakeholder_b_id) });
    },
  });
}

// ============================================================================
// DELETE RELATIONSHIP
// ============================================================================

export function useDeleteRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      stakeholderAId,
      stakeholderBId,
    }: {
      id: string;
      stakeholderAId: string;
      stakeholderBId: string;
    }) => {
      const { error } = await supabase.from('stakeholder_relationships').delete().eq('id', id);

      if (error) throw error;
      return { id, stakeholderAId, stakeholderBId };
    },
    onSuccess: ({ stakeholderAId, stakeholderBId }) => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.relationships(stakeholderAId) });
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.relationships(stakeholderBId) });
    },
  });
}

// ============================================================================
// CREATE INTERACTION
// ============================================================================

export function useCreateInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateInteractionInput) => {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('stakeholder_interactions')
        .insert({
          ...input,
          created_by: userData.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as StakeholderInteraction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.interactions(data.stakeholder_id) });
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.detail(data.stakeholder_id) });
    },
  });
}

// ============================================================================
// DELETE INTERACTION
// ============================================================================

export function useDeleteInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stakeholderId }: { id: string; stakeholderId: string }) => {
      const { error } = await supabase.from('stakeholder_interactions').delete().eq('id', id);

      if (error) throw error;
      return { id, stakeholderId };
    },
    onSuccess: ({ stakeholderId }) => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.interactions(stakeholderId) });
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.detail(stakeholderId) });
    },
  });
}

// ============================================================================
// FETCH STAKEHOLDER SCORE TREND
// ============================================================================

export function useStakeholderScoreTrend(stakeholderId: string, months: number = 6) {
  return useQuery({
    queryKey: [...stakeholderKeys.scoreTrend(stakeholderId), months],
    queryFn: async () => {
      // Note: Function added in migration 20260209120000_stakeholder_score_calculation.sql
      // Regenerate types with `supabase gen types` after applying migration
      const { data, error } = await supabase.rpc(
        'get_stakeholder_score_trend' as 'get_org_stakeholder_overview',
        {
          p_stakeholder_id: stakeholderId,
          p_months: months,
        } as unknown as { p_organization_id: string }
      );

      if (error) throw error;
      return (data || []) as unknown as ScoreHistoryPoint[];
    },
    enabled: !!stakeholderId,
  });
}

// ============================================================================
// RECALCULATE STAKEHOLDER SCORE
// ============================================================================

export function useRecalculateScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stakeholderId: string) => {
      // Note: Function added in migration 20260209120000_stakeholder_score_calculation.sql
      // Regenerate types with `supabase gen types` after applying migration
      const { error } = await supabase.rpc(
        'update_stakeholder_score' as 'get_org_stakeholder_overview',
        {
          p_stakeholder_id: stakeholderId,
        } as unknown as { p_organization_id: string }
      );

      if (error) throw error;
      return stakeholderId;
    },
    onSuccess: (stakeholderId) => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.detail(stakeholderId) });
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.scoreTrend(stakeholderId) });
    },
  });
}

// ============================================================================
// DASHBOARD DATA HOOKS
// ============================================================================

export interface DashboardStats {
  totalStakeholders: number;
  activeStakeholders: number;
  avgScore: number;
  totalInvestment: number;
  byType: { type: string; count: number; label: string }[];
  byClient: { clientId: string; clientName: string; count: number; avgScore: number }[];
  topContributors: { id: string; name: string; score: number; type: string; clientName?: string }[];
  inactiveAlerts: { id: string; name: string; daysSinceInteraction: number; clientName?: string }[];
}

export function useStakeholderDashboard() {
  const { data: allStakeholders, isLoading: stakeholdersLoading } = useAllStakeholders();
  const { data: clientOrgs, isLoading: clientsLoading } = useClientOrganizations();

  const isLoading = stakeholdersLoading || clientsLoading;

  const dashboardData = useMemo((): DashboardStats | null => {
    if (!allStakeholders) return null;

    const active = allStakeholders.filter(s => s.status === 'active');
    const totalInvestment = allStakeholders.reduce((sum, s) => sum + (s.investment_amount || 0), 0);
    const avgScore = active.length > 0
      ? active.reduce((sum, s) => sum + s.contribution_score, 0) / active.length
      : 0;

    // Group by type
    const typeLabels: Record<string, string> = {
      investor: 'Investidor',
      partner: 'Parceiro',
      co_founder: 'Co-fundador',
      advisor: 'Advisor',
    };

    const typeCounts: Record<string, number> = {};
    allStakeholders.forEach(s => {
      typeCounts[s.stakeholder_type] = (typeCounts[s.stakeholder_type] || 0) + 1;
    });

    const byType = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      label: typeLabels[type] || type,
    }));

    // Group by client organization
    const clientMap = new Map(clientOrgs?.map(c => [c.id, c.name]) || []);
    const clientGroups: Record<string, { count: number; totalScore: number; name: string }> = {};

    allStakeholders.forEach(s => {
      const clientName = s.organization?.name || clientMap.get(s.organization_id) || 'Desconhecido';
      if (!clientGroups[s.organization_id]) {
        clientGroups[s.organization_id] = { count: 0, totalScore: 0, name: clientName };
      }
      clientGroups[s.organization_id].count += 1;
      clientGroups[s.organization_id].totalScore += s.contribution_score;
    });

    const byClient = Object.entries(clientGroups).map(([clientId, data]) => ({
      clientId,
      clientName: data.name,
      count: data.count,
      avgScore: data.count > 0 ? data.totalScore / data.count : 0,
    })).sort((a, b) => b.avgScore - a.avgScore);

    // Top 10 contributors
    const topContributors = [...allStakeholders]
      .sort((a, b) => b.contribution_score - a.contribution_score)
      .slice(0, 10)
      .map(s => ({
        id: s.id,
        name: s.full_name,
        score: s.contribution_score,
        type: s.stakeholder_type,
        clientName: s.organization?.name || clientMap.get(s.organization_id),
      }));

    // Inactive alerts (no interaction in 60+ days)
    const inactiveAlerts = allStakeholders
      .filter(s => {
        const decay = s.score_breakdown?.decay;
        return decay && typeof decay === 'object' && 'days_since_interaction' in decay &&
               (decay as { days_since_interaction: number }).days_since_interaction > 60;
      })
      .slice(0, 5)
      .map(s => ({
        id: s.id,
        name: s.full_name,
        daysSinceInteraction: ((s.score_breakdown?.decay as { days_since_interaction?: number })?.days_since_interaction) || 0,
        clientName: s.organization?.name || clientMap.get(s.organization_id),
      }));

    return {
      totalStakeholders: allStakeholders.length,
      activeStakeholders: active.length,
      avgScore,
      totalInvestment,
      byType,
      byClient,
      topContributors,
      inactiveAlerts,
    };
  }, [allStakeholders, clientOrgs]);

  return { data: dashboardData, isLoading };
}
