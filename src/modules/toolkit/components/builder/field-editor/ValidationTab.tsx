/**
 * ValidationTab - Field validation configuration
 */

import * as React from 'react';

import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import type { ValidationConfig } from '../../../types/form.types';

interface ValidationTabProps {
  validation: ValidationConfig;
  onValidationChange: (validation: ValidationConfig) => void;
}

export function ValidationTab({ validation, onValidationChange }: ValidationTabProps) {
  const updateValidation = (updates: Partial<ValidationConfig>) => {
    onValidationChange({ ...validation, ...updates });
  };

  return (
    <div className="space-y-4 pr-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="val-min-length">Tamanho minimo</Label>
          <Input
            id="val-min-length"
            type="number"
            value={validation?.minLength ?? ''}
            onChange={(e) =>
              updateValidation({
                minLength: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="val-max-length">Tamanho maximo</Label>
          <Input
            id="val-max-length"
            type="number"
            value={validation?.maxLength ?? ''}
            onChange={(e) =>
              updateValidation({
                maxLength: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="val-pattern">Padrao (regex)</Label>
        <Input
          id="val-pattern"
          value={validation?.pattern || ''}
          onChange={(e) => updateValidation({ pattern: e.target.value || undefined })}
          placeholder="^[a-zA-Z]+$"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="val-message">Mensagem de erro customizada</Label>
        <Input
          id="val-message"
          value={validation?.customMessage || ''}
          onChange={(e) =>
            updateValidation({ customMessage: e.target.value || undefined })
          }
          placeholder="Por favor, preencha corretamente"
        />
      </div>
    </div>
  );
}
