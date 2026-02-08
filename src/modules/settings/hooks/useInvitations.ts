import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization, useAuth } from '@/core/auth';
import type { Invitation, OrgRole } from '../types';

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function useInvitations() {
  const { currentOrg } = useOrganization();
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitations = useCallback(async () => {
    if (!currentOrg) {
      setInvitations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('org_invitations')
        .select(`
          id,
          organization_id,
          email,
          role,
          token,
          status,
          expires_at,
          created_at,
          invited_by:profiles (
            full_name
          )
        `)
        .eq('organization_id', currentOrg.organization_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching invitations:', fetchError);
        setError('Erro ao carregar convites');
        setInvitations([]);
        return;
      }

      const transformedInvitations: Invitation[] = (data || []).map((inv) => ({
        id: inv.id,
        organization_id: inv.organization_id,
        email: inv.email,
        role: inv.role as OrgRole,
        token: inv.token,
        status: inv.status as Invitation['status'],
        expires_at: inv.expires_at,
        created_at: inv.created_at,
        invited_by: inv.invited_by as Invitation['invited_by'],
      }));

      setInvitations(transformedInvitations);
    } catch (err) {
      console.error('Exception fetching invitations:', err);
      setError('Erro ao carregar convites');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const createInvitation = async (email: string, role: OrgRole): Promise<string> => {
    if (!currentOrg || !user) {
      throw new Error('Organização ou usuário não encontrado');
    }

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { error: insertError } = await supabase.from('org_invitations').insert({
      organization_id: currentOrg.organization_id,
      email,
      role,
      token,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error('Error creating invitation:', insertError);
      throw new Error('Erro ao criar convite');
    }

    // Refresh the list
    await fetchInvitations();

    // Return the invite URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/invite/${token}`;
  };

  const revokeInvitation = async (invitationId: string) => {
    const { error: updateError } = await supabase
      .from('org_invitations')
      .update({ status: 'revoked' })
      .eq('id', invitationId);

    if (updateError) {
      throw new Error('Erro ao revogar convite');
    }

    // Refresh the list
    await fetchInvitations();
  };

  return {
    invitations,
    isLoading,
    error,
    refetch: fetchInvitations,
    createInvitation,
    revokeInvitation,
  };
}
