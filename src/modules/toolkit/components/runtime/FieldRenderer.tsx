/**
 * FieldRenderer - Switch component that renders the appropriate field type
 */

import type { FormField, FieldAnswer, FormFieldType } from '../../types/form.types';
import {
  TextField,
  LongTextField,
  EmailField,
  PhoneField,
  NumberField,
  DateField,
  RadioField,
  SelectField,
  MultiSelectField,
  ScaleField,
  StatementField,
} from './fields';

interface FieldRendererProps {
  /** The field configuration */
  field: FormField;
  /** Current field value */
  value: FieldAnswer | undefined;
  /** Callback when value changes */
  onChange: (value: FieldAnswer) => void;
  /** Validation error message */
  error?: string | null;
  /** Whether to auto-focus the field */
  autoFocus?: boolean;
}

/**
 * Renders the appropriate field component based on field type
 */
export function FieldRenderer({
  field,
  value,
  onChange,
  error,
  autoFocus = true,
}: FieldRendererProps) {
  const commonProps = {
    field,
    value,
    onChange,
    error,
    autoFocus,
  };

  switch (field.type) {
    case 'text':
      return <TextField {...commonProps} />;

    case 'long_text':
      return <LongTextField {...commonProps} />;

    case 'email':
      return <EmailField {...commonProps} />;

    case 'phone':
      return <PhoneField {...commonProps} />;

    case 'number':
      return <NumberField {...commonProps} />;

    case 'date':
      return <DateField {...commonProps} />;

    case 'radio':
      return <RadioField {...commonProps} />;

    case 'select':
      return <SelectField {...commonProps} />;

    case 'multi_select':
      return <MultiSelectField {...commonProps} />;

    case 'scale':
      return <ScaleField {...commonProps} />;

    case 'statement':
      return <StatementField {...commonProps} />;

    case 'file':
      // File upload not implemented yet - show as text for now
      return <TextField {...commonProps} />;

    default:
      // Fallback for unknown types
      console.warn(`Unknown field type: ${field.type}`);
      return <TextField {...commonProps} />;
  }
}

/**
 * Check if a field type requires selection (radio, select, scale)
 * These fields auto-advance on selection
 */
export function isSelectionField(type: FormFieldType): boolean {
  return ['radio', 'select', 'scale'].includes(type);
}

/**
 * Check if a field type is multi-value
 */
export function isMultiValueField(type: FormFieldType): boolean {
  return type === 'multi_select';
}

/**
 * Check if a field type is informational (no data collected)
 */
export function isInformationalField(type: FormFieldType): boolean {
  return type === 'statement';
}
