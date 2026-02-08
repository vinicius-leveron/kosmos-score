import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { JourneyStage, ContactListItem } from '../types';
import { KOSMOS_ORG_ID } from '@/core/auth';

export interface PipelineColumn {
  stage: JourneyStage;
  contacts: ContactListItem[];
  count: number;
}

export interface PipelineData {
  columns: PipelineColumn[];
  totalContacts: number;
}

export function usePipeline(organizationId: string = KOSMOS_ORG_ID) {
  return useQuery({
    queryKey: ['pipeline', organizationId],
    queryFn: async (): Promise<PipelineData> => {
      // Get all journey stages for the org
      const { data: stages, error: stagesError } = await supabase
        .from('journey_stages')
        .select('*')
        .eq('organization_id', organizationId)
        .order('position', { ascending: true });

      if (stagesError) throw stagesError;

      // Get all active contacts with their stages
      const { data: contactOrgs, error: contactsError } = await supabase
        .from('contact_orgs')
        .select(
          `
          id,
          contact_id,
          journey_stage_id,
          score,
          status,
          created_at,
          updated_at,
          contacts!inner (
            id,
            email,
            full_name,
            phone
          )
        `
        )
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .order('score', { ascending: false, nullsFirst: false });

      if (contactsError) throw contactsError;

      // Get tags for all contacts
      const contactOrgIds = (contactOrgs || []).map((c: any) => c.id);
      let tagsByContactOrg = new Map<
        string,
        { id: string; name: string; color: string }[]
      >();

      if (contactOrgIds.length > 0) {
        const { data: tagsData } = await supabase
          .from('contact_tags')
          .select(
            `
            contact_org_id,
            tags (
              id,
              name,
              color
            )
          `
          )
          .in('contact_org_id', contactOrgIds);

        if (tagsData) {
          tagsData.forEach((row: any) => {
            const existing = tagsByContactOrg.get(row.contact_org_id) || [];
            if (row.tags) {
              existing.push({
                id: row.tags.id,
                name: row.tags.name,
                color: row.tags.color,
              });
            }
            tagsByContactOrg.set(row.contact_org_id, existing);
          });
        }
      }

      // Transform contacts to ContactListItem format
      const contacts: ContactListItem[] = (contactOrgs || []).map((row: any) => ({
        id: row.id,
        contact_id: row.contact_id,
        email: row.contacts.email,
        full_name: row.contacts.full_name,
        phone: row.contacts.phone,
        score: row.score,
        stage_name: null, // Will be filled by stage lookup
        stage_color: null,
        status: row.status,
        tags: tagsByContactOrg.get(row.id) || [],
        created_at: row.created_at,
        updated_at: row.updated_at,
        journey_stage_id: row.journey_stage_id,
      }));

      // Group contacts by stage
      const stageMap = new Map<string | null, ContactListItem[]>();

      // Initialize with empty arrays for all stages
      stages?.forEach((stage: any) => {
        stageMap.set(stage.id, []);
      });
      stageMap.set(null, []); // For contacts without a stage

      // Distribute contacts to their stages
      contacts.forEach((contact: any) => {
        const stageContacts = stageMap.get(contact.journey_stage_id) || [];
        stageContacts.push(contact);
        stageMap.set(contact.journey_stage_id, stageContacts);
      });

      // Build columns
      const columns: PipelineColumn[] = (stages || []).map((stage: any) => {
        const stageContacts = stageMap.get(stage.id) || [];
        return {
          stage: stage as JourneyStage,
          contacts: stageContacts.map((c) => ({
            ...c,
            stage_name: stage.display_name,
            stage_color: stage.color,
          })),
          count: stageContacts.length,
        };
      });

      // Add "No Stage" column if there are contacts without stage
      const noStageContacts = stageMap.get(null) || [];
      if (noStageContacts.length > 0) {
        columns.push({
          stage: {
            id: 'no-stage',
            organization_id: organizationId,
            name: 'no_stage',
            display_name: 'Sem Estágio',
            description: null,
            position: -1,
            color: '#6b7280',
            is_default: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          contacts: noStageContacts,
          count: noStageContacts.length,
        });
      }

      return {
        columns,
        totalContacts: contacts.length,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
