/**
 * ScaleTab - Scale field configuration
 */

import * as React from 'react';

import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import type { ScaleConfig } from '../../../types/form.types';

interface ScaleTabProps {
  scaleConfig: ScaleConfig;
  onScaleConfigChange: (config: ScaleConfig) => void;
}

export function ScaleTab({ scaleConfig, onScaleConfigChange }: ScaleTabProps) {
  const updateConfig = (updates: Partial<ScaleConfig>) => {
    onScaleConfigChange({ ...scaleConfig, ...updates });
  };

  return (
    <div className="space-y-4 pr-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scale-min">Valor minimo</Label>
          <Input
            id="scale-min"
            type="number"
            value={scaleConfig?.min ?? 1}
            onChange={(e) => updateConfig({ min: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scale-max">Valor maximo</Label>
          <Input
            id="scale-max"
            type="number"
            value={scaleConfig?.max ?? 5}
            onChange={(e) => updateConfig({ max: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scale-min-label">Label minimo</Label>
          <Input
            id="scale-min-label"
            value={scaleConfig?.minLabel || ''}
            onChange={(e) => updateConfig({ minLabel: e.target.value })}
            placeholder="Ex: Discordo totalmente"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="scale-max-label">Label maximo</Label>
          <Input
            id="scale-max-label"
            value={scaleConfig?.maxLabel || ''}
            onChange={(e) => updateConfig({ maxLabel: e.target.value })}
            placeholder="Ex: Concordo totalmente"
          />
        </div>
      </div>
    </div>
  );
}
