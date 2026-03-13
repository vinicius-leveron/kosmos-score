// Raio-X KOSMOS — 13 Perguntas em 3 Blocos
// Captura (nome/email/instagram) é feita no WelcomeScreen antes das perguntas

import { RaioXQuestion } from './types';

// ============================================================================
// BLOCO 1 — DADOS DO NEGÓCIO (P1-P5)
// ============================================================================

const BLOCO_DADOS_NEGOCIO: RaioXQuestion[] = [
  {
    id: 'p1',
    block: 'dados_negocio',
    type: 'single',
    title: 'Qual o formato principal do seu negócio?',
    required: true,
    scorable: false,
    options: [
      { label: 'Curso online', value: 'curso_online', numericValue: 0 },
      { label: 'Mentoria / consultoria', value: 'mentoria_consultoria', numericValue: 0 },
      { label: 'Comunidade paga', value: 'comunidade_paga', numericValue: 0 },
      { label: 'SaaS / ferramenta', value: 'saas', numericValue: 0 },
      { label: 'Outro', value: 'outro', numericValue: 0 },
    ],
  },
  {
    id: 'p2',
    block: 'dados_negocio',
    type: 'single',
    title: 'Qual a faixa de faturamento mensal do seu negócio?',
    required: true,
    scorable: true,
    options: [
      { label: 'Menos de R$10K', value: 'menos_10k', numericValue: 0 },
      { label: 'R$10K – R$30K', value: '10k_30k', numericValue: 1 },
      { label: 'R$30K – R$50K', value: '30k_50k', numericValue: 2 },
      { label: 'R$50K – R$100K', value: '50k_100k', numericValue: 3 },
      { label: 'R$100K – R$300K', value: '100k_300k', numericValue: 4 },
      { label: 'R$300K+', value: '300k_mais', numericValue: 5 },
    ],
  },
  {
    id: 'p3',
    block: 'dados_negocio',
    type: 'single',
    title: 'Quantos alunos/clientes/membros você tem na base total?',
    required: true,
    scorable: true,
    options: [
      { label: 'Menos de 500', value: 'menos_500', numericValue: 0 },
      { label: '500 – 2.000', value: '500_2000', numericValue: 1 },
      { label: '2.000 – 5.000', value: '2000_5000', numericValue: 2 },
      { label: '5.000 – 10.000', value: '5000_10000', numericValue: 3 },
      { label: '10.000+', value: '10000_mais', numericValue: 4 },
    ],
  },
  {
    id: 'p4',
    block: 'dados_negocio',
    type: 'text',
    title: 'Quais são seus produtos hoje? (nome e preço de cada um)',
    subtitle: 'Isso nos ajuda a mapear oportunidades reais no seu negócio.',
    placeholder: 'Ex: Curso de Tráfego R$997, Mentoria R$5.000',
    required: true,
    scorable: false,
  },
  {
    id: 'p5',
    block: 'dados_negocio',
    type: 'single',
    title: 'Como vem a maior parte da sua receita?',
    required: true,
    scorable: true,
    options: [
      { label: 'Lançamento (aberturas de turma)', value: 'lancamento', numericValue: 0 },
      { label: 'Venda perpétua (sempre aberto)', value: 'perpetua', numericValue: 1 },
      { label: 'Mix dos dois', value: 'mix', numericValue: 1 },
      { label: 'Recorrência (assinatura/mensalidade)', value: 'recorrencia', numericValue: 2 },
    ],
  },
];

// ============================================================================
// BLOCO 2 — MODELO E DEPENDÊNCIA (P6-P9)
// ============================================================================

