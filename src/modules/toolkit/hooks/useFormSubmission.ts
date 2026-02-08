/**
 * useFormSubmission - Hook for managing form submissions (runtime)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type {
  FormSubmission,
  FormAnswers,
  SubmissionMetadata,
  FormWithRelations,
} from '../types/form.types';
import { calculateScore } from '../lib/scoringEngine';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const submissionKeys = {
  all: ['submissions'] as const,
  lists: () => [...submissionKeys.all, 'list'] as const,
  listByForm: (formId: string) => [...submissionKeys.lists(), formId] as const,
  details: () => [...submissionKeys.all, 'detail'] as const,
  detail: (id: string) => [...submissionKeys.details(), id] as const,
};

// ============================================================================
// FETCH SUBMISSIONS BY FORM
// ============================================================================

interface UseSubmissionsOptions {
  status?: 'in_progress' | 'completed' | 'abandoned';
  limit?: number;
  offset?: number;
}

export function useSubmissions(formId: string, options: UseSubmissionsOptions = {}) {
  const { status, limit = 50, offset = 0 } = options;

  return useQuery({
    queryKey: [...submissionKeys.listByForm(formId), status, limit, offset],
    queryFn: async () => {
      let query = supabase
        .from('form_submissions')
        .select('*', { count: 'exact' })
        .eq('form_id', formId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { submissions: data as FormSubmission[], total: count || 0 };
    },
    enabled: !!formId,
  });
}

// ============================================================================
// FETCH SINGLE SUBMISSION
// ============================================================================

export function useSubmission(submissionId: string) {
  return useQuery({
    queryKey: submissionKeys.detail(submissionId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (error) throw error;
      return data as FormSubmission;
    },
    enabled: !!submissionId,
  });
}

// ============================================================================
// CREATE SUBMISSION (start filling form)
// ============================================================================

interface CreateSubmissionInput {
  form_id: string;
  respondent_email?: string;
  metadata?: SubmissionMetadata;
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSubmissionInput) => {
      const { data, error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: input.form_id,
          respondent_email: input.respondent_email,
          status: 'in_progress',
          answers: {},
          progress_percentage: 0,
          metadata: input.metadata || {},
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as FormSubmission;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.listByForm(data.form_id) });
    },
  });
}

// ============================================================================
// UPDATE SUBMISSION (save progress)
// ============================================================================

interface UpdateSubmissionInput {
  id: string;
  form_id: string;
  answers?: FormAnswers;
  current_field_key?: string;
  progress_percentage?: number;
  respondent_email?: string;
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, form_id, ...updates }: UpdateSubmissionInput) => {
      const { data, error } = await supabase
        .from('form_submissions')
        .update({
          ...updates,
          last_answered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'in_progress') // Only update in-progress submissions
        .select()
        .single();

      if (error) throw error;
      return { ...data, form_id } as FormSubmission;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(submissionKeys.detail(data.id), data);
    },
  });
}

// ============================================================================
// COMPLETE SUBMISSION
// ============================================================================

interface CompleteSubmissionInput {
  id: string;
  form: FormWithRelations;
  answers: FormAnswers;
  time_spent_seconds: number;
}

export function useCompleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, form, answers, time_spent_seconds }: CompleteSubmissionInput) => {
      // Calculate score if scoring is enabled
      let scoreResult = null;
      if (form.scoring_enabled) {
        scoreResult = calculateScore(form, answers);
      }

      // Find classification based on score
      let classificationId = null;
      if (scoreResult && form.classifications.length > 0) {
        const classification = form.classifications.find(
          (c) => scoreResult.totalScore >= c.min_score && scoreResult.totalScore <= c.max_score
        );
        classificationId = classification?.id || null;
      }

      const { data, error } = await supabase
        .from('form_submissions')
        .update({
          status: 'completed',
          answers,
          progress_percentage: 100,
          score: scoreResult?.totalScore || null,
          pillar_scores: scoreResult?.pillarScores || {},
          computed_data: scoreResult?.computedData || {},
          classification_id: classificationId,
          completed_at: new Date().toISOString(),
          time_spent_seconds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as FormSubmission;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(submissionKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: submissionKeys.listByForm(data.form_id) });
    },
  });
}

// ============================================================================
// ABANDON SUBMISSION
// ============================================================================

export function useAbandonSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formId }: { id: string; formId: string }) => {
      const { data, error } = await supabase
        .from('form_submissions')
        .update({
          status: 'abandoned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, form_id: formId } as FormSubmission;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.listByForm(data.form_id) });
    },
  });
}

// ============================================================================
// GET FORM STATS
// ============================================================================

export function useFormStats(formId: string) {
  return useQuery({
    queryKey: ['form-stats', formId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_form_stats', {
        p_form_id: formId,
      });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!formId,
  });
}
