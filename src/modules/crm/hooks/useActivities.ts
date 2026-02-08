import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Activity, ActivityFormData } from '../types';

const PAGE_SIZE = 20;

export function useActivities(contactOrgId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['activities', contactOrgId],
    queryFn: async ({ pageParam = 0 }): Promise<{ data: Activity[]; nextPage: number | null }> => {
      if (!contactOrgId) return { data: [], nextPage: null };

      const { data, error } = await supabase.rpc('get_contact_activities', {
        p_contact_org_id: contactOrgId,
        p_limit: PAGE_SIZE,
        p_offset: pageParam,
      });

      if (error) throw error;

      const activities = (data || []) as Activity[];
      const nextPage = activities.length === PAGE_SIZE ? pageParam + PAGE_SIZE : null;

      return { data: activities, nextPage };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!contactOrgId,
    staleTime: 30 * 1000,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactOrgId,
      data,
    }: {
      contactOrgId: string;
      data: ActivityFormData;
    }) => {
      const { data: activity, error } = await supabase
        .from('activities')
        .insert({
          contact_org_id: contactOrgId,
          type: data.type,
          title: data.title,
          description: data.description || null,
          metadata: {},
        })
        .select()
        .single();

      if (error) throw error;
      return activity;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['activities', variables.contactOrgId],
      });
    },
  });
}

export function useRecentActivities(organizationId: string, limit: number = 10) {
  return useQuery({
    queryKey: ['recent-activities', organizationId, limit],
    queryFn: async () => {
      // Get recent activities from contact_orgs in this organization
      const { data, error } = await supabase
        .from('activities')
        .select(
          `
          id,
          type,
          title,
          description,
          created_at,
          contact_org_id,
          contact_orgs!inner (
            id,
            organization_id,
            contacts!inner (
              email,
              full_name
            )
          )
        `
        )
        .eq('contact_orgs.organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        ...row,
        contact_email: row.contact_orgs?.contacts?.email,
        contact_name: row.contact_orgs?.contacts?.full_name,
      }));
    },
    staleTime: 30 * 1000,
  });
}
