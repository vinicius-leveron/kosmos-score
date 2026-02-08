/**
 * ThankYouScreenSettings - Thank you/result screen configuration
 */

import * as React from 'react';

import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
import { Switch } from '@/design-system/primitives/switch';
import { Card, CardContent } from '@/design-system/primitives/card';
import type { ThankYouScreenConfig } from '../../../types/form.types';

interface ThankYouScreenSettingsProps {
  thankYouScreen: ThankYouScreenConfig;
  onThankYouScreenChange: (config: Partial<ThankYouScreenConfig>) => void;
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

export function ThankYouScreenSettings({
  thankYouScreen,
  onThankYouScreenChange,
}: ThankYouScreenSettingsProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <SettingToggle
          id="thankyou-enabled"
          label="Exibir tela de resultado"
          description="Mostra uma tela de conclusao apos o envio"
          checked={thankYouScreen.enabled}
          onCheckedChange={(checked) => onThankYouScreenChange({ enabled: checked })}
        />

        {thankYouScreen.enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="thankyou-title">Titulo</Label>
              <Input
                id="thankyou-title"
                value={thankYouScreen.title}
                onChange={(e) => onThankYouScreenChange({ title: e.target.value })}
                placeholder="Obrigado!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thankyou-desc">Descricao</Label>
              <Textarea
                id="thankyou-desc"
                value={thankYouScreen.description || ''}
                onChange={(e) =>
                  onThankYouScreenChange({ description: e.target.value || null })
                }
                placeholder="Suas respostas foram registradas."
                rows={3}
              />
            </div>

            <SettingToggle
              id="show-score-result"
              label="Mostrar pontuacao"
              description="Exibe a pontuacao final"
              checked={thankYouScreen.showScore}
              onCheckedChange={(checked) => onThankYouScreenChange({ showScore: checked })}
            />

            <SettingToggle
              id="show-class-result"
              label="Mostrar classificacao"
              description="Exibe a categoria do resultado"
              checked={thankYouScreen.showClassification}
              onCheckedChange={(checked) =>
                onThankYouScreenChange({ showClassification: checked })
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
