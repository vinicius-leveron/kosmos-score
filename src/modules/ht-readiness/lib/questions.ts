/**
 * Perguntas do Diagnóstico de Prontidão para High Ticket
 *
 * Estrutura:
 * - 4 categorias principais
 * - 12-14 perguntas total
 * - Sistema de scoring normalizado (0-100)
 */

export interface DiagnosticOption {
  value: string;
  label: string;
  score: number; // 0-100
  description?: string;
}

export interface DiagnosticQuestion {
  id: string;
  category: DiagnosticCategory;
  question: string;
  helperText?: string;
  type: 'single' | 'multi' | 'scale';
  options: DiagnosticOption[];
}

export type DiagnosticCategory =
  | 'autoridade'
  | 'oferta'
  | 'entrega'
  | 'mindset';

export interface CategoryInfo {
  id: DiagnosticCategory;
  name: string;
  description: string;
  weight: number; // Percentage (should sum to 100)
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'autoridade',
    name: 'Autoridade & Posicionamento',
    description: 'Sua credibilidade e posição no mercado',
    weight: 30,
    icon: 'crown',
  },
  {
    id: 'oferta',
    name: 'Estrutura de Oferta',
    description: 'Clareza e força da sua oferta high ticket',
    weight: 25,
    icon: 'package',
  },
  {
    id: 'entrega',
    name: 'Capacidade de Entrega',
    description: 'Sua capacidade de gerar resultados premium',
    weight: 25,
    icon: 'trophy',
  },
  {
    id: 'mindset',
    name: 'Mindset & Pricing',
    description: 'Sua mentalidade em relação a preços altos',
    weight: 20,
    icon: 'brain',
  },
];

