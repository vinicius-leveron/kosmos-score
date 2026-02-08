// B2B CRM - Deal Types

import type { ContactRole } from './company';
import type { PipelineStage, Pipeline } from './pipeline';
import type { ContactListItem } from './index';

export type DealStatus = 'open' | 'won' | 'lost' | 'abandoned';

export type DealActivityType =
  | 'note'
  | 'email_sent'
  | 'call'
  | 'meeting'
  | 'proposal_sent'
  | 'stage_changed'
  | 'amount_changed'
  | 'close_date_changed'
  | 'won'
  | 'lost'
  | 'custom';

export interface Deal {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  amount: number | null;
  currency: string;
  probability: number | null;
  expected_revenue: number | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  status: DealStatus;
  company_id: string;
  primary_contact_id: string | null;
  owner_id: string | null;
  pipeline_id: string | null;
  stage_id: string | null;
  entered_stage_at: string;
  entered_pipeline_at: string;
  close_reason: string | null;
  competitor_id: string | null;
  source: string | null;
  source_detail: Record<string, unknown>;
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DealContact {
  id: string;
  deal_id: string;
  contact_org_id: string;
  role: ContactRole | null;
  is_primary: boolean;
  created_at: string;
}

export interface DealActivity {
  id: string;
  deal_id: string;
  type: DealActivityType;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  actor_id: string | null;
  actor_name?: string;
  created_at: string;
}

// Composite types
export interface DealWithRelations extends Deal {
  company: {
    id: string;
    name: string;
    domain: string | null;
  };
  primary_contact: ContactListItem | null;
  stage: PipelineStage | null;
  owner?: {
    id: string;
    full_name: string | null;
  };
}

export interface DealContactWithInfo extends DealContact {
  email: string;
  full_name: string | null;
}

// For pipeline board (deals)
export interface DealBoardCard {
  id: string;
  name: string;
  amount: number | null;
  currency: string;
  probability: number | null;
  expected_close_date: string | null;
  company_id: string;
  company_name: string;
  owner_name: string | null;
  entered_stage_at: string;
  days_in_stage: number;
}

export interface DealBoardColumn {
  stage: PipelineStage;
  deals: DealBoardCard[];
  count: number;
  total_value: number;
}

export interface DealBoardData {
  pipeline: Pipeline;
  columns: DealBoardColumn[];
  total_deals: number;
  total_value: number;
  weighted_value: number;
}

// List item for deals table
export interface DealListItem {
  id: string;
  name: string;
  amount: number | null;
  probability: number | null;
  expected_revenue: number | null;
  expected_close_date: string | null;
  status: DealStatus;
  company_name: string;
  company_id: string;
  stage_name: string | null;
  stage_color: string | null;
  owner_name: string | null;
  created_at: string;
  updated_at: string;
}

// Forms
export interface DealFormData {
  name: string;
  company_id: string;
  amount?: number;
  probability?: number;
  expected_close_date?: string;
  description?: string;
  pipeline_id?: string;
  stage_id?: string;
  owner_id?: string;
  primary_contact_id?: string;
}

// Filters
export interface DealFilters {
  search?: string;
  status?: DealStatus;
  company_id?: string;
  owner_id?: string;
  pipeline_id?: string;
  stage_id?: string;
  min_amount?: number;
  max_amount?: number;
  expected_close_before?: string;
  expected_close_after?: string;
}

// Close deal form
export interface CloseDealData {
  status: 'won' | 'lost';
  close_reason?: string;
  competitor_id?: string;
  actual_close_date?: string;
}
