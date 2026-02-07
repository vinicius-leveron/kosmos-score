export interface QuestionOption {
  label: string;
  value: string;
  numericValue: number;
}

export interface Question {
  id: number;
  block: 'A' | 'B';
  pillar?: 'causa' | 'cultura' | 'economia';
  title: string;
  subtitle?: string;
  options: QuestionOption[];
}

export const questions: Question[] = [
  // BLOCO A - Dados Quantitativos
  {
    id: 1,
    block: 'A',
    title: 'Quantas pessoas você consegue alcançar hoje sem pagar anúncio?',
    subtitle: 'Inclua: lista de e-mail, grupo de WhatsApp, comunidade, seguidores engajados.',
    options: [
      { label: 'Menos de 500 pessoas', value: 'menos_500', numericValue: 300 },
      { label: '500 a 2.000 pessoas', value: '500_2000', numericValue: 1250 },
      { label: '2.000 a 5.000 pessoas', value: '2000_5000', numericValue: 3500 },
      { label: '5.000 a 15.000 pessoas', value: '5000_15000', numericValue: 10000 },
      { label: 'Mais de 15.000 pessoas', value: 'mais_15000', numericValue: 20000 },
    ],
  },
  {
    id: 2,
    block: 'A',
    title: 'Qual o ticket médio do seu produto/serviço principal?',
    options: [
      { label: 'Até R$ 97 (produto de entrada)', value: 'ate_97', numericValue: 67 },
      { label: 'R$ 97 a R$ 497', value: '97_497', numericValue: 297 },
      { label: 'R$ 497 a R$ 2.000', value: '497_2000', numericValue: 1200 },
      { label: 'R$ 2.000 a R$ 5.000', value: '2000_5000', numericValue: 3500 },
      { label: 'Acima de R$ 5.000', value: 'acima_5000', numericValue: 7500 },
    ],
  },
  {
    id: 3,
    block: 'A',
    title: 'Quantas ofertas diferentes você tem disponíveis para a sua base hoje?',
    subtitle: 'Produtos ou serviços que você oferece atualmente.',
    options: [
      { label: 'Apenas 1 produto', value: '1_produto', numericValue: 1.0 },
      { label: '2 produtos', value: '2_produtos', numericValue: 1.5 },
      { label: '3 a 4 produtos', value: '3_4_produtos', numericValue: 2.0 },
      { label: '5 ou mais (ecossistema completo)', value: '5_mais', numericValue: 2.5 },
    ],
  },
  {
    id: 4,
    block: 'A',
    title: 'Com que frequência você se comunica ativamente com a sua base?',
    subtitle: 'E-mail, WhatsApp, comunidade, etc.',
    options: [
      { label: 'Quase nunca / só quando lanço', value: 'quase_nunca', numericValue: 0.3 },
      { label: '1-2x por mês', value: '1_2_mes', numericValue: 0.5 },
      { label: 'Semanalmente', value: 'semanalmente', numericValue: 0.8 },
      { label: 'Várias vezes por semana', value: 'varias_semana', numericValue: 1.0 },
    ],
  },
  // BLOCO B - Diagnóstico Qualitativo
  // PILAR CAUSA (P5-P6)
  {
    id: 5,
    block: 'B',
    pillar: 'causa',
    title: 'Por que a maioria dos seus clientes compra de você?',
    options: [
      { label: 'Pela técnica/informação que eu ensino', value: 'tecnica', numericValue: 20 },
      { label: 'Porque confiam em mim como autoridade', value: 'autoridade', numericValue: 50 },
      { label: 'Porque se identificam com a minha visão de mundo / causa', value: 'causa', numericValue: 80 },
      { label: 'Porque querem fazer parte do meu grupo/tribo', value: 'tribo', numericValue: 100 },
    ],
  },
  {
    id: 6,
    block: 'B',
    pillar: 'causa',
    title: 'Se você perguntasse aos seus clientes "por que você faz parte deste grupo?", a maioria responderia...',
    options: [
      { label: '"Por causa do conteúdo."', value: 'conteudo', numericValue: 15 },
      { label: '"Por causa do networking."', value: 'networking', numericValue: 40 },
      { label: '"Porque aqui eu me sinto em casa."', value: 'casa', numericValue: 70 },
      { label: '"Porque acreditamos na mesma coisa."', value: 'crenca', numericValue: 100 },
    ],
  },
  // PILAR CULTURA (P7-P8)
  {
    id: 7,
    block: 'B',
    pillar: 'cultura',
    title: 'Se você parasse de postar conteúdo por 15 dias, o que aconteceria com a interação na sua comunidade/grupo?',
    options: [
      { label: 'Morreria completamente', value: 'morreria', numericValue: 10 },
      { label: 'Cairia bastante', value: 'cairia_bastante', numericValue: 35 },
      { label: 'Cairia um pouco, mas continuaria', value: 'cairia_pouco', numericValue: 70 },
      { label: 'Continuaria normalmente (os membros se engajam entre si)', value: 'continuaria', numericValue: 100 },
    ],
  },
  {
    id: 8,
    block: 'B',
    pillar: 'cultura',
    title: 'Você tem rituais recorrentes na sua comunidade?',
    subtitle: 'Encontros semanais, desafios, marcos de progresso, etc.',
    options: [
      { label: 'Não, é só um grupo com conteúdo', value: 'nao', numericValue: 15 },
      { label: 'Tenho alguns encontros esporádicos', value: 'esporadicos', numericValue: 40 },
      { label: 'Tenho uma programação regular (semanal/quinzenal)', value: 'regular', numericValue: 75 },
      { label: 'Tenho rituais, jornada de membros e marcos de progresso', value: 'completo', numericValue: 100 },
    ],
  },
  // PILAR ECONOMIA (P9-P10)
  {
    id: 9,
    block: 'B',
    pillar: 'economia',
    title: 'Você tem uma oferta High-Ticket (acima de R$ 2.000) exclusiva para membros antigos ou mais engajados?',
    options: [
      { label: 'Não, só tenho uma oferta', value: 'nao', numericValue: 10 },
      { label: 'Tenho upsell, mas não é high-ticket', value: 'upsell', numericValue: 40 },
      { label: 'Tenho high-ticket, mas não é exclusivo pra base', value: 'high_ticket', numericValue: 65 },
      { label: 'Sim, tenho uma escada completa de Ascensão', value: 'ascensao', numericValue: 100 },
    ],
  },
  {
    id: 10,
    block: 'B',
    pillar: 'economia',
    title: 'Qual percentual da sua receita vem de clientes que já compraram antes (recompra)?',
    options: [
      { label: 'Menos de 10% (quase tudo é venda nova)', value: 'menos_10', numericValue: 15 },
      { label: '10% a 30%', value: '10_30', numericValue: 40 },
      { label: '30% a 50%', value: '30_50', numericValue: 70 },
      { label: 'Mais de 50% (a base é meu principal motor de receita)', value: 'mais_50', numericValue: 100 },
    ],
  },
];

