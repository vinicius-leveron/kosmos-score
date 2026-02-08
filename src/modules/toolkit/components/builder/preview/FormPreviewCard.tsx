/**
 * FormPreviewCard - Main form preview display
 */

import * as React from 'react';

import { Button } from '@/design-system/primitives/button';
import { ScrollArea } from '@/design-system/primitives/scroll-area';
import { Card } from '@/design-system/primitives/card';
import type { FormWithRelations, FormField } from '../../../types/form.types';
import { FieldInputPreview } from './FieldInputPreview';

interface FormPreviewCardProps {
  form: FormWithRelations;
}

interface FieldPreviewProps {
  field: FormField;
  index: number;
  showNumber: boolean;
  primaryColor: string;
  requiredIndicator: string;
}

function FieldPreview({
  field,
  index,
  showNumber,
  primaryColor,
  requiredIndicator,
}: FieldPreviewProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {showNumber && <span className="mr-2">{index + 1}.</span>}
        {field.label}
        {field.required && (
          <span style={{ color: primaryColor }} className="ml-1">
            {requiredIndicator}
          </span>
        )}
      </label>

      {field.help_text && (
        <p className="text-xs text-muted-foreground">{field.help_text}</p>
      )}

      <FieldInputPreview field={field} primaryColor={primaryColor} />
    </div>
  );
}

export function FormPreviewCard({ form }: FormPreviewCardProps) {
  const sortedFields = React.useMemo(
    () => [...form.fields].sort((a, b) => a.position - b.position),
    [form.fields]
  );

  return (
    <Card
      className="overflow-hidden"
      style={{
        backgroundColor: form.theme.backgroundColor,
        color: form.theme.textColor,
        fontFamily: form.theme.fontFamily,
      }}
    >
      {/* Welcome Screen Preview */}
      {form.welcome_screen.enabled && (
        <div className="border-b border-border p-6 text-center">
          {form.theme.logoUrl && (
            <img
              src={form.theme.logoUrl}
              alt="Logo"
              className="mx-auto mb-4 h-12 object-contain"
            />
          )}
          <h1 className="text-2xl font-bold mb-2">
            {form.welcome_screen.title || form.name}
          </h1>
          {form.welcome_screen.description && (
            <p className="text-muted-foreground mb-4">{form.welcome_screen.description}</p>
          )}
          <Button
            style={{ backgroundColor: form.theme.primaryColor }}
            className="text-white"
          >
            {form.welcome_screen.buttonText}
          </Button>
        </div>
      )}

      {/* Fields Preview */}
      <ScrollArea className="max-h-[500px]">
        <div className="p-6 space-y-6">
          {sortedFields.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Adicione campos ao formulario para visualizar o preview
            </p>
          ) : (
            sortedFields.map((field, index) => (
              <FieldPreview
                key={field.id}
                field={field}
                index={index}
                showNumber={form.settings.showQuestionNumbers}
                primaryColor={form.theme.primaryColor}
                requiredIndicator={form.settings.requiredFieldIndicator}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Submit Button */}
      {sortedFields.length > 0 && (
        <div className="border-t border-border p-6">
          <Button
            className="w-full"
            style={{ backgroundColor: form.theme.primaryColor }}
          >
            {form.settings.submitButtonText}
          </Button>
        </div>
      )}

      {/* Progress Bar */}
      {form.settings.showProgressBar && sortedFields.length > 0 && (
        <div className="border-t border-border p-4">
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: '30%',
                backgroundColor: form.theme.primaryColor,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">30% completo</p>
        </div>
      )}
    </Card>
  );
}
