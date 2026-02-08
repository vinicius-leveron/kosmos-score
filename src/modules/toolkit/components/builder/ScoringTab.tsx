/**
 * ScoringTab - Configuration panel for form scoring settings
 * Manages scoring formula, classifications, and display options
 */

import * as React from 'react';

import { cn } from '@/design-system/lib/utils';
import { Label } from '@/design-system/primitives/label';
import { Switch } from '@/design-system/primitives/switch';
import { ScrollArea } from '@/design-system/primitives/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ScoringConfig, FormClassification } from '../../types/form.types';
import { ClassificationList } from './scoring/ClassificationList';

interface ScoringTabProps {
  /** Whether scoring is enabled */
  scoringEnabled: boolean;
  /** Scoring configuration */
  scoringConfig: ScoringConfig;
  /** List of classifications */
  classifications: FormClassification[];
  /** Callback when scoring enabled changes */
  onScoringEnabledChange: (enabled: boolean) => void;
  /** Callback when scoring config changes */
  onScoringConfigChange: (config: Partial<ScoringConfig>) => void;
  /** Callback to add a classification */
  onAddClassification: () => void;
  /** Callback to update a classification */
  onUpdateClassification: (id: string, updates: Partial<FormClassification>) => void;
  /** Callback to delete a classification */
  onDeleteClassification: (id: string) => void;
  /** Additional CSS classes */
  className?: string;
}

const FORMULA_OPTIONS = [
  { value: 'sum', label: 'Soma', description: 'Soma todos os valores' },
  { value: 'average', label: 'Media', description: 'Media aritmetica simples' },
  { value: 'weighted_average', label: 'Media ponderada', description: 'Usa os pesos de cada campo' },
] as const;

/**
 * Configuration panel for scoring settings
 */
export function ScoringTab({
  scoringEnabled,
  scoringConfig,
  classifications,
  onScoringEnabledChange,
  onScoringConfigChange,
  onAddClassification,
  onUpdateClassification,
  onDeleteClassification,
  className,
}: ScoringTabProps) {
  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="space-y-6 p-4">
        {/* Enable/Disable Scoring */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="scoring-enabled" className="text-base font-medium">
                  Habilitar pontuacao
                </Label>
                <p className="text-sm text-muted-foreground">
                  Calcular score baseado nas respostas
                </p>
              </div>
              <Switch
                id="scoring-enabled"
                checked={scoringEnabled}
                onCheckedChange={onScoringEnabledChange}
              />
            </div>
          </CardContent>
        </Card>

        {scoringEnabled && (
          <>
            {/* Scoring Formula */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Formula de calculo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scoring-formula">Tipo de calculo</Label>
                  <Select
                    value={scoringConfig.formula}
                    onValueChange={(value) =>
                      onScoringConfigChange({ formula: value as ScoringConfig['formula'] })
                    }
                  >
                    <SelectTrigger id="scoring-formula">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMULA_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <span className="font-medium">{option.label}</span>
                            <span className="ml-2 text-muted-foreground text-xs">
                              - {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <Label htmlFor="show-score" className="text-sm font-medium">
                      Mostrar score ao respondente
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Exibir pontuacao final na tela de resultado
                    </p>
                  </div>
                  <Switch
                    id="show-score"
                    checked={scoringConfig.showScoreToRespondent}
                    onCheckedChange={(checked) =>
                      onScoringConfigChange({ showScoreToRespondent: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <Label htmlFor="show-classification" className="text-sm font-medium">
                      Mostrar classificacao ao respondente
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Exibir categoria (Iniciante, Expert, etc.)
                    </p>
                  </div>
                  <Switch
                    id="show-classification"
                    checked={scoringConfig.showClassificationToRespondent}
                    onCheckedChange={(checked) =>
                      onScoringConfigChange({ showClassificationToRespondent: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Classifications */}
            <ClassificationList
              classifications={classifications}
              onAddClassification={onAddClassification}
              onUpdateClassification={onUpdateClassification}
              onDeleteClassification={onDeleteClassification}
            />
          </>
        )}
      </div>
    </ScrollArea>
  );
}