export type AuditAnswers = {
  [key: number]: {
    value: string;
    numericValue: number;
  };
};

export interface AuditResult {
  email: string;
  answers: AuditAnswers;
  scoreCausa: number;
  scoreCultura: number;
  scoreEconomia: number;
  kosmosAssetScore: number;
  lucroOculto: number;
  isBeginner: boolean;
  classification: 'inquilino' | 'gerente' | 'arquiteto' | 'dono';
}

export function calculateAuditResult(email: string, answers: AuditAnswers): AuditResult {
  // Get quantitative values
  const baseValue = answers[1]?.numericValue || 0;
  const ticketValue = answers[2]?.numericValue || 0;
  const ofertasMultiplier = answers[3]?.numericValue || 1;
  const comunicacaoMultiplier = answers[4]?.numericValue || 0.5;

  // Calculate pillar scores (average of 2 questions each)
  const scoreCausa = ((answers[5]?.numericValue || 0) + (answers[6]?.numericValue || 0)) / 2;
  const scoreCultura = ((answers[7]?.numericValue || 0) + (answers[8]?.numericValue || 0)) / 2;
  const scoreEconomia = ((answers[9]?.numericValue || 0) + (answers[10]?.numericValue || 0)) / 2;

  // Calculate KOSMOS Asset Score (weighted average)
  const kosmosAssetScore = (scoreCausa * 0.3) + (scoreCultura * 0.3) + (scoreEconomia * 0.4);

  // Calculate conversion rates based on pillar health
  const avgPillarScore = (scoreCausa + scoreCultura + scoreEconomia) / 3;
  const tcpPotential = 0.02 + (avgPillarScore / 100) * 0.06; // 2% to 8% based on score
  const tcaActual = 0.005 + (kosmosAssetScore / 100) * 0.025; // 0.5% to 3% based on current score

  // Calculate Hidden Profit (conservative formula)
  const conversionGap = tcpPotential - tcaActual;
  const lucroOculto = baseValue * ticketValue * ofertasMultiplier * comunicacaoMultiplier * conversionGap * 4;

  // Determine if beginner mode should activate
  const isBeginner = baseValue < 500 || kosmosAssetScore < 20;

  // Determine classification
  let classification: 'inquilino' | 'gerente' | 'arquiteto' | 'dono';
  if (kosmosAssetScore <= 25) {
    classification = 'inquilino';
  } else if (kosmosAssetScore <= 50) {
    classification = 'gerente';
  } else if (kosmosAssetScore <= 75) {
    classification = 'arquiteto';
  } else {
    classification = 'dono';
  }

  return {
    email,
    answers,
    scoreCausa,
    scoreCultura,
    scoreEconomia,
    kosmosAssetScore,
    lucroOculto: Math.max(0, Math.round(lucroOculto)),
    isBeginner,
    classification,
  };
}

