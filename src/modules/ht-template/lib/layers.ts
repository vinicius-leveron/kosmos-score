/**
 * Blueprint de Ecossistema - 5 Camadas
 *
 * Framework para mapear e avaliar as camadas de um ecossistema digital.
 * Cada camada tem campos para preencher e perguntas de avaliacao.
 */

export type LayerId = 'raiz' | 'estrutura' | 'cultura' | 'crescimento' | 'autonomia';

export interface LayerQuestion {
  id: string;
  question: string;
  placeholder?: string;
  type: 'textarea' | 'text' | 'list' | 'assessment';
  assessmentOptions?: { value: number; label: string }[];
  maxItems?: number;
}

export interface EcosystemLayer {
  id: LayerId;
  name: string;
  emoji: string;
  headline: string;
  description: string;
  focusAreas: string[];
  questions: LayerQuestion[];
  tips: string[];
}

export const ECOSYSTEM_LAYERS: EcosystemLayer[] = [
  {
    id: 'raiz',
    name: 'RAIZ',
    emoji: '🌳',
    headline: 'Transformacao central',
    description: 'O proposito fundamental que une todos os membros. Qual a grande transformacao que voce promove?',
    focusAreas: ['Manifesto', 'Valores inegociaveis', 'Crencas compartilhadas'],
    questions: [
      {
        id: 'manifesto',
        question: 'Qual e o manifesto ou crenca central do seu ecossistema?',
        placeholder: 'Ex: Acreditamos que criadores podem construir negocios sustentaveis sem depender de lancamentos estressantes.',
        type: 'textarea',
      },
      {
        id: 'valores',
        question: 'Quais sao os 3-5 valores inegociaveis do seu ecossistema?',
        placeholder: 'Ex: Transparencia radical, Abundancia vs escassez, Comunidade acima de competicao',
        type: 'list',
        maxItems: 5,
      },
      {
        id: 'transformacao',
        question: 'Qual transformacao as pessoas vivem ao participar?',
        placeholder: 'De onde elas vem (Ponto A) para onde vao (Ponto B)?',
        type: 'textarea',
      },
      {
        id: 'raiz_assessment',
        question: 'Quao clara esta essa raiz para seus membros atuais?',
        type: 'assessment',
        assessmentOptions: [
          { value: 1, label: 'Nao existe ou ninguem conhece' },
          { value: 2, label: 'Existe, mas poucos conhecem' },
          { value: 3, label: 'Alguns membros entendem' },
          { value: 4, label: 'Maioria entende e se identifica' },
          { value: 5, label: 'Todos conhecem e propagam ativamente' },
        ],
      },
    ],
    tips: [
      'O manifesto deve ser algo que membros sentem orgulho de compartilhar',
      'Valores fortes repelem as pessoas erradas - isso e bom',
      'A transformacao deve ser especifica e aspiracional',
    ],
  },
  {
    id: 'estrutura',
    name: 'ESTRUTURA',
    emoji: '🏗️',
    headline: 'Processos e rituais',
    description: 'Os processos que mantem o ecossistema funcionando de forma previsivel, com ou sem voce.',
    focusAreas: ['Onboarding', 'Rituais recorrentes', 'Jornada do membro'],
    questions: [
      {
        id: 'onboarding',
        question: 'Como novos membros sao recebidos e integrados?',
        placeholder: 'Descreva o processo de boas-vindas: emails, videos, primeiros passos, quem recebe, etc.',
        type: 'textarea',
      },
      {
        id: 'rituais',
        question: 'Quais rituais acontecem de forma recorrente?',
        placeholder: 'Ex: Call semanal de Q&A, Post diario de celebracoes, Review mensal de metas',
        type: 'list',
        maxItems: 8,
      },
      {
        id: 'jornada',
        question: 'Qual e a jornada ideal de um membro? (etapas)',
        placeholder: 'Ex: Iniciante → Praticante → Avancado → Mentor',
        type: 'list',
        maxItems: 5,
      },
      {
        id: 'estrutura_assessment',
        question: 'Quanto da estrutura funciona sem sua presenca direta?',
        type: 'assessment',
        assessmentOptions: [
          { value: 1, label: 'Nada funciona sem mim' },
          { value: 2, label: 'Algumas coisas, mas a maioria depende de mim' },
          { value: 3, label: 'Metade funciona sozinha' },
          { value: 4, label: 'Maioria funciona, intervenho quando necessario' },
          { value: 5, label: 'Tudo funciona, participo por escolha' },
        ],
      },
    ],
    tips: [
      'Documente tudo que funciona para poder delegar ou automatizar',
      'Rituais criam previsibilidade e habito nos membros',
      'O onboarding define a experiencia futura do membro',
    ],
  },
  {
    id: 'cultura',
    name: 'CULTURA',
    emoji: '💫',
    headline: 'Conexao entre membros',
    description: 'O tecido social que transforma um grupo em comunidade. Membros se conectam entre si, nao so com voce.',
    focusAreas: ['Linguagem compartilhada', 'Co-criacao', 'Identidade coletiva'],
    questions: [
      {
        id: 'linguagem',
        question: 'Qual linguagem, termos ou expressoes sao unicos do seu ecossistema?',
        placeholder: 'Ex: "Kosmonaut" para membros, "Orbit" para projetos, "Launch" para fazer acontecer',
        type: 'list',
        maxItems: 6,
      },
      {
        id: 'cocriacao',
        question: 'Como membros contribuem e co-criam com o ecossistema?',
        placeholder: 'Ex: Podem propor eventos, criar conteudo, mentorear outros, liderar projetos...',
        type: 'textarea',
      },
      {
        id: 'conexoes',
        question: 'O que voce faz para membros se conectarem ENTRE SI?',
        placeholder: 'Ex: Match de pares, subgrupos por interesse, eventos de networking, projetos em dupla...',
        type: 'list',
        maxItems: 5,
      },
      {
        id: 'cultura_assessment',
        question: 'Quanto os membros se conectam entre si (sem voce intermediar)?',
        type: 'assessment',
        assessmentOptions: [
          { value: 1, label: 'Nao se conectam, so falam comigo' },
          { value: 2, label: 'Pouco, quando eu facilito' },
          { value: 3, label: 'Alguns se conectam espontaneamente' },
          { value: 4, label: 'Maioria interage entre si regularmente' },
          { value: 5, label: 'Existe uma rede ativa de relacionamentos' },
        ],
      },
    ],
    tips: [
      'Linguagem propria cria pertencimento ("nos vs eles")',
      'Co-criacao aumenta engajamento e senso de propriedade',
      'Conexoes entre membros sao mais fortes que conexao com voce',
    ],
  },
  {
    id: 'crescimento',
    name: 'CRESCIMENTO',
    emoji: '🌱',
    headline: 'Como o ecossistema cresce',
    description: 'Mecanismos organicos de crescimento. Membros atraem membros, conteudo gera conteudo.',
    focusAreas: ['Indicacoes', 'Conteudo gerado', 'Embaixadores'],
    questions: [
      {
        id: 'indicacoes',
        question: 'Como membros indicam outras pessoas para o ecossistema?',
        placeholder: 'Ex: Programa de afiliados, convites VIP, beneficio por indicacao, link personalizado...',
        type: 'textarea',
      },
      {
        id: 'conteudo_gerado',
        question: 'Que tipo de conteudo membros criam sobre o ecossistema?',
        placeholder: 'Ex: Depoimentos espontaneos, posts celebrando conquistas, reviews, tutoriais...',
        type: 'list',
        maxItems: 5,
      },
      {
        id: 'embaixadores',
        question: 'Voce tem "embaixadores" ou membros que evangelizam ativamente?',
        placeholder: 'Quem sao? O que eles fazem? Como sao reconhecidos?',
        type: 'textarea',
      },
      {
        id: 'crescimento_assessment',
        question: 'Quanto do crescimento vem de forma organica (sem voce promover)?',
        type: 'assessment',
        assessmentOptions: [
          { value: 1, label: '0% - Todo crescimento vem de mim' },
          { value: 2, label: '10-20% - Algumas indicacoes pontuais' },
          { value: 3, label: '30-40% - Indicacoes regulares' },
          { value: 4, label: '50-60% - Metade vem organico' },
          { value: 5, label: '70%+ - Membros sao meu principal canal' },
        ],
      },
    ],
    tips: [
      'Faca facil de indicar: links, materiais, incentivos',
      'Celebre quem indica publicamente',
      'Conteudo gerado por membros e a melhor prova social',
    ],
  },
  {
    id: 'autonomia',
    name: 'AUTONOMIA',
    emoji: '🏛️',
    headline: 'O que funciona sem voce',
    description: 'A verdadeira medida de um ecossistema: consegue existir independente do fundador?',
    focusAreas: ['Lideranca distribuida', 'Processos autonomos', 'Sucessao'],
    questions: [
      {
        id: 'lideres',
        question: 'Quem sao os lideres/facilitadores alem de voce?',
        placeholder: 'Liste pessoas que lideram iniciativas, mentoram outros ou tomam decisoes',
        type: 'list',
        maxItems: 10,
      },
      {
        id: 'processos_autonomos',
        question: 'Que processos funcionam completamente sem voce?',
        placeholder: 'Ex: Grupo de apoio entre membros, eventos entre pares, onboarding automatizado...',
        type: 'list',
        maxItems: 6,
      },
      {
        id: 'teste_ferias',
        question: 'Se voce sumisse por 30 dias, o que aconteceria?',
        placeholder: 'Seja honesto: o ecossistema sobreviveria? Que partes morreriam? Que partes floresceriam?',
        type: 'textarea',
      },
      {
        id: 'autonomia_assessment',
        question: 'Em quanto tempo o ecossistema sobreviveria sem voce?',
        type: 'assessment',
        assessmentOptions: [
          { value: 1, label: 'Dias - Pararia imediatamente' },
          { value: 2, label: 'Semanas - Sobreviveria um pouco' },
          { value: 3, label: 'Meses - Funcionaria com dificuldade' },
          { value: 4, label: 'Anos - Tem vida propria, mas sentiria falta' },
          { value: 5, label: 'Indefinidamente - Tem estrutura de legado' },
        ],
      },
    ],
    tips: [
      'Autonomia nao significa abandono - significa liberdade',
      'Comece delegando pequenas responsabilidades',
      'Lideres emergentes sao seu maior ativo',
    ],
  },
];

