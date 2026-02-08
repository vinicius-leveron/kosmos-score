/**
 * TextField - Text input field for form runtime
 */

import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { cn } from '@/design-system/lib/utils';
import type { FormField, FieldAnswer } from '../../../types/form.types';

interface TextFieldProps {
  field: FormField;
  value: FieldAnswer | undefined;
  onChange: (value: FieldAnswer) => void;
  error?: string | null;
  autoFocus?: boolean;
}

export function TextField({
  field,
  value,
  onChange,
  error,
  autoFocus,
}: TextFieldProps) {
  const currentValue = (value?.value as string) || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ value: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Let parent handle navigation
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
        type="text"
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={field.placeholder || 'Digite sua resposta...'}
        autoFocus={autoFocus}
        className={cn(
          'h-14 text-lg bg-kosmos-black border-border',
          'focus:border-kosmos-orange focus:ring-kosmos-orange/20',
          'placeholder:text-kosmos-gray/50 text-kosmos-white',
          error && 'border-destructive focus:border-destructive'
        )}
        aria-describedby={error ? `${field.key}-error` : undefined}
        aria-invalid={!!error}
        minLength={field.validation?.minLength}
        maxLength={field.validation?.maxLength}
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
