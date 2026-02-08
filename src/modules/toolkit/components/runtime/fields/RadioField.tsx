/**
 * RadioField - Radio button group field for form runtime
 */

import { RadioGroup, RadioGroupItem } from '@/design-system/primitives/radio-group';
import { cn } from '@/design-system/lib/utils';
import type { FormField, FieldAnswer } from '../../../types/form.types';

interface RadioFieldProps {
  field: FormField;
  value: FieldAnswer | undefined;
  onChange: (value: FieldAnswer) => void;
  error?: string | null;
}

export function RadioField({
  field,
  value,
  onChange,
  error,
}: RadioFieldProps) {
  const currentValue = (value?.value as string) || '';

  const handleChange = (selectedValue: string) => {
    const option = field.options.find((o) => o.value === selectedValue);
    onChange({
      value: selectedValue,
      numericValue: option?.numericValue,
    });
  };

  return (
    <div className="space-y-3">
      <RadioGroup
        value={currentValue}
        onValueChange={handleChange}
        className="space-y-3"
        aria-describedby={error ? `${field.key}-error` : undefined}
        aria-invalid={!!error}
      >
        {field.options.map((option, index) => (
          <label
            key={option.value}
            htmlFor={`${field.key}-${option.value}`}
            className={cn(
              'relative flex items-center space-x-4 rounded-lg border p-4 cursor-pointer transition-all duration-200',
              currentValue === option.value
                ? 'border-kosmos-orange bg-kosmos-orange/10'
                : 'border-border bg-kosmos-black-soft hover:border-kosmos-gray/30 hover:bg-kosmos-black-light'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <RadioGroupItem
              value={option.value}
              id={`${field.key}-${option.value}`}
              className="border-kosmos-gray/50 data-[state=checked]:border-kosmos-orange data-[state=checked]:text-kosmos-orange"
            />
            <span className="flex-1 text-kosmos-white font-medium">
              {option.label}
            </span>
          </label>
        ))}
      </RadioGroup>
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
