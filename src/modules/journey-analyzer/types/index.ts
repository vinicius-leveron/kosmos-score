import { Database } from '@/integrations/supabase/types';

// Base types from Supabase
export type JourneyProject = Database['public']['Tables']['journey_projects']['Row'];
export type JourneyProjectInsert = Database['public']['Tables']['journey_projects']['Insert'];
export type JourneyProjectUpdate = Database['public']['Tables']['journey_projects']['Update'];

export type JourneyProjectStage = Database['public']['Tables']['journey_project_stages']['Row'];
export type JourneyProjectStageInsert = Database['public']['Tables']['journey_project_stages']['Insert'];
export type JourneyProjectStageUpdate = Database['public']['Tables']['journey_project_stages']['Update'];

export type JourneyTouchpoint = Database['public']['Tables']['journey_touchpoints']['Row'];
export type JourneyTouchpointInsert = Database['public']['Tables']['journey_touchpoints']['Insert'];
export type JourneyTouchpointUpdate = Database['public']['Tables']['journey_touchpoints']['Update'];

export type JourneyIntakeForm = Database['public']['Tables']['journey_intake_forms']['Row'];
export type JourneyIntakeFormInsert = Database['public']['Tables']['journey_intake_forms']['Insert'];
export type JourneyIntakeFormUpdate = Database['public']['Tables']['journey_intake_forms']['Update'];

export type JourneyAction = Database['public']['Tables']['journey_actions']['Row'];
export type JourneyActionInsert = Database['public']['Tables']['journey_actions']['Insert'];
export type JourneyActionUpdate = Database['public']['Tables']['journey_actions']['Update'];

// Enums
export type JourneyProjectStatus = Database['public']['Enums']['journey_project_status'];
export type TouchpointType = Database['public']['Enums']['touchpoint_type'];
export type ActionPriority = Database['public']['Enums']['action_priority'];
export type ActionStatus = Database['public']['Enums']['action_status'];
export type IntakeFormStatus = Database['public']['Enums']['intake_form_status'];

// Extended types with relations
export interface JourneyProjectWithStages extends JourneyProject {
  stages: JourneyProjectStageWithTouchpoints[];
}

export interface JourneyProjectStageWithTouchpoints extends JourneyProjectStage {
  touchpoints: JourneyTouchpoint[];
}

// Form types
export interface CreateProjectInput {
  name: string;
  description?: string;
  client_name: string;
  client_email?: string;
  dt_mode?: DTMode;
}

export interface CreateTouchpointInput {
  stage_id: string;
  name: string;
  description?: string;
  type?: TouchpointType;
}

export interface EvaluateTouchpointInput {
  score: number;
  notes?: string;
  is_critical?: boolean;
}

// Default stages template
export const DEFAULT_STAGES = [
  { name: 'discovery', display_name: 'Descoberta', description: 'Como o lead descobre a comunidade', color: '#8b5cf6' },
  { name: 'lead', display_name: 'Lead', description: 'Captação e nutrição de leads', color: '#6366f1' },
  { name: 'sales', display_name: 'Venda', description: 'Processo de conversão', color: '#0ea5e9' },
  { name: 'onboarding', display_name: 'Onboarding', description: 'Primeiros passos do novo membro', color: '#10b981' },
  { name: 'engagement', display_name: 'Engajamento', description: 'Participação ativa na comunidade', color: '#f59e0b' },
  { name: 'retention', display_name: 'Retenção', description: 'Renovação e advocacy', color: '#ef4444' },
] as const;

// Touchpoint type options
export const TOUCHPOINT_TYPES: { value: TouchpointType; label: string }[] = [
  { value: 'page', label: 'Página' },
  { value: 'email', label: 'E-mail' },
  { value: 'event', label: 'Evento' },
  { value: 'content', label: 'Conteúdo' },
  { value: 'automation', label: 'Automação' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Ligação' },
  { value: 'other', label: 'Outro' },
];

// ============================================================================
// Design Thinking Canvas Types
// ============================================================================

export type DTMode = 'full' | 'simplified';
export type DTPhaseId = 'empathize' | 'define' | 'ideate' | 'prototype' | 'test';
export type PhaseStatus = 'not_started' | 'in_progress' | 'completed';
export type IdeaStatus = 'draft' | 'voting' | 'selected' | 'rejected';
export type TestStatus = 'planned' | 'in_progress' | 'completed';
export type TestResult = 'validated' | 'invalidated' | 'inconclusive';

export interface PhaseProgress {
  empathize: PhaseStatus;
  define: PhaseStatus;
  ideate: PhaseStatus;
  prototype: PhaseStatus;
  test: PhaseStatus;
}

// Persona
export interface JourneyPersona {
  id: string;
  project_id: string;
  name: string;
  avatar_url: string | null;
  role: string | null;
  age_range: string | null;
  bio: string | null;
  goals: string[];
  pain_points: string[];
  behaviors: string[];
  motivations: string[];
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePersonaInput {
  project_id: string;
  name: string;
  role?: string;
  age_range?: string;
  bio?: string;
  goals?: string[];
  pain_points?: string[];
  behaviors?: string[];
  motivations?: string[];
}

// Empathy Map
export interface JourneyEmpathyMap {
  id: string;
  project_id: string;
  persona_id: string | null;
  says: string[];
  thinks: string[];
  does: string[];
  feels: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmpathyMapInput {
  project_id: string;
  persona_id?: string;
}

export type EmpathyQuadrant = 'says' | 'thinks' | 'does' | 'feels';

// Problem Statement
export interface JourneyProblemStatement {
  id: string;
  project_id: string;
  persona_id: string | null;
  statement: string;
  context: string | null;
  is_primary: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProblemStatementInput {
  project_id: string;
  persona_id?: string;
  statement: string;
  context?: string;
}

// Idea
export interface JourneyIdea {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  category: string | null;
  problem_statement_id: string | null;
  touchpoint_id: string | null;
  stage_id: string | null;
  status: IdeaStatus;
  votes: number;
  impact: number | null;
  effort: number | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateIdeaInput {
  project_id: string;
  title: string;
  description?: string;
  category?: string;
  problem_statement_id?: string;
  touchpoint_id?: string;
  stage_id?: string;
}

// Test
export interface JourneyTest {
  id: string;
  project_id: string;
  hypothesis: string;
  method: string | null;
  success_metric: string | null;
  target_audience: string | null;
  status: TestStatus;
  result: TestResult | null;
  findings: string | null;
  evidence_url: string | null;
  idea_id: string | null;
  touchpoint_id: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTestInput {
  project_id: string;
  hypothesis: string;
  method?: string;
  success_metric?: string;
  target_audience?: string;
  idea_id?: string;
}

// Test method options
export const TEST_METHODS = [
  { value: 'survey', label: 'Pesquisa' },
  { value: 'interview', label: 'Entrevista' },
  { value: 'ab_test', label: 'Teste A/B' },
  { value: 'usability', label: 'Teste de Usabilidade' },
  { value: 'analytics', label: 'Análise de Dados' },
  { value: 'prototype', label: 'Protótipo' },
  { value: 'other', label: 'Outro' },
] as const;