export interface BlueprintData {
  [layerId: string]: {
    [questionId: string]: string | string[] | number;
  };
}

export interface LayerScore {
  layerId: LayerId;
  score: number; // 1-5
  status: 'vazio' | 'iniciando' | 'construindo' | 'maduro' | 'autonomo';
}

export function calculateLayerScore(layerId: LayerId, data: BlueprintData): LayerScore {
  const layerData = data[layerId] || {};
  const layer = ECOSYSTEM_LAYERS.find((l) => l.id === layerId);

  if (!layer) {
    return { layerId, score: 1, status: 'vazio' };
  }

  // Find the assessment question
  const assessmentQuestion = layer.questions.find((q) => q.type === 'assessment');
  const assessmentScore = (layerData[assessmentQuestion?.id || ''] as number) || 0;

  // Count filled questions (excluding assessment)
  const contentQuestions = layer.questions.filter((q) => q.type !== 'assessment');
  let filledCount = 0;

  for (const q of contentQuestions) {
    const value = layerData[q.id];
    if (q.type === 'list') {
      const list = value as string[] || [];
      if (list.length > 0 && list.some((item) => item.trim() !== '')) {
        filledCount++;
      }
    } else if (value && String(value).trim() !== '') {
      filledCount++;
    }
  }

  const fillRatio = filledCount / contentQuestions.length;

  // Combine assessment score with fill ratio for final score
  // Assessment is weighted more heavily
  let finalScore: number;
  if (assessmentScore === 0) {
    // No assessment answer - use fill ratio only
    finalScore = Math.ceil(fillRatio * 3) || 1;
  } else {
    // Combine: 70% assessment, 30% fill ratio
    finalScore = Math.round(assessmentScore * 0.7 + (fillRatio * 5) * 0.3);
  }

  // Clamp to 1-5
  finalScore = Math.max(1, Math.min(5, finalScore));

  // Determine status
  let status: LayerScore['status'];
  if (finalScore <= 1) status = 'vazio';
  else if (finalScore === 2) status = 'iniciando';
  else if (finalScore === 3) status = 'construindo';
  else if (finalScore === 4) status = 'maduro';
  else status = 'autonomo';

  return { layerId, score: finalScore, status };
}

