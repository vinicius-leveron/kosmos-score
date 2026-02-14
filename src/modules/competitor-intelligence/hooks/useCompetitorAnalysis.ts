/**
 * Competitor Intelligence Hooks - CRUD + pipeline operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, useOrganization } from '@/core/auth/hooks';
import { z } from 'zod';
import type {
  CompetitorProfile,
  CompetitorChannel,
  CompetitorProduct,
  CompetitorAnalysisRun,
  CompetitorWithLatestRun,
  CompetitorDetail,
} from '../lib/competitorTypes';

const QUERY_KEY = 'competitors';

/** Zod schema for Instagram handle validation */
const instagramHandleSchema = z
  .string()
  .min(1, 'Informe o handle do Instagram')
  .max(30, 'Handle deve ter no m\u00e1ximo 30 caracteres')
  .regex(/^@?[a-zA-Z0-9._]+$/, 'Use apenas letras, n\u00fameros, pontos e underscores')
  .transform((val) => val.replace(/^@/, '').trim().toLowerCase());

/**
 * Fetch all competitors for the current organization
 */
export function useCompetitors() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: [QUERY_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('competitor_profiles')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const competitors = data as CompetitorProfile[];
      const competitorIds = competitors.map((c) => c.id);

      // Fetch all runs in a single query (avoids N+1)
      const { data: allRuns } = competitorIds.length > 0
        ? await supabase
            .from('competitor_analysis_runs')
            .select('*')
            .in('competitor_id', competitorIds)
            .order('created_at', { ascending: false })
        : { data: [] };

      // Group by competitor_id, take the first (latest) for each
      const latestRunMap = new Map<string, CompetitorAnalysisRun>();
      for (const run of (allRuns ?? [])) {
        if (!latestRunMap.has(run.competitor_id)) {
          latestRunMap.set(run.competitor_id, run as CompetitorAnalysisRun);
        }
      }

      const withRuns: CompetitorWithLatestRun[] = competitors.map((comp) => ({
        ...comp,
        latest_run: latestRunMap.get(comp.id) ?? null,
      }));

      return withRuns;
    },
    enabled: !!organizationId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch all competitors (admin view - all organizations)
 */
export function useAllCompetitors() {
  const { isKosmosMaster } = useOrganization();

  return useQuery({
    queryKey: [QUERY_KEY, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competitor_profiles')
        .select(`
          *,
          organization:organizations(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isKosmosMaster,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch single competitor with full details
 */
export function useCompetitorDetail(competitorId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', competitorId],
    queryFn: async (): Promise<CompetitorDetail | null> => {
      if (!competitorId) return null;

      // Fetch competitor profile
      const { data: profile, error: profileError } = await supabase
        .from('competitor_profiles')
        .select('*')
        .eq('id', competitorId)
        .single();

      if (profileError) throw profileError;

      // Fetch channels, products, and latest run in parallel
      const [channelsRes, productsRes, runsRes] = await Promise.all([
        supabase
          .from('competitor_channels')
          .select('*')
          .eq('competitor_id', competitorId)
          .order('platform'),
        supabase
          .from('competitor_products')
          .select('*')
          .eq('competitor_id', competitorId)
          .order('name'),
        supabase
          .from('competitor_analysis_runs')
          .select('*')
          .eq('competitor_id', competitorId)
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

      if (channelsRes.error) throw channelsRes.error;
      if (productsRes.error) throw productsRes.error;

      return {
        ...(profile as CompetitorProfile),
        channels: (channelsRes.data ?? []) as CompetitorChannel[],
        products: (productsRes.data ?? []) as CompetitorProduct[],
        latest_run: (runsRes.data?.[0] as CompetitorAnalysisRun) ?? null,
      };
    },
    enabled: !!competitorId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch analysis run (for progress tracking)
 */
export function useAnalysisRun(runId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, 'run', runId],
    queryFn: async () => {
      if (!runId) return null;

      const { data, error } = await supabase
        .from('competitor_analysis_runs')
        .select('*')
        .eq('id', runId)
        .single();

      if (error) throw error;
      return data as CompetitorAnalysisRun;
    },
    enabled: !!runId,
    refetchInterval: (query) => {
      // Poll every 3s while pipeline is running
      const run = query.state.data as CompetitorAnalysisRun | null;
      if (run && run.status !== 'completed' && run.status !== 'failed') {
        return 3000;
      }
      return false;
    },
  });
}

/**
 * Validate Instagram handle using Zod schema
 */
export function validateInstagramHandle(handle: string): { success: boolean; error?: string; data?: string } {
  const result = instagramHandleSchema.safeParse(handle);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.errors[0]?.message ?? 'Handle inv\u00e1lido' };
}

/**
 * Create competitor and start analysis pipeline
 */
export function useCreateCompetitor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { organizationId } = useOrganization();

  return useMutation({
    mutationFn: async (instagramHandle: string) => {
      if (!user?.id) throw new Error('Voc\u00ea precisa estar autenticado');
      if (!organizationId) throw new Error('Nenhuma organiza\u00e7\u00e3o selecionada');

      // Validate handle with Zod
      const parsed = instagramHandleSchema.safeParse(instagramHandle);
      if (!parsed.success) {
        throw new Error(parsed.error.errors[0]?.message ?? 'Handle do Instagram inv\u00e1lido');
      }
      const cleanHandle = parsed.data;

      // Create competitor profile
      const { data: profile, error: profileError } = await supabase
        .from('competitor_profiles')
        .insert({
          organization_id: organizationId,
          created_by: user.id,
          instagram_handle: cleanHandle,
        })
        .select()
        .single();

      if (profileError) {
        if (profileError.code === '23505') {
          throw new Error('Este concorrente j\u00e1 foi adicionado');
        }
        throw profileError;
      }

      // Create analysis run
      const { data: run, error: runError } = await supabase
        .from('competitor_analysis_runs')
        .insert({
          competitor_id: profile.id,
          status: 'pending',
          progress: 0,
        })
        .select()
        .single();

      if (runError) throw runError;

      // Trigger the pipeline Edge Function
      try {
        await supabase.functions.invoke('competitor-pipeline', {
          body: {
            competitor_id: profile.id,
            run_id: run.id,
          },
        });
      } catch {
        // Pipeline invocation failed - update run status
        await supabase
          .from('competitor_analysis_runs')
          .update({
            status: 'failed',
            error_message: 'Falha ao iniciar o pipeline de an\u00e1lise. A Edge Function pode n\u00e3o estar configurada.',
          })
          .eq('id', run.id);
      }

      return { profile: profile as CompetitorProfile, run: run as CompetitorAnalysisRun };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Delete competitor and all related data
 */
export function useDeleteCompetitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (competitorId: string) => {
      const { error } = await supabase
        .from('competitor_profiles')
        .delete()
        .eq('id', competitorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

/**
 * Re-run analysis for an existing competitor
 */
export function useRerunAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (competitorId: string) => {
      // Create new analysis run
      const { data: run, error: runError } = await supabase
        .from('competitor_analysis_runs')
        .insert({
          competitor_id: competitorId,
          status: 'pending',
          progress: 0,
        })
        .select()
        .single();

      if (runError) throw runError;

      // Trigger pipeline
      try {
        await supabase.functions.invoke('competitor-pipeline', {
          body: {
            competitor_id: competitorId,
            run_id: run.id,
          },
        });
      } catch {
        await supabase
          .from('competitor_analysis_runs')
          .update({
            status: 'failed',
            error_message: 'Falha ao iniciar re-an\u00e1lise.',
          })
          .eq('id', run.id);
      }

      return run as CompetitorAnalysisRun;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
