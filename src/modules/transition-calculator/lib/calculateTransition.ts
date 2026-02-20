import { PREMISAS, FrequenciaLancamento } from './premisas';

export interface TransitionInputs {
  faturamentoLancamento: number; // Faturamento médio por lançamento
  frequenciaLancamentos: FrequenciaLancamento;
  custoLancamento: number; // Custo por lançamento
  tamanhoLista: number; // Tamanho da lista de emails
  ticketRecorrencia: number; // Ticket da assinatura mensal
  churnEstimado: number; // % de churn mensal (0-100)
}

export interface MonthProjection {
  month: number;
  assinantes: number;
  mrrRecorrencia: number;
  acumuladoRecorrencia: number;
  faturamentoLancamento: number;
  acumuladoLancamento: number;
  diferencaAcumulada: number;
}

export interface TransitionOutputs {
  // Métricas de breakeven
  assinantesNecessarios: number;
  mesesParaBreakeven: number;
  conversaoNecessaria: number; // % da lista

  // Comparação anual
  faturamentoAnualLancamento: number;
  lucroAnualLancamento: number;
  faturamentoAnualRecorrencia: number; // projetado após 12 meses
  lucroAnualRecorrencia: number;

  // Métricas de recorrência
  mrrInicial: number; // MRR após conversão inicial
  mrrProjetado12Meses: number;
  ltv: number; // Lifetime Value por assinante

  // Timeline
  projecao12Meses: MonthProjection[];

  // Narrativa
  narrative: {
    headline: string;
    mensagem: string;
    recomendacao: string;
  };
}

/**
 * Calcula projeções de transição de lançamento para recorrência
 */
export function calculateTransition(inputs: TransitionInputs): TransitionOutputs {
  const {
    faturamentoLancamento,
    frequenciaLancamentos,
    custoLancamento,
    tamanhoLista,
    ticketRecorrencia,
    churnEstimado,
  } = inputs;

  const churnDecimal = churnEstimado / 100;

  // Cálculos de lançamento
  const faturamentoAnualLancamento = faturamentoLancamento * frequenciaLancamentos;
  const custoAnualLancamento = custoLancamento * frequenciaLancamentos;
  const lucroAnualLancamento = (faturamentoAnualLancamento - custoAnualLancamento) * PREMISAS.margem.lancamento;

  // MRR necessário para igualar
  const mrrNecessario = faturamentoAnualLancamento / 12;

  // Assinantes necessários para breakeven
  const assinantesNecessarios = Math.ceil(mrrNecessario / ticketRecorrencia);

  // Conversão necessária da lista
  const conversaoNecessaria = (assinantesNecessarios / tamanhoLista) * 100;

  // LTV considerando churn
  const ltv = churnDecimal > 0 ? ticketRecorrencia / churnDecimal : ticketRecorrencia * 24;

  // Conversão inicial da lista (conservadora)
  const assinantesIniciais = Math.floor(tamanhoLista * PREMISAS.taxaConversaoLista.moderada);
  const mrrInicial = assinantesIniciais * ticketRecorrencia;

  // Projeção de 12 meses
  const projecao12Meses: MonthProjection[] = [];
  let assinantesAtual = assinantesIniciais;
  let acumuladoRecorrencia = 0;

  // Calcular quando acontece cada lançamento
  const mesesPorLancamento = 12 / frequenciaLancamentos;
  const mesesDeLancamento = Array.from(
    { length: frequenciaLancamentos },
    (_, i) => Math.round((i + 1) * mesesPorLancamento)
  );

  let acumuladoLancamento = 0;
  let mesesParaBreakeven = 0;
  let breakevenEncontrado = false;

  for (let month = 1; month <= 12; month++) {
    // Crescimento de assinantes (orgânico menos churn)
    const novosOrganicos = Math.floor(assinantesAtual * PREMISAS.crescimentoMensal.medio);
    const churned = Math.floor(assinantesAtual * churnDecimal);
    assinantesAtual = assinantesAtual + novosOrganicos - churned;

    // MRR do mês
    const mrrMes = assinantesAtual * ticketRecorrencia;
    acumuladoRecorrencia += mrrMes;

    // Faturamento de lançamento no mês (se houver)
    const temLancamento = mesesDeLancamento.includes(month);
    const faturamentoMesLancamento = temLancamento ? faturamentoLancamento : 0;
    acumuladoLancamento += faturamentoMesLancamento;

    // Diferença acumulada
    const diferencaAcumulada = acumuladoRecorrencia - acumuladoLancamento;

    // Verificar breakeven
    if (!breakevenEncontrado && diferencaAcumulada >= 0) {
      mesesParaBreakeven = month;
      breakevenEncontrado = true;
    }

    projecao12Meses.push({
      month,
      assinantes: assinantesAtual,
      mrrRecorrencia: mrrMes,
      acumuladoRecorrencia,
      faturamentoLancamento: faturamentoMesLancamento,
      acumuladoLancamento,
      diferencaAcumulada,
    });
  }

  // Se não atingiu breakeven em 12 meses
  if (!breakevenEncontrado) {
    mesesParaBreakeven = estimarMesesBreakeven(
      assinantesAtual,
      ticketRecorrencia,
      churnDecimal,
      faturamentoLancamento,
      frequenciaLancamentos,
      acumuladoRecorrencia,
      acumuladoLancamento
    );
  }

  // MRR projetado ao final de 12 meses
  const mrrProjetado12Meses = projecao12Meses[11].mrrRecorrencia;
  const faturamentoAnualRecorrencia = projecao12Meses.reduce((sum, p) => sum + p.mrrRecorrencia, 0);
  const lucroAnualRecorrencia = faturamentoAnualRecorrencia * PREMISAS.margem.recorrencia;

  // Gerar narrativa
  const narrative = gerarNarrativa(
    mesesParaBreakeven,
    conversaoNecessaria,
    lucroAnualRecorrencia,
    lucroAnualLancamento
  );

  return {
    assinantesNecessarios,
    mesesParaBreakeven,
    conversaoNecessaria: Math.round(conversaoNecessaria * 10) / 10,
    faturamentoAnualLancamento,
    lucroAnualLancamento: Math.round(lucroAnualLancamento),
    faturamentoAnualRecorrencia: Math.round(faturamentoAnualRecorrencia),
    lucroAnualRecorrencia: Math.round(lucroAnualRecorrencia),
    mrrInicial,
    mrrProjetado12Meses,
    ltv: Math.round(ltv),
    projecao12Meses,
    narrative,
  };
}

