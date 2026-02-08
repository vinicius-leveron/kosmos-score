/**
 * KOSMOS Toolkit Module
 * Dynamic forms system (TypeForm-like)
 */

// Types
export * from './types/form.types';

// Hooks
export { useForms, useForm, useFormBySlug, useCreateForm, useUpdateForm, usePublishForm, useDeleteForm, formKeys } from './hooks/useForms';
export { useCreateField, useUpdateField, useDeleteField, useReorderFields, useDuplicateField } from './hooks/useFormFields';
export { useSubmissions, useSubmission, useCreateSubmission, useUpdateSubmission, useCompleteSubmission, useAbandonSubmission, useFormStats, submissionKeys } from './hooks/useFormSubmission';

// Libraries
export { calculateScore, getClassification, calculateKosmosMetrics } from './lib/scoringEngine';
export { isFieldVisible, getVisibleFields, hasCircularDependency, validateFormConditions, getConditionDescription } from './lib/conditionEvaluator';
export { FIELD_REGISTRY, FIELD_CATEGORIES, getFieldDefinition, getFieldsByCategory, getAllFields } from './lib/fieldRegistry';

// Components
export { FormBuilder } from './components/builder';
export { FormRuntime } from './components/runtime';

// Components - Analytics
export { AnalyticsOverview, SubmissionsList, SubmissionFunnel } from './components/analytics';

// Pages
export { FormsListPage } from './pages/FormsListPage';
export { FormEditorPage } from './pages/FormEditorPage';
export { FormPublicPage } from './pages/FormPublicPage';
export { FormAnalyticsPage } from './pages/FormAnalyticsPage';
