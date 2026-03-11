/**
 * Financial API Types
 */

// Re-export from auth
export type { AuthResult, ApiKeyPermissions } from './auth.ts';

// Transaction types
export type FinancialTransactionType = 'receivable' | 'payable';
export type FinancialTransactionStatus = 'pending' | 'paid' | 'overdue' | 'canceled' | 'partially_paid';

// Account types
export type FinancialAccountType = 'checking' | 'savings' | 'cash' | 'credit_card' | 'investment' | 'digital_wallet' | 'other';

// Category types
export type FinancialCategoryType = 'revenue' | 'expense' | 'cost';

// Transaction input
export interface TransactionInput {
  type: FinancialTransactionType;
  description: string;
  amount: number;
  due_date: string;
  competence_date?: string;
  category_id?: string | null;
  account_id?: string | null;
  cost_center_id?: string | null;
  counterparty_name?: string | null;
  counterparty_document?: string | null;
  document_number?: string | null;
  notes?: string | null;
}

// Transaction response
export interface TransactionResponse {
  id: string;
  type: FinancialTransactionType;
  status: FinancialTransactionStatus;
  description: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  paid_date: string | null;
  competence_date: string;
  category_id: string | null;
  category_name: string | null;
  account_id: string | null;
  account_name: string | null;
  counterparty_name: string | null;
  created_at: string;
  updated_at: string;
}

// Account response
export interface AccountResponse {
  id: string;
  name: string;
  type: FinancialAccountType;
  initial_balance: number;
  current_balance: number;
  currency: string;
  color: string;
  is_active: boolean;
}

// Category response
export interface CategoryResponse {
  id: string;
  name: string;
  type: FinancialCategoryType;
  color: string;
  icon: string;
  parent_id: string | null;
}

// Dashboard metrics
export interface DashboardMetrics {
  revenue_month: number;
  expenses_month: number;
  profit_month: number;
  receivables_pending: number;
  receivables_overdue: number;
  receivables_overdue_count: number;
  payables_pending: number;
  payables_overdue: number;
  payables_overdue_count: number;
}

// Cashflow period
export interface CashFlowPeriod {
  period_date: string;
  receivables: number;
  payables: number;
  net: number;
  cumulative_balance: number;
}

// DRE group
export interface DreGroupTotal {
  total: number;
  items: Array<{
    category_id: string;
    category_name: string;
    total: number;
  }>;
}

// DRE report
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
}

// Payment input
export interface PaymentInput {
  amount: number;
  date: string;
  account_id: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}
