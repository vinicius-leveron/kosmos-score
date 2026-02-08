/**
 * NumberField - Number input field for form runtime
 */

import { Input } from '@/design-system/primitives/input';
import { cn } from '@/design-system/lib/utils';
import type { FormField, FieldAnswer } from '../../../types/form.types';

interface NumberFieldProps {
  field: FormField;
  value: FieldAnswer | undefined;
  onChange: (value: FieldAnswer) => void;
  error?: string | null;
  autoFocus?: boolean;
}

export function NumberField({
  field,
  value,
  onChange,
  error,
  autoFocus,
}: NumberFieldProps) {
  const currentValue = value?.value !== undefined ? String(value.value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    // Allow empty string
    if (rawValue === '') {
      onChange({ value: '', numericValue: 0 });
      return;
    }

    // Parse number
    const numericValue = parseFloat(rawValue);
    if (!isNaN(numericValue)) {
      onChange({ value: numericValue, numericValue });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    }
  };

  return (
    <div className="space-y-3">
      <Input
        id={field.key}
        type="number"
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={field.placeholder || 'Digite um numero...'}
        autoFocus={autoFocus}
        className={cn(
          'h-14 text-lg bg-kosmos-black border-border',
          'focus:border-kosmos-orange focus:ring-kosmos-orange/20',
          'placeholder:text-kosmos-gray/50 text-kosmos-white',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          error && 'border-destructive focus:border-destructive'
        )}
        aria-describedby={error ? `${field.key}-error` : undefined}
        aria-invalid={!!error}
        min={field.validation?.min}
        max={field.validation?.max}
        required={field.required}
      />
      {error && (
        <p id={`${field.key}-error`} className="text-destructive text-sm">
          {error}
        </p>
      )}
      {field.help_text && !error && (
        <p className="text-kosmos-gray/70 text-sm">{field.help_text}</p>
      )}
    </div>
  );
}
