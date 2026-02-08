// B2B CRM - Company Types

export type CompanyStatus = 'prospect' | 'customer' | 'churned' | 'partner' | 'competitor';
export type CompanySize = 'solo' | 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
export type ContactRole = 'decision_maker' | 'influencer' | 'champion' | 'blocker' | 'end_user' | 'technical' | 'financial' | 'other';

export interface Company {
  id: string;
  organization_id: string;
  name: string;
  domain: string | null;
  domains: string[];
  website: string | null;
  industry: string | null;
  size: CompanySize | null;
  employee_count: number | null;
  annual_revenue: number | null;
  description: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  status: CompanyStatus;
  owner_id: string | null;
  linkedin_url: string | null;
  custom_fields: Record<string, unknown>;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactCompany {
  id: string;
  contact_org_id: string;
  company_id: string;
  title: string | null;
  role: ContactRole | null;
  department: string | null;
  is_primary: boolean;
  is_active: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

// Composite types
export interface CompanyWithStats extends Company {
  contacts_count: number;
  deals_count: number;
  open_deals_value: number;
  owner?: {
    id: string;
    full_name: string | null;
  };
}

export interface ContactAtCompany {
  contact_org_id: string;
  email: string;
  full_name: string | null;
  title: string | null;
  role: ContactRole | null;
  is_primary: boolean;
}

export interface CompanyWithContacts extends Company {
  contacts: ContactAtCompany[];
  deals_count: number;
  open_deals_value: number;
}

export interface CompanyListItem {
  id: string;
  name: string;
  domain: string | null;
  status: CompanyStatus;
  industry: string | null;
  size: CompanySize | null;
  contacts_count: number;
  deals_count: number;
  open_deals_value: number;
  owner_name: string | null;
  created_at: string;
}

// Forms
export interface CompanyFormData {
  name: string;
  domain?: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  description?: string;
  status?: CompanyStatus;
  owner_id?: string;
  linkedin_url?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  country?: string;
}

// Filters
export interface CompanyFilters {
  search?: string;
  status?: CompanyStatus;
  size?: CompanySize;
  industry?: string;
  owner_id?: string;
  has_open_deals?: boolean;
}

// For contact detail - companies the contact works at
export interface ContactCompanyInfo {
  company_id: string;
  company_name: string;
  company_domain: string | null;
  company_status: CompanyStatus;
  title: string | null;
  role: ContactRole | null;
  is_primary: boolean;
}
