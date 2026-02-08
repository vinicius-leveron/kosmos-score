/**
 * useFormFields - Hook for form field CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { FormField, FormFieldType, FieldOption, ConditionGroup, ValidationConfig, ScaleConfig } from '../types/form.types';
import { formKeys } from './useForms';

// ============================================================================
// CREATE FIELD
// ============================================================================

interface CreateFieldInput {
  form_id: string;
  block_id?: string;
  type: FormFieldType;
  key: string;
  label: string;
  placeholder?: string;
  help_text?: string;
  required?: boolean;
  validation?: ValidationConfig;
  options?: FieldOption[];
  scale_config?: ScaleConfig;
  conditions?: ConditionGroup[];
  scoring_weight?: number;
  pillar?: string;
  position?: number;
}

export function useCreateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFieldInput) => {
      // Get max position if not provided
      let position = input.position;
      if (position === undefined) {
        const { data: existingFields } = await supabase
          .from('form_fields')
          .select('position')
          .eq('form_id', input.form_id)
          .order('position', { ascending: false })
          .limit(1);

        position = existingFields && existingFields.length > 0
          ? existingFields[0].position + 1
          : 0;
      }

      const { data, error } = await supabase
        .from('form_fields')
        .insert({
          ...input,
          position,
          options: input.options || [],
          validation: input.validation || {},
          scale_config: input.scale_config || {},
          conditions: input.conditions || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data as FormField;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: formKeys.detail(data.form_id) });
    },
  });
}

// ============================================================================
// UPDATE FIELD
// ============================================================================

interface UpdateFieldInput {
  id: string;
  form_id: string;
  block_id?: string | null;
  type?: FormFieldType;
  key?: string;
  label?: string;
  placeholder?: string | null;
  help_text?: string | null;
  required?: boolean;
  validation?: ValidationConfig;
  options?: FieldOption[];
  scale_config?: ScaleConfig;
  conditions?: ConditionGroup[];
  scoring_weight?: number;
  pillar?: string | null;
  position?: number;
}

export function useUpdateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, form_id, ...updates }: UpdateFieldInput) => {
      const { data, error } = await supabase
        .from('form_fields')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, form_id } as FormField;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: formKeys.detail(data.form_id) });
    },
  });
}

// ============================================================================
// DELETE FIELD
// ============================================================================

export function useDeleteField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formId }: { id: string; formId: string }) => {
      const { error } = await supabase.from('form_fields').delete().eq('id', id);

      if (error) throw error;
      return { id, formId };
    },
    onSuccess: ({ formId }) => {
      queryClient.invalidateQueries({ queryKey: formKeys.detail(formId) });
    },
  });
}

// ============================================================================
// REORDER FIELDS
// ============================================================================

interface ReorderFieldsInput {
  formId: string;
  fieldIds: string[]; // Array of field IDs in new order
}

export function useReorderFields() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formId, fieldIds }: ReorderFieldsInput) => {
      // Update each field's position
      const updates = fieldIds.map((id, index) =>
        supabase
          .from('form_fields')
          .update({ position: index, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      const results = await Promise.all(updates);

      // Check for errors
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error('Failed to reorder some fields');
      }

      return { formId };
    },
    onSuccess: ({ formId }) => {
      queryClient.invalidateQueries({ queryKey: formKeys.detail(formId) });
    },
  });
}

// ============================================================================
// DUPLICATE FIELD
// ============================================================================

export function useDuplicateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ field }: { field: FormField }) => {
      // Get max position
      const { data: existingFields } = await supabase
        .from('form_fields')
        .select('position')
        .eq('form_id', field.form_id)
        .order('position', { ascending: false })
        .limit(1);

      const newPosition = existingFields && existingFields.length > 0
        ? existingFields[0].position + 1
        : 0;

      // Generate unique key
      const baseKey = field.key.replace(/_copy\d*$/, '');
      const { data: keysData } = await supabase
        .from('form_fields')
        .select('key')
        .eq('form_id', field.form_id)
        .like('key', `${baseKey}%`);

      const existingKeys = keysData?.map((f) => f.key) || [];
      let newKey = `${baseKey}_copy`;
      let counter = 1;
      while (existingKeys.includes(newKey)) {
        newKey = `${baseKey}_copy${counter}`;
        counter++;
      }

      const { data, error } = await supabase
        .from('form_fields')
        .insert({
          form_id: field.form_id,
          block_id: field.block_id,
          type: field.type,
          key: newKey,
          label: `${field.label} (cópia)`,
          placeholder: field.placeholder,
          help_text: field.help_text,
          required: field.required,
          validation: field.validation,
          options: field.options,
          scale_config: field.scale_config,
          conditions: field.conditions,
          scoring_weight: field.scoring_weight,
          pillar: field.pillar,
          position: newPosition,
        })
        .select()
        .single();

      if (error) throw error;
      return data as FormField;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: formKeys.detail(data.form_id) });
    },
  });
}
