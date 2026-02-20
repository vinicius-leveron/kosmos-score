/**
 * Seções do Template de Oferta High Ticket
 *
 * O template guia o creator a estruturar uma oferta HT completa
 * seguindo as melhores práticas de posicionamento e valor.
 */

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'list';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  maxItems?: number; // Para type: 'list'
}

export interface TemplateSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  fields: TemplateField[];
  tips: string[];
}

export const TEMPLATE_SECTIONS: TemplateSection[] = [
  {
    id: 'transformacao',
    name: 'Transformação',
    description: 'Defina claramente de onde o cliente sai e onde chega',
    icon: 'arrow-right',
    fields: [
      {
        id: 'estado_atual',
        label: 'Estado Atual (Ponto A)',
        type: 'textarea',
        placeholder: 'Descreva a situação atual do seu cliente ideal. Quais são as dores, frustrações e desafios que ele enfrenta?',
        helperText: 'Seja específico sobre os problemas que seu cliente vive hoje',
        required: true,
      },
      {
        id: 'estado_desejado',
        label: 'Estado Desejado (Ponto B)',
        type: 'textarea',
        placeholder: 'Descreva onde seu cliente estará após trabalhar com você. Quais resultados concretos ele terá alcançado?',
        helperText: 'Use métricas e resultados tangíveis quando possível',
        required: true,
      },
      {
        id: 'tempo_transformacao',
        label: 'Tempo da Transformação',
        type: 'select',
        options: [
          { value: '30dias', label: '30 dias' },
          { value: '60dias', label: '60 dias' },
          { value: '90dias', label: '90 dias' },
          { value: '6meses', label: '6 meses' },
          { value: '12meses', label: '12 meses' },
        ],
        required: true,
      },
    ],
    tips: [
      'A transformação deve ser específica e mensurável',
      'Evite promessas genéricas como "ter mais sucesso"',
      'O cliente precisa visualizar claramente o antes e depois',
    ],
  },
  {
    id: 'mecanismo',
    name: 'Método/Mecanismo',
    description: 'Apresente seu framework proprietário',
    icon: 'cog',
    fields: [
      {
        id: 'nome_metodo',
        label: 'Nome do Método',
        type: 'text',
        placeholder: 'Ex: Método KOSMOS, Framework 4P, Sistema XYZ',
        helperText: 'Dê um nome memorável ao seu processo',
        required: true,
      },
      {
        id: 'etapas',
        label: 'Etapas do Método',
        type: 'list',
        placeholder: 'Ex: Diagnóstico → Estratégia → Implementação → Otimização',
        helperText: 'Liste as principais fases do seu método (3-5 etapas)',
        maxItems: 5,
        required: true,
      },
      {
        id: 'diferencial',
        label: 'Por que é diferente?',
        type: 'textarea',
        placeholder: 'O que torna seu método único? Por que funciona melhor que outras abordagens?',
        helperText: 'Destaque o diferencial competitivo do seu approach',
        required: true,
      },
    ],
    tips: [
      'Use acrônimos ou palavras que resumam o método',
      'Cada etapa deve ter um resultado claro',
      'Explique o "porquê" por trás do método',
    ],
  },
  {
    id: 'entregaveis',
    name: 'Entregáveis',
    description: 'Liste tudo que o cliente recebe',
    icon: 'package',
    fields: [
      {
        id: 'entregavel_principal',
        label: 'Entregável Principal',
        type: 'text',
        placeholder: 'Ex: Mentoria Individual, Consultoria, Programa de Aceleração',
        required: true,
      },
      {
        id: 'componentes',
        label: 'Componentes da Oferta',
        type: 'list',
        placeholder: 'Ex: 8 sessões individuais de 1h, Acesso ao grupo VIP, Templates exclusivos',
        helperText: 'Liste todos os itens inclusos (adicione valor percebido)',
        maxItems: 10,
        required: true,
      },
      {
        id: 'bonus',
        label: 'Bônus (opcional)',
        type: 'list',
        placeholder: 'Ex: Acesso vitalício à comunidade, 1 sessão extra de emergência',
        helperText: 'Bônus aumentam o valor percebido sem custo adicional',
        maxItems: 5,
      },
    ],
    tips: [
      'Quantifique sempre que possível (horas, módulos, templates)',
      'Bônus devem ser relevantes, não apenas "enchimento"',
      'Pense em entregáveis que você pode escalar',
    ],
  },
  {
    id: 'garantias',
    name: 'Garantias',
    description: 'Remova o risco da decisão',
    icon: 'shield',
    fields: [
      {
        id: 'tipo_garantia',
        label: 'Tipo de Garantia',
        type: 'select',
        options: [
          { value: 'resultado', label: 'Garantia de Resultado' },
          { value: 'satisfacao', label: 'Garantia de Satisfação' },
          { value: 'reembolso', label: 'Reembolso em X dias' },
          { value: 'condicional', label: 'Garantia Condicional' },
          { value: 'nenhuma', label: 'Sem garantia formal' },
        ],
        required: true,
      },
      {
        id: 'descricao_garantia',
        label: 'Descrição da Garantia',
        type: 'textarea',
        placeholder: 'Descreva exatamente como funciona sua garantia e quais são as condições',
        helperText: 'Seja claro sobre o que acontece se o cliente não ficar satisfeito',
      },
      {
        id: 'risk_reversal',
        label: 'Inversão de Risco Adicional',
        type: 'textarea',
        placeholder: 'Algo extra que você oferece para reduzir o risco? Ex: "Se não atingir X, trabalho com você até atingir"',
        helperText: 'Quanto mais risco você assume, mais confiança transmite',
      },
    ],
    tips: [
      'Garantias fortes aumentam conversão significativamente',
      'Seja específico sobre condições para evitar problemas',
      'Garantias condicionais filtram clientes não comprometidos',
    ],
  },
  {
    id: 'pricing',
    name: 'Pricing',
    description: 'Estruture seu preço e formas de pagamento',
    icon: 'dollar-sign',
    fields: [
      {
        id: 'investimento',
        label: 'Investimento (valor principal)',
        type: 'number',
        placeholder: '10000',
        helperText: 'Valor total do programa em reais',
        required: true,
      },
      {
        id: 'parcelas',
        label: 'Opção de Parcelamento',
        type: 'text',
        placeholder: 'Ex: 12x de R$ 997 ou à vista com 10% de desconto',
        helperText: 'Ofereça opções para diferentes perfis',
      },
      {
        id: 'ancora_valor',
        label: 'Âncora de Valor',
        type: 'number',
        placeholder: '25000',
        helperText: 'Quanto vale tudo isso se comprado separadamente?',
      },
      {
        id: 'justificativa_preco',
        label: 'Justificativa do Preço',
        type: 'textarea',
        placeholder: 'Por que este investimento faz sentido? Compare com alternativas ou com o custo de não resolver o problema.',
        helperText: 'Ajude o cliente a racionalizar a decisão',
      },
    ],
    tips: [
      'O preço deve refletir o valor da transformação, não o tempo gasto',
      'Use âncora de valor para contextualizar o investimento',
      'Parcelamento pode aumentar conversão em até 40%',
    ],
  },
  {
    id: 'stack_valor',
    name: 'Stack de Valor',
    description: 'Visualize toda a oferta consolidada',
    icon: 'layers',
    fields: [
      {
        id: 'headline_oferta',
        label: 'Headline da Oferta',
        type: 'text',
        placeholder: 'Ex: Programa de Aceleração para Criadores de Conteúdo',
        helperText: 'O nome oficial da sua oferta high ticket',
        required: true,
      },
      {
        id: 'subheadline',
        label: 'Subheadline',
        type: 'text',
        placeholder: 'Ex: De 0 a 100k/mês em 90 dias com o Método KOSMOS',
        helperText: 'Uma frase que resume a transformação',
      },
      {
        id: 'publico_ideal',
        label: 'Para Quem É (e NÃO é)',
        type: 'textarea',
        placeholder: 'É para: criadores com pelo menos 10k seguidores que querem monetizar.\nNÃO é para: quem busca dinheiro rápido sem esforço.',
        helperText: 'Deixe claro quem é o cliente ideal e quem não é',
        required: true,
      },
      {
        id: 'cta_principal',
        label: 'CTA Principal',
        type: 'text',
        placeholder: 'Ex: Agendar Conversa Estratégica',
        helperText: 'Qual é o próximo passo que o interessado deve dar?',
        required: true,
      },
    ],
    tips: [
      'A headline deve ser clara, não criativa demais',
      'Excluir quem não é ideal aumenta a qualidade dos leads',
      'O CTA deve ser de baixo compromisso inicial',
    ],
  },
];

