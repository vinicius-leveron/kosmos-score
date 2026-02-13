export type FinancialAccountType =
  | 'checking'
  | 'savings'
  | 'cash'
  | 'credit_card'
  | 'investment'
  | 'digital_wallet'
  | 'other';

export interface FinancialAccount {
  id: string;
  organization_id: string;
  name: string;
  type: FinancialAccountType;
  bank_name: string | null;
  bank_branch: string | null;
  account_number: string | null;
  initial_balance: number;
  current_balance: number;
  currency: string;
  color: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountFormData {
  name: string;
  type: FinancialAccountType;
  bank_name?: string;
  bank_branch?: string;
  account_number?: string;
  initial_balance?: number;
  currency?: string;
  color?: string;
  description?: string;
}

export interface AccountFilters {
  search?: string;
  type?: FinancialAccountType;
  is_active?: boolean;
}
