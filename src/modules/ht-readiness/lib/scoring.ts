import {
  QUESTIONS,
  CATEGORIES,
  DiagnosticAnswers,
  DiagnosticCategory,
} from './questions';

export interface CategoryScore {
  category: DiagnosticCategory;
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: 'critico' | 'atencao' | 'bom' | 'excelente';
  questionsAnswered: number;
  totalQuestions: number;
}

export interface DiagnosticResult {
  // Lead data
  email: string;
  name?: string;

  // Overall
  totalScore: number;
  level: DiagnosticLevel;
  levelLabel: string;

  // By category
  categoryScores: CategoryScore[];

  // Strengths and weaknesses
  strengths: string[];
  weaknesses: string[];

  // Recommendations
  recommendations: string[];

  // Metadata
  answeredAt: Date;
}

export type DiagnosticLevel = 'fundacao' | 'preparacao' | 'pronto' | 'avancado';

export const LEVEL_THRESHOLDS = {
  fundacao: { min: 0, max: 40, label: 'Fundacao' },
  preparacao: { min: 41, max: 65, label: 'Preparacao' },
  pronto: { min: 66, max: 85, label: 'Pronto' },
  avancado: { min: 86, max: 100, label: 'Avancado' },
};

export const LEVEL_HEADLINES: Record<DiagnosticLevel, string> = {
  fundacao: 'Construa sua fundacao antes do High Ticket',
  preparacao: 'Voce esta a passos do High Ticket',
  pronto: 'Voce esta pronto para High Ticket!',
  avancado: 'Hora de escalar seu High Ticket',
};

/**
 * Calculate diagnostic result from answers
 */
export function calculateDiagnosticResult(
  email: string,
  answers: DiagnosticAnswers,
  name?: string
): DiagnosticResult {
  // Calculate scores by category
  const categoryScores = calculateCategoryScores(answers);

  // Calculate weighted total score
  const totalScore = calculateWeightedScore(categoryScores);

  // Determine level
  const level = determineLevel(totalScore);
  const levelLabel = LEVEL_HEADLINES[level];

  // Find strengths and weaknesses
  const { strengths, weaknesses } = findStrengthsAndWeaknesses(categoryScores);

  // Generate recommendations
  const recommendations = generateRecommendations(level, categoryScores);

  return {
    email,
    name,
    totalScore: Math.round(totalScore),
    level,
    levelLabel,
    categoryScores,
    strengths,
    weaknesses,
    recommendations,
    answeredAt: new Date(),
  };
}

function calculateCategoryScores(answers: DiagnosticAnswers): CategoryScore[] {
  return CATEGORIES.map((category) => {
    const categoryQuestions = QUESTIONS.filter((q) => q.category === category.id);
    let totalScore = 0;
    let answered = 0;

    categoryQuestions.forEach((question) => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find((o) => o.value === answer);
        if (option) {
          totalScore += option.score;
          answered++;
        }
      }
    });

    const maxScore = categoryQuestions.length * 100;
    const percentage = answered > 0 ? Math.round((totalScore / (answered * 100)) * 100) : 0;

    return {
      category: category.id,
      name: category.name,
      score: totalScore,
      maxScore,
      percentage,
      level: getCategoryLevel(percentage),
      questionsAnswered: answered,
      totalQuestions: categoryQuestions.length,
    };
  });
}

function getCategoryLevel(percentage: number): 'critico' | 'atencao' | 'bom' | 'excelente' {
  if (percentage < 40) return 'critico';
  if (percentage < 60) return 'atencao';
  if (percentage < 80) return 'bom';
  return 'excelente';
}

function calculateWeightedScore(categoryScores: CategoryScore[]): number {
  let weightedSum = 0;
  let totalWeight = 0;

  categoryScores.forEach((cs) => {
    const categoryInfo = CATEGORIES.find((c) => c.id === cs.category);
    if (categoryInfo) {
      weightedSum += cs.percentage * (categoryInfo.weight / 100);
      totalWeight += categoryInfo.weight;
    }
  });

  return totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
}

function determineLevel(score: number): DiagnosticLevel {
  if (score <= LEVEL_THRESHOLDS.fundacao.max) return 'fundacao';
  if (score <= LEVEL_THRESHOLDS.preparacao.max) return 'preparacao';
  if (score <= LEVEL_THRESHOLDS.pronto.max) return 'pronto';
  return 'avancado';
}

function findStrengthsAndWeaknesses(categoryScores: CategoryScore[]): {
  strengths: string[];
  weaknesses: string[];
} {
  const sorted = [...categoryScores].sort((a, b) => b.percentage - a.percentage);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  sorted.forEach((cs) => {
    if (cs.percentage >= 70) {
      strengths.push(cs.name);
    } else if (cs.percentage < 50) {
      weaknesses.push(cs.name);
    }
  });

  return { strengths, weaknesses };
}

function generateRecommendations(
  level: DiagnosticLevel,
  categoryScores: CategoryScore[]
): string[] {
  const recommendations: string[] = [];

  // Sort categories by score (lowest first) to prioritize
  const sorted = [...categoryScores].sort((a, b) => a.percentage - b.percentage);

  // Base recommendations by level
  if (level === 'fundacao') {
    recommendations.push(
      'Foque em construir autoridade antes de lançar ofertas high ticket'
    );
    recommendations.push(
      'Documente seus primeiros cases de sucesso, mesmo que pequenos'
    );
  } else if (level === 'preparacao') {
    recommendations.push(
      'Desenvolva seu método proprietário e dê um nome a ele'
    );
    recommendations.push(
      'Comece testando preços mais altos com clientes que já te conhecem'
    );
  } else if (level === 'pronto') {
    recommendations.push(
      'Estruture sua oferta high ticket com entregáveis claros'
    );
    recommendations.push('Crie um processo de vendas consultivo');
  } else {
    recommendations.push(
      'Considere criar uma oferta ainda mais premium ou grupo exclusivo'
    );
    recommendations.push('Explore parcerias estratégicas para ampliar alcance');
  }

  // Specific recommendations based on weakest categories
  const weakest = sorted[0];
  if (weakest.percentage < 60) {
    const categoryRecs: Record<DiagnosticCategory, string> = {
      autoridade:
        'Invista em produção de conteúdo para aumentar sua visibilidade',
      oferta: 'Trabalhe na clareza da transformação que você entrega',
      entrega:
        'Estruture processos de entrega para garantir resultados consistentes',
      mindset:
        'Trabalhe sua mentalidade de valor - seu trabalho merece ser bem pago',
    };
    recommendations.push(categoryRecs[weakest.category]);
  }

  return recommendations.slice(0, 4);
}
