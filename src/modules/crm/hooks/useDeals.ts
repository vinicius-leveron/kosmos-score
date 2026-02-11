import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  Deal,
  DealListItem,
  DealFilters,
  DealFormData,
  DealBoardData,
  DealBoardColumn,
  DealBoardCard,
  DealWithRelations,
  DealActivity,
  PaginationParams,
  PaginatedResult,
} from '../types';

const DEFAULT_PER_PAGE = 20;

interface UseDealsParams {
  organizationId?: string;
  filters?: DealFilters;
  pagination?: PaginationParams;
}

export function useDeals({
  organizationId,
  filters = {},
  pagination = { page: 1, per_page: DEFAULT_PER_PAGE },
}: UseDealsParams = {}) {
  return useQuery({
    queryKey: ['deals', organizationId, filters, pagination],
    queryFn: async (): Promise<PaginatedResult<DealListItem>> => {
      if (!organizationId) {
        return {
          data: [],
          total: 0,
          page: pagination.page,
          per_page: pagination.per_page,
          total_pages: 0,
        };
      }
      
      let query = supabase
        .from('deals')
        .select(`
          *,
          companies (
            id,
            name,
            domain,
            logo_url
          ),
          pipeline_stages (
            id,
            name,
            display_name,
            color
          ),
          pipelines (
            id,
            name,
            display_name
          )
        `, { count: 'exact' })
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.pipeline_id) {
        query = query.eq('pipeline_id', filters.pipeline_id);
      }

      if (filters.stage_id) {
        query = query.eq('stage_id', filters.stage_id);
      }

      if (filters.company_id) {
        query = query.eq('company_id', filters.company_id);
      }

      if (filters.owner_id) {
        query = query.eq('owner_id', filters.owner_id);
      }

      if (filters.amount_min !== undefined) {
        query = query.gte('amount', filters.amount_min);
      }

      if (filters.amount_max !== undefined) {
        query = query.lte('amount', filters.amount_max);
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Apply sorting and pagination
      query = query.order('created_at', { ascending: false });

      const from = (pagination.page - 1) * pagination.per_page;
      const to = from + pagination.per_page - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const items: DealListItem[] = (data || []).map((deal: any) => ({
        id: deal.id,
        name: deal.name,
        amount: deal.amount,
        currency: deal.currency,
        probability: deal.probability,
        expected_revenue: deal.expected_revenue,
        expected_close_date: deal.expected_close_date,
        status: deal.status,
        company_id: deal.company_id,
        company_name: deal.companies?.name || null,
        company_domain: deal.companies?.domain || null,
        company_logo_url: deal.companies?.logo_url || null,
        pipeline_id: deal.pipeline_id,
        pipeline_name: deal.pipelines?.display_name || null,
        stage_id: deal.stage_id,
        stage_name: deal.pipeline_stages?.display_name || null,
        stage_color: deal.pipeline_stages?.color || null,
        owner_id: deal.owner_id,
        created_at: deal.created_at,
        updated_at: deal.updated_at,
      }));

      return {
        data: items,
        total: count || 0,
        page: pagination.page,
        per_page: pagination.per_page,
        total_pages: Math.ceil((count || 0) / pagination.per_page),
      };
    },
    staleTime: 30 * 1000,
  });
}

