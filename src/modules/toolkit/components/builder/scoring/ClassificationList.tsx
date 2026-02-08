/**
 * ClassificationList - List of score classifications
 */

import * as React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { FormClassification } from '../../../types/form.types';

interface ClassificationListProps {
  classifications: FormClassification[];
  onAddClassification: () => void;
  onUpdateClassification: (id: string, updates: Partial<FormClassification>) => void;
  onDeleteClassification: (id: string) => void;
}

interface ClassificationItemProps {
  classification: FormClassification;
  onUpdate: (updates: Partial<FormClassification>) => void;
  onDelete: () => void;
}

function ClassificationItem({ classification, onUpdate, onDelete }: ClassificationItemProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border p-3">
      <div className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center text-muted-foreground">
        <GripVertical className="h-4 w-4" />
      </div>

      <div
        className="h-8 w-8 shrink-0 rounded-md"
        style={{ backgroundColor: classification.color || '#6B7280' }}
      />

      <Input
        value={classification.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        className="flex-1"
        placeholder="Nome da classificacao"
        aria-label="Nome da classificacao"
      />

      <div className="flex items-center gap-1 shrink-0">
        <Input
          type="number"
          value={classification.min_score}
          onChange={(e) => onUpdate({ min_score: Number(e.target.value) })}
          className="w-16 text-center"
          aria-label="Pontuacao minima"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type="number"
          value={classification.max_score}
          onChange={(e) => onUpdate({ max_score: Number(e.target.value) })}
          className="w-16 text-center"
          aria-label="Pontuacao maxima"
        />
      </div>

      <Input
        type="color"
        value={classification.color || '#6B7280'}
        onChange={(e) => onUpdate({ color: e.target.value })}
        className="h-8 w-10 shrink-0 p-0 cursor-pointer"
        aria-label="Cor da classificacao"
      />

      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="shrink-0 text-destructive hover:text-destructive"
        aria-label="Remover classificacao"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ClassificationList({
  classifications,
  onAddClassification,
  onUpdateClassification,
  onDeleteClassification,
}: ClassificationListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Classificacoes</CardTitle>
        <Button variant="outline" size="sm" onClick={onAddClassification}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </CardHeader>
      <CardContent>
        {classifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma classificacao definida. Adicione faixas de pontuacao.
          </p>
        ) : (
          <div className="space-y-3">
            {classifications.map((classification) => (
              <ClassificationItem
                key={classification.id}
                classification={classification}
                onUpdate={(updates) => onUpdateClassification(classification.id, updates)}
                onDelete={() => onDeleteClassification(classification.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
