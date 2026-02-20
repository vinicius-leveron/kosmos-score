/**
 * Premissas para cálculo de transição de lançamento para recorrência
 *
 * Baseado em benchmarks de mercado de infoprodutores brasileiros.
 */

export const PREMISAS = {
  // Taxa de conversão de lista para assinatura
  taxaConversaoLista: {
    conservadora: 0.01, // 1%
    moderada: 0.02, // 2%
    otimista: 0.03, // 3%
  },

  // Crescimento mensal de assinantes (após período inicial)
  crescimentoMensal: {
    baixo: 0.05, // 5%
    medio: 0.10, // 10%
    alto: 0.15, // 15%
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

  // Margem de lucro por modelo
  margem: {
    lancamento: 0.35, // 35% após todos os custos
    recorrencia: 0.60, // 60% margem maior na recorrência
  },

  // Meses para estabilização
  mesesEstabilizacao: 6,
};

export type FrequenciaLancamento = 2 | 3 | 4 | 6;

export const FREQUENCIAS: { value: FrequenciaLancamento; label: string }[] = [
  { value: 2, label: '2 lançamentos/ano' },
  { value: 3, label: '3 lançamentos/ano' },
  { value: 4, label: '4 lançamentos/ano (trimestral)' },
  { value: 6, label: '6 lançamentos/ano (bimestral)' },
];
