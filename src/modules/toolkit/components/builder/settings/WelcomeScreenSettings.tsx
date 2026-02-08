/**
 * WelcomeScreenSettings - Welcome screen configuration
 */

import * as React from 'react';

import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
import { Switch } from '@/design-system/primitives/switch';
import { Card, CardContent } from '@/design-system/primitives/card';
import type { WelcomeScreenConfig } from '../../../types/form.types';

interface WelcomeScreenSettingsProps {
  welcomeScreen: WelcomeScreenConfig;
  onWelcomeScreenChange: (config: Partial<WelcomeScreenConfig>) => void;
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

export function WelcomeScreenSettings({
  welcomeScreen,
  onWelcomeScreenChange,
}: WelcomeScreenSettingsProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <SettingToggle
          id="welcome-enabled"
          label="Exibir tela inicial"
          description="Mostra uma tela de boas-vindas antes do formulario"
          checked={welcomeScreen.enabled}
          onCheckedChange={(checked) => onWelcomeScreenChange({ enabled: checked })}
        />

        {welcomeScreen.enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="welcome-title">Titulo</Label>
              <Input
                id="welcome-title"
                value={welcomeScreen.title || ''}
                onChange={(e) => onWelcomeScreenChange({ title: e.target.value || null })}
                placeholder="Bem-vindo ao nosso formulario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcome-desc">Descricao</Label>
              <Textarea
                id="welcome-desc"
                value={welcomeScreen.description || ''}
                onChange={(e) =>
                  onWelcomeScreenChange({ description: e.target.value || null })
                }
                placeholder="Responda algumas perguntas..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="welcome-btn">Texto do botao</Label>
              <Input
                id="welcome-btn"
                value={welcomeScreen.buttonText}
                onChange={(e) => onWelcomeScreenChange({ buttonText: e.target.value })}
                placeholder="Comecar"
              />
            </div>

            <SettingToggle
              id="collect-email"
              label="Coletar e-mail"
              description="Solicita e-mail antes de iniciar"
              checked={welcomeScreen.collectEmail}
              onCheckedChange={(checked) => onWelcomeScreenChange({ collectEmail: checked })}
            />

            {welcomeScreen.collectEmail && (
              <SettingToggle
                id="email-required"
                label="E-mail obrigatorio"
                description="Exige preenchimento do e-mail"
                checked={welcomeScreen.emailRequired}
                onCheckedChange={(checked) =>
                  onWelcomeScreenChange({ emailRequired: checked })
                }
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
