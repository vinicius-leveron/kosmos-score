export type CashFlowGranularity = 'daily' | 'weekly' | 'monthly';

export interface CashFlowPeriod {
  period_date: string;
  receivables: number;
  payables: number;
  net: number;
  cumulative_balance: number;
}

export interface CashFlowFilters {
  start_date: string;
  end_date: string;
  granularity: CashFlowGranularity;
}
