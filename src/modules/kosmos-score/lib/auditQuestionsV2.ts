// KOSMOS Score V2 - Auditoria de Lucro Oculto
// 18 perguntas estruturadas em 6 blocos

// ============================================================================
// TYPES
// ============================================================================

export type BlockType = 'perfil' | 'quantitativo' | 'movimento' | 'estrutura' | 'economia' | 'voz';
export type PillarName = 'movimento' | 'estrutura' | 'economia';
export type QuestionType = 'single' | 'multi' | 'text';
export type UserStage = 'construindo' | 'escalando' | 'consolidando';
export type ResultProfile = 'base_sem_estrutura' | 'base_construcao' | 'base_maturacao' | 'ativo_alta_performance';

export interface QuestionOption {
  label: string;
  value: string;
  numericValue: number;
}

export interface Question {
  id: number;
  block: BlockType;
  pillar?: PillarName;
  type: QuestionType;
  title: string;
  subtitle?: string;
  placeholder?: string;
  options?: QuestionOption[];
  required: boolean;
  scorable: boolean; // Does this question contribute to pillar score?
  dbColumn?: string; // Database column name
}

export interface AuditAnswerSingle {
  type: 'single';
  value: string;
  numericValue: number;
}

export interface AuditAnswerMulti {
  type: 'multi';
  values: string[];
  numericValue: number;
}

export interface AuditAnswerText {
  type: 'text';
  value: string;
}

export type AuditAnswer = AuditAnswerSingle | AuditAnswerMulti | AuditAnswerText;

export type AuditAnswers = {
  [key: number]: AuditAnswer;
};

export interface AuditResult {
  email: string;
  version: 2;
  answers: AuditAnswers;
  // Profile data
  stage: UserStage;
  businessCategory: string;
  niche: string;
  instagramHandle: string;
  timeSelling: string;
  // Quantitative
  baseValue: number;
  ticketValue: number;
  monthlyRevenue: number;
  // Scores
  scoreMovimento: number;
  scoreEstrutura: number;
  scoreEconomia: number;
  kosmosAssetScore: number;
  // Results
  resultProfile: ResultProfile;
  lucroOcultoMin: number;
  lucroOcultoMax: number;
  lucroOcultoDisplay: string;
  // Voice of customer
  mainObstacle: string;
  workshopMotivation: string;
}

// ============================================================================
// QUESTIONS (18 total)
// ============================================================================

