import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ContactWithOrg } from '../types';

export function useContactDetail(contactOrgId: string | undefined) {
  return useQuery({
    queryKey: ['contact-detail', contactOrgId],
    queryFn: async (): Promise<ContactWithOrg | null> => {
      if (!contactOrgId) return null;

      const { data, error } = await supabase
        .from('contact_orgs')
        .select(
          `
          id,
          contact_id,
          organization_id,
          journey_stage_id,
          score,
          score_breakdown,
          owner_id,
          status,
          notes,
          custom_fields,
          created_at,
          updated_at,
          contacts!inner (
            id,
            email,
            phone,
            full_name,
            profile_id,
            source,
            source_detail,
            created_at,
            updated_at
          ),
          journey_stages (
            id,
            organization_id,
            name,
            display_name,
            description,
            position,
            color,
            is_default,
            created_at,
            updated_at
          )
        `
        )
        .eq('id', contactOrgId)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Get tags for this contact_org
      const { data: tagsData } = await supabase
        .from('contact_tags')
        .select(
          `
          tags (
            id,
            organization_id,
            name,
            color,
            description,
            created_at,
            updated_at
          )
        `
        )
        .eq('contact_org_id', contactOrgId);

      const tags = tagsData?.map((t: any) => t.tags).filter(Boolean) || [];

      // Transform to ContactWithOrg format
      const result: ContactWithOrg = {
        id: data.contacts.id,
        email: data.contacts.email,
        phone: data.contacts.phone,
        full_name: data.contacts.full_name,
        profile_id: data.contacts.profile_id,
        source: data.contacts.source,
        source_detail: data.contacts.source_detail as Record<string, unknown>,
        created_at: data.contacts.created_at,
        updated_at: data.contacts.updated_at,
        contact_org: {
          id: data.id,
          contact_id: data.contact_id,
          organization_id: data.organization_id,
          journey_stage_id: data.journey_stage_id,
          score: data.score,
          score_breakdown: data.score_breakdown as any,
          owner_id: data.owner_id,
          status: data.status,
          notes: data.notes,
          custom_fields: data.custom_fields as Record<string, unknown>,
          created_at: data.created_at,
          updated_at: data.updated_at,
          journey_stage: data.journey_stages,
          tags,
        },
      };

      return result;
    },
    enabled: !!contactOrgId,
    staleTime: 30 * 1000, // 30 seconds
  });
}
