import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/core/auth';
import type { TeamMember, OrgRole } from '../types';

export function useTeamMembers() {
  const { currentOrg } = useOrganization();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!currentOrg) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('org_members')
        .select(`
          id,
          profile_id,
          organization_id,
          role,
          created_at,
          profile:profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', currentOrg.organization_id)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching members:', fetchError);
        setError('Erro ao carregar membros');
        setMembers([]);
        return;
      }

      // Transform the data to match our type
      const transformedMembers: TeamMember[] = (data || [])
        .filter((m) => m.profile)
        .map((m) => ({
          id: m.id,
          profile_id: m.profile_id,
          organization_id: m.organization_id,
          role: m.role as OrgRole,
          created_at: m.created_at,
          profile: {
            id: (m.profile as any).id,
            email: (m.profile as any).email,
            full_name: (m.profile as any).full_name,
            avatar_url: (m.profile as any).avatar_url,
          },
        }));

      setMembers(transformedMembers);
    } catch (err) {
      console.error('Exception fetching members:', err);
      setError('Erro ao carregar membros');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const updateMemberRole = async (memberId: string, newRole: OrgRole) => {
    const { error: updateError } = await supabase
      .from('org_members')
      .update({ role: newRole })
      .eq('id', memberId);

    if (updateError) {
      throw new Error('Erro ao atualizar role');
    }

    // Refresh the list
    await fetchMembers();
  };

  const removeMember = async (memberId: string) => {
    const { error: deleteError } = await supabase
      .from('org_members')
      .delete()
      .eq('id', memberId);

    if (deleteError) {
      throw new Error('Erro ao remover membro');
    }

    // Refresh the list
    await fetchMembers();
  };

  return {
    members,
    isLoading,
    error,
    refetch: fetchMembers,
    updateMemberRole,
    removeMember,
  };
}
