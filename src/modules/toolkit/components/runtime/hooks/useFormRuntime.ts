/**
 * useFormRuntime - Custom hook for form runtime state management
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import type {
  FormWithRelations,
  FormSubmission,
  FormAnswers,
  FieldAnswer,
  FormClassification,
} from '../../../types/form.types';
import {
  useCreateSubmission,
  useUpdateSubmission,
  useCompleteSubmission,
} from '../../../hooks/useFormSubmission';
import { getVisibleFields } from '../../../lib/conditionEvaluator';
import { getClassification } from '../../../lib/scoringEngine';
import { validateField } from '../utils/validation';

export type RuntimeStep = 'welcome' | 'questions' | 'thank_you';

interface UseFormRuntimeOptions {
  form: FormWithRelations;
  onComplete?: (submission: FormSubmission) => void;
}

export function useFormRuntime({ form, onComplete }: UseFormRuntimeOptions) {
  // Step state
  const [step, setStep] = useState<RuntimeStep>(() =>
    form.welcome_screen.enabled ? 'welcome' : 'questions'
  );

  // Submission state
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [completedSubmission, setCompletedSubmission] = useState<FormSubmission | null>(null);
  const [classification, setClassification] = useState<FormClassification | null>(null);

  // Timer for time spent tracking
  const startTimeRef = useRef<number>(Date.now());

  // Mutations
  const createSubmission = useCreateSubmission();
  const updateSubmission = useUpdateSubmission();
  const completeSubmission = useCompleteSubmission();

  // Calculate visible fields based on current answers
  const visibleFields = useMemo(() => {
    return getVisibleFields(form.fields, answers);
  }, [form.fields, answers]);

  // Get current field
  const currentField = visibleFields[currentFieldIndex];

  // Get block for current field
  const currentBlock = useMemo(() => {
    if (!currentField?.block_id) return null;
    return form.blocks.find((b) => b.id === currentField.block_id) || null;
  }, [currentField, form.blocks]);

  // Check navigation states
  const canGoBack = currentFieldIndex > 0 && form.settings.allowBack;
  const isLastQuestion = currentFieldIndex === visibleFields.length - 1;

  // Handle welcome screen start
  const handleStart = useCallback(
    async (email?: string) => {
      try {
        const submission = await createSubmission.mutateAsync({
          form_id: form.id,
          respondent_email: email,
          metadata: {
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          },
        });

        setSubmissionId(submission.id);
        startTimeRef.current = Date.now();
        setStep('questions');
      } catch (error) {
        console.error('Failed to create submission:', error);
        setStep('questions');
      }
    },
    [createSubmission, form.id]
  );

  // Handle answer change
  const handleAnswer = useCallback(
    (value: FieldAnswer) => {
      if (!currentField) return;

      setFieldError(null);
      setAnswers((prev) => ({
        ...prev,
        [currentField.key]: value,
      }));
    },
    [currentField]
  );

  // Validate current field
  const validateCurrentField = useCallback((): boolean => {
    if (!currentField) return true;

    const answer = answers[currentField.key];
    const error = validateField(currentField, answer);

    if (error) {
      setFieldError(error);
      return false;
    }

    setFieldError(null);
    return true;
  }, [currentField, answers]);

  // Handle next question
  const handleNext = useCallback(async () => {
    if (currentField?.type !== 'statement' && !validateCurrentField()) {
      return;
    }

    if (isLastQuestion) {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

      try {
        const result = await completeSubmission.mutateAsync({
          id: submissionId || '',
          form,
          answers,
          time_spent_seconds: timeSpent,
        });

        setCompletedSubmission(result);

        if (form.scoring_enabled && result.score !== null) {
          const cls = getClassification(form, result.score);
          setClassification(cls);
        }

        onComplete?.(result);
        setStep('thank_you');
      } catch (error) {
        console.error('Failed to complete submission:', error);
        setStep('thank_you');
      }
    } else {
      setCurrentFieldIndex((prev) => prev + 1);

      if (submissionId) {
        const progress = ((currentFieldIndex + 1) / visibleFields.length) * 100;
        updateSubmission.mutate({
          id: submissionId,
          form_id: form.id,
          answers,
          current_field_key: visibleFields[currentFieldIndex + 1]?.key,
          progress_percentage: Math.round(progress),
        });
      }
    }
  }, [
    currentField,
    isLastQuestion,
    validateCurrentField,
    submissionId,
    form,
    answers,
    currentFieldIndex,
    visibleFields,
    completeSubmission,
    updateSubmission,
    onComplete,
  ]);

  // Handle previous question
  const handlePrevious = useCallback(() => {
    if (canGoBack) {
      setFieldError(null);
      setCurrentFieldIndex((prev) => prev - 1);
    }
  }, [canGoBack]);

  return {
    // State
    step,
    answers,
    currentFieldIndex,
    fieldError,
    completedSubmission,
    classification,

    // Computed
    visibleFields,
    currentField,
    currentBlock,
    canGoBack,
    isLastQuestion,

    // Loading states
    isCreating: createSubmission.isPending,
    isCompleting: completeSubmission.isPending,

    // Actions
    handleStart,
    handleAnswer,
    handleNext,
    handlePrevious,
  };
}
