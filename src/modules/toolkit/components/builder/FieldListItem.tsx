/**
 * FieldListItem - Single field item in the draggable field list
 * Shows field info and provides actions (edit, duplicate, delete)
 */

import * as React from 'react';
import {
  GripVertical,
  Pencil,
  Copy,
  Trash2,
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
import { Draggable } from '@hello-pangea/dnd';

import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import type { FormField, FormFieldType } from '../../types/form.types';
import { FIELD_REGISTRY } from '../../lib/fieldRegistry';

interface FieldListItemProps {
  /** The field data */
  field: FormField;
  /** Index for drag-and-drop */
  index: number;
  /** Whether this field is currently selected */
  isSelected?: boolean;
  /** Callback when field is clicked for editing */
  onSelect: (field: FormField) => void;
  /** Callback to duplicate the field */
  onDuplicate: (field: FormField) => void;
  /** Callback to delete the field */
  onDelete: (field: FormField) => void;
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

function getFieldIcon(type: FormFieldType): LucideIcon {
  const iconName = FIELD_REGISTRY[type]?.icon || 'Type';
  return ICON_MAP[iconName] || Type;
}

/**
 * Individual draggable field item with actions
 */
export function FieldListItem({
  field,
  index,
  isSelected = false,
  onSelect,
  onDuplicate,
  onDelete,
}: FieldListItemProps) {
  const Icon = getFieldIcon(field.type);
  const fieldDef = FIELD_REGISTRY[field.type];

  return (
    <Draggable draggableId={field.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            'group flex items-center gap-3 rounded-lg border bg-card p-3 transition-all duration-200',
            isSelected
              ? 'border-kosmos-orange ring-1 ring-kosmos-orange'
              : 'border-border hover:border-muted-foreground/50',
            snapshot.isDragging && 'shadow-lg ring-2 ring-kosmos-orange/50'
          )}
        >
          {/* Drag handle */}
          <div
            {...provided.dragHandleProps}
            className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
            aria-label="Arrastar para reordenar"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Field icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Field info */}
          <button
            type="button"
            onClick={() => onSelect(field)}
            className="min-w-0 flex-1 text-left focus:outline-none"
            aria-label={`Editar campo ${field.label}`}
          >
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-foreground">
                {field.label}
              </p>
              {field.required && (
                <Badge variant="outline" className="shrink-0 text-[10px] px-1.5 py-0">
                  Obrigatorio
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {fieldDef?.label || field.type}
              {field.key && ` - ${field.key}`}
            </p>
          </button>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onSelect(field)}
              aria-label={`Editar campo ${field.label}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDuplicate(field)}
              aria-label={`Duplicar campo ${field.label}`}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(field)}
              aria-label={`Excluir campo ${field.label}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