const BLOCO_MODELO_DEPENDENCIA: RaioXQuestion[] = [
  {
    id: 'p6',
    block: 'modelo_dependencia',
    type: 'single',
    title: 'De onde vem a maioria dos seus clientes?',
    required: true,
    scorable: false,
    options: [
      { label: 'Meu conteúdo no Instagram/YouTube', value: 'conteudo_organico', numericValue: 0 },
      { label: 'Tráfego pago', value: 'trafego_pago', numericValue: 0 },
      { label: 'Indicação / boca a boca', value: 'indicacao', numericValue: 0 },
      { label: 'Afiliados', value: 'afiliados', numericValue: 0 },
      { label: 'Mix', value: 'mix', numericValue: 0 },
    ],
  },
  {
    id: 'p7',
    block: 'modelo_dependencia',
    type: 'single',
    title: 'Quantas pessoas trabalham no seu negócio?',
    required: true,
    scorable: false,
    options: [
      { label: 'Só eu', value: 'solo', numericValue: 0 },
      { label: '2–5', value: '2_5', numericValue: 0 },
      { label: '6–15', value: '6_15', numericValue: 0 },
      { label: '16+', value: '16_mais', numericValue: 0 },
    ],
  },
  {
    id: 'p8',
    block: 'modelo_dependencia',
    type: 'single',
    title: 'Se você desaparecesse por 30 dias — sem gravar, sem postar, sem vender — o que aconteceria?',
    required: true,
    scorable: true,
    options: [
      { label: 'Tudo para. Sem mim, não funciona.', value: 'tudo_para', numericValue: 0 },
      { label: 'Desacelera mas o time segura.', value: 'desacelera', numericValue: 1 },
      { label: 'Continua rodando normalmente.', value: 'continua', numericValue: 3 },
    ],
  },
  {
    id: 'p9',
    block: 'modelo_dependencia',
    type: 'single',
    title: 'O que seus alunos/membros fazem DEPOIS de comprar?',
    required: true,
    scorable: true,
    options: [
      { label: 'Assistem o conteúdo e pronto', value: 'assistem_pronto', numericValue: 0 },
      { label: 'Participam de um grupo mas a maioria é passiva', value: 'grupo_passivo', numericValue: 1 },
      { label: 'Agem, têm resultado e alguns compartilham', value: 'agem_compartilham', numericValue: 2 },
      { label: 'Agem, documentam resultado e atraem novos', value: 'documentam_atraem', numericValue: 3 },
    ],
  },
];

// ============================================================================
// BLOCO 3 — TRANSFORMAÇÃO E MOVIMENTO (P10-P13)
// ============================================================================

const BLOCO_TRANSFORMACAO: RaioXQuestion[] = [
  {
    id: 'p10',
    block: 'transformacao',
    type: 'text',
    title: 'Em uma frase, o que seu negócio faz?',
    subtitle: 'Descreva como você explica o que faz para alguém que acabou de conhecer.',
    placeholder: 'Ex: Ensino gestão de tráfego pago pra quem quer viver disso',
    required: true,
    scorable: false,
  },
  {
    id: 'p11',
    block: 'transformacao',
    type: 'text',
    title: 'Qual a melhor coisa que um aluno/cliente já te disse sobre o resultado que teve?',
    subtitle: 'Pode ser uma mensagem, um depoimento, algo que te marcou.',
    placeholder: 'Ex: "Larguei meu emprego e fechei 5 clientes no primeiro mês"',
    required: false,
    scorable: false,
  },
  {
    id: 'p12',
    block: 'transformacao',
    type: 'text',
    title: 'Por que você começou esse negócio? O que te incomodava no mercado?',
    subtitle: 'Sua história de origem alimenta a narrativa do seu diagnóstico.',
    placeholder: 'Ex: Cansei de ver guru vendendo método que nunca aplicou',
    required: false,
    scorable: false,
  },
  {
    id: 'p13',
    block: 'transformacao',
    type: 'single',
    title: 'Seus alunos/clientes se conectam entre si ou só com você?',
    required: true,
    scorable: true,
    options: [
      { label: 'Só comigo (não tem espaço pra eles se encontrarem)', value: 'so_comigo', numericValue: 0 },
      { label: 'Tem grupo mas não interagem muito', value: 'grupo_sem_interacao', numericValue: 1 },
      { label: 'Se conectam e trocam entre si ativamente', value: 'conectam_ativamente', numericValue: 3 },
    ],
  },
];

// ============================================================================
// EXPORT
// ============================================================================

export const RAIO_X_QUESTIONS: RaioXQuestion[] = [
  ...BLOCO_DADOS_NEGOCIO,
  ...BLOCO_MODELO_DEPENDENCIA,
  ...BLOCO_TRANSFORMACAO,
];

export const TOTAL_QUESTIONS = RAIO_X_QUESTIONS.length;

export const SCORABLE_QUESTION_IDS = RAIO_X_QUESTIONS
  .filter(q => q.scorable)
  .map(q => q.id);

export const BLOCK_LABELS: Record<string, string> = {
  dados_negocio: 'Dados do Negócio',
  modelo_dependencia: 'Modelo e Dependência',
  transformacao: 'Transformação e Movimento',
};

// Helper: get the midpoint value for revenue ranges (used in AI prompts)
export const REVENUE_MIDPOINTS: Record<string, number> = {
  menos_10k: 5000,
  '10k_30k': 20000,
  '30k_50k': 40000,
  '50k_100k': 75000,
  '100k_300k': 200000,
  '300k_mais': 400000,
};

// Helper: get the midpoint value for base size ranges (used in AI prompts)
export const BASE_MIDPOINTS: Record<string, number> = {
  menos_500: 250,
  '500_2000': 1250,
  '2000_5000': 3500,
  '5000_10000': 7500,
  '10000_mais': 15000,
};
