/**
 * Scoring Engine - Calculate scores from form answers
 */

import type {
  FormWithRelations,
  FormField,
  FormAnswers,
  FieldAnswer,
} from '../types/form.types';

export interface ScoreResult {
  totalScore: number;
  pillarScores: Record<string, number>;
  fieldScores: Record<string, number>;
  computedData: Record<string, unknown>;
}

/**
 * Extract numeric value from a field answer
 */
function getNumericValue(field: FormField, answer: FieldAnswer | undefined): number | null {
  if (!answer) return null;

  // For fields with options (radio, select, scale)
  if (field.options && field.options.length > 0) {
    const selectedOption = field.options.find((opt) => opt.value === answer.value);
    if (selectedOption?.numericValue !== undefined) {
      return selectedOption.numericValue;
    }
  }

  // For scale fields
  if (field.type === 'scale' && typeof answer.value === 'number') {
    return answer.value;
  }

  // For number fields
  if (field.type === 'number' && typeof answer.value === 'number') {
    return answer.value;
  }

  // If answer has explicit numericValue
  if (answer.numericValue !== undefined) {
    return answer.numericValue;
  }

  return null;
}

/**
 * Calculate the total score and pillar scores from form answers
 */
export function calculateScore(form: FormWithRelations, answers: FormAnswers): ScoreResult {
  const fieldScores: Record<string, number> = {};
  const pillarScores: Record<string, number> = {};
  const pillarCounts: Record<string, number> = {};
  const computedData: Record<string, unknown> = {};

  // Get scoring config
  const { formula, weights } = form.scoring_config;

  // Calculate individual field scores
  for (const field of form.fields) {
    const answer = answers[field.key];
    const numericValue = getNumericValue(field, answer);

    if (numericValue !== null) {
      // Apply field weight
      const weight = weights[field.key] ?? field.scoring_weight ?? 1;
      const weightedScore = numericValue * weight;

      fieldScores[field.key] = weightedScore;

      // Group by pillar if defined
      if (field.pillar) {
        if (!pillarScores[field.pillar]) {
          pillarScores[field.pillar] = 0;
          pillarCounts[field.pillar] = 0;
        }
        pillarScores[field.pillar] += weightedScore;
        pillarCounts[field.pillar]++;
      }
    }
  }

  // Calculate pillar averages
  for (const pillar of Object.keys(pillarScores)) {
    if (pillarCounts[pillar] > 0) {
      pillarScores[pillar] = pillarScores[pillar] / pillarCounts[pillar];
    }
  }

  // Calculate total score based on formula
  let totalScore = 0;
  const allScores = Object.values(fieldScores);

  if (allScores.length === 0) {
    return { totalScore: 0, pillarScores, fieldScores, computedData };
  }

  switch (formula) {
    case 'sum':
      totalScore = allScores.reduce((acc, score) => acc + score, 0);
      break;

    case 'average':
      totalScore = allScores.reduce((acc, score) => acc + score, 0) / allScores.length;
      break;

    case 'weighted_average':
    default:
      // If pillars exist, use weighted average of pillars
      if (Object.keys(pillarScores).length > 0) {
        const pillarValues = Object.values(pillarScores);
        totalScore = pillarValues.reduce((acc, score) => acc + score, 0) / pillarValues.length;
      } else {
        // Otherwise, use weighted average of all fields
        totalScore = allScores.reduce((acc, score) => acc + score, 0) / allScores.length;
      }
      break;
  }

  // Round to 2 decimal places
  totalScore = Math.round(totalScore * 100) / 100;

  // Store computed data
  computedData.fieldScores = fieldScores;
  computedData.formula = formula;
  computedData.fieldCount = allScores.length;

  return {
    totalScore,
    pillarScores,
    fieldScores,
    computedData,
  };
}

/**
 * Get classification for a score
 */
export function getClassification(form: FormWithRelations, score: number) {
  // Sort classifications by position
  const sortedClassifications = [...form.classifications].sort(
    (a, b) => a.position - b.position
  );

  // Find matching classification
  for (const classification of sortedClassifications) {
    if (score >= classification.min_score && score <= classification.max_score) {
      return classification;
    }
  }

  // Return last classification as fallback
  return sortedClassifications[sortedClassifications.length - 1] || null;
}

/**
 * Calculate KOSMOS-specific metrics (for compatibility with existing score)
 * This replicates the lucro_oculto calculation from auditQuestions.ts
 */
export function calculateKosmosMetrics(
  answers: FormAnswers,
  pillarScores: Record<string, number>
): Record<string, unknown> {
  // Get quantitative values (if fields exist with these keys)
  const baseValue = answers['base_size']?.numericValue || 0;
  const ticketValue = answers['ticket_medio']?.numericValue || 0;
  const ofertasMultiplier = answers['num_ofertas']?.numericValue || 1;
  const comunicacaoMultiplier = answers['frequencia_comunicacao']?.numericValue || 0.5;

  const scoreCausa = pillarScores['causa'] || 0;
  const scoreCultura = pillarScores['cultura'] || 0;
  const scoreEconomia = pillarScores['economia'] || 0;

  // Calculate KOSMOS Asset Score (weighted average)
  const kosmosAssetScore = (scoreCausa * 0.3) + (scoreCultura * 0.3) + (scoreEconomia * 0.4);

  // Calculate conversion rates based on pillar health
  const avgPillarScore = (scoreCausa + scoreCultura + scoreEconomia) / 3;
  const tcpPotential = 0.02 + (avgPillarScore / 100) * 0.06;
  const tcaActual = 0.005 + (kosmosAssetScore / 100) * 0.025;

  // Calculate Hidden Profit
  const conversionGap = tcpPotential - tcaActual;
  const lucroOculto = baseValue * ticketValue * ofertasMultiplier * comunicacaoMultiplier * conversionGap * 4;

  // Determine if beginner mode should activate
  const isBeginner = baseValue < 500 || kosmosAssetScore < 20;

  return {
    kosmosAssetScore: Math.round(kosmosAssetScore * 100) / 100,
    lucroOculto: Math.max(0, Math.round(lucroOculto)),
    isBeginner,
    tcpPotential,
    tcaActual,
    conversionGap,
  };
}
