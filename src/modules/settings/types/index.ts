export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamMember {
  id: string;
  profile_id: string;
  organization_id: string;
  role: OrgRole;
  created_at: string;
  profile: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: OrgRole;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
  invited_by: {
    full_name: string | null;
  } | null;
}

export interface InvitationInfo {
  found: boolean;
  id?: string;
  email?: string;
  role?: OrgRole;
  status?: string;
  expires_at?: string;
  organization_name?: string;
  organization_slug?: string;
  invited_by_name?: string | null;
  is_valid?: boolean;
}

export const ROLE_LABELS: Record<OrgRole, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Visualizador',
};

export const ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
  owner: 'Acesso total, pode gerenciar proprietários',
  admin: 'Pode gerenciar membros e todos os módulos',
  member: 'Pode usar os módulos',
  viewer: 'Apenas visualização',
};
