export * from './category';
export * from './account';
export * from './transaction';
export * from './cashflow';
export * from './dre';
export * from './reconciliation';

export interface PaginationParams {
  page: number;
  per_page: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
