import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  Company,
  CompanyListItem,
  CompanyFilters,
  CompanyFormData,
  CompanyWithStats,
  ContactCompanyInfo,
  PaginationParams,
  PaginatedResult,
} from '../types';

const DEFAULT_PER_PAGE = 20;

interface UseCompaniesParams {
  organizationId?: string;
  filters?: CompanyFilters;
  pagination?: PaginationParams;
}

export function useCompanies({
  organizationId,
  filters = {},
  pagination = { page: 1, per_page: DEFAULT_PER_PAGE },
}: UseCompaniesParams = {}) {
  return useQuery({
    queryKey: ['companies', organizationId, filters, pagination],
    queryFn: async (): Promise<PaginatedResult<CompanyListItem>> => {
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
        .from('companies')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.size) {
        query = query.eq('size', filters.size);
      }

      if (filters.industry) {
        query = query.ilike('industry', `%${filters.industry}%`);
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,domain.ilike.%${filters.search}%`
        );
      }

      if (filters.owner_id) {
        query = query.eq('owner_id', filters.owner_id);
      }

      // Apply sorting and pagination
      query = query.order('created_at', { ascending: false });

      const from = (pagination.page - 1) * pagination.per_page;
      const to = from + pagination.per_page - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Get contact counts for each company
      const companyIds = (data || []).map((c: Company) => c.id);

      const { data: contactCounts } = await supabase
        .from('contact_companies')
        .select('company_id')
        .in('company_id', companyIds)
        .eq('is_active', true);

      const countsMap = new Map<string, number>();
      contactCounts?.forEach((cc: { company_id: string }) => {
        countsMap.set(cc.company_id, (countsMap.get(cc.company_id) || 0) + 1);
      });

      // Get deal stats for each company
      const { data: dealStats } = await supabase
        .from('deals')
        .select('company_id, status, amount')
        .in('company_id', companyIds);

      const dealsMap = new Map<string, { open: number; won: number; total_value: number }>();
      dealStats?.forEach((d: { company_id: string; status: string; amount: number | null }) => {
        const existing = dealsMap.get(d.company_id) || { open: 0, won: 0, total_value: 0 };
        if (d.status === 'open') existing.open++;
        if (d.status === 'won') {
          existing.won++;
          existing.total_value += d.amount || 0;
        }
        dealsMap.set(d.company_id, existing);
      });

      const items: CompanyListItem[] = (data || []).map((company: Company) => ({
        ...company,
        contact_count: countsMap.get(company.id) || 0,
        open_deals_count: dealsMap.get(company.id)?.open || 0,
        won_deals_count: dealsMap.get(company.id)?.won || 0,
        total_deals_value: dealsMap.get(company.id)?.total_value || 0,
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

export function useCompanyDetail(companyId: string) {
  return useQuery({
    queryKey: ['company-detail', companyId],
    queryFn: async (): Promise<CompanyWithStats> => {
      const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) throw error;

      // Get contacts
      const { data: contactsData } = await supabase
        .from('contact_companies')
        .select(`
          id,
          title,
          role,
          is_primary,
          is_active,
          started_at,
          contact_orgs!inner (
            id,
            score,
            contacts!inner (
              id,
              email,
              full_name,
              phone
            )
          )
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);

      const contacts: ContactCompanyInfo[] = (contactsData || []).map((cc: any) => ({
        contact_company_id: cc.id,
        contact_org_id: cc.contact_orgs.id,
        contact_id: cc.contact_orgs.contacts.id,
        email: cc.contact_orgs.contacts.email,
        full_name: cc.contact_orgs.contacts.full_name,
        phone: cc.contact_orgs.contacts.phone,
        title: cc.title,
        role: cc.role,
        is_primary: cc.is_primary,
        score: cc.contact_orgs.score,
      }));

      // Get deal stats
      const { data: deals } = await supabase
        .from('deals')
        .select('id, status, amount')
        .eq('company_id', companyId);

      const stats = {
        total_deals: deals?.length || 0,
        open_deals: deals?.filter((d: any) => d.status === 'open').length || 0,
        won_deals: deals?.filter((d: any) => d.status === 'won').length || 0,
        lost_deals: deals?.filter((d: any) => d.status === 'lost').length || 0,
        total_revenue: deals
          ?.filter((d: any) => d.status === 'won')
          .reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0,
        pipeline_value: deals
          ?.filter((d: any) => d.status === 'open')
          .reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0,
      };

      return {
        ...company,
        contacts,
        stats,
      };
    },
    enabled: !!companyId,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      organizationId = KOSMOS_ORG_ID,
    }: {
      data: CompanyFormData;
      organizationId?: string;
    }) => {
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          organization_id: organizationId,
          name: data.name,
          domain: data.domain?.toLowerCase().trim() || null,
          website: data.website || null,
          industry: data.industry || null,
          size: data.size || null,
          employee_count: data.employee_count || null,
          annual_revenue: data.annual_revenue || null,
          status: data.status || 'prospect',
          owner_id: data.owner_id || null,
          linkedin_url: data.linkedin_url || null,
          address_line1: data.address_line1 || null,
          address_line2: data.address_line2 || null,
          address_city: data.address_city || null,
          address_state: data.address_state || null,
          address_country: data.address_country || null,
          address_postal_code: data.address_postal_code || null,
        })
        .select()
        .single();

      if (error) throw error;
      return company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: string;
      data: Partial<CompanyFormData>;
    }) => {
      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.domain !== undefined) updateData.domain = data.domain?.toLowerCase().trim() || null;
      if (data.website !== undefined) updateData.website = data.website || null;
      if (data.industry !== undefined) updateData.industry = data.industry || null;
      if (data.size !== undefined) updateData.size = data.size || null;
      if (data.employee_count !== undefined) updateData.employee_count = data.employee_count || null;
      if (data.annual_revenue !== undefined) updateData.annual_revenue = data.annual_revenue || null;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.owner_id !== undefined) updateData.owner_id = data.owner_id || null;
      if (data.linkedin_url !== undefined) updateData.linkedin_url = data.linkedin_url || null;
      if (data.address_line1 !== undefined) updateData.address_line1 = data.address_line1 || null;
      if (data.address_line2 !== undefined) updateData.address_line2 = data.address_line2 || null;
      if (data.address_city !== undefined) updateData.address_city = data.address_city || null;
      if (data.address_state !== undefined) updateData.address_state = data.address_state || null;
      if (data.address_country !== undefined) updateData.address_country = data.address_country || null;
      if (data.address_postal_code !== undefined) updateData.address_postal_code = data.address_postal_code || null;

      const { data: company, error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', companyId)
        .select()
        .single();

      if (error) throw error;
      return company;
    },
    onSuccess: (_, { companyId }) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company-detail', companyId] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useLinkContactToCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactOrgId,
      companyId,
      title,
      role,
      isPrimary = false,
    }: {
      contactOrgId: string;
      companyId: string;
      title?: string;
      role?: string;
      isPrimary?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('contact_companies')
        .upsert({
          contact_org_id: contactOrgId,
          company_id: companyId,
          title: title || null,
          role: role || null,
          is_primary: isPrimary,
          is_active: true,
        }, { onConflict: 'contact_org_id,company_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { companyId, contactOrgId }) => {
      queryClient.invalidateQueries({ queryKey: ['company-detail', companyId] });
      queryClient.invalidateQueries({ queryKey: ['contact-detail', contactOrgId] });
      queryClient.invalidateQueries({ queryKey: ['contact-companies'] });
    },
  });
}

export function useUnlinkContactFromCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactOrgId,
      companyId,
    }: {
      contactOrgId: string;
      companyId: string;
    }) => {
      const { error } = await supabase
        .from('contact_companies')
        .update({ is_active: false })
        .eq('contact_org_id', contactOrgId)
        .eq('company_id', companyId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, { companyId, contactOrgId }) => {
      queryClient.invalidateQueries({ queryKey: ['company-detail', companyId] });
      queryClient.invalidateQueries({ queryKey: ['contact-detail', contactOrgId] });
      queryClient.invalidateQueries({ queryKey: ['contact-companies'] });
    },
  });
}

export function useContactCompanies(contactOrgId: string) {
  return useQuery({
    queryKey: ['contact-companies', contactOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_companies')
        .select(`
          id,
          title,
          role,
          is_primary,
          is_active,
          started_at,
          companies (
            id,
            name,
            domain,
            industry,
            size,
            status,
            logo_url
          )
        `)
        .eq('contact_org_id', contactOrgId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
    enabled: !!contactOrgId,
  });
}
