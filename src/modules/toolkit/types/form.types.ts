/**
 * KOSMOS Toolkit - Form Types
 * TypeScript interfaces for the dynamic forms system
 */

// ============================================================================
// FIELD TYPES
// ============================================================================

export type FormFieldType =
  | 'text'
  | 'long_text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'select'
  | 'multi_select'
  | 'radio'
  | 'scale'
  | 'statement'
  | 'file';

// ============================================================================
// CONDITION TYPES (for conditional logic)
// ============================================================================

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equals'
  | 'less_than_or_equals'
  | 'is_empty'
  | 'is_not_empty';

export interface Condition {
  fieldKey: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export interface ConditionGroup {
  logic: 'AND' | 'OR';
  conditions: Condition[];
}

// ============================================================================
// FIELD OPTIONS (for select, radio, multi_select)
// ============================================================================

export interface FieldOption {
  label: string;
  value: string;
  numericValue?: number; // For scoring
}

// ============================================================================
// SCALE CONFIG
// ============================================================================

export interface ScaleConfig {
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  showLabels?: boolean;
}

// ============================================================================
// FILE CONFIG
// ============================================================================

export interface FileConfig {
  acceptedTypes?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
}

// ============================================================================
// VALIDATION CONFIG
// ============================================================================

export interface ValidationConfig {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

// ============================================================================
// FORM FIELD
// ============================================================================

export interface FormField {
  id: string;
  form_id: string;
  block_id?: string | null;
  type: FormFieldType;
  key: string;
  label: string;
  placeholder?: string | null;
  help_text?: string | null;
  required: boolean;
  validation: ValidationConfig;
  options: FieldOption[];
  scale_config: ScaleConfig;
  file_config: FileConfig;
  conditions: ConditionGroup[];
  scoring_weight: number;
  pillar?: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FORM BLOCK
// ============================================================================

export interface FormBlock {
  id: string;
  form_id: string;
  name: string;
  description?: string | null;
  show_title: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FORM CLASSIFICATION
// ============================================================================

export interface FormClassification {
  id: string;
  form_id: string;
  name: string;
  slug: string;
  min_score: number;
  max_score: number;
  color?: string | null;
  emoji?: string | null;
  description?: string | null;
  message?: string | null;
  position: number;
  created_at: string;
}

// ============================================================================
// FORM SETTINGS
// ============================================================================

export interface FormSettings {
  showProgressBar: boolean;
  allowBack: boolean;
  saveProgress: boolean;
  progressExpireDays: number;
  showQuestionNumbers: boolean;
  submitButtonText: string;
  requiredFieldIndicator: string;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl?: string | null;
  fontFamily: string;
}

export interface WelcomeScreenConfig {
  enabled: boolean;
  title?: string | null;
  description?: string | null;
  buttonText: string;
  collectEmail: boolean;
  emailRequired: boolean;
}

export interface ThankYouScreenConfig {
  enabled: boolean;
  title: string;
  description?: string | null;
  showScore: boolean;
  showClassification: boolean;
  ctaButton?: {
    text: string;
    url: string;
  } | null;
}

export interface CrmConfig {
  createContact: boolean;
  emailFieldKey: string;
  nameFieldKey?: string | null;
  phoneFieldKey?: string | null;
  defaultJourneyStage?: string | null;
}

export interface ScoringConfig {
  formula: 'sum' | 'average' | 'weighted_average';
  weights: Record<string, number>;
  showScoreToRespondent: boolean;
  showClassificationToRespondent: boolean;
}

// ============================================================================
// FORM
// ============================================================================

export type FormStatus = 'draft' | 'published' | 'archived';

export interface Form {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: FormStatus;
  settings: FormSettings;
  theme: FormTheme;
  scoring_enabled: boolean;
  scoring_config: ScoringConfig;
  welcome_screen: WelcomeScreenConfig;
  thank_you_screen: ThankYouScreenConfig;
  crm_config: CrmConfig;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  created_by?: string | null;
}

// ============================================================================
// FORM WITH RELATIONS
// ============================================================================

export interface FormWithRelations extends Form {
  blocks: FormBlock[];
  fields: FormField[];
  classifications: FormClassification[];
}

// ============================================================================
// FORM SUBMISSION
// ============================================================================

export type SubmissionStatus = 'in_progress' | 'completed' | 'abandoned';

export interface FieldAnswer {
  value: string | string[] | number | boolean;
  numericValue?: number;
}

export type FormAnswers = Record<string, FieldAnswer>;

export interface SubmissionMetadata {
  userAgent?: string;
  referrer?: string;
  utmParams?: Record<string, string>;
  ip?: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  respondent_email?: string | null;
  respondent_id?: string | null;
  contact_id?: string | null;
  contact_org_id?: string | null;
  status: SubmissionStatus;
  answers: FormAnswers;
  current_field_key?: string | null;
  progress_percentage: number;
  last_answered_at?: string | null;
  score?: number | null;
  pillar_scores: Record<string, number>;
  classification_id?: string | null;
  computed_data: Record<string, unknown>;
  metadata: SubmissionMetadata;
  started_at: string;
  completed_at?: string | null;
  time_spent_seconds: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FORM STATISTICS
// ============================================================================

export interface FormStats {
  total_submissions: number;
  completed_submissions: number;
  in_progress_submissions: number;
  abandoned_submissions: number;
  completion_rate: number;
  avg_score: number | null;
  avg_time_seconds: number | null;
  submissions_today: number;
  submissions_this_week: number;
  submissions_this_month: number;
}

// ============================================================================
// FIELD REGISTRY (for builder)
// ============================================================================

export interface FieldDefinition {
  type: FormFieldType;
  label: string;
  icon: string;
  description: string;
  category: 'input' | 'choice' | 'special';
  hasOptions: boolean;
  hasScaleConfig: boolean;
  hasFileConfig: boolean;
  defaultValidation?: ValidationConfig;
}

// ============================================================================
// RUNTIME TYPES
// ============================================================================

export interface RuntimeField extends FormField {
  isVisible: boolean;
  isAnswered: boolean;
  error?: string | null;
}

export interface RuntimeState {
  form: FormWithRelations;
  submission: FormSubmission;
  currentFieldIndex: number;
  fields: RuntimeField[];
  isSubmitting: boolean;
  isComplete: boolean;
}
