/**
 * useStakeholders - Hooks for stakeholder CRUD operations
 */

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
} from '../types/stakeholder.types';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const stakeholderKeys = {
  all: ['stakeholders'] as const,
  lists: () => [...stakeholderKeys.all, 'list'] as const,
  list: (orgId: string) => [...stakeholderKeys.lists(), orgId] as const,
  details: () => [...stakeholderKeys.all, 'detail'] as const,
  detail: (id: string) => [...stakeholderKeys.details(), id] as const,
  relationships: (id: string) => [...stakeholderKeys.all, 'relationships', id] as const,
  interactions: (id: string) => [...stakeholderKeys.all, 'interactions', id] as const,
  stats: (orgId: string) => [...stakeholderKeys.all, 'stats', orgId] as const,
};

// ============================================================================
// FETCH STAKEHOLDERS LIST
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
        .update(updates)
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
