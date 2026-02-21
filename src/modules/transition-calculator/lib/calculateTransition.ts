import { PREMISAS } from './premisas';
import type { FrequenciaLancamento } from './premisas';

export type StressLevel = 1 | 2 | 3 | 4 | 5;
export type DependencyLevel = 1 | 2 | 3 | 4 | 5;

export interface TransitionInputs {
  // Dados financeiros
  faturamentoLancamento: number; // Faturamento médio por lançamento
  frequenciaLancamentos: FrequenciaLancamento;
  custoLancamento: number; // Custo por lançamento
  tamanhoLista: number; // Tamanho da lista de emails
  ticketRecorrencia: number; // Ticket da assinatura mensal
  churnEstimado: number; // % de churn mensal (0-100)

  // Dados não-financeiros
  horasPorLancamento?: number; // Horas trabalhadas por período de lançamento
  nivelEstresse?: StressLevel; // 1 = tranquilo, 5 = muito estressado
  nivelDependencia?: DependencyLevel; // 1 = negócio funciona sem mim, 5 = depende 100%
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

// Métricas não-financeiras para cada cenário
export interface NonFinancialMetrics {
  horasAnuais: number;
  horasMensaisMedia: number;
  desgasteProjetado: number; // 0-100
  sustentabilidade: number; // 0-100%
  dependencia: number; // 0-100%
  riscoDesgaste: 'baixo' | 'moderado' | 'alto' | 'critico';
}

// Comparação lado a lado dos dois cenários
export interface ScenarioComparison {
  lancamento: {
    financial: {
      faturamentoAnual: number;
      lucroAnual: number;
      margemLiquida: number;
    };
    nonFinancial: NonFinancialMetrics;
    label: string;
  };
  ecossistema: {
    financial: {
      faturamentoAnual: number;
      lucroAnual: number;
      margemLiquida: number;
      mrrProjetado: number;
    };
    nonFinancial: NonFinancialMetrics;
    label: string;
  };
  diferencas: {
    lucro: number;
    lucroPercent: number;
    horas: number;
    horasPercent: number;
    sustentabilidade: number;
    desgaste: number;
  };
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

  // Comparação de cenários (NOVO)
  scenarioComparison: ScenarioComparison;

