/**
 * FieldEditor - Dialog for editing a single form field
 * Contains all field configuration options organized in tabs
 */

import * as React from 'react';

import { cn } from '@/design-system/lib/utils';
import { Button } from '@/design-system/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/design-system/primitives/dialog';
import { ScrollArea } from '@/design-system/primitives/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import type { FormField, FieldOption, ValidationConfig, ScaleConfig } from '../../types/form.types';
import { FIELD_REGISTRY } from '../../lib/fieldRegistry';

import { GeneralTab } from './field-editor/GeneralTab';
import { OptionsTab } from './field-editor/OptionsTab';
import { ScaleTab } from './field-editor/ScaleTab';
import { ValidationTab } from './field-editor/ValidationTab';
import { ScoringFieldTab } from './field-editor/ScoringFieldTab';

interface FieldEditorProps {
  /** The field being edited (null when closed) */
  field: FormField | null;
  /** Whether the dialog is open */
  open: boolean;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Callback to save changes */
  onSave: (field: Partial<FormField>) => void;
}

type FieldDraft = Omit<FormField, 'id' | 'form_id' | 'created_at' | 'updated_at'>;

/**
 * Dialog component for editing field properties
 */
export function FieldEditor({
  field,
  open,
  isSaving = false,
  onClose,
  onSave,
}: FieldEditorProps) {
  const [draft, setDraft] = React.useState<FieldDraft | null>(null);

  // Initialize draft when field changes
  React.useEffect(() => {
    if (field) {
      setDraft({
        type: field.type,
        key: field.key,
        label: field.label,
        placeholder: field.placeholder,
        help_text: field.help_text,
        required: field.required,
        validation: field.validation,
        options: field.options,
        scale_config: field.scale_config,
        file_config: field.file_config,
        conditions: field.conditions,
        scoring_weight: field.scoring_weight,
        pillar: field.pillar,
        position: field.position,
        block_id: field.block_id,
      });
    } else {
      setDraft(null);
    }
  }, [field]);

  if (!draft || !field) return null;

  const fieldDef = FIELD_REGISTRY[draft.type];
  const hasOptions = fieldDef?.hasOptions ?? false;
  const hasScaleConfig = fieldDef?.hasScaleConfig ?? false;

  const handleSave = () => {
    onSave({ id: field.id, form_id: field.form_id, ...draft });
  };

  const updateDraft = (updates: Partial<FieldDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar campo: {fieldDef?.label || draft.type}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
          <TabsList className="shrink-0">
            <TabsTrigger value="general">Geral</TabsTrigger>
            {hasOptions && <TabsTrigger value="options">Opcoes</TabsTrigger>}
            {hasScaleConfig && <TabsTrigger value="scale">Escala</TabsTrigger>}
            <TabsTrigger value="validation">Validacao</TabsTrigger>
            <TabsTrigger value="scoring">Pontuacao</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="general" className="mt-0">
              <GeneralTab
                label={draft.label}
                fieldKey={draft.key}
                placeholder={draft.placeholder}
                helpText={draft.help_text}
                required={draft.required}
                onLabelChange={(label) => updateDraft({ label })}
                onKeyChange={(key) => updateDraft({ key })}
                onPlaceholderChange={(placeholder) => updateDraft({ placeholder })}
                onHelpTextChange={(help_text) => updateDraft({ help_text })}
                onRequiredChange={(required) => updateDraft({ required })}
              />
            </TabsContent>

            {hasOptions && (
              <TabsContent value="options" className="mt-0">
                <OptionsTab
                  options={draft.options || []}
                  onOptionsChange={(options) => updateDraft({ options })}
                />
              </TabsContent>
            )}

            {hasScaleConfig && (
              <TabsContent value="scale" className="mt-0">
                <ScaleTab
                  scaleConfig={draft.scale_config}
                  onScaleConfigChange={(scale_config) => updateDraft({ scale_config })}
                />
              </TabsContent>
            )}

            <TabsContent value="validation" className="mt-0">
              <ValidationTab
                validation={draft.validation}
                onValidationChange={(validation) => updateDraft({ validation })}
              />
            </TabsContent>

            <TabsContent value="scoring" className="mt-0">
              <ScoringFieldTab
                scoringWeight={draft.scoring_weight}
                pillar={draft.pillar}
                onScoringWeightChange={(scoring_weight) => updateDraft({ scoring_weight })}
                onPillarChange={(pillar) => updateDraft({ pillar })}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-kosmos-orange hover:bg-kosmos-orange/90"
          >
            {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
