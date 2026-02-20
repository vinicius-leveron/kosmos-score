/**
 * Premissas para cálculo do potencial de ecossistema
 *
 * Estas premissas são baseadas em benchmarks de mercado e são
 * intencionalmente conservadoras para evitar resultados irrealistas.
 */

export const PREMISAS = {
  // Multiplicadores por modelo atual
  modeloMultiplicador: {
    lancamento: 1.0, // Baseline
    perpetuo: 1.2, // Perpétuo já é mais estável
    recorrencia: 1.4, // Recorrência tem melhor base
  } as Record<string, number>,

  // Multiplicadores por tamanho de equipe
  equipeMultiplicador: {
    sozinho: 0.8, // Limitação de execução
    pequena: 1.0, // 1-3 pessoas
    media: 1.2, // 4+ pessoas
  } as Record<string, number>,

  // Potencial de monetização da audiência
  taxaConversaoAudiencia: {
    min: 0.01, // 1% conversão mínima
    media: 0.02, // 2% conversão média
    max: 0.04, // 4% conversão otimista
  },

  // Aumento de ticket médio com ecossistema
  aumentoTicketEcossistema: {
    baixo: 1.3, // 30% de aumento
    medio: 1.5, // 50% de aumento
    alto: 2.0, // 100% de aumento
  },

  // LTV multiplicador com modelo de ecossistema
  ltvMultiplicador: 2.5, // Cliente vale 2.5x mais em ecossistema

  // Redução de horas trabalhadas com automação
  eficienciaEcossistema: 0.7, // 30% menos horas para mesmo resultado

  // Número médio de produtos em ecossistema
  produtosEcossistema: 4,

  // Margem de lucro média
  margemLucro: {
    lancamento: 0.3, // 30% margem em lançamentos
    perpetuo: 0.4, // 40% margem em perpétuo
    recorrencia: 0.5, // 50% margem em recorrência
    ecossistema: 0.55, // 55% margem com ecossistema
  },

  // Faixas de resultado para narrativas
  faixasGap: {
    baixo: 10000, // até R$ 10k
    medio: 50000, // até R$ 50k
    alto: 150000, // até R$ 150k
  },
};

export type ModeloAtual = 'lancamento' | 'perpetuo' | 'recorrencia';
export type TamanhoEquipe = 'sozinho' | 'pequena' | 'media';
