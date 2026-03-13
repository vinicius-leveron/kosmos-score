// Raio-X KOSMOS — Lead Scoring
// Pontuação baseada em 6 perguntas de múltipla escolha
// Total máximo: 20 pontos

import type { RaioXAnswers, RaioXClassification, RaioXScoreBreakdown } from './types';

const SCORABLE_QUESTIONS = ['p2', 'p3', 'p5', 'p8', 'p9', 'p13'] as const;

const CLASSIFICATION_THRESHOLDS = {
  QUALIFICADO: 12,
  EM_CONSTRUCAO: 6,
} as const;

function getScoreForQuestion(questionId: string, answers: RaioXAnswers): number {
  const answer = answers[questionId];
  if (!answer || answer.type !== 'single') return 0;
  return answer.numericValue;
}

export function classifyScore(total: number): RaioXClassification {
  if (total >= CLASSIFICATION_THRESHOLDS.QUALIFICADO) return 'QUALIFICADO';
  if (total >= CLASSIFICATION_THRESHOLDS.EM_CONSTRUCAO) return 'EM_CONSTRUCAO';
  return 'INICIO';
}

export function calculateLeadScore(answers: RaioXAnswers): RaioXScoreBreakdown {
  const p2_score = getScoreForQuestion('p2', answers);
  const p3_score = getScoreForQuestion('p3', answers);
  const p5_score = getScoreForQuestion('p5', answers);
  const p8_score = getScoreForQuestion('p8', answers);
  const p9_score = getScoreForQuestion('p9', answers);
  const p13_score = getScoreForQuestion('p13', answers);

  const total = p2_score + p3_score + p5_score + p8_score + p9_score + p13_score;
  const classification = classifyScore(total);

  return {
    p2_score,
    p3_score,
    p5_score,
    p8_score,
    p9_score,
    p13_score,
    total,
    classification,
  };
}

export const CLASSIFICATION_LABELS: Record<RaioXClassification, string> = {
  INICIO: 'Início',
  EM_CONSTRUCAO: 'Em Construção',
  QUALIFICADO: 'Qualificado',
};

export const CLASSIFICATION_COLORS: Record<RaioXClassification, string> = {
  INICIO: '#fbbf24',      // amarelo
  EM_CONSTRUCAO: '#E05A30', // laranja KOSMOS
  QUALIFICADO: '#4ade80',   // verde
};

export { SCORABLE_QUESTIONS, CLASSIFICATION_THRESHOLDS };
