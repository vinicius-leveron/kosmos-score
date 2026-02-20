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

  // Potencial de monetização da audiência (valores conservadores)
  taxaConversaoAudiencia: {
    min: 0.005, // 0.5% conversão mínima
    media: 0.01, // 1% conversão média (realista)
    max: 0.02, // 2% conversão otimista
  },

  // Aumento de ticket médio com ecossistema (realista)
  aumentoTicketEcossistema: {
    baixo: 1.1, // 10% de aumento
    medio: 1.2, // 20% de aumento
    alto: 1.4, // 40% de aumento
  },

  // LTV multiplicador com modelo de ecossistema (conservador)
  ltvMultiplicador: 1.5, // Cliente vale 1.5x mais em ecossistema

  // Redução de horas trabalhadas com automação (conservador)
  eficienciaEcossistema: 0.85, // 15% menos horas (não 30%)

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
