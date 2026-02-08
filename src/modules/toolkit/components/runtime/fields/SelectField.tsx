/**
 * SelectField - Dropdown select field for form runtime
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { cn } from '@/design-system/lib/utils';
import type { FormField, FieldAnswer } from '../../../types/form.types';

interface SelectFieldProps {
  field: FormField;
  value: FieldAnswer | undefined;
  onChange: (value: FieldAnswer) => void;
  error?: string | null;
}

export function SelectField({
  field,
  value,
  onChange,
  error,
}: SelectFieldProps) {
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
      <Select value={currentValue} onValueChange={handleChange}>
        <SelectTrigger
          id={field.key}
          className={cn(
            'h-14 text-lg bg-kosmos-black border-border',
            'focus:border-kosmos-orange focus:ring-kosmos-orange/20',
            'text-kosmos-white',
            !currentValue && 'text-kosmos-gray/50',
            error && 'border-destructive focus:border-destructive'
          )}
          aria-describedby={error ? `${field.key}-error` : undefined}
          aria-invalid={!!error}
        >
          <SelectValue placeholder={field.placeholder || 'Selecione uma opcao...'} />
        </SelectTrigger>
        <SelectContent className="bg-kosmos-black-soft border-border">
          {field.options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-kosmos-white focus:bg-kosmos-orange/20 focus:text-kosmos-white cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
