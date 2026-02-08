/**
 * Condition Evaluator - Evaluate conditional logic for form fields
 */

import type {
  Condition,
  ConditionGroup,
  ConditionOperator,
  FormField,
  FormAnswers,
  FieldAnswer,
} from '../types/form.types';

/**
 * Get the value to compare from an answer
 */
function getAnswerValue(answer: FieldAnswer | undefined): string | number | boolean | string[] | null {
  if (!answer) return null;
  return answer.value;
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(
  condition: Condition,
  answers: FormAnswers
): boolean {
  const answer = answers[condition.fieldKey];
  const answerValue = getAnswerValue(answer);
  const conditionValue = condition.value;

  switch (condition.operator) {
    case 'equals':
      if (Array.isArray(answerValue)) {
        return answerValue.includes(String(conditionValue));
      }
      return String(answerValue) === String(conditionValue);

    case 'not_equals':
      if (Array.isArray(answerValue)) {
        return !answerValue.includes(String(conditionValue));
      }
      return String(answerValue) !== String(conditionValue);

    case 'contains':
      if (Array.isArray(answerValue)) {
        return answerValue.some((v) =>
          String(v).toLowerCase().includes(String(conditionValue).toLowerCase())
        );
      }
      return String(answerValue || '')
        .toLowerCase()
        .includes(String(conditionValue).toLowerCase());

    case 'not_contains':
      if (Array.isArray(answerValue)) {
        return !answerValue.some((v) =>
          String(v).toLowerCase().includes(String(conditionValue).toLowerCase())
        );
      }
      return !String(answerValue || '')
        .toLowerCase()
        .includes(String(conditionValue).toLowerCase());

    case 'greater_than':
      return Number(answerValue) > Number(conditionValue);

    case 'less_than':
      return Number(answerValue) < Number(conditionValue);

    case 'greater_than_or_equals':
      return Number(answerValue) >= Number(conditionValue);

    case 'less_than_or_equals':
      return Number(answerValue) <= Number(conditionValue);

    case 'is_empty':
      if (answerValue === null || answerValue === undefined) return true;
      if (Array.isArray(answerValue)) return answerValue.length === 0;
      if (typeof answerValue === 'string') return answerValue.trim() === '';
      return false;

    case 'is_not_empty':
      if (answerValue === null || answerValue === undefined) return false;
      if (Array.isArray(answerValue)) return answerValue.length > 0;
      if (typeof answerValue === 'string') return answerValue.trim() !== '';
      return true;

    default:
      console.warn(`Unknown operator: ${condition.operator}`);
      return true;
  }
}

/**
 * Evaluate a condition group (AND/OR logic)
 */
function evaluateConditionGroup(
  group: ConditionGroup,
  answers: FormAnswers
): boolean {
  if (!group.conditions || group.conditions.length === 0) {
    return true; // No conditions means always show
  }

  if (group.logic === 'AND') {
    return group.conditions.every((condition) =>
      evaluateCondition(condition, answers)
    );
  } else {
    // OR logic
    return group.conditions.some((condition) =>
      evaluateCondition(condition, answers)
    );
  }
}

/**
 * Check if a field should be visible based on its conditions
 * All condition groups must be true (groups are ANDed together)
 */
export function isFieldVisible(
  field: FormField,
  answers: FormAnswers
): boolean {
  // If no conditions, field is always visible
  if (!field.conditions || field.conditions.length === 0) {
    return true;
  }

  // All condition groups must be true
  return field.conditions.every((group) =>
    evaluateConditionGroup(group, answers)
  );
}

/**
 * Get all visible fields based on current answers
 */
export function getVisibleFields(
  fields: FormField[],
  answers: FormAnswers
): FormField[] {
  return fields.filter((field) => isFieldVisible(field, answers));
}

/**
 * Validate that a field's conditions don't create circular dependencies
 */
export function hasCircularDependency(
  field: FormField,
  allFields: FormField[],
  visited: Set<string> = new Set()
): boolean {
  if (visited.has(field.key)) {
    return true; // Circular dependency detected
  }

  visited.add(field.key);

  // Get all field keys referenced in conditions
  const referencedKeys = new Set<string>();
  for (const group of field.conditions) {
    for (const condition of group.conditions) {
      referencedKeys.add(condition.fieldKey);
    }
  }

  // Check each referenced field for circular dependencies
  for (const refKey of referencedKeys) {
    const refField = allFields.find((f) => f.key === refKey);
    if (refField && hasCircularDependency(refField, allFields, new Set(visited))) {
      return true;
    }
  }

  return false;
}

/**
 * Get fields that reference a given field in their conditions
 */
export function getDependentFields(
  fieldKey: string,
  allFields: FormField[]
): FormField[] {
  return allFields.filter((field) => {
    for (const group of field.conditions) {
      for (const condition of group.conditions) {
        if (condition.fieldKey === fieldKey) {
          return true;
        }
      }
    }
    return false;
  });
}

/**
 * Check if deleting a field would break conditions
 */
export function getOrphanedFields(
  fieldKeyToDelete: string,
  allFields: FormField[]
): FormField[] {
  return getDependentFields(fieldKeyToDelete, allFields);
}

/**
 * Validate all conditions in a form
 */
export interface ConditionValidationResult {
  isValid: boolean;
  errors: Array<{
    fieldKey: string;
    message: string;
  }>;
}

export function validateFormConditions(
  fields: FormField[]
): ConditionValidationResult {
  const errors: ConditionValidationResult['errors'] = [];
  const fieldKeys = new Set(fields.map((f) => f.key));

  for (const field of fields) {
    // Check for circular dependencies
    if (hasCircularDependency(field, fields)) {
      errors.push({
        fieldKey: field.key,
        message: `Campo "${field.label}" tem dependência circular`,
      });
      continue;
    }

    // Check that all referenced fields exist
    for (const group of field.conditions) {
      for (const condition of group.conditions) {
        if (!fieldKeys.has(condition.fieldKey)) {
          errors.push({
            fieldKey: field.key,
            message: `Campo "${field.label}" referencia campo inexistente: ${condition.fieldKey}`,
          });
        }

        // Check that referenced field comes before this field
        const refFieldIndex = fields.findIndex((f) => f.key === condition.fieldKey);
        const thisFieldIndex = fields.findIndex((f) => f.key === field.key);
        if (refFieldIndex >= thisFieldIndex) {
          errors.push({
            fieldKey: field.key,
            message: `Campo "${field.label}" referencia campo "${condition.fieldKey}" que vem depois`,
          });
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get human-readable description of a condition
 */
export function getConditionDescription(
  condition: Condition,
  fields: FormField[]
): string {
  const field = fields.find((f) => f.key === condition.fieldKey);
  const fieldLabel = field?.label || condition.fieldKey;

  const operatorLabels: Record<ConditionOperator, string> = {
    equals: 'é igual a',
    not_equals: 'é diferente de',
    contains: 'contém',
    not_contains: 'não contém',
    greater_than: 'é maior que',
    less_than: 'é menor que',
    greater_than_or_equals: 'é maior ou igual a',
    less_than_or_equals: 'é menor ou igual a',
    is_empty: 'está vazio',
    is_not_empty: 'não está vazio',
  };

  const operator = operatorLabels[condition.operator] || condition.operator;

  if (condition.operator === 'is_empty' || condition.operator === 'is_not_empty') {
    return `${fieldLabel} ${operator}`;
  }

  return `${fieldLabel} ${operator} "${condition.value}"`;
}