export function calculateOverallScore(data: BlueprintData): {
  totalScore: number;
  averageScore: number;
  layerScores: LayerScore[];
  overallStatus: string;
} {
  const layerScores = ECOSYSTEM_LAYERS.map((layer) =>
    calculateLayerScore(layer.id, data)
  );

  const totalScore = layerScores.reduce((sum, ls) => sum + ls.score, 0);
  const averageScore = totalScore / layerScores.length;

  let overallStatus: string;
  if (averageScore < 2) {
    overallStatus = 'Audiencia';
  } else if (averageScore < 3) {
    overallStatus = 'Comunidade';
  } else if (averageScore < 4) {
    overallStatus = 'Ecossistema';
  } else if (averageScore < 4.5) {
    overallStatus = 'Movimento';
  } else {
    overallStatus = 'Legado';
  }

  return { totalScore, averageScore, layerScores, overallStatus };
}

export function getLayerStatusColor(status: LayerScore['status']): string {
  const colors = {
    vazio: 'text-red-500',
    iniciando: 'text-orange-500',
    construindo: 'text-yellow-500',
    maduro: 'text-emerald-500',
    autonomo: 'text-cyan-500',
  };
  return colors[status];
}

export function getLayerStatusBgColor(status: LayerScore['status']): string {
  const colors = {
    vazio: 'bg-red-500/10',
    iniciando: 'bg-orange-500/10',
    construindo: 'bg-yellow-500/10',
    maduro: 'bg-emerald-500/10',
    autonomo: 'bg-cyan-500/10',
  };
  return colors[status];
}
