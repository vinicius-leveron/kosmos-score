/**
 * useFormRuntime - Custom hook for form runtime state management
 * Supports both single-field and multi-field screens (block-based grouping)
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import type {
  FormWithRelations,
  FormSubmission,
  FormAnswers,
  FieldAnswer,
  FormClassification,
  FormField,
  FormBlock,
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

/** A screen can contain one or more fields */
export interface FormScreen {
  fields: FormField[];
  block: FormBlock | null;
}

interface UseFormRuntimeOptions {
  form: FormWithRelations;
  onComplete?: (submission: FormSubmission) => void;
}

/**
 * Groups consecutive fields by block_id to create screens
 * Fields in the same block appear on the same screen
 */
function groupFieldsIntoScreens(fields: FormField[], blocks: FormBlock[]): FormScreen[] {
  const screens: FormScreen[] = [];
  let currentScreen: FormScreen | null = null;

  for (const field of fields) {
    const block = field.block_id ? blocks.find((b) => b.id === field.block_id) || null : null;

    // Check if this field should be on the same screen as the previous
    // Fields are grouped if they have the same block_id
    if (currentScreen && currentScreen.block?.id === field.block_id && field.block_id) {
      currentScreen.fields.push(field);
    } else {
      // Start a new screen
      currentScreen = {
        fields: [field],
        block,
      };
      screens.push(currentScreen);
    }
  }

  return screens;
}

export function useFormRuntime({ form, onComplete }: UseFormRuntimeOptions) {
  // Step state
  const [step, setStep] = useState<RuntimeStep>(() =>
    form.welcome_screen.enabled ? 'welcome' : 'questions'
  );

  // Submission state
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
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

  // Group fields into screens (fields in same block = same screen)
  const screens = useMemo(() => {
    return groupFieldsIntoScreens(visibleFields, form.blocks);
  }, [visibleFields, form.blocks]);

  // Get current screen
  const currentScreen = screens[currentScreenIndex];

  // For backwards compatibility, also expose single field (first field of current screen)
  const currentField = currentScreen?.fields[0];
  const currentFieldIndex = visibleFields.findIndex((f) => f.id === currentField?.id);

  // Get block for current screen
  const currentBlock = currentScreen?.block || null;

  // Check if current screen has multiple fields
  const isMultiFieldScreen = (currentScreen?.fields.length || 0) > 1;

  // Check navigation states
  const canGoBack = currentScreenIndex > 0 && form.settings.allowBack;
  const isLastQuestion = currentScreenIndex === screens.length - 1;

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

  // Handle answer change (for single field)
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

  // Handle answer change for specific field (for multi-field screens)
  const handleFieldAnswer = useCallback(
    (fieldKey: string, value: FieldAnswer) => {
      setFieldError(null);
      setAnswers((prev) => ({
        ...prev,
        [fieldKey]: value,
      }));
    },
    []
  );

  // Validate current field (single field mode)
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

  // Validate all fields in current screen (multi-field mode)
  const validateCurrentScreen = useCallback((): boolean => {
    if (!currentScreen) return true;

    for (const field of currentScreen.fields) {
      const answer = answers[field.key];
      const error = validateField(field, answer);
      if (error) {
        setFieldError(error);
        return false;
      }
    }

    setFieldError(null);
    return true;
  }, [currentScreen, answers]);

  // Handle next question
  const handleNext = useCallback(async () => {
    // Validate based on screen type
    if (isMultiFieldScreen) {
      if (!validateCurrentScreen()) return;
    } else if (currentField?.type !== 'statement' && !validateCurrentField()) {
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
      setCurrentScreenIndex((prev) => prev + 1);

      if (submissionId) {
        const progress = ((currentScreenIndex + 1) / screens.length) * 100;
        const nextScreen = screens[currentScreenIndex + 1];
        updateSubmission.mutate({
          id: submissionId,
          form_id: form.id,
          answers,
          current_field_key: nextScreen?.fields[0]?.key,
          progress_percentage: Math.round(progress),
        });
      }
    }
  }, [
    currentField,
    isMultiFieldScreen,
    isLastQuestion,
    validateCurrentField,
    validateCurrentScreen,
    submissionId,
    form,
    answers,
    currentScreenIndex,
    screens,
    completeSubmission,
    updateSubmission,
    onComplete,
  ]);

  // Handle previous question
  const handlePrevious = useCallback(() => {
    if (canGoBack) {
      setFieldError(null);
      setCurrentScreenIndex((prev) => prev - 1);
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

    // Screen-based navigation
    screens,
    currentScreen,
    currentScreenIndex,
    isMultiFieldScreen,

    // Computed (backwards compatible)
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
    handleFieldAnswer,
    handleNext,
    handlePrevious,
  };
}
