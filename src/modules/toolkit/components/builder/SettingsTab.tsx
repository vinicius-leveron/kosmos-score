/**
 * SettingsTab - Configuration panel for form settings
 * Manages form behavior, welcome/thank you screens, and theme
 */

import * as React from 'react';

import { cn } from '@/design-system/lib/utils';
import { ScrollArea } from '@/design-system/primitives/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import type {
  FormSettings,
  FormTheme,
  WelcomeScreenConfig,
  ThankYouScreenConfig,
} from '../../types/form.types';

import { BehaviorSettings } from './settings/BehaviorSettings';
import { WelcomeScreenSettings } from './settings/WelcomeScreenSettings';
import { ThankYouScreenSettings } from './settings/ThankYouScreenSettings';
import { ThemeSettings } from './settings/ThemeSettings';

interface SettingsTabProps {
  /** Form behavior settings */
  settings: FormSettings;
  /** Form theme settings */
  theme: FormTheme;
  /** Welcome screen configuration */
  welcomeScreen: WelcomeScreenConfig;
  /** Thank you screen configuration */
  thankYouScreen: ThankYouScreenConfig;
  /** Callback when settings change */
  onSettingsChange: (settings: Partial<FormSettings>) => void;
  /** Callback when theme changes */
  onThemeChange: (theme: Partial<FormTheme>) => void;
  /** Callback when welcome screen changes */
  onWelcomeScreenChange: (config: Partial<WelcomeScreenConfig>) => void;
  /** Callback when thank you screen changes */
  onThankYouScreenChange: (config: Partial<ThankYouScreenConfig>) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Settings configuration panel with tabs for different setting categories
 */
export function SettingsTab({
  settings,
  theme,
  welcomeScreen,
  thankYouScreen,
  onSettingsChange,
  onThemeChange,
  onWelcomeScreenChange,
  onThankYouScreenChange,
  className,
}: SettingsTabProps) {
  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-4">
        <Tabs defaultValue="behavior">
          <TabsList className="w-full">
            <TabsTrigger value="behavior" className="flex-1">
              Comportamento
            </TabsTrigger>
            <TabsTrigger value="welcome" className="flex-1">
              Tela inicial
            </TabsTrigger>
            <TabsTrigger value="thankyou" className="flex-1">
              Resultado
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex-1">
              Tema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="behavior" className="mt-4">
            <BehaviorSettings settings={settings} onSettingsChange={onSettingsChange} />
          </TabsContent>

          <TabsContent value="welcome" className="mt-4">
            <WelcomeScreenSettings
              welcomeScreen={welcomeScreen}
              onWelcomeScreenChange={onWelcomeScreenChange}
            />
          </TabsContent>

          <TabsContent value="thankyou" className="mt-4">
            <ThankYouScreenSettings
              thankYouScreen={thankYouScreen}
              onThankYouScreenChange={onThankYouScreenChange}
            />
          </TabsContent>

          <TabsContent value="theme" className="mt-4">
            <ThemeSettings theme={theme} onThemeChange={onThemeChange} />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
