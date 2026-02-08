// Types do módulo CRM
// Baseados nas tabelas do Supabase

// Re-export pipeline types
export * from './pipeline';

export type ActivityType =
  | 'note'
  | 'email_sent'
  | 'email_opened'
  | 'email_clicked'
  | 'email_bounced'
  | 'call'
  | 'meeting'
  | 'form_submitted'
  | 'stage_changed'
  | 'score_changed'
  | 'tag_added'
  | 'tag_removed'
  | 'owner_assigned'
  | 'whatsapp_sent'
  | 'whatsapp_read'
  | 'custom';

export type ContactSource =
  | 'kosmos_score'
  | 'landing_page'
  | 'manual'
  | 'import'
  | 'referral'
  | 'form_submission';

export type ContactOrgStatus = 'active' | 'archived' | 'unsubscribed';

export interface Contact {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  profile_id: string | null;
  source: ContactSource;
  source_detail: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface JourneyStage {
  id: string;
  organization_id: string;
  name: string;
  display_name: string;
  description: string | null;
  position: number;
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactOrg {
  id: string;
  contact_id: string;
  organization_id: string;
  journey_stage_id: string | null;
  score: number | null;
  score_breakdown: ScoreBreakdown;
  owner_id: string | null;
  status: ContactOrgStatus;
  notes: string | null;
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ScoreBreakdown {
  causa?: number;
  cultura?: number;
  economia?: number;
  base_value?: number;
  ticket_value?: number;
  lucro_oculto?: number;
  is_beginner?: boolean;
  computed?: Record<string, unknown>;
}

export interface Activity {
  id: string;
  contact_org_id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  reference_type: string | null;
  reference_id: string | null;
  actor_id: string | null;
  actor_name?: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  organization_id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactTag {
  contact_org_id: string;
  tag_id: string;
  added_at: string;
  added_by: string | null;
}

// Tipos compostos para views
export interface ContactWithOrg extends Contact {
  contact_org: ContactOrg & {
    journey_stage: JourneyStage | null;
    tags: Tag[];
  };
}

export interface ContactListItem {
  id: string;
  contact_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  score: number | null;
  stage_name: string | null;
  stage_color: string | null;
  status: ContactOrgStatus;
  tags: { id: string; name: string; color: string }[];
  created_at: string;
  updated_at: string;
}

// Filtros para listagem
export interface ContactFilters {
  search?: string;
  stage_id?: string;
  tag_id?: string;
  status?: ContactOrgStatus;
  score_min?: number;
  score_max?: number;
  source?: ContactSource;
}

// Ordenação
export interface ContactSort {
  field: 'created_at' | 'updated_at' | 'score' | 'full_name' | 'email';
  direction: 'asc' | 'desc';
}

// Paginação
export interface PaginationParams {
  page: number;
  per_page: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form para criar/editar contato
export interface ContactFormData {
  email: string;
  full_name?: string;
  phone?: string;
  notes?: string;
  journey_stage_id?: string;
  tag_ids?: string[];
}

// Form para criar atividade
export interface ActivityFormData {
  type: 'note' | 'call' | 'meeting' | 'custom';
  title: string;
  description?: string;
}
