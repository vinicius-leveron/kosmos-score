/**
 * PreviewTab - Live preview of the form
 * Shows how the form will appear to respondents
 */

import * as React from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';

import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/primitives/button';
import type { FormWithRelations } from '../../types/form.types';
import { FormPreviewCard } from './preview/FormPreviewCard';

interface PreviewTabProps {
  /** The form to preview */
  form: FormWithRelations;
  /** Callback to open full preview in new tab */
  onOpenFullPreview?: () => void;
  /** Additional CSS classes */
  className?: string;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_SIZES: Record<ViewportSize, { width: string; icon: React.ElementType }> = {
  desktop: { width: '100%', icon: Monitor },
  tablet: { width: '768px', icon: Tablet },
  mobile: { width: '375px', icon: Smartphone },
};

/**
 * Preview panel showing how the form will look
 */
export function PreviewTab({ form, onOpenFullPreview, className }: PreviewTabProps) {
  const [viewport, setViewport] = React.useState<ViewportSize>('desktop');

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-1">
          {(Object.keys(VIEWPORT_SIZES) as ViewportSize[]).map((size) => {
            const { icon: Icon } = VIEWPORT_SIZES[size];
            return (
              <Button
                key={size}
                variant={viewport === size ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewport(size)}
                aria-label={`Visualizar em ${size}`}
              >
                <Icon className="h-4 w-4" />
              </Button>
            );
          })}
        </div>

        {onOpenFullPreview && (
          <Button variant="outline" size="sm" onClick={onOpenFullPreview}>
            <ExternalLink className="h-4 w-4 mr-1" />
            Abrir em nova aba
          </Button>
        )}
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-auto bg-muted/30 p-4">
        <div
          className="mx-auto transition-all duration-300"
          style={{ maxWidth: VIEWPORT_SIZES[viewport].width }}
        >
          <FormPreviewCard form={form} />
        </div>
      </div>
    </div>
  );
}
