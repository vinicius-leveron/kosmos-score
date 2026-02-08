/**
 * BehaviorSettings - Form behavior configuration
 */

import * as React from 'react';

import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Switch } from '@/design-system/primitives/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { FormSettings } from '../../../types/form.types';

interface BehaviorSettingsProps {
  settings: FormSettings;
  onSettingsChange: (settings: Partial<FormSettings>) => void;
}

interface SettingToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function SettingToggle({ id, label, description, checked, onCheckedChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function BehaviorSettings({ settings, onSettingsChange }: BehaviorSettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Navegacao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            id="show-progress"
            label="Mostrar barra de progresso"
            description="Exibe o progresso do respondente"
            checked={settings.showProgressBar}
            onCheckedChange={(checked) => onSettingsChange({ showProgressBar: checked })}
          />

          <SettingToggle
            id="allow-back"
            label="Permitir voltar"
            description="Permite navegar para perguntas anteriores"
            checked={settings.allowBack}
            onCheckedChange={(checked) => onSettingsChange({ allowBack: checked })}
          />

          <SettingToggle
            id="show-numbers"
            label="Numerar perguntas"
            description="Exibe numero antes de cada pergunta"
            checked={settings.showQuestionNumbers}
            onCheckedChange={(checked) => onSettingsChange({ showQuestionNumbers: checked })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progresso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            id="save-progress"
            label="Salvar progresso"
            description="Permite continuar de onde parou"
            checked={settings.saveProgress}
            onCheckedChange={(checked) => onSettingsChange({ saveProgress: checked })}
          />

          {settings.saveProgress && (
            <div className="space-y-2">
              <Label htmlFor="expire-days">Dias para expirar</Label>
              <Input
                id="expire-days"
                type="number"
                min={1}
                max={365}
                value={settings.progressExpireDays}
                onChange={(e) =>
                  onSettingsChange({ progressExpireDays: Number(e.target.value) })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Textos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submit-btn">Texto do botao de envio</Label>
            <Input
              id="submit-btn"
              value={settings.submitButtonText}
              onChange={(e) => onSettingsChange({ submitButtonText: e.target.value })}
              placeholder="Enviar"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="required-indicator">Indicador de obrigatorio</Label>
            <Input
              id="required-indicator"
              value={settings.requiredFieldIndicator}
              onChange={(e) => onSettingsChange({ requiredFieldIndicator: e.target.value })}
              placeholder="*"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
