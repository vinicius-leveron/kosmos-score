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
  SchedulingScreenConfig,
} from '../../types/form.types';

import { BehaviorSettings } from './settings/BehaviorSettings';
import { WelcomeScreenSettings } from './settings/WelcomeScreenSettings';
import { ThankYouScreenSettings } from './settings/ThankYouScreenSettings';
import { ThemeSettings } from './settings/ThemeSettings';
import { SchedulingSettings } from './settings/SchedulingSettings';

interface SettingsTabProps {
  /** Form behavior settings */
  settings: FormSettings;
  /** Form theme settings */
  theme: FormTheme;
  /** Welcome screen configuration */
  welcomeScreen: WelcomeScreenConfig;
  /** Thank you screen configuration */
  thankYouScreen: ThankYouScreenConfig;
  /** Scheduling screen configuration */
  schedulingScreen: SchedulingScreenConfig;
  /** Callback when settings change */
  onSettingsChange: (settings: Partial<FormSettings>) => void;
  /** Callback when theme changes */
  onThemeChange: (theme: Partial<FormTheme>) => void;
  /** Callback when welcome screen changes */
  onWelcomeScreenChange: (config: Partial<WelcomeScreenConfig>) => void;
  /** Callback when thank you screen changes */
  onThankYouScreenChange: (config: Partial<ThankYouScreenConfig>) => void;
  /** Callback when scheduling screen changes */
  onSchedulingScreenChange: (config: Partial<SchedulingScreenConfig>) => void;
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
  schedulingScreen,
  onSettingsChange,
  onThemeChange,
  onWelcomeScreenChange,
  onThankYouScreenChange,
  onSchedulingScreenChange,
  className,
}: SettingsTabProps) {
  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-4">
        <Tabs defaultValue="behavior">
          <TabsList className="w-full flex-wrap">
            <TabsTrigger value="behavior" className="flex-1">
              Comportamento
            </TabsTrigger>
            <TabsTrigger value="welcome" className="flex-1">
              Tela inicial
            </TabsTrigger>
            <TabsTrigger value="thankyou" className="flex-1">
              Resultado
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex-1">
              Agendamento
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

          <TabsContent value="scheduling" className="mt-4">
            <SchedulingSettings
              schedulingScreen={schedulingScreen}
              onSchedulingScreenChange={onSchedulingScreenChange}
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
