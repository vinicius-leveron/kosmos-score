/**
 * OptionsTab - Field options configuration
 */

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import type { FieldOption } from '../../../types/form.types';

interface OptionsTabProps {
  options: FieldOption[];
  onOptionsChange: (options: FieldOption[]) => void;
}

export function OptionsTab({ options, onOptionsChange }: OptionsTabProps) {
  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onOptionsChange(newOptions);
  };

  const addOption = () => {
    const newIndex = options.length + 1;
    const newOptions = [
      ...options,
      {
        label: `Opcao ${newIndex}`,
        value: `opcao_${newIndex}`,
        numericValue: newIndex,
      },
    ];
    onOptionsChange(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    onOptionsChange(newOptions);
  };

  return (
    <div className="space-y-4 pr-4">
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={option.label}
              onChange={(e) => updateOption(index, { label: e.target.value })}
              placeholder="Label da opcao"
              className="flex-1"
              aria-label={`Label da opcao ${index + 1}`}
            />
            <Input
              type="number"
              value={option.numericValue ?? ''}
              onChange={(e) =>
                updateOption(index, {
                  numericValue: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Valor"
              className="w-20"
              aria-label={`Valor numerico da opcao ${index + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeOption(index)}
              className="shrink-0 text-destructive hover:text-destructive"
              aria-label={`Remover opcao ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" onClick={addOption} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar opcao
      </Button>
    </div>
  );
}