export const questions: Question[] = [
  // -------------------------------------------------------------------------
  // BLOCO 1: PERFIL (5 perguntas - P1 a P5) - NÃO entram no score
  // -------------------------------------------------------------------------
  {
    id: 1,
    block: 'perfil',
    type: 'single',
    title: 'Qual categoria descreve melhor o seu negócio?',
    options: [
      { label: 'Infoprodutor / Expert / Criador de Conteúdo', value: 'infoprodutor', numericValue: 0 },
      { label: 'Prestador de Serviço (Agência, Consultoria, Freelancer)', value: 'servico', numericValue: 0 },
      { label: 'Negócio Físico / Varejo Local', value: 'fisico', numericValue: 0 },
      { label: 'SaaS / Tecnologia', value: 'saas', numericValue: 0 },
      { label: 'Outro', value: 'outro', numericValue: 0 },
    ],
    required: true,
    scorable: false,
    dbColumn: 'business_category',
  },
  {
    id: 2,
    block: 'perfil',
    type: 'single',
    title: 'Em qual momento você está?',
    options: [
      { label: 'Construindo: Ainda não tenho muitos clientes ou comunidade ativa', value: 'construindo', numericValue: 0 },
      { label: 'Escalando: Já tenho clientes/alunos, mas quero monetizar melhor', value: 'escalando', numericValue: 0 },
      { label: 'Consolidando: Já tenho uma grande base e quero transformá-la em ecossistema', value: 'consolidando', numericValue: 0 },
    ],
    required: true,
    scorable: false,
    dbColumn: 'stage',
  },
  {
    id: 3,
    block: 'perfil',
    type: 'text',
    title: 'Qual é o seu nicho / mercado?',
    placeholder: 'Ex: Finanças pessoais, Emagrecimento, Marketing Digital...',
    required: true,
    scorable: false,
    dbColumn: 'niche',
  },
  {
    id: 4,
    block: 'perfil',
    type: 'text',
    title: 'Qual o seu @ do Instagram?',
    placeholder: '@seuperfil',
    required: false,
    scorable: false,
    dbColumn: 'instagram_handle',
  },
  {
    id: 5,
    block: 'perfil',
    type: 'single',
    title: 'Há quanto tempo você vende online?',
    options: [
      { label: 'Menos de 1 ano', value: 'menos_1', numericValue: 0 },
      { label: '1 a 3 anos', value: '1_3', numericValue: 0 },
      { label: '3 a 5 anos', value: '3_5', numericValue: 0 },
      { label: 'Mais de 5 anos', value: 'mais_5', numericValue: 0 },
    ],
    required: true,
    scorable: false,
    dbColumn: 'time_selling',
  },

  // -------------------------------------------------------------------------
  // BLOCO 2: BASE QUANTITATIVA (4 perguntas - P6 a P9)
  // -------------------------------------------------------------------------
  {
    id: 6,
    block: 'quantitativo',
    type: 'single',
    title: 'Quantas pessoas você consegue alcançar hoje sem pagar anúncio?',
    subtitle: 'Inclua: lista de e-mail, grupo de WhatsApp, comunidade, seguidores engajados.',
    options: [
      { label: 'Menos de 500 pessoas', value: 'menos_500', numericValue: 300 },
      { label: '500 a 2.000 pessoas', value: '500_2000', numericValue: 1250 },
      { label: '2.000 a 5.000 pessoas', value: '2000_5000', numericValue: 3500 },
      { label: '5.000 a 15.000 pessoas', value: '5000_15000', numericValue: 10000 },
      { label: 'Mais de 15.000 pessoas', value: 'mais_15000', numericValue: 20000 },
    ],
    required: true,
    scorable: false, // Usado no cálculo de lucro, não no score do pilar
    dbColumn: 'base_size',
  },
  {
    id: 7,
    block: 'quantitativo',
    type: 'single',
    title: 'Qual o ticket médio do seu produto/serviço principal?',
    options: [
      { label: 'Até R$ 97 (produto de entrada)', value: 'ate_97', numericValue: 67 },
      { label: 'R$ 97 a R$ 497', value: '97_497', numericValue: 297 },
      { label: 'R$ 497 a R$ 2.000', value: '497_2000', numericValue: 1200 },
      { label: 'R$ 2.000 a R$ 5.000', value: '2000_5000', numericValue: 3500 },
      { label: 'Acima de R$ 5.000', value: 'acima_5000', numericValue: 7500 },
    ],
    required: true,
    scorable: false,
    dbColumn: 'ticket_medio',
  },
  {
    id: 8,
    block: 'quantitativo',
    pillar: 'economia', // Entra no score do pilar Economia
    type: 'single',
    title: 'Quantas ofertas diferentes você tem disponíveis para a sua base hoje?',
    subtitle: 'Produtos ou serviços que você oferece atualmente.',
    options: [
      { label: 'Apenas 1 produto', value: '1_produto', numericValue: 25 },
      { label: '2 produtos', value: '2_produtos', numericValue: 50 },
      { label: '3 a 4 produtos', value: '3_4_produtos', numericValue: 75 },
      { label: '5 ou mais (ecossistema completo)', value: '5_mais', numericValue: 100 },
    ],
    required: true,
    scorable: true,
    dbColumn: 'num_ofertas',
  },
  {
    id: 9,
    block: 'quantitativo',
    type: 'single',
    title: 'Qual seu faturamento mensal aproximado?',
    options: [
      { label: 'Até R$ 5.000/mês', value: 'ate_5k', numericValue: 2500 },
      { label: 'R$ 5.000 a R$ 20.000/mês', value: '5k_20k', numericValue: 12500 },
      { label: 'R$ 20.000 a R$ 50.000/mês', value: '20k_50k', numericValue: 35000 },
      { label: 'R$ 50.000 a R$ 100.000/mês', value: '50k_100k', numericValue: 75000 },
      { label: 'Acima de R$ 100.000/mês', value: 'acima_100k', numericValue: 150000 },
    ],
    required: true,
    scorable: false,
    dbColumn: 'monthly_revenue',
  },

  // -------------------------------------------------------------------------
  // BLOCO 3: PILAR MOVIMENTO (2 perguntas - P10 a P11)
  // -------------------------------------------------------------------------
  {
    id: 10,
    block: 'movimento',
    pillar: 'movimento',
    type: 'single',
    title: 'Se um cliente indicasse você para um amigo, ele provavelmente diria...',
    options: [
      { label: '"Ele ensina [técnica X] muito bem" (atração por conteúdo/técnica)', value: 'tecnica', numericValue: 25 },
      { label: '"Ele é referência no assunto, confia nele" (atração por autoridade)', value: 'autoridade', numericValue: 50 },
      { label: '"Ele tem uma visão diferente, vale a pena ouvir" (atração por visão de mundo)', value: 'visao', numericValue: 75 },
      { label: '"Faz parte do grupo dele, é outra vibe" (atração por pertencimento/tribo)', value: 'tribo', numericValue: 100 },
    ],
    required: true,
    scorable: true,
    dbColumn: 'referral_perception',
  },
  {
    id: 11,
    block: 'movimento',
    pillar: 'movimento',
    type: 'single',
    title: 'Seus clientes se identificam com uma causa, missão ou visão de mundo clara no seu negócio?',
    options: [
      { label: 'Não, meu negócio é mais técnico/prático', value: 'tecnico', numericValue: 25 },
      { label: 'Tenho uma mensagem, mas não é muito clara ou consistente', value: 'inconsistente', numericValue: 50 },
      { label: 'Sim, tenho uma narrativa clara que diferencia meu negócio', value: 'clara', numericValue: 75 },
      { label: 'Sim, minha comunidade se define por essa causa (é parte da identidade deles)', value: 'identidade', numericValue: 100 },
    ],
    required: true,
    scorable: true,
    dbColumn: 'mission_identification',
  },

  // -------------------------------------------------------------------------
  // BLOCO 4: PILAR ESTRUTURA (3 perguntas - P12 a P14)
  // -------------------------------------------------------------------------
  {
    id: 12,
    block: 'estrutura',
    pillar: 'estrutura',
    type: 'single',
    title: 'Com que frequência você se comunica ativamente com a sua base?',
    subtitle: 'E-mail, WhatsApp, comunidade, etc.',
    options: [
      { label: 'Quase nunca / só quando lanço', value: 'quase_nunca', numericValue: 25 },
      { label: '1-2x por mês', value: '1_2_mes', numericValue: 50 },
      { label: 'Semanalmente', value: 'semanalmente', numericValue: 75 },
      { label: 'Várias vezes por semana', value: 'varias_semana', numericValue: 100 },
    ],
    required: true,
    scorable: true,
    dbColumn: 'frequencia_comunicacao',
  },
  {
    id: 13,
    block: 'estrutura',
    pillar: 'estrutura',
    type: 'single',
    title: 'Nos últimos 30 dias, quantas interações na sua comunidade/grupo foram iniciadas por membros (não por você)?',
    options: [
      { label: 'Nenhuma / não tenho comunidade ativa', value: 'nenhuma', numericValue: 25 },
      { label: 'Poucas (menos de 10)', value: 'poucas', numericValue: 50 },
      { label: 'Algumas (10 a 30)', value: 'algumas', numericValue: 75 },
      { label: 'Muitas (mais de 30, os membros se engajam entre si)', value: 'muitas', numericValue: 100 },
    ],
    required: true,
    scorable: true,
    dbColumn: 'member_interactions',
  },
  {
    id: 14,
    block: 'estrutura',
    pillar: 'estrutura',
    type: 'multi',
    title: 'Quais destes rituais você pratica na sua comunidade?',
    subtitle: 'Marque todos que se aplicam.',
    options: [
      { label: 'Encontros ao vivo recorrentes (semanais ou quinzenais)', value: 'encontros', numericValue: 25 },
      { label: 'Desafios ou missões com prazo definido', value: 'desafios', numericValue: 25 },
      { label: 'Marcos de progresso com reconhecimento público', value: 'marcos', numericValue: 25 },
      { label: 'Onboarding estruturado para novos membros', value: 'onboarding', numericValue: 25 },
      { label: 'Nenhum dos anteriores', value: 'nenhum', numericValue: 0 },
    ],
    required: true,
    scorable: true,
    dbColumn: 'rituals_multi',
  },

  // -------------------------------------------------------------------------
  // BLOCO 5: PILAR ECONOMIA (2 perguntas - P15 a P16)
  // -------------------------------------------------------------------------
  {
    id: 15,
    block: 'economia',
    pillar: 'economia',
    type: 'single',
    title: 'Você tem uma oferta High-Ticket (acima de R$ 5.000) exclusiva para membros antigos ou mais engajados?',
    options: [
      { label: 'Não, só tenho uma oferta', value: 'nao', numericValue: 25 },
      { label: 'Tenho upsell, mas não é high-ticket', value: 'upsell', numericValue: 50 },
      { label: 'Tenho high-ticket, mas não é exclusivo pra base', value: 'high_ticket', numericValue: 75 },
      { label: 'Sim, tenho uma escada completa de Ascensão', value: 'ascensao', numericValue: 100 },
      { label: 'Ainda estou validando minha oferta', value: 'validando', numericValue: 25 },
    ],
    required: true,
    scorable: true,
    dbColumn: 'oferta_ascensao',
  },
  {
    id: 16,
    block: 'economia',
    pillar: 'economia',
    type: 'single',
    title: 'Qual percentual da sua receita vem de clientes que já compraram antes (recompra)?',
    options: [
      { label: 'Menos de 10% (quase tudo é venda nova)', value: 'menos_10', numericValue: 25 },
      { label: '10% a 30%', value: '10_30', numericValue: 50 },
      { label: '30% a 50%', value: '30_50', numericValue: 75 },
      { label: 'Mais de 50% (a base é meu principal motor de receita)', value: 'mais_50', numericValue: 100 },
    ],
    required: true,
    scorable: true,
    dbColumn: 'recorrencia',
  },

  // -------------------------------------------------------------------------
  // BLOCO 6: VOZ DO CLIENTE (2 perguntas - P17 a P18) - NÃO entram no score
  // -------------------------------------------------------------------------
  {
    id: 17,
    block: 'voz',
    type: 'text',
    title: 'Em uma frase, qual é o maior obstáculo que te impede de escalar seu negócio hoje?',
    placeholder: 'Escreva com suas próprias palavras...',
    required: true,
    scorable: false,
    dbColumn: 'main_obstacle',
  },
  {
    id: 18,
    block: 'voz',
    type: 'text',
    title: 'O que te motivou a se inscrever no Workshop KOSMOS?',
    placeholder: 'O que você espera aprender ou conquistar...',
    required: true,
    scorable: false,
    dbColumn: 'workshop_motivation',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getBlockLabel = (block: BlockType): string => {
  const labels: Record<BlockType, string> = {
    perfil: 'PERFIL',
    quantitativo: 'BASE QUANTITATIVA',
    movimento: 'MOVIMENTO (Identidade & Atração)',
    estrutura: 'ESTRUTURA (Retenção & Jornada)',
    economia: 'ECONOMIA (Lucro & Dados)',
    voz: 'SUA VOZ',
  };
  return labels[block];
};

export const getPillarLabel = (pillar: PillarName): string => {
  const labels: Record<PillarName, string> = {
    movimento: 'MOVIMENTO',
    estrutura: 'ESTRUTURA',
    economia: 'ECONOMIA',
  };
  return labels[pillar];
};

export const getPillarFullLabel = (pillar: PillarName): string => {
  const labels: Record<PillarName, string> = {
    movimento: 'MOVIMENTO (Identidade & Atração)',
    estrutura: 'ESTRUTURA (Retenção & Jornada)',
    economia: 'ECONOMIA (Lucro & Dados)',
  };
  return labels[pillar];
};

// ============================================================================
// SCORE CALCULATION
// ============================================================================

function calculateRitualsScore(values: string[] | undefined): number {
  if (!values || values.length === 0) return 20;
  if (values.includes('nenhum')) return 20;

  // Each ritual adds 25 points, max 100
  const ritualCount = values.filter(v => v !== 'nenhum').length;
  return Math.min(100, 20 + ritualCount * 20);
}

export function getAnswerNumericValue(answer: AuditAnswer | undefined): number {
  if (!answer) return 0;
  if (answer.type === 'single') return answer.numericValue;
  if (answer.type === 'multi') return answer.numericValue;
  return 0;
}

export function getAnswerValue(answer: AuditAnswer | undefined): string {
  if (!answer) return '';
  if (answer.type === 'single') return answer.value;
  if (answer.type === 'text') return answer.value;
  if (answer.type === 'multi') return answer.values.join(',');
  return '';
}

export function calculateAuditResult(email: string, answers: AuditAnswers): AuditResult {
  // Get stage from P2
  const stageAnswer = answers[2] as AuditAnswerSingle | undefined;
  const stage = (stageAnswer?.value || 'escalando') as UserStage;

  // Get profile data
  const businessCategory = getAnswerValue(answers[1]);
  const niche = (answers[3] as AuditAnswerText)?.value || '';
  const instagramHandle = (answers[4] as AuditAnswerText)?.value || '';
  const timeSelling = getAnswerValue(answers[5]);

  // Get quantitative values for lucro calculation
  const baseValue = getAnswerNumericValue(answers[6]);
  const ticketValue = getAnswerNumericValue(answers[7]);
  const monthlyRevenue = getAnswerNumericValue(answers[9]);

  // Calculate MOVIMENTO score (average of P10 and P11)
  const scoreMovimento = (getAnswerNumericValue(answers[10]) + getAnswerNumericValue(answers[11])) / 2;

  // Calculate ESTRUTURA score (average of P12, P13, P14)
  const p14Answer = answers[14] as AuditAnswerMulti | undefined;
  const ritualsScore = calculateRitualsScore(p14Answer?.values);
  const scoreEstrutura = (
    getAnswerNumericValue(answers[12]) +
    getAnswerNumericValue(answers[13]) +
    ritualsScore
  ) / 3;

  // Calculate ECONOMIA score (average of P8, P15, P16)
  const scoreEconomia = (
    getAnswerNumericValue(answers[8]) +
    getAnswerNumericValue(answers[15]) +
    getAnswerNumericValue(answers[16])
  ) / 3;

  // Calculate KOSMOS Asset Score (equal weight 33/33/33)
  const kosmosAssetScore = (scoreMovimento + scoreEstrutura + scoreEconomia) / 3;

  // Determine result profile
  let resultProfile: ResultProfile;
  if (kosmosAssetScore <= 25) {
    resultProfile = 'base_sem_estrutura';
  } else if (kosmosAssetScore <= 50) {
    resultProfile = 'base_construcao';
  } else if (kosmosAssetScore <= 75) {
    resultProfile = 'base_maturacao';
  } else {
    resultProfile = 'ativo_alta_performance';
  }

  // Calculate Lucro Oculto with ranges
  const { min, max, display } = calculateLucroOculto(
    baseValue,
    ticketValue,
    monthlyRevenue,
    kosmosAssetScore,
    stage
  );

  // Get voice of customer data
  const mainObstacle = (answers[17] as AuditAnswerText)?.value || '';
  const workshopMotivation = (answers[18] as AuditAnswerText)?.value || '';

  return {
    email,
    version: 2,
    answers,
    stage,
    businessCategory,
    niche,
    instagramHandle,
    timeSelling,
    baseValue,
    ticketValue,
    monthlyRevenue,
    scoreMovimento,
    scoreEstrutura,
    scoreEconomia,
    kosmosAssetScore,
    resultProfile,
    lucroOcultoMin: min,
    lucroOcultoMax: max,
    lucroOcultoDisplay: display,
    mainObstacle,
    workshopMotivation,
  };
}

function calculateLucroOculto(
  baseValue: number,
  ticketValue: number,
  monthlyRevenue: number,
  score: number,
  stage: UserStage
): { min: number; max: number; display: string } {
  // Benchmark conversion rates
  const tcpPotential = 0.05; // 5% potential conversion for optimized community
  const highTicketRate = 0.02; // 2% for high-ticket
  const highTicketAvg = 5000;

  // Calculate annual potential
  const regularPotential = baseValue * ticketValue * tcpPotential * 2; // 2x per year
  const highTicketPotential = baseValue * highTicketRate * highTicketAvg;
  const annualPotential = regularPotential + highTicketPotential;

  // Current annual revenue
  const annualCurrent = monthlyRevenue * 12;

  // Gap calculation
  let gap = annualPotential - annualCurrent;

  // For beginners, show full potential instead of gap
  if (stage === 'construindo') {
    gap = annualPotential;
  }

  // Ensure positive
  gap = Math.max(0, gap);

  // Round to ranges (never exact numbers)
  const min = Math.floor(gap * 0.8 / 10000) * 10000;
  const max = Math.ceil(gap * 1.2 / 10000) * 10000;

  // Format display
  let display: string;
  if (max === 0) {
    display = 'R$ 0';
  } else if (min >= 1000000) {
    display = `R$ ${(min / 1000000).toFixed(1)}M+`;
  } else if (max >= 100000) {
    display = `R$ ${Math.round(min / 1000)}K a R$ ${Math.round(max / 1000)}K`;
  } else if (max >= 10000) {
    display = `R$ ${Math.round(max / 1000)}K+`;
  } else {
    display = `R$ ${max.toLocaleString('pt-BR')}+`;
  }

  return { min, max, display };
}

// ============================================================================
// RESULT PROFILE INFO
// ============================================================================

export interface ProfileInfo {
  emoji: string;
  title: string;
  color: string;
  description: string;
}

export function getProfileInfo(profile: ResultProfile): ProfileInfo {
  const info: Record<ResultProfile, ProfileInfo> = {
    base_sem_estrutura: {
      emoji: '🔴',
      title: 'BASE SEM ESTRUTURA',
      color: 'score-red',
      description: 'Sua base existe, mas não tem a arquitetura necessária para gerar valor recorrente. É hora de construir os fundamentos.',
    },
    base_construcao: {
      emoji: '🟠',
      title: 'BASE EM CONSTRUÇÃO',
      color: 'score-orange',
      description: 'Você tem alguns elementos, mas ainda falta acabamento. Há potencial significativo sendo desperdiçado.',
    },
    base_maturacao: {
      emoji: '🟡',
      title: 'BASE EM MATURAÇÃO',
      color: 'score-yellow',
      description: 'Estrutura emergente. Você está no caminho certo, mas ainda há vazamentos significativos. Potencial alto, execução incompleta.',
    },
    ativo_alta_performance: {
      emoji: '🟢',
      title: 'ATIVO DE ALTA PERFORMANCE',
      color: 'score-green',
      description: 'Arquitetura funcional. Você tem uma comunidade autônoma, escada de valor e receita recorrente. É hora de otimizar.',
    },
  };
  return info[profile];
}

// ============================================================================
// PILLAR DIAGNOSIS
// ============================================================================

export interface PillarDiagnosis {
  status: string;
  message: string;
}

export function getPillarDiagnosis(pillar: PillarName, score: number): PillarDiagnosis {
  if (pillar === 'movimento') {
    if (score < 40) {
      return {
        status: 'Fraco',
        message: 'Baixa diferenciação competitiva. Você atrai por conteúdo ou preço, gerando alta rotatividade e baixo senso de pertencimento.',
      };
    } else if (score < 70) {
      return {
        status: 'Em Desenvolvimento',
        message: 'Há elementos de identidade, mas ainda não são suficientes para criar uma tribo fiel. Falta clareza na sua missão.',
      };
    } else {
      return {
        status: 'Forte',
        message: 'Sua comunidade se identifica com sua visão de mundo. Isso gera lealdade e reduz a sensibilidade a preço.',
      };
    }
  }

  if (pillar === 'estrutura') {
    if (score < 40) {
      return {
        status: 'Reativa',
        message: 'Alta Dependência Operacional. Sua comunidade não tem processos autônomos de retenção. Risco de churn alto se você se ausentar.',
      };
    } else if (score < 70) {
      return {
        status: 'Em Construção',
        message: 'Alguns rituais existem, mas a comunidade ainda depende muito de você. Precisa de mais sistemas autônomos.',
      };
    } else {
      return {
        status: 'Autônoma',
        message: 'Sua comunidade tem vida própria. Os membros se engajam entre si e os rituais funcionam sem sua presença constante.',
      };
    }
  }

  // economia
  if (score < 40) {
    return {
      status: 'Ineficiente',
      message: 'Sub-monetização da Base. Ausência de produtos de margem. Esteira de LTV inexistente ou subutilizada.',
    };
  } else if (score < 70) {
    return {
      status: 'Parcial',
      message: 'Tem alguns produtos, mas falta uma escada clara de Ascensão. Parte do potencial financeiro está sendo desperdiçada.',
    };
  } else {
    return {
      status: 'Otimizada',
      message: 'Você tem uma escada de valor bem definida. A base gera receita recorrente e os clientes mais engajados têm para onde ir.',
    };
  }
}

// ============================================================================
// STAGE-BASED MESSAGES
// ============================================================================

export function getStageMessage(stage: UserStage): string {
  const messages: Record<UserStage, string> = {
    construindo: 'Você está começando com a vantagem de quem já conhece a Arquitetura certa. A maioria dos negócios digitais leva 2-3 anos para descobrir o que você vai aprender no Workshop. Você não vai construir como Inquilino — vai começar direto como Arquiteto.',
    escalando: 'Você já tem uma base, mas está deixando dinheiro na mesa. O Workshop vai te mostrar exatamente onde estão os vazamentos e como corrigi-los para multiplicar sua receita.',
    consolidando: 'Você tem uma operação rodando, mas pode estar operacionalizando demais. O Workshop vai te ajudar a transformar sua base em um ativo que trabalha por você.',
  };
  return messages[stage];
}

export function getLucroLabel(stage: UserStage): string {
  return stage === 'construindo' ? 'SEU POTENCIAL DE LUCRO' : 'SEU LUCRO OCULTO';
}

// ============================================================================
// WORKSHOP DATE (centralized)
// ============================================================================

export const WORKSHOP_DATE = '5 de Março de 2026';
export const WORKSHOP_DATE_SHORT = '5/Mar';