function estimarMesesBreakeven(
  assinantesAtual: number,
  ticketRecorrencia: number,
  churnDecimal: number,
  faturamentoLancamento: number,
  frequenciaLancamentos: number,
  acumuladoRecorrencia: number,
  acumuladoLancamento: number
): number {
  let meses = 12;
  let assinantes = assinantesAtual;
  let acumRec = acumuladoRecorrencia;
  let acumLan = acumuladoLancamento;
  const mesesPorLancamento = 12 / frequenciaLancamentos;

  while (meses < 36 && acumRec < acumLan) {
    meses++;
    const novos = Math.floor(assinantes * PREMISAS.crescimentoMensal.medio);
    const churned = Math.floor(assinantes * churnDecimal);
    assinantes = assinantes + novos - churned;
    acumRec += assinantes * ticketRecorrencia;

    if (meses % mesesPorLancamento === 0) {
      acumLan += faturamentoLancamento;
    }
  }

  return meses;
}

function gerarNarrativa(
  mesesParaBreakeven: number,
  conversaoNecessaria: number,
  lucroAnualRecorrencia: number,
  lucroAnualLancamento: number
): { headline: string; mensagem: string; recomendacao: string } {
  const diferencaLucro = lucroAnualRecorrencia - lucroAnualLancamento;
  const percentualMaior = Math.round((diferencaLucro / lucroAnualLancamento) * 100);

  if (mesesParaBreakeven <= 6) {
    return {
      headline: 'Transicao rapida e vantajosa',
      mensagem: `Com sua lista atual, voce pode atingir o breakeven em apenas ${mesesParaBreakeven} meses. A conversao necessaria de ${conversaoNecessaria}% e totalmente viavel.`,
      recomendacao: 'Recomendamos iniciar a transicao o quanto antes. O modelo de recorrencia pode gerar ate ' + percentualMaior + '% mais lucro no longo prazo.',
    };
  } else if (mesesParaBreakeven <= 12) {
    return {
      headline: 'Transicao viavel com planejamento',
      mensagem: `O breakeven acontece em ${mesesParaBreakeven} meses. Voce precisara converter ${conversaoNecessaria}% da sua lista, o que e alcancavel com uma boa estrategia de lancamento.`,
      recomendacao: 'Considere um modelo hibrido: mantenha 1-2 lancamentos por ano enquanto constroi a base de assinantes.',
    };
  } else {
    return {
      headline: 'Transicao requer preparacao',
      mensagem: `O breakeven levaria ${mesesParaBreakeven} meses. A conversao necessaria de ${conversaoNecessaria}% esta acima da media do mercado.`,
      recomendacao: 'Antes de transicionar, foque em: 1) Crescer a lista, 2) Reduzir ticket ou aumentar valor percebido, 3) Testar com um produto piloto.',
    };
  }
}

export function formatarMoeda(valor: number): string {
  if (valor >= 1000000) {
    return `R$ ${(valor / 1000000).toFixed(1)}M`;
  }
  if (valor >= 1000) {
    return `R$ ${(valor / 1000).toFixed(0)}k`;
  }
  return `R$ ${valor.toFixed(0)}`;
}
