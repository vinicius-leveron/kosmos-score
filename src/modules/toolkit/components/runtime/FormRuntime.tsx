/**
 * FormRuntime - Main orchestrator component for form execution
 *
 * Handles the complete form flow:
 * 1. Welcome screen (optional email capture)
 * 2. Question-by-question navigation (single or multi-field screens)
 * 3. Conditional field visibility
 * 4. Score calculation
 * 5. Thank you screen with results
 */

import { useCallback } from 'react';
import type { FormWithRelations, FormSubmission } from '../../types/form.types';
import { useFormRuntime } from './hooks/useFormRuntime';
import { WelcomeScreen } from './WelcomeScreen';
import { QuestionScreen } from './QuestionScreen';
import { MultiFieldQuestionScreen } from './MultiFieldQuestionScreen';
import { ThankYouScreen } from './ThankYouScreen';

interface FormRuntimeProps {
  /** Form configuration with all relations */
  form: FormWithRelations;
  /** Callback when form is completed */
  onComplete?: (submission: FormSubmission) => void;
}

/**
 * FormRuntime - Renders and manages the complete form experience
 */
export function FormRuntime({ form, onComplete }: FormRuntimeProps) {
  const {
    step,
    answers,
    currentFieldIndex,
    fieldError,
    completedSubmission,
    classification,
    visibleFields,
    currentField,
    currentBlock,
    canGoBack,
    isLastQuestion,
    isCreating,
    // New screen-based props
    screens,
    currentScreen,
    currentScreenIndex,
    isMultiFieldScreen,
    handleStart,
    handleAnswer,
    handleFieldAnswer,
    handleNext,
    handlePrevious,
  } = useFormRuntime({ form, onComplete });

  // Handle CTA click
  const handleCtaClick = useCallback(() => {
    if (form.thank_you_screen.ctaButton?.url) {
      window.open(form.thank_you_screen.ctaButton.url, '_blank');
    }
  }, [form.thank_you_screen.ctaButton]);

  // Handle share
  const handleShare = useCallback(() => {
    const shareText = classification
      ? `Minha classificacao: ${classification.name}`
      : 'Acabei de responder este formulario!';
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: form.name,
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    }
  }, [form.name, classification]);

  // Render based on step
  if (step === 'welcome') {
    return (
      <WelcomeScreen
        form={form}
        onStart={handleStart}
        isLoading={isCreating}
      />
    );
  }

  if (step === 'questions' && currentScreen) {
    // Use MultiFieldQuestionScreen for screens with multiple fields
    if (isMultiFieldScreen) {
      return (
        <MultiFieldQuestionScreen
          fields={currentScreen.fields}
          block={currentScreen.block}
          currentScreenIndex={currentScreenIndex}
          totalScreens={screens.length}
          answers={answers}
          onAnswer={handleFieldAnswer}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoBack={canGoBack}
          isLastScreen={isLastQuestion}
          formName={form.name}
          showProgress={form.settings.showProgressBar}
        />
      );
    }

    // Use single-field QuestionScreen for screens with one field
    if (currentField) {
      return (
        <QuestionScreen
          field={currentField}
          block={currentBlock}
          currentIndex={currentScreenIndex}
          totalFields={screens.length}
          answer={answers[currentField.key]}
          onAnswer={handleAnswer}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoBack={canGoBack}
          isLastQuestion={isLastQuestion}
          error={fieldError}
          formName={form.name}
          showProgress={form.settings.showProgressBar}
          showQuestionNumbers={form.settings.showQuestionNumbers}
        />
      );
    }
  }

  if (step === 'thank_you') {
    return (
      <ThankYouScreen
        form={form}
        submission={completedSubmission || ({} as FormSubmission)}
        classification={classification}
        onCtaClick={handleCtaClick}
        onShare={handleShare}
      />
    );
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-kosmos-black flex items-center justify-center">
      <div className="animate-pulse text-kosmos-gray">Carregando...</div>
    </div>
  );
}
