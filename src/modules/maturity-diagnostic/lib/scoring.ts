// Diagnóstico de Maturidade de Ecossistema - Scoring
// Lógica de cálculo do resultado do diagnóstico

import {
  MATURITY_QUESTIONS,
  MaturityPillar,
  PILLAR_LABELS,
  type MaturityQuestion,
} from './questions';
import {
  getMaturityLevel,
  getMaturityLevelInfo,
  getLevelProgress,
  type MaturityLevel,
  type MaturityLevelInfo,
} from './maturityLevels';

export interface DiagnosticAnswer {
  questionId: string;
  value: string;
  score: number;
}

export interface PillarScore {
  pillar: MaturityPillar;
  label: string;
  score: number; // 1-5
  status: 'critical' | 'weak' | 'moderate' | 'strong' | 'excellent';
}

export interface DiagnosticResult {
  // Identificação
  email: string;
  fullName?: string;
  createdAt: Date;

  // Scores
  answers: DiagnosticAnswer[];
  totalScore: number; // 7-35
  averageScore: number; // 1-5
  pillarScores: PillarScore[];

  // Resultado
  level: MaturityLevel;
  levelInfo: MaturityLevelInfo;
  levelProgress: number; // % dentro do nível atual

  // Análise
  strengths: PillarScore[];
  weaknesses: PillarScore[];
  recommendations: string[];

  // Compartilhamento
  shareText: string;
  shareUrl?: string;
}

/**
 * Calcula o status de um score
 */
function getScoreStatus(
  score: number
): 'critical' | 'weak' | 'moderate' | 'strong' | 'excellent' {
  if (score <= 1.5) return 'critical';
  if (score <= 2.5) return 'weak';
  if (score <= 3.5) return 'moderate';
  if (score <= 4.5) return 'strong';
  return 'excellent';
}

/**
 * Gera recomendações personalizadas baseadas nos pilares fracos
 */
function generateRecommendations(pillarScores: PillarScore[]): string[] {
  const recommendations: string[] = [];
  const weakPillars = pillarScores.filter((p) => p.score <= 2.5);

  for (const pillar of weakPillars) {
    switch (pillar.pillar) {
      case 'dependencia':
        recommendations.push(
          'Comece a documentar seus processos e identifique membros que podem assumir responsabilidades.'
        );
        break;
      case 'conexao':
        recommendations.push(
          'Crie espaços e momentos específicos para membros se conectarem entre si, não só com você.'
        );
        break;
      case 'estrutura':
        recommendations.push(
          'Estabeleça rituais recorrentes (semanais ou quinzenais) que funcionem sem sua presença constante.'
        );
        break;
      case 'onboarding':
        recommendations.push(
          'Desenvolva um processo de boas-vindas estruturado que faça novos membros se sentirem em casa rapidamente.'
        );
        break;
      case 'ascensao':
        recommendations.push(
          'Crie caminhos claros de aprofundamento para quem quer ir mais fundo com você.'
        );
        break;
      case 'advocacy':
        recommendations.push(
          'Fortaleça a identidade do grupo para que membros sintam orgulho de fazer parte e indiquem naturalmente.'
        );
        break;
      case 'tendencia':
        recommendations.push(
          'Analise o que está causando a queda no engajamento e teste novos formatos de interação.'
        );
        break;
    }
  }

  // Adiciona recomendações gerais se tiver poucos pontos fracos
  if (recommendations.length < 2) {
    const level = getMaturityLevel(
      pillarScores.reduce((sum, p) => sum + p.score, 0)
    );
    const levelInfo = getMaturityLevelInfo(level);
    recommendations.push(levelInfo.nextStep);
  }

  return recommendations.slice(0, 4); // Máximo 4 recomendações
}

/**
 * Calcula o resultado completo do diagnóstico
 */
