// Raio-X KOSMOS — Types

// ============================================================================
// QUESTION TYPES
// ============================================================================

export type RaioXBlockType = 'dados_negocio' | 'modelo_dependencia' | 'transformacao';
export type RaioXQuestionType = 'single' | 'text';

export interface RaioXOption {
  label: string;
  value: string;
  numericValue: number;
}

export interface RaioXQuestion {
  id: string;
  block: RaioXBlockType;
  type: RaioXQuestionType;
  title: string;
  subtitle?: string;
  placeholder?: string;
  options?: RaioXOption[];
  required: boolean;
  scorable: boolean;
}

// ============================================================================
// ANSWER TYPES
// ============================================================================

export interface RaioXAnswerSingle {
  type: 'single';
  value: string;
  numericValue: number;
}

export interface RaioXAnswerText {
  type: 'text';
  value: string;
}

export type RaioXAnswer = RaioXAnswerSingle | RaioXAnswerText;

export type RaioXAnswers = Record<string, RaioXAnswer>;

// ============================================================================
// SCORING TYPES
// ============================================================================

export type RaioXClassification = 'INICIO' | 'EM_CONSTRUCAO' | 'QUALIFICADO';

export interface RaioXScoreBreakdown {
  p2_score: number;
  p3_score: number;
  p5_score: number;
  p8_score: number;
  p9_score: number;
  p13_score: number;
  total: number;
  classification: RaioXClassification;
}

// ============================================================================
// AI OUTPUT TYPES (from Edge Function)
// ============================================================================

export interface OpportunityItem {
  tipo: 'RECORRENCIA' | 'EVENTO' | 'HIGH_TICKET' | 'ATIVACAO' | 'CERTIFICACAO';
  titulo: string;
  descricao: string;
  itens: string[];
  valor_estimado: string;
  calculo: string;
}

export interface Prompt1Output {
  produtos_atuais: Array<{ nome: string; preco: number }>;
  ltv_atual: number;
  oportunidades: OpportunityItem[];
  fatura_hoje: string;
  poderia_faturar: string;
  receita_travada: string;
  total_oportunidades: string;
}

export interface Prompt2Output {
  feature: string;
  transformacao: string;
}

export interface Prompt3Output {
  causa: string;
  inimigo: string;
  narrativa: string;
  movimento: string;
}

export interface Prompt4Output {
  modelo: 'CICLO_FECHADO' | 'CICLO_PARCIAL' | 'CICLO_ABERTO';
  dependencia_score: number;
  riscos: string[];
  frase_final: string;
}

export interface RaioXOutputs {
  prompt1_opportunities: Prompt1Output;
  prompt2_transformation: Prompt2Output;
  prompt3_narrative: Prompt3Output;
  prompt4_model: Prompt4Output;
}

// ============================================================================
// RESULT TYPES
// ============================================================================

export interface RaioXResult {
  id: string;
  respondent_name: string;
  respondent_email: string;
  instagram: string;
  score: RaioXScoreBreakdown;
  outputs: RaioXOutputs;
  created_at: string;
}

export interface RaioXSubmission {
  name: string;
  email: string;
  instagram: string;
  answers: RaioXAnswers;
}

export interface RaioXProcessResponse {
  id: string;
  classification: RaioXClassification;
  outputs: RaioXOutputs;
  score: RaioXScoreBreakdown;
}