export const QUESTIONS: DiagnosticQuestion[] = [
  // AUTORIDADE & POSICIONAMENTO (3 perguntas)
  {
    id: 'auth-1',
    category: 'autoridade',
    question: 'Como as pessoas te conhecem no seu mercado?',
    type: 'single',
    options: [
      { value: 'desconhecido', label: 'Pouco conhecimento', score: 20, description: 'Estou começando a construir presença' },
      { value: 'conhecido', label: 'Conhecido no nicho', score: 50, description: 'Tenho algum reconhecimento local' },
      { value: 'referencia', label: 'Referência no tema', score: 80, description: 'Sou citado como especialista' },
      { value: 'autoridade', label: 'Autoridade estabelecida', score: 100, description: 'Líder reconhecido no mercado' },
    ],
  },
  {
    id: 'auth-2',
    category: 'autoridade',
    question: 'Você tem cases de sucesso documentados?',
    type: 'single',
    options: [
      { value: 'nenhum', label: 'Não tenho cases', score: 0 },
      { value: 'poucos', label: '1-3 cases', score: 40 },
      { value: 'varios', label: '4-10 cases', score: 70 },
      { value: 'muitos', label: 'Mais de 10 cases', score: 100 },
    ],
  },
  {
    id: 'auth-3',
    category: 'autoridade',
    question: 'Qual é a principal forma como novos clientes chegam até você?',
    type: 'single',
    options: [
      { value: 'outbound', label: 'Eu vou atrás deles', score: 30, description: 'Prospecção ativa' },
      { value: 'conteudo', label: 'Pelo meu conteúdo', score: 60, description: 'Inbound marketing' },
      { value: 'indicacao', label: 'Por indicações', score: 90, description: 'Boca a boca orgânico' },
      { value: 'mix', label: 'Mix equilibrado', score: 75, description: 'Múltiplas fontes' },
    ],
  },

  // ESTRUTURA DE OFERTA (4 perguntas)
  {
    id: 'oferta-1',
    category: 'oferta',
    question: 'Você tem clareza sobre a transformação que entrega?',
    helperText: 'De onde o cliente sai e onde chega com sua ajuda',
    type: 'single',
    options: [
      { value: 'confuso', label: 'Ainda estou definindo', score: 20 },
      { value: 'basico', label: 'Tenho uma ideia geral', score: 50 },
      { value: 'claro', label: 'Consigo explicar bem', score: 80 },
      { value: 'cristalino', label: 'Tenho métrica clara de sucesso', score: 100 },
    ],
  },
  {
    id: 'oferta-2',
    category: 'oferta',
    question: 'Você tem um método ou framework proprietário?',
    type: 'single',
    options: [
      { value: 'nao', label: 'Não, uso métodos genéricos', score: 20 },
      { value: 'adaptado', label: 'Adaptei de outros métodos', score: 50 },
      { value: 'proprio', label: 'Tenho meu próprio método', score: 80 },
      { value: 'validado', label: 'Método próprio validado com resultados', score: 100 },
    ],
  },
  {
    id: 'oferta-3',
    category: 'oferta',
    question: 'Qual o ticket médio dos seus produtos/serviços atuais?',
    type: 'single',
    options: [
      { value: 'baixo', label: 'Até R$ 500', score: 20 },
      { value: 'medio', label: 'R$ 500 - R$ 2.000', score: 40 },
      { value: 'alto', label: 'R$ 2.000 - R$ 5.000', score: 70 },
      { value: 'premium', label: 'Acima de R$ 5.000', score: 100 },
    ],
  },
  {
    id: 'oferta-4',
    category: 'oferta',
    question: 'Você já fez alguma venda acima de R$ 3.000?',
    type: 'single',
    options: [
      { value: 'nunca', label: 'Nunca', score: 0 },
      { value: 'uma', label: '1-2 vezes', score: 40 },
      { value: 'algumas', label: '3-10 vezes', score: 70 },
      { value: 'recorrente', label: 'É comum no meu negócio', score: 100 },
    ],
  },

  // CAPACIDADE DE ENTREGA (3 perguntas)
  {
    id: 'entrega-1',
    category: 'entrega',
    question: 'Quanto tempo você consegue dedicar para um cliente premium?',
    type: 'single',
    options: [
      { value: 'pouco', label: 'Menos de 2h/semana', score: 30 },
      { value: 'medio', label: '2-5h/semana', score: 60 },
      { value: 'dedicado', label: '5-10h/semana', score: 85 },
      { value: 'exclusivo', label: 'Tenho disponibilidade total', score: 100 },
    ],
  },
  {
    id: 'entrega-2',
    category: 'entrega',
    question: 'Você tem processos estruturados para onboarding de clientes?',
    type: 'single',
    options: [
      { value: 'nao', label: 'Não, improviso', score: 20 },
      { value: 'basico', label: 'Tenho um roteiro básico', score: 50 },
      { value: 'estruturado', label: 'Processo documentado', score: 80 },
      { value: 'automatizado', label: 'Processo automatizado e escalável', score: 100 },
    ],
  },
  {
    id: 'entrega-3',
    category: 'entrega',
    question: 'Qual a taxa de satisfação dos seus clientes atuais?',
    type: 'single',
    options: [
      { value: 'baixa', label: 'Tenho algumas reclamações', score: 20 },
      { value: 'media', label: 'A maioria fica satisfeita', score: 50 },
      { value: 'alta', label: 'Quase todos ficam satisfeitos', score: 80 },
      { value: 'excepcional', label: 'Recebo elogios frequentes', score: 100 },
    ],
  },

  // MINDSET & PRICING (3 perguntas)
  {
    id: 'mindset-1',
    category: 'mindset',
    question: 'Como você se sente ao cobrar preços altos?',
    type: 'single',
    options: [
      { value: 'desconfortavel', label: 'Muito desconfortável', score: 20 },
      { value: 'inseguro', label: 'Um pouco inseguro', score: 50 },
      { value: 'tranquilo', label: 'Tranquilo', score: 80 },
      { value: 'confiante', label: 'Completamente confiante', score: 100 },
    ],
  },
  {
    id: 'mindset-2',
    category: 'mindset',
    question: 'Você acredita que seu trabalho vale R$ 10.000+?',
    type: 'single',
    options: [
      { value: 'nao', label: 'Não, parece muito', score: 20 },
      { value: 'talvez', label: 'Talvez, com ajustes', score: 50 },
      { value: 'sim', label: 'Sim, com o pacote certo', score: 80 },
      { value: 'certeza', label: 'Absolutamente, já deveria cobrar isso', score: 100 },
    ],
  },
  {
    id: 'mindset-3',
    category: 'mindset',
    question: 'Como você reage quando alguém diz que é caro?',
    type: 'single',
    options: [
      { value: 'desconto', label: 'Geralmente dou desconto', score: 20 },
      { value: 'justifica', label: 'Fico justificando o preço', score: 40 },
      { value: 'explica', label: 'Explico o valor com calma', score: 70 },
      { value: 'seguro', label: 'Mantenho o preço com confiança', score: 100 },
    ],
  },
];

export type DiagnosticAnswers = Record<string, string>;
