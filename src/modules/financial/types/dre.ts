import type { DreGroup } from './category';

export interface DreLineItem {
  dre_group_name: DreGroup;
  category_id: string;
  category_name: string;
  total_amount: number;
}

export interface DreGroupTotal {
  group: DreGroup;
  label: string;
  items: DreLineItem[];
  total: number;
}

export interface DreReport {
  receita_bruta: DreGroupTotal;
  deducoes: DreGroupTotal;
  receita_liquida: number;
  custos: DreGroupTotal;
  lucro_bruto: number;
  despesas_administrativas: DreGroupTotal;
  despesas_comerciais: DreGroupTotal;
  despesas_pessoal: DreGroupTotal;
  despesas_outras: DreGroupTotal;
  ebitda: number;
  depreciacao_amortizacao: DreGroupTotal;
  ebit: number;
  resultado_financeiro: DreGroupTotal;
  lucro_antes_ir: number;
  impostos: DreGroupTotal;
  lucro_liquido: number;
  outras_receitas: DreGroupTotal;
  outras_despesas: DreGroupTotal;
}

export interface DreFilters {
  start_date: string;
  end_date: string;
  use_competence: boolean;
}
