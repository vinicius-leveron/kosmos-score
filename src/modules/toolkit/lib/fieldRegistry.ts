/**
 * Field Registry - Define all available field types and their configurations
 */

import type { FieldDefinition, FormFieldType } from '../types/form.types';

export const FIELD_REGISTRY: Record<FormFieldType, FieldDefinition> = {
  text: {
    type: 'text',
    label: 'Texto curto',
    icon: 'Type',
    description: 'Campo de texto simples para respostas curtas',
    category: 'input',
    hasOptions: false,
    hasScaleConfig: false,
    hasFileConfig: false,
    defaultValidation: {
      maxLength: 255,
    },
  },
  long_text: {
    type: 'long_text',
    label: 'Texto longo',
    icon: 'AlignLeft',
    description: 'Área de texto para respostas mais elaboradas',
    category: 'input',
    hasOptions: false,
    hasScaleConfig: false,
    hasFileConfig: false,
    defaultValidation: {
      maxLength: 5000,
    },
  },
  email: {
    type: 'email',
    label: 'E-mail',
    icon: 'Mail',
    description: 'Campo de e-mail com validação automática',
    category: 'input',
    hasOptions: false,
    hasScaleConfig: false,
    hasFileConfig: false,
  },
  phone: {
    type: 'phone',
    label: 'Telefone',
    icon: 'Phone',
    description: 'Campo de telefone com máscara',
    category: 'input',
    hasOptions: false,
    hasScaleConfig: false,
    hasFileConfig: false,
  },
  number: {
    type: 'number',
    label: 'Número',
    icon: 'Hash',
    description: 'Campo numérico com validação de min/max',
    category: 'input',
    hasOptions: false,
    hasScaleConfig: false,
    hasFileConfig: false,
  },
  date: {
    type: 'date',
    label: 'Data',
    icon: 'Calendar',
    description: 'Seletor de data',
    category: 'input',
    hasOptions: false,
    hasScaleConfig: false,
    hasFileConfig: false,
  },
  select: {
    type: 'select',
    label: 'Dropdown',
    icon: 'ChevronDown',
    description: 'Lista suspensa de opções',
    category: 'choice',
    hasOptions: true,
    hasScaleConfig: false,
    hasFileConfig: false,
  },
  multi_select: {
    type: 'multi_select',
    label: 'Múltipla escolha',
    icon: 'CheckSquare',
    description: 'Permite selecionar várias opções (checkboxes)',
    category: 'choice',
    hasOptions: true,
    hasScaleConfig: false,
    hasFileConfig: false,
  },
  radio: {
    type: 'radio',
    label: 'Escolha única',
    icon: 'Circle',
    description: 'Permite selecionar apenas uma opção (radio buttons)',
    category: 'choice',
    hasOptions: true,
    hasScaleConfig: false,
    hasFileConfig: false,
  },
  scale: {
    type: 'scale',
    label: 'Escala',
    icon: 'Sliders',
    description: 'Escala numérica (1-5, 1-10, NPS)',
    category: 'choice',
    hasOptions: false,
    hasScaleConfig: true,
    hasFileConfig: false,
  },
  statement: {
    type: 'statement',
    label: 'Texto informativo',
    icon: 'FileText',
    description: 'Exibe texto sem solicitar resposta',
    category: 'special',
    hasOptions: false,
    hasScaleConfig: false,
    hasFileConfig: false,
  },
  file: {
    type: 'file',
    label: 'Upload de arquivo',
    icon: 'Upload',
    description: 'Permite upload de arquivos',
    category: 'special',
    hasOptions: false,
    hasScaleConfig: false,
    hasFileConfig: true,
  },
};

export const FIELD_CATEGORIES = {
  input: {
    label: 'Entrada de texto',
    fields: ['text', 'long_text', 'email', 'phone', 'number', 'date'] as FormFieldType[],
  },
  choice: {
    label: 'Escolha',
    fields: ['select', 'multi_select', 'radio', 'scale'] as FormFieldType[],
  },
  special: {
    label: 'Especial',
    fields: ['statement', 'file'] as FormFieldType[],
  },
};

export function getFieldDefinition(type: FormFieldType): FieldDefinition {
  return FIELD_REGISTRY[type];
}

export function getFieldsByCategory(category: 'input' | 'choice' | 'special'): FieldDefinition[] {
  return FIELD_CATEGORIES[category].fields.map((type) => FIELD_REGISTRY[type]);
}

export function getAllFields(): FieldDefinition[] {
  return Object.values(FIELD_REGISTRY);
}
