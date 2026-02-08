/**
 * Field Validation Utilities for Form Runtime
 */

import type { FormField, FieldAnswer } from '../../../types/form.types';

/**
 * Validate a field value and return an error message if invalid
 */
export function validateField(
  field: FormField,
  answer: FieldAnswer | undefined
): string | null {
  // Check required
  if (field.required) {
    if (!answer || answer.value === undefined || answer.value === null) {
      return field.validation?.customMessage || 'Este campo e obrigatorio';
    }

    if (typeof answer.value === 'string' && answer.value.trim() === '') {
      return field.validation?.customMessage || 'Este campo e obrigatorio';
    }

    if (Array.isArray(answer.value) && answer.value.length === 0) {
      return field.validation?.customMessage || 'Selecione pelo menos uma opcao';
    }
  }

  // Skip further validation if no answer
  if (!answer || answer.value === undefined || answer.value === null) {
    return null;
  }

  const value = answer.value;

  // Type-specific validations
  switch (field.type) {
    case 'email':
      if (typeof value === 'string' && value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Por favor, insira um email valido';
        }
      }
      break;

    case 'phone':
      if (typeof value === 'string' && value.trim()) {
        // Basic phone validation (at least 10 digits)
        const digits = value.replace(/\D/g, '');
        if (digits.length < 10) {
          return 'Por favor, insira um telefone valido';
        }
      }
      break;

    case 'number':
      if (typeof value === 'number' || (typeof value === 'string' && value.trim())) {
        const numValue = typeof value === 'number' ? value : parseFloat(value);

        if (isNaN(numValue)) {
          return 'Por favor, insira um numero valido';
        }

        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          return `O valor minimo e ${field.validation.min}`;
        }

        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          return `O valor maximo e ${field.validation.max}`;
        }
      }
      break;

    case 'text':
    case 'long_text':
      if (typeof value === 'string') {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          return `Minimo de ${field.validation.minLength} caracteres`;
        }

        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          return `Maximo de ${field.validation.maxLength} caracteres`;
        }

        if (field.validation?.pattern) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            return field.validation.customMessage || 'Formato invalido';
          }
        }
      }
      break;

    case 'date':
      if (typeof value === 'string' && value.trim()) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          return 'Por favor, insira uma data valida';
        }
      }
      break;

    case 'scale':
      if (typeof value === 'number') {
        const min = field.scale_config?.min ?? 1;
        const max = field.scale_config?.max ?? 10;

        if (value < min || value > max) {
          return `Selecione um valor entre ${min} e ${max}`;
        }
      }
      break;
  }

  return null;
}

/**
 * Check if a field has a valid answer (for navigation purposes)
 */
export function hasValidAnswer(
  field: FormField,
  answer: FieldAnswer | undefined
): boolean {
  // Statement fields don't require answers
  if (field.type === 'statement') {
    return true;
  }

  if (!answer || answer.value === undefined || answer.value === null) {
    return false;
  }

  if (typeof answer.value === 'string' && answer.value.trim() === '') {
    return false;
  }

  if (Array.isArray(answer.value) && answer.value.length === 0) {
    return false;
  }

  return true;
}
