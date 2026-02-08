/**
 * Benchmarking Hooks - CRUD operations for benchmarks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/auth/hooks';
import type {
  Benchmark,
  BenchmarkInsert,
  BenchmarkUpdate,
  BenchmarkWithRelations,
  BenchmarkStatus,
} from '../types';

const QUERY_KEY = 'benchmarks';

/**
 * Fetch all benchmarks (admin view)
 */
export function useBenchmarks() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benchmarks')
        .select(`
          *,
          contact_org:contact_orgs(
            id,
            contact:contacts(id, email, full_name)
          ),
          created_by_profile:profiles!benchmarks_created_by_fkey(id, full_name),
          organization:organizations(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BenchmarkWithRelations[];
    },
  });
}

/**
 * Fetch benchmarks for a specific organization (client view)
 */
export function useOrganizationBenchmarks(organizationId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, 'org', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('benchmarks')
        .select(`
          *,
          contact_org:contact_orgs(
            id,
            contact:contacts(id, email, full_name)
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'published')
        .order('analysis_date', { ascending: false });

      if (error) throw error;
      return data as BenchmarkWithRelations[];
    },
    enabled: !!organizationId,
  });
}

/**
 * Fetch single benchmark by ID
 */
export function useBenchmark(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('benchmarks')
        .select(`
          *,
          contact_org:contact_orgs(
            id,
            contact:contacts(id, email, full_name)
          ),
          created_by_profile:profiles!benchmarks_created_by_fkey(id, full_name),
          organization:organizations(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as BenchmarkWithRelations;
    },
    enabled: !!id,
  });
}

/**
 * Create benchmark
 */
export function useCreateBenchmark() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<BenchmarkInsert, 'created_by'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: benchmark, error } = await supabase
        .from('benchmarks')
        .insert({
          ...data,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return benchmark as Benchmark;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Update benchmark
 */
export function useUpdateBenchmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: BenchmarkUpdate & { id: string }) => {
      const { data: benchmark, error } = await supabase
        .from('benchmarks')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return benchmark as Benchmark;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
    },
  });
}

/**
 * Delete benchmark
 */
export function useDeleteBenchmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('benchmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Publish benchmark
 */
export function usePublishBenchmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: benchmark, error } = await supabase
        .from('benchmarks')
        .update({ status: 'published' as BenchmarkStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return benchmark as Benchmark;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
    },
  });
}

/**
 * Archive benchmark
 */
export function useArchiveBenchmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: benchmark, error } = await supabase
        .from('benchmarks')
        .update({ status: 'archived' as BenchmarkStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return benchmark as Benchmark;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
    },
  });
}
