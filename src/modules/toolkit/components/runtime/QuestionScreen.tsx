/**
 * QuestionScreen - Individual question display for form runtime
 */

import { useEffect, useCallback } from 'react';
import type { FormField, FormBlock, FieldAnswer } from '../../types/form.types';
import { ProgressBar } from './ProgressBar';
import { FieldRenderer, isSelectionField, isInformationalField } from './FieldRenderer';
import { NavigationButtons } from './NavigationButtons';

interface QuestionScreenProps {
  /** Current field to display */
  field: FormField;
  /** Optional block this field belongs to */
  block?: FormBlock | null;
  /** Current field index (0-based) */
  currentIndex: number;
  /** Total number of visible fields */
  totalFields: number;
  /** Current answer for this field */
  answer: FieldAnswer | undefined;
  /** Callback when answer changes */
  onAnswer: (value: FieldAnswer) => void;
  /** Callback to go to next question */
  onNext: () => void;
  /** Callback to go to previous question */
  onPrevious: () => void;
  /** Whether can go back */
  canGoBack: boolean;
  /** Whether this is the last question */
  isLastQuestion: boolean;
  /** Validation error for current field */
  error?: string | null;
  /** Form name for progress bar */
  formName?: string;
  /** Whether to show progress bar */
  showProgress?: boolean;
  /** Whether to show question numbers */
  showQuestionNumbers?: boolean;
}

/**
 * Displays a single question with navigation
 */
export function QuestionScreen({
  field,
  block,
  currentIndex,
  totalFields,
  answer,
  onAnswer,
  onNext,
  onPrevious,
  canGoBack,
  isLastQuestion,
  error,
  formName,
  showProgress = true,
  showQuestionNumbers = true,
}: QuestionScreenProps) {
  const hasAnswer = answer !== undefined && answer.value !== '' && answer.value !== null;
  const canProceed = hasAnswer || isInformationalField(field.type);

  // Auto-advance for selection fields
  const handleAnswerChange = useCallback(
    (value: FieldAnswer) => {
      onAnswer(value);
      if (isSelectionField(field.type) && value.value) {
        setTimeout(onNext, 300);
      }
    },
    [field.type, onAnswer, onNext]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Enter' && !e.shiftKey && !isInput && canProceed) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canProceed, onNext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canProceed) onNext();
  };

  const getPillarLabel = (pillar?: string | null) => pillar?.toUpperCase() || null;

  return (
    <div className="min-h-screen bg-kosmos-black blueprint-grid flex flex-col px-4 py-6 md:py-12 relative">
      {/* Structural Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/20 to-transparent" />

      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col relative z-10">
        {showProgress && (
          <ProgressBar
            currentIndex={currentIndex}
            totalQuestions={totalFields}
            formName={formName}
            className="mb-8"
          />
        )}

        <form
          onSubmit={handleSubmit}
          className="card-structural flex-1 flex flex-col animate-slide-in"
        >
          <div className="p-6 md:p-10 flex-1 flex flex-col">
            {/* Block/Pillar Label */}
            <div className="flex items-center gap-3 mb-6">
              {block?.name && (
                <span className="text-kosmos-gray text-xs font-display tracking-wider uppercase">
                  {block.name}
                </span>
              )}
              {block?.name && field.pillar && <div className="w-px h-3 bg-border" />}
              {field.pillar && (
                <span className="text-kosmos-orange text-xs font-display tracking-wider">
                  {getPillarLabel(field.pillar)}
                </span>
              )}
            </div>

            {showQuestionNumbers && (
              <div className="text-kosmos-gray/50 text-sm mb-2">
                Pergunta {currentIndex + 1}
              </div>
            )}

            <h2 className="font-display text-xl md:text-2xl font-semibold text-kosmos-white mb-2 leading-tight">
              {field.label}
              {field.required && <span className="text-kosmos-orange ml-1">*</span>}
            </h2>

            {field.placeholder && !isSelectionField(field.type) && (
              <p className="text-kosmos-gray text-sm mb-6">{field.placeholder}</p>
            )}

            <div className="mt-4 flex-1">
              <FieldRenderer
                field={field}
                value={answer}
                onChange={handleAnswerChange}
                error={error}
                autoFocus={true}
              />
            </div>

            <NavigationButtons
              canGoBack={canGoBack}
              isLastQuestion={isLastQuestion}
              canProceed={canProceed}
              onPrevious={onPrevious}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
