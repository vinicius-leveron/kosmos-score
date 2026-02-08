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
