/**
 * Cal.com embed API type declarations
 */

interface CalInlineOptions {
  elementOrSelector: string;
  calLink: string;
  layout?: 'month_view' | 'week_view' | 'column_view';
  config?: {
    name?: string;
    email?: string;
    notes?: string;
    guests?: string[];
    theme?: 'light' | 'dark' | 'auto';
  };
}

interface CalUIOptions {
  theme?: 'light' | 'dark' | 'auto';
  styles?: {
    branding?: {
      brandColor?: string;
    };
  };
  hideEventTypeDetails?: boolean;
  layout?: 'month_view' | 'week_view' | 'column_view';
}

interface CalInitOptions {
  origin?: string;
}

type CalAction = 'init' | 'inline' | 'ui' | 'modal' | 'floatingButton' | 'preload';

interface CalFunction {
  (action: 'init', options?: CalInitOptions): void;
  (action: 'inline', options: CalInlineOptions): void;
  (action: 'ui', options: CalUIOptions): void;
  (action: string, options?: Record<string, unknown>): void;
  loaded?: boolean;
  ns: Record<string, CalFunction>;
  q: unknown[];
  hierarchyLevel?: number;
  init?: (...args: unknown[]) => void;
}

declare global {
  interface Window {
    Cal?: CalFunction;
  }
}

export {};
