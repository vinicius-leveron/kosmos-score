/**
 * SchedulingSettings - Cal.com scheduling configuration
 */

import * as React from 'react';

import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
import { Switch } from '@/design-system/primitives/switch';
import { Card, CardContent } from '@/design-system/primitives/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import type { SchedulingScreenConfig } from '../../../types/form.types';

interface SchedulingSettingsProps {
  schedulingScreen: SchedulingScreenConfig;
  onSchedulingScreenChange: (config: Partial<SchedulingScreenConfig>) => void;
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

export function SchedulingSettings({
  schedulingScreen,
  onSchedulingScreenChange,
}: SchedulingSettingsProps) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <SettingToggle
          id="scheduling-enabled"
          label="Habilitar agendamento"
          description="Adiciona botao para agendar via Cal.com"
          checked={schedulingScreen.enabled}
          onCheckedChange={(checked) => onSchedulingScreenChange({ enabled: checked })}
        />

        {schedulingScreen.enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="cal-link">
                Cal.com Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cal-link"
                value={schedulingScreen.calLink}
                onChange={(e) => onSchedulingScreenChange({ calLink: e.target.value })}
                placeholder="seu-usuario"
              />
              <p className="text-xs text-muted-foreground">
                Seu username do Cal.com (ex: vinicius-kosmos)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-type">Tipo de Evento (opcional)</Label>
              <Input
                id="event-type"
                value={schedulingScreen.eventType || ''}
                onChange={(e) =>
                  onSchedulingScreenChange({ eventType: e.target.value || null })
                }
                placeholder="30min"
              />
              <p className="text-xs text-muted-foreground">
                Slug do evento especifico (ex: 30min, consultoria)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta-text">Texto do Botao</Label>
              <Input
                id="cta-text"
                value={schedulingScreen.ctaText}
                onChange={(e) => onSchedulingScreenChange({ ctaText: e.target.value })}
                placeholder="Agendar conversa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduling-title">Titulo da Tela</Label>
              <Input
                id="scheduling-title"
                value={schedulingScreen.title}
                onChange={(e) => onSchedulingScreenChange({ title: e.target.value })}
                placeholder="Agende uma conversa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduling-desc">Descricao</Label>
              <Textarea
                id="scheduling-desc"
                value={schedulingScreen.description || ''}
                onChange={(e) =>
                  onSchedulingScreenChange({ description: e.target.value || null })
                }
                placeholder="Escolha o melhor horario para conversarmos..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Layout do Calendario</Label>
              <Select
                value={schedulingScreen.layout}
                onValueChange={(value) =>
                  onSchedulingScreenChange({
                    layout: value as SchedulingScreenConfig['layout'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month_view">Mensal</SelectItem>
                  <SelectItem value="week_view">Semanal</SelectItem>
                  <SelectItem value="column_view">Coluna</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tema</Label>
              <Select
                value={schedulingScreen.theme}
                onValueChange={(value) =>
                  onSchedulingScreenChange({
                    theme: value as SchedulingScreenConfig['theme'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="auto">Automatico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SettingToggle
              id="hide-event-details"
              label="Ocultar detalhes do evento"
              description="Esconde descricao e duracao do evento no embed"
              checked={schedulingScreen.hideEventTypeDetails}
              onCheckedChange={(checked) =>
                onSchedulingScreenChange({ hideEventTypeDetails: checked })
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
