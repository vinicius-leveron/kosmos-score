/**
 * LongTextField - Textarea field for form runtime
 */

import { Textarea } from '@/design-system/primitives/textarea';
import { cn } from '@/design-system/lib/utils';
import type { FormField, FieldAnswer } from '../../../types/form.types';

interface LongTextFieldProps {
  field: FormField;
  value: FieldAnswer | undefined;
  onChange: (value: FieldAnswer) => void;
  error?: string | null;
  autoFocus?: boolean;
}

export function LongTextField({
  field,
  value,
  onChange,
  error,
  autoFocus,
}: LongTextFieldProps) {
  const currentValue = (value?.value as string) || '';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ value: e.target.value });
  };

  // For textarea, Shift+Enter adds new line, Ctrl/Cmd+Enter submits
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        id={field.key}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={field.placeholder || 'Digite sua resposta...'}
        autoFocus={autoFocus}
        rows={4}
        className={cn(
          'min-h-[120px] text-base bg-kosmos-black border-border resize-none',
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
      <div className="flex items-center justify-between">
        {field.help_text && !error ? (
          <p className="text-kosmos-gray/70 text-sm">{field.help_text}</p>
        ) : (
          <span />
        )}
        <p className="text-kosmos-gray/50 text-xs">
          Ctrl+Enter para continuar
        </p>
      </div>
    </div>
  );
}
