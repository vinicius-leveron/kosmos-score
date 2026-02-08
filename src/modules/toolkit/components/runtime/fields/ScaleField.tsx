/**
 * ScaleField - Scale/slider field for form runtime
 */

import { cn } from '@/design-system/lib/utils';
import type { FormField, FieldAnswer } from '../../../types/form.types';

interface ScaleFieldProps {
  field: FormField;
  value: FieldAnswer | undefined;
  onChange: (value: FieldAnswer) => void;
  error?: string | null;
}

export function ScaleField({
  field,
  value,
  onChange,
  error,
}: ScaleFieldProps) {
  const { scale_config } = field;
  const min = scale_config?.min ?? 1;
  const max = scale_config?.max ?? 10;
  const step = scale_config?.step ?? 1;

  const currentValue = value?.value !== undefined ? Number(value.value) : undefined;

  // Generate scale points
  const points: number[] = [];
  for (let i = min; i <= max; i += step) {
    points.push(i);
  }

  const handleSelect = (selectedValue: number) => {
    onChange({ value: selectedValue, numericValue: selectedValue });
  };

  return (
    <div className="space-y-4">
      {/* Scale labels */}
      {scale_config?.showLabels !== false && (scale_config?.minLabel || scale_config?.maxLabel) && (
        <div className="flex items-center justify-between text-sm text-kosmos-gray">
          <span>{scale_config.minLabel || min}</span>
          <span>{scale_config.maxLabel || max}</span>
        </div>
      )}

      {/* Scale buttons */}
      <div
        className="flex items-center justify-center gap-2 flex-wrap"
        role="radiogroup"
        aria-describedby={error ? `${field.key}-error` : undefined}
        aria-invalid={!!error}
      >
        {points.map((point) => {
          const isSelected = currentValue === point;

          return (
            <button
              key={point}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(point)}
              className={cn(
                'w-12 h-12 rounded-lg border-2 font-display font-semibold text-lg transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-kosmos-orange focus-visible:ring-offset-2 focus-visible:ring-offset-kosmos-black',
                isSelected
                  ? 'border-kosmos-orange bg-kosmos-orange text-white scale-110'
                  : 'border-border bg-kosmos-black-soft text-kosmos-gray hover:border-kosmos-gray/50 hover:text-kosmos-white'
              )}
            >
              {point}
            </button>
          );
        })}
      </div>

      {error && (
        <p id={`${field.key}-error`} className="text-destructive text-sm text-center">
          {error}
        </p>
      )}
      {field.help_text && !error && (
        <p className="text-kosmos-gray/70 text-sm text-center">{field.help_text}</p>
      )}
    </div>
  );
}
