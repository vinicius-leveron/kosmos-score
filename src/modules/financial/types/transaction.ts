export type FinancialTransactionType = 'receivable' | 'payable';

export type FinancialTransactionStatus =
  | 'pending'
  | 'paid'
  | 'overdue'
  | 'canceled'
  | 'partially_paid';

export type RecurrenceFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'bimonthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual';

export interface FinancialTransaction {
  id: string;
  organization_id: string;
  type: FinancialTransactionType;
  status: FinancialTransactionStatus;
  description: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  paid_date: string | null;
  competence_date: string;
  category_id: string | null;
  account_id: string | null;
  cost_center_id: string | null;
  recurrence_id: string | null;
  deal_id: string | null;
  company_id: string | null;
  contact_org_id: string | null;
  counterparty_name: string | null;
  counterparty_document: string | null;
  document_number: string | null;
  document_type: string | null;
  notes: string | null;
  tags: string[];
  attachments: unknown[];
  created_at: string;
  updated_at: string;
}

export interface TransactionListItem extends FinancialTransaction {
  category_name: string | null;
  category_color: string | null;
  account_name: string | null;
  cost_center_name: string | null;
}

export interface TransactionFormData {
  type: FinancialTransactionType;
  description: string;
  amount: number;
  due_date: string;
  competence_date: string;
  category_id?: string;
  account_id?: string;
  cost_center_id?: string;
  counterparty_name?: string;
  counterparty_document?: string;
  document_number?: string;
  document_type?: string;
  notes?: string;
  tags?: string[];
}

export interface PaymentFormData {
  amount: number;
  date: string;
  account_id: string;
}

export interface TransactionFilters {
  search?: string;
  type?: FinancialTransactionType;
  status?: FinancialTransactionStatus;
  category_id?: string;
  account_id?: string;
  cost_center_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface FinancialRecurrence {
  id: string;
  organization_id: string;
  description: string;
  type: FinancialTransactionType;
  amount: number;
  frequency: RecurrenceFrequency;
  start_date: string;
  end_date: string | null;
  day_of_month: number | null;
  next_due_date: string | null;
  last_generated_date: string | null;
  category_id: string | null;
  account_id: string | null;
  cost_center_id: string | null;
  counterparty_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurrenceFormData {
  description: string;
  type: FinancialTransactionType;
  amount: number;
  frequency: RecurrenceFrequency;
  start_date: string;
  end_date?: string;
  day_of_month?: number;
  category_id?: string;
  account_id?: string;
  cost_center_id?: string;
  counterparty_name?: string;
}
