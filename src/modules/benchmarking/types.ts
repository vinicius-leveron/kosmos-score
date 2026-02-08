/**
 * Benchmarking Module Types
 */

import type { Database } from '@/integrations/supabase/types';

// Database row types
export type Benchmark = Database['public']['Tables']['benchmarks']['Row'];
export type BenchmarkInsert = Database['public']['Tables']['benchmarks']['Insert'];
export type BenchmarkUpdate = Database['public']['Tables']['benchmarks']['Update'];
export type BenchmarkStatus = Database['public']['Enums']['benchmark_status'];

// Insights structure
export interface BenchmarkInsights {
  pontos_fortes?: string[];
  oportunidades?: string[];
  riscos?: string[];
  plano_acao?: {
    prioridade: number;
    acao: string;
    impacto: 'alto' | 'medio' | 'baixo';
  }[];
  analise_qualitativa?: string;
}

// Benchmark with related data
export interface BenchmarkWithRelations extends Benchmark {
  contact_org?: {
    id: string;
    contact: {
      id: string;
      email: string;
      full_name: string | null;
    };
  };
  created_by_profile?: {
    id: string;
    full_name: string | null;
  };
  organization?: {
    id: string;
    name: string;
  };
}

// Form data for creating/editing benchmarks
export interface BenchmarkFormData {
  // Step 1: Cliente + Data
  contact_org_id: string;
  organization_id: string;
  title: string;
  analysis_date: string;

  // Step 2: Scores
  score_causa: number | null;
  score_cultura: number | null;
  score_economia: number | null;
  score_total: number | null;

  // Benchmarks de mercado
  market_avg_causa: number | null;
  market_avg_cultura: number | null;
  market_avg_economia: number | null;
  market_avg_total: number | null;

  // Percentis
  percentile_causa: number | null;
  percentile_cultura: number | null;
  percentile_economia: number | null;
  percentile_total: number | null;

  // Top 10%
  top10_causa: number | null;
  top10_cultura: number | null;
  top10_economia: number | null;
  top10_total: number | null;

  // Step 3: Financeiro
  ticket_medio: number | null;
  ticket_medio_benchmark: number | null;
  ltv_estimado: number | null;
  ltv_benchmark: number | null;
  lucro_oculto: number | null;
  projecao_crescimento: number | null;

  // Step 4: Insights
  insights: BenchmarkInsights;
}

// Chart data for visualizations
export interface PillarScoreData {
  pilar: string;
  cliente: number;
  mercado: number;
  top10: number;
}

export interface FinancialMetric {
  label: string;
  cliente: number;
  benchmark: number;
  variacao: number;
}
