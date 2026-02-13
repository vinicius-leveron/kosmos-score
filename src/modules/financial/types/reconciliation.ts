export type ReconciliationEntryStatus = 'pending' | 'matched' | 'unmatched' | 'ignored';

export interface BankReconciliationImport {
  id: string;
  organization_id: string;
  account_id: string;
  file_name: string;
  file_type: string;
  period_start: string;
  period_end: string;
  total_entries: number;
  matched_entries: number;
  created_at: string;
}

export interface BankReconciliationEntry {
  id: string;
  import_id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: ReconciliationEntryStatus;
  matched_transaction_id: string | null;
  match_confidence: number | null;
  raw_data: Record<string, unknown>;
  created_at: string;
}
