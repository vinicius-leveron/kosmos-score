/**
 * DateField - Date input field for form runtime
 */

import { Input } from '@/design-system/primitives/input';
import { Calendar } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import type { FormField, FieldAnswer } from '../../../types/form.types';

interface DateFieldProps {
  field: FormField;
  value: FieldAnswer | undefined;
  onChange: (value: FieldAnswer) => void;
  error?: string | null;
  autoFocus?: boolean;
}

export function DateField({
  field,
  value,
  onChange,
  error,
  autoFocus,
}: DateFieldProps) {
  const currentValue = (value?.value as string) || '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ value: e.target.value });
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
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kosmos-gray/50 pointer-events-none" />
        <Input
          id={field.key}
          type="date"
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className={cn(
            'h-14 text-lg bg-kosmos-black border-border pl-12',
            'focus:border-kosmos-orange focus:ring-kosmos-orange/20',
            'text-kosmos-white',
            '[color-scheme:dark]',
            error && 'border-destructive focus:border-destructive'
          )}
          aria-describedby={error ? `${field.key}-error` : undefined}
          aria-invalid={!!error}
          required={field.required}
        />
      </div>
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
