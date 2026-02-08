/**
 * MultiSelectField - Multiple checkbox selection field for form runtime
 */

import { Checkbox } from '@/design-system/primitives/checkbox';
import { cn } from '@/design-system/lib/utils';
import type { FormField, FieldAnswer } from '../../../types/form.types';

interface MultiSelectFieldProps {
  field: FormField;
  value: FieldAnswer | undefined;
  onChange: (value: FieldAnswer) => void;
  error?: string | null;
}

export function MultiSelectField({
  field,
  value,
  onChange,
  error,
}: MultiSelectFieldProps) {
  const currentValues: string[] = Array.isArray(value?.value)
    ? (value.value as string[])
    : [];

  const handleToggle = (optionValue: string, checked: boolean) => {
    let newValues: string[];

    if (checked) {
      newValues = [...currentValues, optionValue];
    } else {
      newValues = currentValues.filter((v) => v !== optionValue);
    }

    // Calculate total numeric value from selected options
    const numericValue = newValues.reduce((sum, val) => {
      const option = field.options.find((o) => o.value === val);
      return sum + (option?.numericValue || 0);
    }, 0);

    onChange({ value: newValues, numericValue });
  };

  return (
    <div className="space-y-3">
      <div
        className="space-y-3"
        role="group"
        aria-describedby={error ? `${field.key}-error` : undefined}
        aria-invalid={!!error}
      >
        {field.options.map((option, index) => {
          const isChecked = currentValues.includes(option.value);

          return (
            <label
              key={option.value}
              htmlFor={`${field.key}-${option.value}`}
              className={cn(
                'relative flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-all duration-200',
                isChecked
                  ? 'border-kosmos-orange bg-kosmos-orange/10'
                  : 'border-border bg-kosmos-black-soft hover:border-kosmos-gray/30 hover:bg-kosmos-black-light'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Checkbox
                id={`${field.key}-${option.value}`}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  handleToggle(option.value, checked as boolean)
                }
                className="border-kosmos-gray/50 data-[state=checked]:border-kosmos-orange data-[state=checked]:bg-kosmos-orange"
              />
              <span className="flex-1 text-kosmos-white font-medium">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
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
          {currentValues.length} selecionado{currentValues.length !== 1 && 's'}
        </p>
      </div>
    </div>
  );
}
