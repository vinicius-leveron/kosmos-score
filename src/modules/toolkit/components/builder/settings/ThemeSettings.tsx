/**
 * ThemeSettings - Form theme/appearance configuration
 */

import * as React from 'react';

import { Input } from '@/design-system/primitives/input';
import { Label } from '@/design-system/primitives/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { FormTheme } from '../../../types/form.types';

interface ThemeSettingsProps {
  theme: FormTheme;
  onThemeChange: (theme: Partial<FormTheme>) => void;
}

interface ColorInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInput({ id, label, value, onChange }: ColorInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 p-0 cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-xs"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function ThemeSettings({ theme, onThemeChange }: ThemeSettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <ColorInput
              id="primary-color"
              label="Primaria"
              value={theme.primaryColor}
              onChange={(value) => onThemeChange({ primaryColor: value })}
            />
            <ColorInput
              id="bg-color"
              label="Fundo"
              value={theme.backgroundColor}
              onChange={(value) => onThemeChange({ backgroundColor: value })}
            />
            <ColorInput
              id="text-color"
              label="Texto"
              value={theme.textColor}
              onChange={(value) => onThemeChange({ textColor: value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipografia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="font-family">Fonte</Label>
            <Input
              id="font-family"
              value={theme.fontFamily}
              onChange={(e) => onThemeChange({ fontFamily: e.target.value })}
              placeholder="Inter, system-ui, sans-serif"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="logo-url">URL do logo</Label>
            <Input
              id="logo-url"
              value={theme.logoUrl || ''}
              onChange={(e) => onThemeChange({ logoUrl: e.target.value || null })}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
