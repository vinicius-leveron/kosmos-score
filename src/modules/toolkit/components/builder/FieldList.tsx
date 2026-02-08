/**
 * FieldList - Draggable list of form fields
 * Uses @hello-pangea/dnd for drag-and-drop reordering
 */

import * as React from 'react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { FileQuestion } from 'lucide-react';

import { cn } from '@/design-system/lib/utils';
import { ScrollArea } from '@/design-system/primitives/scroll-area';
import { Button } from '@/design-system/primitives/button';
import type { FormField } from '../../types/form.types';
import { FieldListItem } from './FieldListItem';

interface FieldListProps {
  /** Array of fields to display */
  fields: FormField[];
  /** Currently selected field ID */
  selectedFieldId?: string | null;
  /** Whether reordering is in progress */
  isReordering?: boolean;
  /** Callback when field is selected for editing */
  onSelectField: (field: FormField) => void;
  /** Callback when fields are reordered */
  onReorderFields: (fieldIds: string[]) => void;
  /** Callback to duplicate a field */
  onDuplicateField: (field: FormField) => void;
  /** Callback to delete a field */
  onDeleteField: (field: FormField) => void;
  /** Callback to add a new field (shown in empty state) */
  onAddField?: () => void;
  /** Additional CSS classes */
  className?: string;
}

interface EmptyStateProps {
  onAddField?: () => void;
}

function EmptyState({ onAddField }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        Nenhum campo ainda
      </h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        Comece adicionando campos ao seu formulario. Use a paleta ao lado ou clique no botao abaixo.
      </p>
      {onAddField && (
        <Button onClick={onAddField} className="bg-kosmos-orange hover:bg-kosmos-orange/90">
          Adicionar primeiro campo
        </Button>
      )}
    </div>
  );
}

/**
 * Draggable list of form fields with reorder support
 */
export function FieldList({
  fields,
  selectedFieldId,
  isReordering = false,
  onSelectField,
  onReorderFields,
  onDuplicateField,
  onDeleteField,
  onAddField,
  className,
}: FieldListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const reorderedFields = Array.from(fields);
    const [removed] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, removed);

    const newFieldIds = reorderedFields.map((f) => f.id);
    onReorderFields(newFieldIds);
  };

  if (fields.length === 0) {
    return (
      <div className={cn('flex-1', className)}>
        <EmptyState onAddField={onAddField} />
      </div>
    );
  }

  return (
    <ScrollArea className={cn('flex-1', className)}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fields">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'space-y-2 p-4',
                snapshot.isDraggingOver && 'bg-muted/30',
                isReordering && 'pointer-events-none opacity-50'
              )}
            >
              {fields.map((field, index) => (
                <FieldListItem
                  key={field.id}
                  field={field}
                  index={index}
                  isSelected={field.id === selectedFieldId}
                  onSelect={onSelectField}
                  onDuplicate={onDuplicateField}
                  onDelete={onDeleteField}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ScrollArea>
  );
}
