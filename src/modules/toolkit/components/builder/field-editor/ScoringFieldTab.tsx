/**
 * ScoringFieldTab - Field scoring configuration
 */

import * as React from 'react';

import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';

interface ScoringFieldTabProps {
  scoringWeight: number;
  pillar: string | null | undefined;
  onScoringWeightChange: (weight: number) => void;
  onPillarChange: (pillar: string | null) => void;
}

export function ScoringFieldTab({
  scoringWeight,
  pillar,
  onScoringWeightChange,
  onPillarChange,
}: ScoringFieldTabProps) {
  return (
    <div className="space-y-4 pr-4">
      <div className="space-y-2">
        <Label htmlFor="scoring-weight">Peso da pontuacao</Label>
        <Input
          id="scoring-weight"
          type="number"
          min={0}
          step={0.1}
          value={scoringWeight}
          onChange={(e) => onScoringWeightChange(Number(e.target.value))}
        />
        <p className="text-xs text-muted-foreground">
          Peso deste campo no calculo da pontuacao final
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="scoring-pillar">Pilar</Label>
        <Input
          id="scoring-pillar"
          value={pillar || ''}
          onChange={(e) => onPillarChange(e.target.value || null)}
          placeholder="Ex: Engajamento, Monetizacao"
        />
        <p className="text-xs text-muted-foreground">
          Agrupa campos para calculos de pontuacao por categoria
        </p>
      </div>
    </div>
  );
}