export interface TemplateData {
  [sectionId: string]: {
    [fieldId: string]: string | string[] | number;
  };
}

export const EXAMPLE_DATA: TemplateData = {
  transformacao: {
    estado_atual: 'Criadores de conteúdo que faturam entre R$10-30k/mês com lançamentos, mas vivem em uma montanha-russa de receita, trabalham 60+ horas por semana e não conseguem escalar sem se matar.',
    estado_desejado: 'Faturamento previsível de R$100k+/mês com modelo de recorrência, trabalhando 30h/semana com uma operação enxuta e escalável.',
    tempo_transformacao: '90dias',
  },
  mecanismo: {
    nome_metodo: 'Método KOSMOS',
    etapas: [
      'Diagnóstico do Ecossistema Atual',
      'Arquitetura da Oferta Recorrente',
      'Implementação do Funil Perpétuo',
      'Otimização e Escala',
    ],
    diferencial: 'Ao invés de criar mais produtos, reorganizamos o que você já tem em um ecossistema integrado onde cada produto alimenta o próximo, gerando receita previsível sem aumentar sua carga de trabalho.',
  },
  entregaveis: {
    entregavel_principal: 'Mentoria Estratégica Individual',
    componentes: [
      '12 sessões individuais de 90 minutos (1 por semana)',
      'Acesso ao KOSMOS Toolkit (plataforma completa)',
      'Templates de funis e automações prontos',
      'Análise mensal de métricas e ajustes',
      'Grupo VIP com outros criadores do programa',
      'Suporte via WhatsApp em horário comercial',
    ],
    bonus: [
      'Sessão de emergência (uso ilimitado por 90 dias)',
      'Acesso vitalício às atualizações do método',
      'Review de copy das suas páginas de venda',
    ],
  },
  garantias: {
    tipo_garantia: 'condicional',
    descricao_garantia: 'Se você aplicar o método, comparecer às sessões e não ver aumento de pelo menos 30% no faturamento em 90 dias, continuo trabalhando com você sem custo adicional até atingir.',
    risk_reversal: 'Além disso, se nas primeiras 2 semanas você sentir que não é pra você, devolvemos 100% do investimento.',
  },
  pricing: {
    investimento: 12000,
    parcelas: '12x de R$ 1.197 ou R$ 10.800 à vista (10% off)',
    ancora_valor: 35000,
    justificativa_preco: 'Se você está faturando R$20k/mês e chegar a R$50k em 90 dias, são R$30k a mais POR MÊS. Em 12 meses, R$360k extras. O investimento se paga no primeiro mês de resultado.',
  },
  stack_valor: {
    headline_oferta: 'Programa KOSMOS de Aceleração',
    subheadline: 'Transforme seu negócio de conteúdo em um ecossistema de R$100k+/mês em 90 dias',
    publico_ideal: 'É PARA VOCÊ SE:\n- Já fatura R$10k+/mês com infoprodutos\n- Tem audiência engajada (10k+ seguidores)\n- Está disposto a implementar e não só aprender\n- Quer sair da montanha-russa de lançamentos\n\nNÃO É PARA VOCÊ SE:\n- Está começando do zero\n- Busca dinheiro rápido sem esforço\n- Não tem tempo para implementar (mínimo 10h/semana)',
    cta_principal: 'Agendar Conversa Estratégica',
  },
};
