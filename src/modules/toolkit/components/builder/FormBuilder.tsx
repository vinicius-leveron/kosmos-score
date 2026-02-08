/**
 * FormBuilder - Main form builder component
 * Orchestrates the form editing experience with tabs, field list, and editor
 */

import * as React from 'react';
import { toast } from 'sonner';

import { cn } from '@/design-system/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/design-system/primitives/tabs';
import { Skeleton } from '@/design-system/primitives/skeleton';

import { useFormBuilder } from '../../hooks/useFormBuilder';

import { FormBuilderHeader } from './FormBuilderHeader';
import { FieldPalette } from './FieldPalette';
import { FieldList } from './FieldList';
import { FieldEditor } from './FieldEditor';
import { ScoringTab } from './ScoringTab';
import { SettingsTab } from './SettingsTab';
import { PreviewTab } from './PreviewTab';

interface FormBuilderProps {
  /** The ID of the form to edit */
  formId: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main form builder component that provides the complete
 * form editing experience with drag-and-drop fields,
 * scoring configuration, settings, and live preview
 */
export function FormBuilder({ formId, className }: FormBuilderProps) {
  const {
    form,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    selectedField,
    isEditorOpen,
    sortedFields,
    isSaving,
    isReordering,
    isFieldSaving,
    handleNameChange,
    handleSave,
    handleTogglePublish,
    handlePreview,
    handleAddField,
    handleSelectField,
    handleCloseEditor,
    handleSaveField,
    handleDuplicateField,
    handleDeleteField,
    handleReorderFields,
    handleScoringEnabledChange,
    handleScoringConfigChange,
    handleSettingsChange,
    handleThemeChange,
    handleWelcomeScreenChange,
    handleThankYouScreenChange,
  } = useFormBuilder(formId);

  if (isLoading) {
    return <FormBuilderSkeleton />;
  }

  if (error || !form) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Erro ao carregar formulario
          </h2>
          <p className="text-muted-foreground">
            {error?.message || 'Formulario nao encontrado'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-screen flex-col bg-background', className)}>
      <FormBuilderHeader
        form={form}
        isSaving={isSaving}
        onNameChange={handleNameChange}
        onSave={handleSave}
        onTogglePublish={handleTogglePublish}
        onPreview={handlePreview}
      />

      <div className="flex flex-1 min-h-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-1 flex-col"
        >
          <div className="border-b border-border px-4">
            <TabsList>
              <TabsTrigger value="fields">Campos</TabsTrigger>
              <TabsTrigger value="scoring">Pontuacao</TabsTrigger>
              <TabsTrigger value="settings">Configuracoes</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-1 min-h-0">
            <TabsContent value="fields" className="flex flex-1 m-0 data-[state=inactive]:hidden">
              <FieldPalette onAddField={handleAddField} className="w-72 shrink-0" />
              <FieldList
                fields={sortedFields}
                selectedFieldId={selectedField?.id}
                isReordering={isReordering}
                onSelectField={handleSelectField}
                onReorderFields={handleReorderFields}
                onDuplicateField={handleDuplicateField}
                onDeleteField={handleDeleteField}
                className="flex-1"
              />
            </TabsContent>

            <TabsContent value="scoring" className="flex-1 m-0 data-[state=inactive]:hidden">
              <ScoringTab
                scoringEnabled={form.scoring_enabled}
                scoringConfig={form.scoring_config}
                classifications={form.classifications}
                onScoringEnabledChange={handleScoringEnabledChange}
                onScoringConfigChange={handleScoringConfigChange}
                onAddClassification={() => toast.info('Funcionalidade em desenvolvimento')}
                onUpdateClassification={() => toast.info('Funcionalidade em desenvolvimento')}
                onDeleteClassification={() => toast.info('Funcionalidade em desenvolvimento')}
              />
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0 data-[state=inactive]:hidden">
              <SettingsTab
                settings={form.settings}
                theme={form.theme}
                welcomeScreen={form.welcome_screen}
                thankYouScreen={form.thank_you_screen}
                onSettingsChange={handleSettingsChange}
                onThemeChange={handleThemeChange}
                onWelcomeScreenChange={handleWelcomeScreenChange}
                onThankYouScreenChange={handleThankYouScreenChange}
              />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 m-0 data-[state=inactive]:hidden">
              <PreviewTab form={form} onOpenFullPreview={handlePreview} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <FieldEditor
        field={selectedField}
        open={isEditorOpen}
        isSaving={isFieldSaving}
        onClose={handleCloseEditor}
        onSave={handleSaveField}
      />
    </div>
  );
}

function FormBuilderSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-72 border-r border-border p-4 space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>

        <div className="flex-1 p-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
