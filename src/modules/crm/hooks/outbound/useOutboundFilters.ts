import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { subDays } from 'date-fns';
import {
  OutboundFilters,
  Tenant,
  Classificacao,
  CadenceStatus,
} from '../../types/outbound';

const DEFAULT_FILTERS: OutboundFilters = {
  tenant: 'all',
  dateRange: {
    start: subDays(new Date(), 30),
    end: new Date(),
  },
  classificacao: [],
  sources: [],
  cadenceStatus: [],
};

export function useOutboundFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<OutboundFilters>(() => {
    // Initialize from URL params
    const tenant = (searchParams.get('tenant') as Tenant) || 'all';
    const classificacao = searchParams.getAll('class') as Classificacao[];
    const sources = searchParams.getAll('source');
    const cadenceStatus = searchParams.getAll('status') as CadenceStatus[];

    // Parse date range
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    const start = startParam ? new Date(startParam) : subDays(new Date(), 30);
    const end = endParam ? new Date(endParam) : new Date();

    return {
      tenant,
      dateRange: { start, end },
      classificacao,
      sources,
      cadenceStatus,
    };
  });

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.tenant !== 'all') {
      params.set('tenant', filters.tenant);
    }

    if (filters.dateRange.start) {
      params.set('start', filters.dateRange.start.toISOString().split('T')[0]);
    }
    if (filters.dateRange.end) {
      params.set('end', filters.dateRange.end.toISOString().split('T')[0]);
    }

    filters.classificacao.forEach((c) => params.append('class', c));
    filters.sources.forEach((s) => params.append('source', s));
    filters.cadenceStatus.forEach((s) => params.append('status', s));

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const updateFilters = useCallback((newFilters: OutboundFilters) => {
    setFilters(newFilters);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Build filter params for API queries
  const getQueryParams = useCallback(() => {
    const params: Record<string, any> = {};

    if (filters.tenant !== 'all') {
      params.tenant = filters.tenant;
    }

    if (filters.dateRange.start) {
      params.startDate = filters.dateRange.start.toISOString();
    }
    if (filters.dateRange.end) {
      params.endDate = filters.dateRange.end.toISOString();
    }

    if (filters.classificacao.length > 0) {
      params.classificacao = filters.classificacao;
    }

    if (filters.sources.length > 0) {
      params.sources = filters.sources;
    }

    if (filters.cadenceStatus.length > 0) {
      params.cadenceStatus = filters.cadenceStatus;
    }

    return params;
  }, [filters]);

  return {
    filters,
    setFilters: updateFilters,
    resetFilters,
    getQueryParams,
  };
}