export function useDealBoard(pipelineId: string, organizationId: string | null) {
  return useQuery({
    queryKey: ['deal-board', pipelineId, organizationId],
    queryFn: async (): Promise<DealBoardData> => {
      if (!organizationId) {
        return {
          pipeline_id: pipelineId,
          pipeline_name: '',
          columns: [],
          total_value: 0,
          total_deals: 0,
        };
      }
      
      // Get pipeline stages
      const { data: stages, error: stagesError } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('position', { ascending: true });

      if (stagesError) throw stagesError;

      // Get deals for this pipeline
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select(`
          id,
          name,
          amount,
          currency,
          probability,
          expected_revenue,
          expected_close_date,
          status,
          stage_id,
          entered_stage_at,
          companies (
            id,
            name,
            domain,
            logo_url
          ),
          contact_orgs:primary_contact_id (
            id,
            contacts (
              id,
              email,
              full_name
            )
          )
        `)
        .eq('pipeline_id', pipelineId)
        .eq('organization_id', organizationId)
        .eq('status', 'open');

      if (dealsError) throw dealsError;

      // Build columns
      const columns: DealBoardColumn[] = (stages || []).map((stage: any) => {
        const stageDeals = (deals || []).filter((d: any) => d.stage_id === stage.id);

        const cards: DealBoardCard[] = stageDeals.map((deal: any) => ({
          id: deal.id,
          name: deal.name,
          amount: deal.amount,
          currency: deal.currency,
          probability: deal.probability,
          expected_revenue: deal.expected_revenue,
          expected_close_date: deal.expected_close_date,
          company_id: deal.companies?.id || null,
          company_name: deal.companies?.name || null,
          company_logo_url: deal.companies?.logo_url || null,
          primary_contact_name: deal.contact_orgs?.contacts?.full_name || null,
          primary_contact_email: deal.contact_orgs?.contacts?.email || null,
          stage_id: deal.stage_id,
          entered_stage_at: deal.entered_stage_at,
        }));

        return {
          id: stage.id,
          name: stage.name,
          display_name: stage.display_name,
          color: stage.color,
          position: stage.position,
          is_entry_stage: stage.is_entry_stage,
          is_exit_stage: stage.is_exit_stage,
          exit_type: stage.exit_type,
          deals: cards,
          total_value: cards.reduce((sum, c) => sum + (c.amount || 0), 0),
          count: cards.length,
        };
      });

      return {
        pipeline_id: pipelineId,
        columns,
        total_deals: deals?.length || 0,
        total_value: (deals || []).reduce((sum: number, d: any) => sum + (d.amount || 0), 0),
      };
    },
    enabled: !!pipelineId,
    staleTime: 15 * 1000,
  });
}

export function useDealDetail(dealId: string) {
  return useQuery({
    queryKey: ['deal-detail', dealId],
    queryFn: async (): Promise<DealWithRelations> => {
      const { data: deal, error } = await supabase
        .from('deals')
        .select(`
          *,
          companies (
            id,
            name,
            domain,
            website,
            industry,
            size,
            status,
            logo_url
          ),
          pipelines (
            id,
            name,
            display_name
          ),
          pipeline_stages (
            id,
            name,
            display_name,
            color,
            position
          )
        `)
        .eq('id', dealId)
        .single();

      if (error) throw error;

      // Get contacts
      const { data: contacts } = await supabase
        .from('deal_contacts')
        .select(`
          id,
          role,
          is_primary,
          contact_orgs (
            id,
            score,
            contacts (
              id,
              email,
              full_name,
              phone
            )
          )
        `)
        .eq('deal_id', dealId);

      // Get activities
      const { data: activities } = await supabase
        .from('deal_activities')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })
        .limit(50);

      return {
        ...deal,
        company: deal.companies,
        pipeline: deal.pipelines,
        stage: deal.pipeline_stages,
        contacts: (contacts || []).map((dc: any) => ({
          id: dc.id,
          deal_id: dealId,
          contact_org_id: dc.contact_orgs.id,
          role: dc.role,
          is_primary: dc.is_primary,
          contact: {
            id: dc.contact_orgs.contacts.id,
            email: dc.contact_orgs.contacts.email,
            full_name: dc.contact_orgs.contacts.full_name,
            phone: dc.contact_orgs.contacts.phone,
            score: dc.contact_orgs.score,
          },
        })),
        activities: activities || [],
      };
    },
    enabled: !!dealId,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      organizationId = KOSMOS_ORG_ID,
    }: {
      data: DealFormData;
      organizationId?: string;
    }) => {
      const { data: deal, error } = await supabase
        .from('deals')
        .insert({
          organization_id: organizationId,
          name: data.name,
          description: data.description || null,
          amount: data.amount || null,
          currency: data.currency || 'BRL',
          probability: data.probability || null,
          expected_close_date: data.expected_close_date || null,
          status: 'open',
          company_id: data.company_id,
          primary_contact_id: data.primary_contact_id || null,
          owner_id: data.owner_id || null,
          pipeline_id: data.pipeline_id || null,
          stage_id: data.stage_id || null,
          source: data.source || null,
          source_detail: data.source_detail || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Link primary contact if provided
      if (data.primary_contact_id) {
        await supabase
          .from('deal_contacts')
          .insert({
            deal_id: deal.id,
            contact_org_id: data.primary_contact_id,
            is_primary: true,
          });
      }

      return deal;
    },
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-board', data.pipeline_id] });
      if (data.company_id) {
        queryClient.invalidateQueries({ queryKey: ['company-detail', data.company_id] });
      }
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      data,
    }: {
      dealId: string;
      data: Partial<DealFormData>;
    }) => {
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.amount !== undefined) updateData.amount = data.amount || null;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.probability !== undefined) updateData.probability = data.probability || null;
      if (data.expected_close_date !== undefined) updateData.expected_close_date = data.expected_close_date || null;
      if (data.company_id !== undefined) updateData.company_id = data.company_id;
      if (data.primary_contact_id !== undefined) updateData.primary_contact_id = data.primary_contact_id || null;
      if (data.owner_id !== undefined) updateData.owner_id = data.owner_id || null;
      if (data.pipeline_id !== undefined) updateData.pipeline_id = data.pipeline_id || null;
      if (data.stage_id !== undefined) updateData.stage_id = data.stage_id || null;

      const { data: deal, error } = await supabase
        .from('deals')
        .update(updateData)
        .eq('id', dealId)
        .select()
        .single();

      if (error) throw error;
      return deal;
    },
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-detail', deal.id] });
      if (deal.pipeline_id) {
        queryClient.invalidateQueries({ queryKey: ['deal-board', deal.pipeline_id] });
      }
    },
  });
}