export function getClassificationInfo(classification: 'inquilino' | 'gerente' | 'arquiteto' | 'dono') {
  const info = {
    inquilino: {
      emoji: '🔴',
      title: 'INQUILINO DO ALGORITMO',
      color: 'score-red',
      description: 'Dependente de tráfego pago e algoritmo. Comunidade não existe ou é passiva. Alto risco de colapso se a plataforma mudar as regras.',
    },
    gerente: {
      emoji: '🟠',
      title: 'GERENTE DE AUDIÊNCIA',
      color: 'score-orange',
      description: 'Tem base, mas opera no modelo "empurra conteúdo". Trabalha para a audiência, não o contrário. Cargo operacional, não estratégico.',
    },
    arquiteto: {
      emoji: '🟡',
      title: 'ARQUITETO DE COMUNIDADE',
      color: 'score-yellow',
      description: 'Estrutura emergente. Já está construindo, mas falta acabamento. Tem alguns pilares, mas vazamentos significativos. Potencial alto, execução incompleta.',
    },
    dono: {
      emoji: '🟢',
      title: 'DONO DE ECOSSISTEMA',
      color: 'score-green',
      description: 'Arquitetura funcional. Não é apenas um líder; é o proprietário do sistema econômico. Comunidade autônoma, escada de valor, receita recorrente.',
    },
  };
  return info[classification];
}

export function getPillarDiagnosis(pillar: 'causa' | 'cultura' | 'economia', score: number) {
  if (pillar === 'causa') {
    if (score < 40) {
      return {
        status: 'Fraca',
        message: 'Baixa diferenciação competitiva. Você atrai pelo preço ou conteúdo, gerando alta rotatividade e baixo senso de pertencimento.',
      };
    } else if (score < 70) {
      return {
        status: 'Em Desenvolvimento',
        message: 'Há elementos de identidade, mas ainda não são suficientes para criar uma tribo fiel. Falta clareza na Causa.',
      };
    } else {
      return {
        status: 'Forte',
        message: 'Sua comunidade se identifica com sua visão de mundo. Isso gera lealdade e reduz a sensibilidade a preço.',
      };
    }
  }

  if (pillar === 'cultura') {
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
