/**
 * GeneralTab - General field settings
 */

import * as React from 'react';

import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
import { Switch } from '@/design-system/primitives/switch';

interface GeneralTabProps {
  label: string;
  fieldKey: string;
  placeholder: string | null | undefined;
  helpText: string | null | undefined;
  required: boolean;
  onLabelChange: (value: string) => void;
  onKeyChange: (value: string) => void;
  onPlaceholderChange: (value: string | null) => void;
  onHelpTextChange: (value: string | null) => void;
  onRequiredChange: (value: boolean) => void;
}

export function GeneralTab({
  label,
  fieldKey,
  placeholder,
  helpText,
  required,
  onLabelChange,
  onKeyChange,
  onPlaceholderChange,
  onHelpTextChange,
  onRequiredChange,
}: GeneralTabProps) {
  return (
    <div className="space-y-4 pr-4">
      <div className="space-y-2">
        <Label htmlFor="field-label">Label</Label>
        <Input
          id="field-label"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder="Pergunta ou instrucao"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="field-key">Chave (identificador)</Label>
        <Input
          id="field-key"
          value={fieldKey}
          onChange={(e) => onKeyChange(e.target.value)}
          placeholder="campo_unico"
        />
        <p className="text-xs text-muted-foreground">
          Identificador unico para uso em integrações
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="field-placeholder">Placeholder</Label>
        <Input
          id="field-placeholder"
          value={placeholder || ''}
          onChange={(e) => onPlaceholderChange(e.target.value || null)}
          placeholder="Texto de exemplo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="field-help">Texto de ajuda</Label>
        <Textarea
          id="field-help"
          value={helpText || ''}
          onChange={(e) => onHelpTextChange(e.target.value || null)}
          placeholder="Instrucoes adicionais para o respondente"
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <Label htmlFor="field-required" className="text-sm font-medium">
            Campo obrigatorio
          </Label>
          <p className="text-xs text-muted-foreground">
            Exigir resposta antes de continuar
          </p>
        </div>
        <Switch
          id="field-required"
          checked={required}
          onCheckedChange={onRequiredChange}
        />
      </div>
    </div>
  );
}