export function useMoveDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      stageId,
      pipelineId,
    }: {
      dealId: string;
      stageId: string;
      pipelineId?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        stage_id: stageId,
        entered_stage_at: new Date().toISOString(),
      };

      if (pipelineId) {
        updateData.pipeline_id = pipelineId;
        updateData.entered_pipeline_at = new Date().toISOString();
      }

      const { data: deal, error } = await supabase
        .from('deals')
        .update(updateData)
        .eq('id', dealId)
        .select()
        .single();

      if (error) throw error;
      return deal;
    },
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-detail', deal.id] });
      queryClient.invalidateQueries({ queryKey: ['deal-board'] });
    },
  });
}

export function useCloseDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      status,
      closeReason,
      actualCloseDate,
    }: {
      dealId: string;
      status: 'won' | 'lost' | 'abandoned';
      closeReason?: string;
      actualCloseDate?: string;
    }) => {
      const { data: deal, error } = await supabase
        .from('deals')
        .update({
          status,
          close_reason: closeReason || null,
          actual_close_date: actualCloseDate || new Date().toISOString(),
        })
        .eq('id', dealId)
        .select()
        .single();

      if (error) throw error;
      return deal;
    },
    onSuccess: (deal) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal-detail', deal.id] });
      queryClient.invalidateQueries({ queryKey: ['deal-board'] });
      if (deal.company_id) {
        queryClient.invalidateQueries({ queryKey: ['company-detail', deal.company_id] });
      }
    },
  });
}

export function useAddDealContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      contactOrgId,
      role,
      isPrimary = false,
    }: {
      dealId: string;
      contactOrgId: string;
      role?: string;
      isPrimary?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('deal_contacts')
        .upsert({
          deal_id: dealId,
          contact_org_id: contactOrgId,
          role: role || null,
          is_primary: isPrimary,
        }, { onConflict: 'deal_id,contact_org_id' })
        .select()
        .single();

      if (error) throw error;

      // If marking as primary, update the deal's primary_contact_id
      if (isPrimary) {
        await supabase
          .from('deals')
          .update({ primary_contact_id: contactOrgId })
          .eq('id', dealId);
      }

      return data;
    },
    onSuccess: (_, { dealId }) => {
      queryClient.invalidateQueries({ queryKey: ['deal-detail', dealId] });
    },
  });
}

export function useRemoveDealContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      contactOrgId,
    }: {
      dealId: string;
      contactOrgId: string;
    }) => {
      const { error } = await supabase
        .from('deal_contacts')
        .delete()
        .eq('deal_id', dealId)
        .eq('contact_org_id', contactOrgId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, { dealId }) => {
      queryClient.invalidateQueries({ queryKey: ['deal-detail', dealId] });
    },
  });
}

export function useAddDealActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      data,
    }: {
      dealId: string;
      data: {
        type: DealActivity['type'];
        title: string;
        description?: string;
        metadata?: Record<string, unknown>;
      };
    }) => {
      const { data: activity, error } = await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          type: data.type,
          title: data.title,
          description: data.description || null,
          metadata: data.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return activity;
    },
    onSuccess: (_, { dealId }) => {
      queryClient.invalidateQueries({ queryKey: ['deal-detail', dealId] });
    },
  });
}

export function useDealActivities(dealId: string, limit = 20) {
  return useQuery({
    queryKey: ['deal-activities', dealId, limit],
    queryFn: async (): Promise<DealActivity[]> => {
      const { data, error } = await supabase
        .from('deal_activities')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!dealId,
  });
}