  // Narrativa
  narrative: {
    headline: string;
    mensagem: string;
    recomendacao: string;
  };
}

/**
 * Calcula métricas não-financeiras para o cenário de lançamentos
 */
function calcularMetricasLancamento(
  frequencia: FrequenciaLancamento,
  horasPorLancamento: number,
  nivelEstresse: StressLevel,
  nivelDependencia: DependencyLevel
): NonFinancialMetrics {
  // Horas anuais = horas por lançamento × frequência
  const horasAnuais = horasPorLancamento * frequencia;
  const horasMensaisMedia = horasAnuais / 12;

  // Desgaste projetado baseado no nível de estresse
  const desgasteBase = PREMISAS.projecaoDesgaste.lancamento[nivelEstresse];
  const desgasteProjetado = Math.min(100, desgasteBase + (frequencia - 2) * 5); // Mais lançamentos = mais desgaste

  // Sustentabilidade
  const sustentabilidadeBase = PREMISAS.sustentabilidade.lancamento;
  const modificadorDependencia = PREMISAS.sustentabilidade.porNivelDependencia[nivelDependencia];
  const sustentabilidade = Math.max(0, Math.min(100, sustentabilidadeBase + modificadorDependencia));

  // Dependência permanece alta no modelo de lançamento
  const dependencia = PREMISAS.dependencia.lancamento;

  // Classificação de risco
  let riscoDesgaste: 'baixo' | 'moderado' | 'alto' | 'critico';
  if (desgasteProjetado >= 80) riscoDesgaste = 'critico';
  else if (desgasteProjetado >= 60) riscoDesgaste = 'alto';
  else if (desgasteProjetado >= 40) riscoDesgaste = 'moderado';
  else riscoDesgaste = 'baixo';

  return {
    horasAnuais,
    horasMensaisMedia: Math.round(horasMensaisMedia),
    desgasteProjetado: Math.round(desgasteProjetado),
    sustentabilidade: Math.round(sustentabilidade),
    dependencia: Math.round(dependencia),
    riscoDesgaste,
  };
}

/**
 * Calcula métricas não-financeiras para o cenário de ecossistema/recorrência
 */
function calcularMetricasEcossistema(
  nivelEstresse: StressLevel,
  nivelDependencia: DependencyLevel
): NonFinancialMetrics {
  // Horas mensais reduzidas no modelo de ecossistema
  const horasMensais = PREMISAS.horasPorModelo.recorrenciaMensal.medio;
  const horasAnuais = horasMensais * 12;

  // Desgaste inicial é 50% do cenário de lançamento, mas reduz com o tempo
  const desgasteInicialLancamento = PREMISAS.projecaoDesgaste.lancamento[nivelEstresse];
  const desgasteInicial = desgasteInicialLancamento * 0.5;
  // Após 12 meses, reduz mais 12 × 5% = 60% do que restou
  const reducaoAnual = 12 * PREMISAS.projecaoDesgaste.recorrenciaReducaoMensal;
  const desgasteProjetado = Math.max(10, desgasteInicial * (1 - reducaoAnual));

  // Sustentabilidade alta no ecossistema
  const sustentabilidadeBase = PREMISAS.sustentabilidade.recorrencia;
  const modificadorDependencia = PREMISAS.sustentabilidade.porNivelDependencia[nivelDependencia];
  const sustentabilidade = Math.max(0, Math.min(100, sustentabilidadeBase + modificadorDependencia));

  // Dependência reduz gradualmente no ecossistema
  const dependenciaInicial = PREMISAS.dependencia.recorrencia.inicial;
  const reducaoMensalDep = PREMISAS.dependencia.recorrencia.reducaoMensal;
  const dependenciaMinima = PREMISAS.dependencia.recorrencia.minimo;
  const dependencia = Math.max(dependenciaMinima, dependenciaInicial - 12 * reducaoMensalDep);

  // Classificação de risco
  let riscoDesgaste: 'baixo' | 'moderado' | 'alto' | 'critico';
  if (desgasteProjetado >= 80) riscoDesgaste = 'critico';
  else if (desgasteProjetado >= 60) riscoDesgaste = 'alto';
  else if (desgasteProjetado >= 40) riscoDesgaste = 'moderado';
  else riscoDesgaste = 'baixo';

  return {
    horasAnuais,
    horasMensaisMedia: horasMensais,
    desgasteProjetado: Math.round(desgasteProjetado),
    sustentabilidade: Math.round(sustentabilidade),
    dependencia: Math.round(dependencia),
    riscoDesgaste,
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
    horasPorLancamento = PREMISAS.horasPorModelo.lancamentoIntensivo.medio,
    nivelEstresse = 3,
    nivelDependencia = 4,
  } = inputs;

  const churnDecimal = churnEstimado / 100;

  // Cálculos de lançamento
  const faturamentoAnualLancamento = faturamentoLancamento * frequenciaLancamentos;
  const custoAnualLancamento = custoLancamento * frequenciaLancamentos;
  const lucroAnualLancamento = (faturamentoAnualLancamento - custoAnualLancamento) * PREMISAS.margem.lancamento;
  const margemLancamento = faturamentoAnualLancamento > 0 ? (lucroAnualLancamento / faturamentoAnualLancamento) * 100 : 0;

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
  const margemRecorrencia = faturamentoAnualRecorrencia > 0 ? (lucroAnualRecorrencia / faturamentoAnualRecorrencia) * 100 : 0;

  // Calcular métricas não-financeiras
  const metricasLancamento = calcularMetricasLancamento(
    frequenciaLancamentos,
    horasPorLancamento,
    nivelEstresse,
    nivelDependencia
  );

  const metricasEcossistema = calcularMetricasEcossistema(nivelEstresse, nivelDependencia);

  // Montar comparação de cenários
  const scenarioComparison: ScenarioComparison = {
    lancamento: {
      financial: {
        faturamentoAnual: faturamentoAnualLancamento,
        lucroAnual: Math.round(lucroAnualLancamento),
        margemLiquida: Math.round(margemLancamento),
      },
      nonFinancial: metricasLancamento,
      label: 'Continuar Lancando',
    },
    ecossistema: {
      financial: {
        faturamentoAnual: Math.round(faturamentoAnualRecorrencia),
        lucroAnual: Math.round(lucroAnualRecorrencia),
        margemLiquida: Math.round(margemRecorrencia),
        mrrProjetado: mrrProjetado12Meses,
      },
      nonFinancial: metricasEcossistema,
      label: 'Construir Ecossistema',
    },
    diferencas: {
      lucro: Math.round(lucroAnualRecorrencia - lucroAnualLancamento),
      lucroPercent: lucroAnualLancamento > 0
        ? Math.round(((lucroAnualRecorrencia - lucroAnualLancamento) / lucroAnualLancamento) * 100)
        : 0,
      horas: metricasLancamento.horasAnuais - metricasEcossistema.horasAnuais,
      horasPercent: metricasLancamento.horasAnuais > 0
        ? Math.round(((metricasLancamento.horasAnuais - metricasEcossistema.horasAnuais) / metricasLancamento.horasAnuais) * 100)
        : 0,
      sustentabilidade: metricasEcossistema.sustentabilidade - metricasLancamento.sustentabilidade,
      desgaste: metricasLancamento.desgasteProjetado - metricasEcossistema.desgasteProjetado,
    },
  };

  // Gerar narrativa (atualizada para focar em ecossistema)
  const narrative = gerarNarrativa(
    mesesParaBreakeven,
    conversaoNecessaria,
    scenarioComparison
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
    scenarioComparison,
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
  comparison: ScenarioComparison
): { headline: string; mensagem: string; recomendacao: string } {
  const { diferencas } = comparison;
  const lancamento = comparison.lancamento.nonFinancial;
  const ecossistema = comparison.ecossistema.nonFinancial;

  // Determinar headline baseado no risco de desgaste
  if (lancamento.riscoDesgaste === 'critico') {
    return {
      headline: 'Alerta: risco alto de esgotamento',
      mensagem: `Seu nivel de estresse atual projeta ${lancamento.desgasteProjetado}% de desgaste em 12 meses no modelo de lancamentos. O ecossistema pode reduzir isso para ${ecossistema.desgasteProjetado}%.`,
      recomendacao: `Alem de ${diferencas.horasPercent}% menos horas trabalhadas, a transicao traz ${diferencas.sustentabilidade} pontos a mais de sustentabilidade. O breakeven acontece em ${mesesParaBreakeven} meses.`,
    };
  }

  if (mesesParaBreakeven <= 6) {
    return {
      headline: 'Cenario favoravel para transicao',
      mensagem: `Em ${mesesParaBreakeven} meses voce atinge o breakeven com ${conversaoNecessaria}% de conversao. Alem disso, trabalha ${diferencas.horasPercent}% menos horas por ano.`,
      recomendacao: `O modelo de ecossistema oferece ${ecossistema.sustentabilidade}% de sustentabilidade vs ${lancamento.sustentabilidade}% dos lancamentos. Hora de construir sua estrutura.`,
    };
  }

  if (mesesParaBreakeven <= 12) {
    return {
      headline: 'Transicao viavel com planejamento',
      mensagem: `O breakeven acontece em ${mesesParaBreakeven} meses. Voce economizara ${diferencas.horas} horas por ano e reduzira o desgaste projetado de ${lancamento.desgasteProjetado}% para ${ecossistema.desgasteProjetado}%.`,
      recomendacao: 'Considere um modelo hibrido: mantenha 1-2 lancamentos por ano enquanto constroi a base de assinantes do ecossistema.',
    };
  }

  return {
    headline: 'Preparacao necessaria antes da transicao',
    mensagem: `Com os numeros atuais, o breakeven levaria ${mesesParaBreakeven} meses. Mas mesmo assim, o modelo de ecossistema oferece ${diferencas.horasPercent}% menos horas e ${diferencas.sustentabilidade} pontos a mais de sustentabilidade.`,
    recomendacao: 'Antes de transicionar completamente: 1) Cresça a lista, 2) Construa rituais de comunidade, 3) Teste com um produto piloto recorrente.',
  };
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

// Re-export FrequenciaLancamento for convenience
export type { FrequenciaLancamento } from './premisas';
