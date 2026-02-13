export type FinancialCategoryType = 'revenue' | 'expense' | 'cost';

export type DreGroup =
  | 'receita_bruta'
  | 'deducoes'
  | 'custos'
  | 'despesas_administrativas'
  | 'despesas_comerciais'
  | 'despesas_pessoal'
  | 'despesas_outras'
  | 'depreciacao_amortizacao'
  | 'resultado_financeiro'
  | 'impostos'
  | 'outras_receitas'
  | 'outras_despesas';

export interface FinancialCategory {
  id: string;
  organization_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  type: FinancialCategoryType;
  dre_group: DreGroup;
  color: string;
  icon: string;
  is_system: boolean;
  is_active: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  children?: FinancialCategory[];
}

export interface CategoryFormData {
  name: string;
  description?: string;
  type: FinancialCategoryType;
  dre_group: DreGroup;
  parent_id?: string;
  color?: string;
  icon?: string;
}

export interface CategoryFilters {
  search?: string;
  type?: FinancialCategoryType;
  dre_group?: DreGroup;
  is_active?: boolean;
}
