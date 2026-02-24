/**
 * CRM API Types
 */

// API Key permissions structure
export interface ApiKeyPermissions {
  contacts: { read: boolean; write: boolean; delete: boolean };
  companies: { read: boolean; write: boolean; delete: boolean };
  deals: { read: boolean; write: boolean; delete: boolean };
  activities: { read: boolean; write: boolean; delete: boolean };
  tags: { read: boolean; write: boolean; delete: boolean };
  tasks: { read: boolean; write: boolean; delete: boolean };
  pipelines: { read: boolean; write: boolean; delete: boolean };
}

// API Key record from database
export interface ApiKeyRecord {
  id: string;
  organization_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  permissions: ApiKeyPermissions;
  allowed_ips: string[] | null;
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  is_active: boolean;
  expires_at: string | null;
}

// Authentication result
export interface AuthResult {
  success: boolean;
  error?: string;
  status?: number;
  organizationId?: string;
  permissions?: ApiKeyPermissions;
  apiKeyId?: string;
}

// Pagination params
export interface PaginationParams {
  page: number;
  perPage: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

// Contact from API
export interface ContactInput {
  email: string;
  full_name?: string | null;
  phone?: string | null;
  source?: string;
  source_detail?: Record<string, unknown>;
  stage_id?: string | null;
  tag_ids?: string[];
  score?: number | null;
  notes?: string | null;
  custom_fields?: Record<string, unknown>;
  // Social handles (contacts table)
  instagram?: string | null;
  linkedin_url?: string | null;
  website?: string | null;
  fontes?: string[];
  // Outbound fields (contact_orgs table)
  score_icp?: number | null;
  score_engagement?: number | null;
  classificacao?: 'A' | 'B' | 'C' | null;
  cadence_status?: string | null;
  cadence_step?: number | null;
  cadence_id?: string | null;
  channel_in?: string | null;
  tenant?: 'kosmos' | 'oliveira-dev';
  do_not_contact?: boolean;
  axiom_status?: string | null;
  ig_handler?: 'manual' | 'manychat' | 'axiom' | null;
}

// Contact response
export interface ContactResponse {
  id: string;
  contact_org_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  score: number | null;
  status: string;
  stage: {
    id: string;
    name: string;
    display_name: string;
    color: string;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
  // Social handles
  instagram?: string | null;
  linkedin_url?: string | null;
  website?: string | null;
  fontes?: string[];
  // Outbound fields
  score_icp?: number | null;
  score_engagement?: number | null;
  classificacao?: string | null;
  cadence_status?: string | null;
  cadence_step?: number | null;
  channel_in?: string | null;
  tenant?: string | null;
  do_not_contact?: boolean;
  axiom_status?: string | null;
  ig_handler?: string | null;
  last_contacted?: string | null;
  next_action_date?: string | null;
}

// Company input
export interface CompanyInput {
  name: string;
  domain?: string | null;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
  employee_count?: number | null;
  description?: string | null;
  status?: string;
  linkedin_url?: string | null;
  custom_fields?: Record<string, unknown>;
}

// Deal input
export interface DealInput {
  name: string;
  description?: string | null;
  amount?: number | null;
  currency?: string;
  probability?: number | null;
  expected_close_date?: string | null;
  company_id?: string | null;
  primary_contact_id?: string | null;
  pipeline_id?: string | null;
  stage_id?: string | null;
  source?: string;
  custom_fields?: Record<string, unknown>;
}

// Activity input
export interface ActivityInput {
  type: string;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
}

// Task input
export interface TaskInput {
  title: string;
  description?: string | null;
  type?: string;
  priority?: string;
  due_at?: string | null;
  contact_org_id?: string | null;
  deal_id?: string | null;
  company_id?: string | null;
}

// Error response
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}
