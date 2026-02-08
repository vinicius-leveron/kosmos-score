/**
 * Form Runtime Components Index
 * Export all runtime components for form execution
 */

// Main runtime component
export { FormRuntime } from './FormRuntime';

// Screen components
export { WelcomeScreen } from './WelcomeScreen';
export { QuestionScreen } from './QuestionScreen';
export { ThankYouScreen } from './ThankYouScreen';

// UI components
export { ProgressBar } from './ProgressBar';
export { NavigationButtons } from './NavigationButtons';
export { ScoreDisplay, ClassificationBadge } from './ScoreDisplay';
export { FieldRenderer, isSelectionField, isMultiValueField, isInformationalField } from './FieldRenderer';

// Field components
export * from './fields';

// Utilities
export { validateField, hasValidAnswer } from './utils/validation';

// Hooks
export { useFormRuntime } from './hooks/useFormRuntime';
export type { RuntimeStep } from './hooks/useFormRuntime';
