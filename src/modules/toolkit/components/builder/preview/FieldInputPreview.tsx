/**
 * FieldInputPreview - Renders a preview of field input based on type
 */

import * as React from 'react';
import type { FormField } from '../../../types/form.types';

interface FieldInputPreviewProps {
  field: FormField;
  primaryColor: string;
}

export function FieldInputPreview({ field, primaryColor }: FieldInputPreviewProps) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'number':
    case 'date':
      return (
        <input
          type={field.type === 'long_text' ? 'text' : field.type}
          placeholder={field.placeholder || ''}
          disabled
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      );

    case 'long_text':
      return (
        <textarea
          placeholder={field.placeholder || ''}
          disabled
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
        />
      );

    case 'select':
      return (
        <select
          disabled
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option>{field.placeholder || 'Selecione...'}</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {field.options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <div
                className="h-4 w-4 rounded-full border-2"
                style={{ borderColor: primaryColor }}
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case 'multi_select':
      return (
        <div className="space-y-2">
          {field.options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <div
                className="h-4 w-4 rounded border-2"
                style={{ borderColor: primaryColor }}
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case 'scale': {
      const { min = 1, max = 5 } = field.scale_config || {};
      const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return (
        <div className="space-y-2">
          <div className="flex justify-between gap-2">
            {range.map((num) => (
              <button
                key={num}
                disabled
                className="flex-1 rounded-md border border-input py-2 text-sm hover:border-primary"
              >
                {num}
              </button>
            ))}
          </div>
          {(field.scale_config?.minLabel || field.scale_config?.maxLabel) && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{field.scale_config.minLabel}</span>
              <span>{field.scale_config.maxLabel}</span>
            </div>
          )}
        </div>
      );
    }

    case 'statement':
      return null;

    case 'file':
      return (
        <div className="rounded-md border-2 border-dashed border-input p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Arraste arquivos ou clique para fazer upload
          </p>
        </div>
      );

    default:
      return null;
  }
}
