// Multi-Pipeline CRM Types

export type PipelineType = 'sales' | 'customer_success' | 'marketing' | 'custom';
export type ExitType = 'positive' | 'negative' | 'neutral';

export interface Pipeline {
  id: string;
  organization_id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  color: string;
  position: number;
  is_default: boolean;
  is_active: boolean;
  settings: PipelineSettings;
  created_at: string;
  updated_at: string;
}

export interface PipelineSettings {
  show_win_rate?: boolean;
  show_conversion_time?: boolean;
  default_owner_id?: string;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  organization_id: string;
  name: string;
  display_name: string;
  description: string | null;
  position: number;
  color: string;
  is_entry_stage: boolean;
  is_exit_stage: boolean;
  exit_type: ExitType | null;
  automation_rules: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ContactPipelinePosition {
  id: string;
  contact_org_id: string;
  pipeline_id: string;
  stage_id: string;
  entered_stage_at: string;
  entered_pipeline_at: string;
  owner_id: string | null;
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Composite types for views
export interface PipelineWithStages extends Pipeline {
  stages: PipelineStage[];
}

export interface ContactInPipeline {
  position: ContactPipelinePosition;
  stage: PipelineStage;
  pipeline: Pipeline;
}

export interface ContactWithPipelines {
  pipelines: ContactInPipeline[];
}

// For the board view
export interface PipelineBoardColumn {
  stage: PipelineStage;
  contacts: PipelineBoardContact[];
  count: number;
}

export interface PipelineBoardContact {
  id: string;
  contact_org_id: string;
  email: string;
  full_name: string | null;
  score: number | null;
  entered_stage_at: string;
  tags: { id: string; name: string; color: string }[];
}

export interface PipelineBoardData {
  pipeline: Pipeline;
  columns: PipelineBoardColumn[];
  totalContacts: number;
}

// Form data for creating/updating
export interface PipelineFormData {
  name: string;
  display_name: string;
  description?: string;
  icon?: string;
  color: string;
  is_default?: boolean;
}

export interface PipelineStageFormData {
  name: string;
  display_name: string;
  description?: string;
  color: string;
  is_entry_stage?: boolean;
  is_exit_stage?: boolean;
  exit_type?: ExitType;
}
