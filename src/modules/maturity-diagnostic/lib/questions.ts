// Diagnóstico de Maturidade de Ecossistema - Perguntas
// 7 perguntas que medem o nível de maturidade do ecossistema

export type MaturityPillar =
  | 'dependencia' // Nível de dependência do fundador
  | 'conexao' // Conexão entre membros
  | 'estrutura' // Processos e rituais
  | 'onboarding' // Integração de novos membros
  | 'ascensao' // Potencial de ofertas premium
  | 'advocacy' // Indicações orgânicas
  | 'tendencia'; // Tendência de engajamento

export interface QuestionOption {
  value: string;
  label: string;
  score: number; // 1-5
  description: string;
}

export interface MaturityQuestion {
  id: string;
  pillar: MaturityPillar;
  question: string;
  helperText?: string;
  options: QuestionOption[];
}

export const MATURITY_QUESTIONS: MaturityQuestion[] = [
  {
    id: 'dep-1',
    pillar: 'dependencia',
    question: 'Se você sumisse por 30 dias, o que aconteceria com sua comunidade?',
    helperText: 'Pense no que realmente aconteceria, não no que você gostaria.',
    options: [
      {
        value: 'collapse',
        label: 'Tudo para',
        score: 1,
        description: 'Membros perdem interesse e engajamento cai drasticamente',
      },
      {
        value: 'decline',
        label: 'Cai bastante',
        score: 2,
        description: 'Atividade reduz significativamente, mas alguns continuam',
      },
      {
        value: 'maintain',
        label: 'Continua funcionando',
        score: 3,
        description: 'Membros se ajudam e mantêm ritmo básico',
      },
      {
        value: 'thrive',
        label: 'Funciona normalmente',
        score: 4,
        description: 'Lideranças distribuídas mantêm tudo rodando',
      },
      {
        value: 'grow',
        label: 'Pode até crescer',
        score: 5,
        description: 'Comunidade tem vida própria e evolui sozinha',
      },
    ],
  },
  {
    id: 'con-1',
    pillar: 'conexao',
    question: 'Como os membros interagem entre si (não com você)?',
    helperText: 'Avalie as conexões membro-membro, não membro-criador.',
    options: [
      {
        value: 'only_founder',
        label: 'Só comigo',
        score: 1,
        description: 'Membros só interagem comigo, nunca entre si',
      },
      {
        value: 'rare',
        label: 'Raramente',
        score: 2,
        description: 'Algumas interações esporádicas e superficiais',
      },
      {
        value: 'moderate',
        label: 'Com frequência',
        score: 3,
        description: 'Existe diálogo regular entre membros',
      },
      {
        value: 'active',
        label: 'Muito ativo',
        score: 4,
        description: 'Membros se conectam naturalmente e se ajudam',
      },
      {
        value: 'organic',
        label: 'Orgânico e constante',
        score: 5,
        description: 'Relações profundas entre membros, amizades reais',
      },
    ],
  },
  {
    id: 'est-1',
    pillar: 'estrutura',
    question: 'Quais rituais ou processos funcionam sem sua presença direta?',
    helperText: 'Rituais são atividades recorrentes. Processos são fluxos documentados.',
    options: [
      {
        value: 'none',
        label: 'Nenhum',
        score: 1,
        description: 'Tudo depende de mim para acontecer',
      },
      {
        value: 'few',
        label: 'Um ou dois',
        score: 2,
        description: 'Alguns processos básicos funcionam',
      },
      {
        value: 'some',
        label: 'Vários',
        score: 3,
        description: 'Rituais recorrentes estabelecidos e documentados',
      },
      {
        value: 'many',
        label: 'A maioria',
        score: 4,
        description: 'Estrutura sólida, maioria funciona sozinha',
      },
      {
        value: 'all',
        label: 'Praticamente tudo',
        score: 5,
        description: 'Operação completamente autônoma',
      },
    ],
  },
  {
    id: 'onb-1',
    pillar: 'onboarding',
    question: 'Novos membros se sentem "em casa" em quanto tempo?',
    helperText: 'Considere quando um novo membro realmente se integra ao grupo.',
    options: [
      {
        value: 'never',
        label: 'Muitos abandonam',
        score: 1,
        description: 'Dificuldade de integração, churn alto no início',
      },
      {
        value: 'months',
        label: 'Vários meses',
        score: 2,
        description: 'Processo lento, precisa de muito tempo',
      },
      {
        value: 'weeks',
        label: 'Algumas semanas',
        score: 3,
        description: 'Onboarding razoável, funciona com tempo',
      },
      {
        value: 'days',
        label: 'Poucos dias',
        score: 4,
        description: 'Integração rápida, acolhimento estruturado',
      },
      {
        value: 'immediate',
        label: 'Imediatamente',
        score: 5,
        description: 'Acolhimento excepcional, se sentem parte desde o primeiro dia',
      },
    ],
  },
  {
    id: 'asc-1',
    pillar: 'ascensao',
    question: 'Qual percentual da sua base pagaria 5-10x mais por uma experiência premium?',
    helperText: 'Pense em quem já demonstrou interesse em ir mais fundo com você.',
    options: [
      {
        value: 'zero',
        label: '0-5%',
        score: 1,
        description: 'Quase ninguém, base muito sensível a preço',
      },
      {
        value: 'few',
        label: '5-15%',
        score: 2,
        description: 'Poucos, existe algum potencial',
      },
      {
        value: 'some',
        label: '15-25%',
        score: 3,
        description: 'Parcela significativa com potencial',
      },
      {
        value: 'many',
        label: '25-40%',
        score: 4,
        description: 'Boa parte já demonstrou interesse',
      },
      {
        value: 'most',
        label: '40%+',
        score: 5,
        description: 'Maioria engajada e disposta a investir mais',
      },
    ],
  },
  {
    id: 'adv-1',
    pillar: 'advocacy',
    question: 'Seus membros indicam organicamente para outras pessoas?',
    helperText: 'Indicações espontâneas, sem você pedir ou oferecer incentivo.',
    options: [
      {
        value: 'never',
        label: 'Nunca',
        score: 1,
        description: 'Zero indicações orgânicas',
      },
      {
        value: 'rare',
        label: 'Raramente',
        score: 2,
        description: 'Algumas indicações esporádicas',
      },
      {
        value: 'sometimes',
        label: 'Às vezes',
        score: 3,
        description: 'Com alguma frequência, mas não é constante',
      },
      {
        value: 'often',
        label: 'Frequentemente',
        score: 4,
        description: 'Canal relevante de aquisição de novos membros',
      },
      {
        value: 'always',
        label: 'Constantemente',
        score: 5,
        description: 'Principal fonte de novos membros',
      },
    ],
  },
  {
    id: 'ten-1',
    pillar: 'tendencia',
    question: 'Como está a tendência de engajamento nos últimos 3 meses?',
    helperText: 'Considere interações, participação em eventos, mensagens no grupo.',
    options: [
      {
        value: 'falling_fast',
        label: 'Caindo muito',
        score: 1,
        description: 'Queda acelerada e preocupante',
      },
      {
        value: 'falling',
        label: 'Caindo',
        score: 2,
        description: 'Tendência de queda gradual',
      },
      {
        value: 'stable',
        label: 'Estável',
        score: 3,
        description: 'Mantendo o nível atual',
      },
      {
        value: 'growing',
        label: 'Crescendo',
        score: 4,
        description: 'Tendência de alta consistente',
      },
      {
        value: 'accelerating',
        label: 'Acelerando',
        score: 5,
        description: 'Crescimento exponencial',
      },
    ],
  },
];

/**
 * Retorna o total de perguntas
 */
export function getTotalQuestions(): number {
  return MATURITY_QUESTIONS.length;
}

/**
 * Retorna uma pergunta pelo índice
 */
export function getQuestionByIndex(index: number): MaturityQuestion | undefined {
  return MATURITY_QUESTIONS[index];
}

/**
 * Retorna uma pergunta pelo ID
 */
export function getQuestionById(id: string): MaturityQuestion | undefined {
  return MATURITY_QUESTIONS.find((q) => q.id === id);
}

/**
 * Mapeamento de pilares para labels amigáveis
 */
export const PILLAR_LABELS: Record<MaturityPillar, string> = {
  dependencia: 'Dependência do Fundador',
  conexao: 'Conexão entre Membros',
  estrutura: 'Processos e Rituais',
  onboarding: 'Integração de Novos',
  ascensao: 'Potencial de Ascensão',
  advocacy: 'Indicações Orgânicas',
  tendencia: 'Tendência de Engajamento',
};
