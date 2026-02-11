/**
 * MultiFieldQuestionScreen - Displays multiple fields on the same screen
 * Used for grouped fields like contact info (name, email, phone)
 */

import { useCallback, useState } from 'react';
import type { FormField, FormBlock, FieldAnswer, FormAnswers } from '../../types/form.types';
import { ProgressBar } from './ProgressBar';
import { FieldRenderer } from './FieldRenderer';
import { NavigationButtons } from './NavigationButtons';
import { validateField } from './utils/validation';

interface MultiFieldQuestionScreenProps {
  /** Fields to display on this screen */
  fields: FormField[];
  /** Block these fields belong to */
  block?: FormBlock | null;
  /** Current screen index */
  currentScreenIndex: number;
  /** Total number of screens */
  totalScreens: number;
  /** Current answers for all fields */
  answers: FormAnswers;
  /** Callback when any answer changes */
  onAnswer: (fieldKey: string, value: FieldAnswer) => void;
  /** Callback to go to next screen */
  onNext: () => void;
  /** Callback to go to previous screen */
  onPrevious: () => void;
  /** Whether can go back */
  canGoBack: boolean;
  /** Whether this is the last screen */
  isLastScreen: boolean;
  /** Form name for header */
  formName?: string;
  /** Whether to show progress bar */
  showProgress?: boolean;
}

export function MultiFieldQuestionScreen({
  fields,
  block,
  currentScreenIndex,
  totalScreens,
  answers,
  onAnswer,
  onNext,
  onPrevious,
  canGoBack,
  isLastScreen,
  formName,
  showProgress = true,
}: MultiFieldQuestionScreenProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if all required fields are answered
  const allFieldsAnswered = fields.every((field) => {
    if (!field.required) return true;
    const answer = answers[field.key];
    return answer !== undefined && answer.value !== '' && answer.value !== null;
  });

  // Validate all fields in this screen
  const validateAllFields = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const answer = answers[field.key];
      const error = validateField(field, answer);
      if (error) {
        newErrors[field.key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, answers]);

  // Handle field answer change
  const handleFieldAnswer = useCallback(
    (fieldKey: string, value: FieldAnswer) => {
      // Clear error for this field
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
      onAnswer(fieldKey, value);
    },
    [onAnswer]
  );

  // Handle form submission (next button)
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (validateAllFields()) {
        onNext();
      }
    },
    [validateAllFields, onNext]
  );

  return (
    <div className="min-h-screen bg-kosmos-black blueprint-grid flex flex-col px-4 py-6 md:py-12 relative">
      {/* Structural Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/20 to-transparent" />

      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col relative z-10">
        {showProgress && (
          <ProgressBar
            currentIndex={currentScreenIndex}
            totalQuestions={totalScreens}
            formName={formName}
            className="mb-8"
          />
        )}

        <form
          onSubmit={handleSubmit}
          className="card-structural flex-1 flex flex-col animate-slide-in"
        >
          <div className="p-6 md:p-10 flex-1 flex flex-col">
            {/* Block Label */}
            {block?.name && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-kosmos-gray text-xs font-display tracking-wider uppercase">
                  {block.name}
                </span>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-6 flex-1">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="block">
                    <span className="font-display text-base font-medium text-kosmos-white">
                      {field.label}
                      {field.required && <span className="text-kosmos-orange ml-1">*</span>}
                    </span>
                    {field.help_text && (
                      <span className="block text-kosmos-gray text-sm mt-1">{field.help_text}</span>
                    )}
                  </label>
                  <FieldRenderer
                    field={field}
                    value={answers[field.key]}
                    onChange={(value) => handleFieldAnswer(field.key, value)}
                    error={errors[field.key]}
                    autoFocus={field === fields[0]}
                  />
                </div>
              ))}
            </div>

            <NavigationButtons
              canGoBack={canGoBack}
              isLastQuestion={isLastScreen}
              canProceed={allFieldsAnswered}
              onPrevious={onPrevious}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