export function calculateDiagnosticResult(
  email: string,
  answers: DiagnosticAnswer[],
  fullName?: string
): DiagnosticResult {
  // Calcula score total
  const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
  const averageScore = totalScore / answers.length;

  // Calcula scores por pilar
  const pillarScores: PillarScore[] = [];
  const pillarAnswers: Record<MaturityPillar, number[]> = {
    dependencia: [],
    conexao: [],
    estrutura: [],
    onboarding: [],
    ascensao: [],
    advocacy: [],
    tendencia: [],
  };

  // Agrupa respostas por pilar
  for (const answer of answers) {
    const question = MATURITY_QUESTIONS.find((q) => q.id === answer.questionId);
    if (question) {
      pillarAnswers[question.pillar].push(answer.score);
    }
  }

  // Calcula média por pilar
  for (const [pillar, scores] of Object.entries(pillarAnswers)) {
    if (scores.length > 0) {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      pillarScores.push({
        pillar: pillar as MaturityPillar,
        label: PILLAR_LABELS[pillar as MaturityPillar],
        score: avgScore,
        status: getScoreStatus(avgScore),
      });
    }
  }

  // Ordena pilares por score
  const sortedPillars = [...pillarScores].sort((a, b) => b.score - a.score);
  const strengths = sortedPillars.filter((p) => p.score >= 3.5).slice(0, 3);
  const weaknesses = sortedPillars.filter((p) => p.score < 3).slice(-3).reverse();

  // Determina nível
  const level = getMaturityLevel(totalScore);
  const levelInfo = getMaturityLevelInfo(level);
  const levelProgress = getLevelProgress(totalScore);

  // Gera recomendações
  const recommendations = generateRecommendations(pillarScores);

  return {
    email,
    fullName,
    createdAt: new Date(),
    answers,
    totalScore,
    averageScore,
    pillarScores,
    level,
    levelInfo,
    levelProgress,
    strengths,
    weaknesses,
    recommendations,
    shareText: levelInfo.shareText,
  };
}

/**
 * Formata o resultado para salvar no banco (lead_magnet_results)
 */
export function formatResultForDatabase(result: DiagnosticResult) {
  return {
    // Lead data
    respondent_email: result.email,
    respondent_name: result.fullName,

    // Lead magnet identification
    lead_magnet_type: 'maturity-diagnostic',

    // Inputs (dados fornecidos pelo usuário)
    inputs: {
      answers: result.answers,
    },

    // Outputs (resultados calculados)
    outputs: {
      level: result.level,
      levelName: result.levelInfo.name,
      levelHeadline: result.levelInfo.headline,
      averageScore: result.averageScore,
      pillarScores: result.pillarScores,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendations: result.recommendations,
      levelProgress: result.levelProgress,
      shareText: result.shareText,
    },

    // Score fields (para queries e pipeline)
    total_score: result.totalScore,
    score_level: String(result.level), // nível 1-5 como string
    score_breakdown: {
      pillarScores: result.pillarScores,
      averageScore: result.averageScore,
    },
  };
}

/**
 * Retorna cor do status
 */
export function getStatusColor(
  status: 'critical' | 'weak' | 'moderate' | 'strong' | 'excellent'
): string {
  const colors = {
    critical: 'text-red-500',
    weak: 'text-orange-500',
    moderate: 'text-yellow-500',
    strong: 'text-emerald-500',
    excellent: 'text-cyan-500',
  };
  return colors[status];
}

/**
 * Retorna cor de fundo do status
 */
export function getStatusBgColor(
  status: 'critical' | 'weak' | 'moderate' | 'strong' | 'excellent'
): string {
  const colors = {
    critical: 'bg-red-500/10',
    weak: 'bg-orange-500/10',
    moderate: 'bg-yellow-500/10',
    strong: 'bg-emerald-500/10',
    excellent: 'bg-cyan-500/10',
  };
  return colors[status];
}

// ============================================
// NARRATIVAS PERSONALIZADAS
// ============================================

export interface LevelNarrative {
  headline: string;
  story: string;
  emotion: string;
  gapAnalysis: string;
  urgency?: string;
}

/**
 * Narrativas emocionais por nivel
 */
