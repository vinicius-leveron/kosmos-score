/**
 * FieldPalette - Palette of available field types to add to the form
 * Organized by category (input, choice, special)
 */

import * as React from 'react';
import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  Calendar,
  ChevronDown,
  CheckSquare,
  Circle,
  Sliders,
  FileText,
  Upload,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/design-system/lib/utils';
import { ScrollArea } from '@/design-system/primitives/scroll-area';
import { FIELD_CATEGORIES, FIELD_REGISTRY } from '../../lib/fieldRegistry';
import type { FormFieldType } from '../../types/form.types';

interface FieldPaletteProps {
  /** Callback when a field type is selected */
  onAddField: (type: FormFieldType) => void;
  /** Additional CSS classes */
  className?: string;
}

/** Map icon names to Lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  Calendar,
  ChevronDown,
  CheckSquare,
  Circle,
  Sliders,
  FileText,
  Upload,
};

interface FieldTypeButtonProps {
  type: FormFieldType;
  label: string;
  icon: string;
  description: string;
  onClick: () => void;
}

function FieldTypeButton({ type, label, icon, description, onClick }: FieldTypeButtonProps) {
  const Icon = ICON_MAP[icon] || Type;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border border-border bg-card p-3',
        'text-left transition-all duration-200',
        'hover:border-kosmos-orange/50 hover:bg-muted/50',
        'focus:outline-none focus:ring-2 focus:ring-kosmos-orange focus:ring-offset-2 focus:ring-offset-background'
      )}
      aria-label={`Adicionar campo ${label}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      </div>
    </button>
  );
}

interface FieldCategoryProps {
  title: string;
  fields: FormFieldType[];
  onAddField: (type: FormFieldType) => void;
}

function FieldCategory({ title, fields, onAddField }: FieldCategoryProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
        {title}
      </h4>
      <div className="space-y-2">
        {fields.map((type) => {
          const field = FIELD_REGISTRY[type];
          return (
            <FieldTypeButton
              key={type}
              type={type}
              label={field.label}
              icon={field.icon}
              description={field.description}
              onClick={() => onAddField(type)}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Sidebar palette showing all available field types
 * organized by category for easy discovery
 */
export function FieldPalette({ onAddField, className }: FieldPaletteProps) {
  return (
    <aside
      className={cn('flex h-full flex-col border-r border-border bg-background', className)}
      aria-label="Paleta de campos"
    >
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">Adicionar campo</h3>
        <p className="text-xs text-muted-foreground">
          Clique para adicionar ao formulario
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {Object.entries(FIELD_CATEGORIES).map(([key, category]) => (
            <FieldCategory
              key={key}
              title={category.label}
              fields={category.fields}
              onAddField={onAddField}
            />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
