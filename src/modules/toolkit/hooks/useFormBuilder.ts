/**
 * useFormBuilder - Hook for form builder state and operations
 */

import * as React from 'react';
import { toast } from 'sonner';

import { useForm, useUpdateForm, usePublishForm } from './useForms';
import {
  useCreateField,
  useUpdateField,
  useDeleteField,
  useReorderFields,
  useDuplicateField,
} from './useFormFields';
import type { FormField, FormFieldType, ScoringConfig } from '../types/form.types';
import { FIELD_REGISTRY } from '../lib/fieldRegistry';

export function useFormBuilder(formId: string) {
  const [activeTab, setActiveTab] = React.useState('fields');
  const [selectedField, setSelectedField] = React.useState<FormField | null>(null);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);

  // Data fetching
  const { data: form, isLoading, error } = useForm(formId);

  // Mutations
  const updateForm = useUpdateForm();
  const publishForm = usePublishForm();
  const createField = useCreateField();
  const updateField = useUpdateField();
  const deleteField = useDeleteField();
  const reorderFields = useReorderFields();
  const duplicateField = useDuplicateField();

  // Sorted fields
  const sortedFields = React.useMemo(
    () => (form?.fields ? [...form.fields].sort((a, b) => a.position - b.position) : []),
    [form?.fields]
  );

  // Form handlers
  const handleNameChange = React.useCallback(
    async (name: string) => {
      try {
        await updateForm.mutateAsync({ id: formId, name });
        toast.success('Nome atualizado');
      } catch {
        toast.error('Erro ao atualizar nome');
      }
    },
    [formId, updateForm]
  );

  const handleSave = React.useCallback(() => {
    toast.success('Formulario salvo');
  }, []);

  const handleTogglePublish = React.useCallback(async () => {
    if (!form) return;
    try {
      if (form.status === 'published') {
        await updateForm.mutateAsync({ id: formId, status: 'draft' });
        toast.success('Formulario despublicado');
      } else {
        await publishForm.mutateAsync(formId);
        toast.success('Formulario publicado');
      }
    } catch {
      toast.error('Erro ao alterar status');
    }
  }, [form, formId, updateForm, publishForm]);

  const handlePreview = React.useCallback(() => {
    if (!form) return;
    window.open(`/f/${form.slug}?preview=true`, '_blank');
  }, [form]);

  // Field handlers
  const handleAddField = React.useCallback(
    async (type: FormFieldType) => {
      if (!form) return;
      const fieldDef = FIELD_REGISTRY[type];
      const fieldCount = form.fields.filter((f) => f.type === type).length;
      const key = `${type}_${fieldCount + 1}`;

      try {
        await createField.mutateAsync({
          form_id: formId,
          type,
          key,
          label: fieldDef.label,
          required: false,
          validation: fieldDef.defaultValidation || {},
          options: fieldDef.hasOptions
            ? [
                { label: 'Opcao 1', value: 'opcao_1', numericValue: 1 },
                { label: 'Opcao 2', value: 'opcao_2', numericValue: 2 },
              ]
            : [],
          scale_config: fieldDef.hasScaleConfig ? { min: 1, max: 5 } : undefined,
          scoring_weight: 1,
        });
        toast.success('Campo adicionado');
      } catch {
        toast.error('Erro ao adicionar campo');
      }
    },
    [form, formId, createField]
  );

  const handleSelectField = React.useCallback((field: FormField) => {
    setSelectedField(field);
    setIsEditorOpen(true);
  }, []);

  const handleCloseEditor = React.useCallback(() => {
    setIsEditorOpen(false);
    setSelectedField(null);
  }, []);

  const handleSaveField = React.useCallback(
    async (fieldData: Partial<FormField>) => {
      if (!fieldData.id) return;

      try {
        await updateField.mutateAsync({
          id: fieldData.id,
          form_id: formId,
          ...fieldData,
        });
        toast.success('Campo atualizado');
        handleCloseEditor();
      } catch {
        toast.error('Erro ao atualizar campo');
      }
    },
    [formId, updateField, handleCloseEditor]
  );

  const handleDuplicateField = React.useCallback(
    async (field: FormField) => {
      try {
        await duplicateField.mutateAsync({ field });
        toast.success('Campo duplicado');
      } catch {
        toast.error('Erro ao duplicar campo');
      }
    },
    [duplicateField]
  );

  const handleDeleteField = React.useCallback(
    async (field: FormField) => {
      try {
        await deleteField.mutateAsync({ id: field.id, formId });
        toast.success('Campo excluido');
      } catch {
        toast.error('Erro ao excluir campo');
      }
    },
    [formId, deleteField]
  );

  const handleReorderFields = React.useCallback(
    async (fieldIds: string[]) => {
      try {
        await reorderFields.mutateAsync({ formId, fieldIds });
      } catch {
        toast.error('Erro ao reordenar campos');
      }
    },
    [formId, reorderFields]
  );

  // Scoring handlers
  const handleScoringEnabledChange = React.useCallback(
    async (enabled: boolean) => {
      try {
        await updateForm.mutateAsync({ id: formId, scoring_enabled: enabled });
      } catch {
        toast.error('Erro ao alterar configuracao');
      }
    },
    [formId, updateForm]
  );

  const handleScoringConfigChange = React.useCallback(
    async (config: Partial<ScoringConfig>) => {
      if (!form) return;
      try {
        await updateForm.mutateAsync({
          id: formId,
          scoring_config: { ...form.scoring_config, ...config },
        });
      } catch {
        toast.error('Erro ao alterar configuracao');
      }
    },
    [form, formId, updateForm]
  );

  // Settings handlers
  const handleSettingsChange = React.useCallback(
    async (settings: Partial<typeof form.settings>) => {
      if (!form) return;
      try {
        await updateForm.mutateAsync({
          id: formId,
          settings: { ...form.settings, ...settings },
        });
      } catch {
        toast.error('Erro ao salvar configuracoes');
      }
    },
    [form, formId, updateForm]
  );

  const handleThemeChange = React.useCallback(
    async (theme: Partial<typeof form.theme>) => {
      if (!form) return;
      try {
        await updateForm.mutateAsync({
          id: formId,
          theme: { ...form.theme, ...theme },
        });
      } catch {
        toast.error('Erro ao salvar tema');
      }
    },
    [form, formId, updateForm]
  );

  const handleWelcomeScreenChange = React.useCallback(
    async (config: Partial<typeof form.welcome_screen>) => {
      if (!form) return;
      try {
        await updateForm.mutateAsync({
          id: formId,
          welcome_screen: { ...form.welcome_screen, ...config },
        });
      } catch {
        toast.error('Erro ao salvar configuracoes');
      }
    },
    [form, formId, updateForm]
  );

  const handleThankYouScreenChange = React.useCallback(
    async (config: Partial<typeof form.thank_you_screen>) => {
      if (!form) return;
      try {
        await updateForm.mutateAsync({
          id: formId,
          thank_you_screen: { ...form.thank_you_screen, ...config },
        });
      } catch {
        toast.error('Erro ao salvar configuracoes');
      }
    },
    [form, formId, updateForm]
  );

  return {
    // State
    form,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    selectedField,
    isEditorOpen,
    sortedFields,

    // Mutation states
    isSaving: updateForm.isPending,
    isReordering: reorderFields.isPending,
    isFieldSaving: updateField.isPending,

    // Form handlers
    handleNameChange,
    handleSave,
    handleTogglePublish,
    handlePreview,

    // Field handlers
    handleAddField,
    handleSelectField,
    handleCloseEditor,
    handleSaveField,
    handleDuplicateField,
    handleDeleteField,
    handleReorderFields,

    // Scoring handlers
    handleScoringEnabledChange,
    handleScoringConfigChange,

    // Settings handlers
    handleSettingsChange,
    handleThemeChange,
    handleWelcomeScreenChange,
    handleThankYouScreenChange,
  };
}
