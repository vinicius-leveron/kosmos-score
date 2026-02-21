// Diagnóstico de Maturidade de Ecossistema - Níveis
// 5 níveis da Pirâmide de Maturidade KOSMOS

export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

export interface MaturityLevelInfo {
  level: MaturityLevel;
  name: string;
  emoji: string;
  headline: string;
  description: string;
  characteristics: string[];
  whatsMissing: string[];
  nextStep: string;
  shareText: string;
  color: string;
  bgColor: string;
}

export const MATURITY_LEVELS: Record<MaturityLevel, MaturityLevelInfo> = {
  1: {
    level: 1,
    name: 'AUDIÊNCIA',
    emoji: '📢',
    headline: 'Seguidores que consomem, mas não participam',
    description:
      'Você tem uma audiência que consome seu conteúdo, mas ainda não existe uma comunidade de verdade. As pessoas te seguem, assistem, curtem — mas não interagem entre si e não criam vínculos com o seu trabalho.',
    characteristics: [
      'Engajamento depende 100% de você postar',
      'Seguidores não se conhecem entre si',
      'Sem rituais ou processos recorrentes',
      'Se você para, tudo para',
    ],
    whatsMissing: [
      'Criar espaço para membros se conectarem',
      'Estabelecer rituais de engajamento',
      'Desenvolver processo de onboarding',
      'Definir identidade e valores claros',
    ],
    nextStep:
      'O primeiro passo é criar um espaço onde sua audiência possa interagir — não só com você, mas entre si. Isso pode ser um grupo, uma comunidade, ou até encontros recorrentes.',
    shareText:
      'Descobri que meu ecossistema está no Nível 1 — Audiência. Hora de construir conexões reais! 🚀',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  2: {
    level: 2,
    name: 'COMUNIDADE',
    emoji: '👥',
    headline: 'Grupo ativo, mas depende 100% de você',
    description:
      'Você criou uma comunidade engajada — as pessoas participam, comentam, interagem. Mas o engajamento gira em torno de você. Se você não posta, não faz live, não está presente, o grupo silencia.',
    characteristics: [
      'Membros engajam quando você está presente',
      'Algumas interações entre membros, mas raras',
      'Você é o centro de todas as conversas',
      'Ausência sua = queda no engajamento',
    ],
    whatsMissing: [
      'Criar rituais que funcionem sem você',
      'Identificar e empoderar líderes entre membros',
      'Desenvolver estrutura de conexão membro-membro',
      'Documentar processos para outros executarem',
    ],
    nextStep:
      'O próximo passo é criar estruturas que funcionem sem a sua presença constante. Rituais recorrentes, líderes entre os membros, e processos documentados.',
    shareText:
      'Descobri que meu ecossistema está no Nível 2 — Comunidade. Preciso distribuir liderança! 💪',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  3: {
    level: 3,
    name: 'ECOSSISTEMA',
    emoji: '🌱',
    headline: 'Membros se conectam, existe estrutura',
    description:
      'Sua comunidade começa a ter vida própria. Membros se ajudam, existem rituais que funcionam, há estrutura. Mas ainda falta consistência — às vezes funciona bem, às vezes depende de você empurrar.',
    characteristics: [
      'Membros se ajudam e interagem entre si',
      'Rituais recorrentes estabelecidos',
      'Onboarding estruturado existe',
      'Alguns processos funcionam sozinhos',
    ],
    whatsMissing: [
      'Consistência nos rituais e processos',
      'Mais líderes distribuídos',
      'Cultura de co-criação forte',
      'Mecanismos de crescimento orgânico',
    ],
    nextStep:
      'O próximo passo é fortalecer a cultura e criar mecanismos de crescimento orgânico. Membros indicando membros, conteúdo gerado pela comunidade, e liderança mais distribuída.',
    shareText:
      'Descobri que meu ecossistema está no Nível 3 — Ecossistema em formação. Quase lá! 🌱',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  4: {
    level: 4,
    name: 'MOVIMENTO',
    emoji: '🔥',
    headline: 'Identidade coletiva, membros trazem membros',
    description:
      'Você construiu um movimento. Há identidade compartilhada — os membros se veem como parte de algo maior. O crescimento é orgânico, com membros trazendo novos membros. A estrutura é sólida.',
    characteristics: [
      'Identidade coletiva forte',
      'Crescimento orgânico via indicações',
      'Liderança distribuída funcionando',
      'Comunidade funciona nas suas férias',
    ],
    whatsMissing: [
      'Governança mais estruturada',
      'Sucessão e continuidade planejada',
      'Documentação completa de todos os processos',
      'Independência total do fundador',
    ],
    nextStep:
      'O próximo passo é garantir que o movimento continue evoluindo mesmo sem você. Governança clara, sucessão planejada, e documentação completa de todos os processos.',
    shareText:
      'Descobri que meu ecossistema está no Nível 4 — Movimento! Construindo algo maior. 🔥',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  5: {
    level: 5,
    name: 'LEGADO',
    emoji: '🏛',
    headline: 'Funciona independente do fundador',
    description:
      'Seu ecossistema tem vida própria. Funciona, cresce e evolui mesmo sem sua presença constante. Você criou algo que transcende você — um legado que continua impactando pessoas.',
    characteristics: [
      'Funciona completamente sem o fundador',
      'Governança clara e distribuída',
      'Auto-sustentável financeira e operacionalmente',
      'Evolui e se adapta organicamente',
    ],
    whatsMissing: [
      'Continue evoluindo e documentando',
      'Expanda o impacto para novos mercados',
      'Forme novos líderes constantemente',
      'Compartilhe o modelo com outros',
    ],
    nextStep:
      'Você chegou ao nível máximo. O próximo passo é expandir o impacto, formar novos líderes, e compartilhar o que aprendeu construindo esse ecossistema.',
    shareText:
      'Descobri que meu ecossistema está no Nível 5 — Legado! Construí algo que transcende. 🏛',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
};

/**
 * Retorna o nível de maturidade baseado no score total (7-35)
 */
export function getMaturityLevel(totalScore: number): MaturityLevel {
  if (totalScore <= 10) return 1;
  if (totalScore <= 16) return 2;
  if (totalScore <= 23) return 3;
  if (totalScore <= 30) return 4;
  return 5;
}

/**
 * Retorna as informações do nível de maturidade
 */
export function getMaturityLevelInfo(level: MaturityLevel): MaturityLevelInfo {
  return MATURITY_LEVELS[level];
}

/**
 * Calcula a porcentagem de progresso dentro do nível atual
 */
export function getLevelProgress(totalScore: number): number {
  const level = getMaturityLevel(totalScore);
  const thresholds = [
    { min: 7, max: 10 }, // Level 1
    { min: 11, max: 16 }, // Level 2
    { min: 17, max: 23 }, // Level 3
    { min: 24, max: 30 }, // Level 4
    { min: 31, max: 35 }, // Level 5
  ];

  const { min, max } = thresholds[level - 1];
  const progress = ((totalScore - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, progress));
}
