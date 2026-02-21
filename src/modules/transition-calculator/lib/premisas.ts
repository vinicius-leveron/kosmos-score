/**
 * Premissas para simulador "E Se Voce Parar de Lancar"
 *
 * Baseado em benchmarks de mercado de infoprodutores brasileiros.
 */

export const PREMISAS = {
  // Taxa de conversão de lista para assinatura (conservadora)
  taxaConversaoLista: {
    conservadora: 0.005, // 0.5%
    moderada: 0.01, // 1% (realista)
    otimista: 0.015, // 1.5%
  },

  // Crescimento mensal de assinantes (realista)
  crescimentoMensal: {
    baixo: 0.02, // 2%
    medio: 0.03, // 3% (realista, ~42% ao ano)
    alto: 0.05, // 5%
  },

  // Churn mensal típico por faixa de ticket
  churnTipico: {
    baixo: 0.08, // 8% - tickets até R$97
    medio: 0.05, // 5% - tickets de R$97-297
    alto: 0.03, // 3% - tickets acima de R$297
  },

  // Custo de aquisição por canal
  cacPorCanal: {
    organico: 0, // Audiência própria
    pago: 50, // Tráfego pago médio
    afiliado: 0.3, // 30% de comissão
  },

  // Margem de lucro por modelo (realista)
  margem: {
    lancamento: 0.30, // 30% após todos os custos
    recorrencia: 0.45, // 45% margem na recorrência (não 60%)
  },

  // Meses para estabilização
  mesesEstabilizacao: 6,

  // ========================================
  // PREMISSAS NÃO-FINANCEIRAS (NOVO)
  // ========================================

  // Horas trabalhadas por modelo
  horasPorModelo: {
    // Horas INTENSIVAS por lançamento (período de lançamento)
    lancamentoIntensivo: {
      minimo: 80, // 80h em 2 semanas
      medio: 120, // 120h em 2-3 semanas
      maximo: 200, // 200h+ para grandes lançamentos
    },
    // Horas mensais no modelo recorrente (depois de estabilizado)
    recorrenciaMensal: {
      minimo: 20, // Ecossistema bem automatizado
      medio: 40, // Operação normal
      maximo: 60, // Ainda em construção
    },
  },

  // Projeção de desgaste (0-100)
  projecaoDesgaste: {
    // Por nível de estresse atual (1-5) -> desgaste projetado em 12 meses
    lancamento: {
      1: 30,
      2: 45,
      3: 60,
      4: 75,
      5: 90, // Alto risco de burnout
    },
    // Recorrência começa em 50% do desgaste atual e reduz 5% ao mês
    recorrenciaReducaoMensal: 0.05,
  },

  // Índice de sustentabilidade (0-100%)
  sustentabilidade: {
    // Base por modelo
    lancamento: 35, // Baixa sustentabilidade natural
    recorrencia: 70, // Alta sustentabilidade base
    // Modificadores
    porNivelDependencia: {
      1: 20, // Muito independente: +20%
      2: 10, // Independente: +10%
      3: 0, // Neutro
      4: -10, // Dependente: -10%
      5: -20, // Totalmente dependente: -20%
    },
  },

  // Distribuição de dependência
  dependencia: {
    lancamento: 95, // 95% depende do fundador
    recorrencia: {
      inicial: 80, // Começa em 80%
      reducaoMensal: 5, // Reduz 5% ao mês com estrutura
      minimo: 40, // Não fica abaixo de 40% sem equipe
    },
  },
};

export type FrequenciaLancamento = 2 | 3 | 4 | 6;

export const FREQUENCIAS: { value: FrequenciaLancamento; label: string }[] = [
  { value: 2, label: '2 lançamentos/ano' },
  { value: 3, label: '3 lançamentos/ano' },
  { value: 4, label: '4 lançamentos/ano (trimestral)' },
  { value: 6, label: '6 lançamentos/ano (bimestral)' },
];