export const LEVEL_NARRATIVES: Record<MaturityLevel, LevelNarrative> = {
  1: {
    headline: 'Voce tem uma audiencia, nao um ecossistema',
    story: 'Seus seguidores consomem seu conteudo, mas nao participam ativamente. Eles assistem, curtem, talvez comentem — mas nao criam vinculos entre si nem com o que voce representa.',
    emotion: 'Este e o ponto de partida de todo criador. A boa noticia? Voce ja tem a materia-prima. Agora precisa transformar consumidores em participantes.',
    gapAnalysis: 'O que separa voce de uma Comunidade (Nivel 2) e criar espacos onde as pessoas interajam — nao so com voce, mas entre si.',
  },
  2: {
    headline: 'Voce construiu uma comunidade, mas ela depende de voce',
    story: 'Parabens — voce criou algo real. Pessoas engajam, participam, se sentem parte. Mas quando voce para, tudo para. Voce e o sol ao redor do qual tudo gira.',
    emotion: 'Isso e natural neste estagio. O desafio agora e criar estruturas que funcionem sem sua presenca constante.',
    gapAnalysis: 'Para chegar ao Nivel 3 (Ecossistema), voce precisa de rituais autonomos, lideres emergentes, e processos que rodem sozinhos.',
  },
  3: {
    headline: 'Seu ecossistema esta ganhando vida propria',
    story: 'Membros se ajudam, existem rituais recorrentes, ha estrutura. As vezes funciona perfeitamente; as vezes ainda precisa do seu empurrao. Voce esta no caminho certo.',
    emotion: 'Este e um momento de transicao importante. O ecossistema esta testando se consegue andar sozinho.',
    gapAnalysis: 'Para virar um Movimento (Nivel 4), voce precisa de identidade coletiva mais forte e mecanismos de crescimento organico.',
  },
  4: {
    headline: 'Voce esta construindo um movimento',
    story: 'Membros trazem novos membros. Ha identidade compartilhada — as pessoas se veem como parte de algo maior. O crescimento acontece organicamente.',
    emotion: 'Poucos criadores chegam aqui. Voce construiu algo que transcende o conteudo.',
    gapAnalysis: 'O proximo passo para o Legado (Nivel 5) e garantir que o movimento continue sem voce: governanca clara, sucessao planejada.',
  },
  5: {
    headline: 'Voce criou um legado',
    story: 'Seu ecossistema funciona, cresce e evolui mesmo sem sua presenca constante. Voce construiu algo que impacta pessoas de forma autonoma.',
    emotion: 'Isso e raro. Voce fez o que poucos conseguem: criar algo que transcende o criador.',
    gapAnalysis: 'Seu proximo desafio e expandir o impacto, formar novos lideres, e compartilhar o modelo com outros.',
  },
};

/**
 * Gera narrativa personalizada baseada no perfil do usuario
 */
export function generatePersonalizedNarrative(result: DiagnosticResult): LevelNarrative {
  const baseNarrative = LEVEL_NARRATIVES[result.level];

  // Personaliza baseado em pontos fortes e fracos
  let personalizedGap = baseNarrative.gapAnalysis;

  if (result.weaknesses.length > 0) {
    const weakestPillar = result.weaknesses[0];
    const pillarTips: Record<MaturityPillar, string> = {
      dependencia: 'Voce precisa urgentemente distribuir responsabilidades.',
      conexao: 'Membros ainda dependem de voce para se conectar.',
      estrutura: 'Faltam rituais que funcionem sem voce.',
      onboarding: 'Novos membros demoram para se sentir em casa.',
      ascensao: 'Nao ha caminhos claros para quem quer ir mais fundo.',
      advocacy: 'Membros ainda nao indicam organicamente.',
      tendencia: 'O engajamento esta caindo — atencao.',
    };
    personalizedGap = `${pillarTips[weakestPillar.pillar]} ${baseNarrative.gapAnalysis}`;
  }

  return {
    ...baseNarrative,
    gapAnalysis: personalizedGap,
  };
}

/**
 * Gera insights rapidos baseados no resultado
 */
export function generateQuickInsights(result: DiagnosticResult): string[] {
  const insights: string[] = [];

  // Insight sobre nivel
  if (result.level <= 2) {
    insights.push('Seu ecossistema ainda depende muito de voce — isso e normal neste estagio.');
  } else if (result.level === 3) {
    insights.push('Voce esta no ponto de virada — momento de acelerar a autonomia.');
  } else {
    insights.push('Voce esta entre os poucos que construiram algo com vida propria.');
  }

  // Insight sobre distribuicao de scores
  const scoreVariance = Math.max(...result.pillarScores.map(p => p.score)) -
                        Math.min(...result.pillarScores.map(p => p.score));
  if (scoreVariance > 2) {
    insights.push('Ha um desequilibrio entre suas areas — foque nas mais fracas.');
  } else {
    insights.push('Seus pilares estao equilibrados — bom sinal de consistencia.');
  }

  // Insight sobre pontos fortes
  if (result.strengths.length > 0) {
    const strongestLabel = result.strengths[0].label;
    insights.push(`Seu ponto mais forte e ${strongestLabel.toLowerCase()} — use isso a seu favor.`);
  }

  return insights;
}
