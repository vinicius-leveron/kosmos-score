/**
 * useOrganizations - Hooks for organization management
 *
 * Includes:
 * - useConvertToClient: Convert a CRM contact to a client organization
 * - useClientOrganizations: List all client organizations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'master' | 'client' | 'community';
  status: 'active' | 'inactive';
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ConvertToClientInput {
  contactOrgId: string;
  name: string;
  slug: string;
  settings?: Record<string, unknown>;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const organizationKeys = {
  all: ['organizations'] as const,
  clients: () => [...organizationKeys.all, 'clients'] as const,
  detail: (id: string) => [...organizationKeys.all, 'detail', id] as const,
};

// ============================================================================
// CONVERT TO CLIENT
// ============================================================================

export function useConvertToClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ConvertToClientInput): Promise<string> => {
      // Note: Function added in migration 20260209130000_contact_client_conversion.sql
      // Regenerate types with `supabase gen types` after applying migration
      const { data, error } = await supabase.rpc(
        'convert_contact_to_client' as 'get_org_stakeholder_overview',
        {
          p_contact_org_id: input.contactOrgId,
          p_org_name: input.name,
          p_org_slug: input.slug,
          p_org_settings: input.settings || {},
        } as unknown as { p_organization_id: string }
      );

      if (error) {
        // Handle duplicate slug error
        if (error.code === '23505' && error.message.includes('slug')) {
          throw new Error('Este slug ja esta em uso. Escolha outro.');
        }
        throw new Error(error.message);
      }

      return data as unknown as string;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: organizationKeys.clients() });
      queryClient.invalidateQueries({ queryKey: ['pipeline-board'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

// ============================================================================
// LIST CLIENT ORGANIZATIONS
// ============================================================================

export function useClientOrganizationsList() {
  return useQuery({
    queryKey: organizationKeys.clients(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('type', 'client')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data as Organization[];
    },
  });
}

// ============================================================================
// GET ORGANIZATION BY ID
// ============================================================================

export function useOrganization(organizationId: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (error) throw error;
      return data as Organization;
    },
    enabled: !!organizationId,
  });
}

// ============================================================================
// CHECK IF CONTACT IS CONVERTED
// ============================================================================

export function useContactClientOrg(contactOrgId: string | undefined) {
  return useQuery({
    queryKey: ['contact-client-org', contactOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_orgs')
        .select('client_organization_id')
        .eq('id', contactOrgId)
        .single();

      if (error) throw error;
      return data.client_organization_id as string | null;
    },
    enabled: !!contactOrgId,
  });
}
