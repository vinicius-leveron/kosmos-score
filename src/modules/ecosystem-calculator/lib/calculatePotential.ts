import { PREMISAS, ModeloAtual, TamanhoEquipe } from './premisas';

export interface CalculatorInputs {
  faturamentoAtual: number; // R$/mês
  modeloAtual: ModeloAtual;
  tamanhoAudiencia: number;
  ticketMedio: number; // R$
  horasTrabalhadas: number; // horas/semana
  equipe: TamanhoEquipe;
}

export interface CalculatorOutputs {
  // Resultados principais
  potencialEcossistema: number;
  potencialMensal: number;
  potencialAnual: number;
  gapAtual: number;
  gapPercentual: number;

  // Eficiência
  faturamentoPorHoraAtual: number;
  faturamentoPorHoraPotencial: number;
  aumentoEficiencia: number;

  // Breakdown
  potencialProdutoEntrada: number;
  potencialRecorrencia: number;
  potencialHighTicket: number;
  potencialComunidade: number;

  // Metadata
  nivelGap: 'baixo' | 'medio' | 'alto' | 'muito_alto';
  narrative: {
    headline: string;
    mensagem: string;
    ctaTexto: string;
  };
}

/**
 * Calcula o potencial de faturamento com modelo de ecossistema
 */
export function calculatePotential(inputs: CalculatorInputs): CalculatorOutputs {
  const {
    faturamentoAtual,
    modeloAtual,
    tamanhoAudiencia,
    ticketMedio,
    horasTrabalhadas,
    equipe,
  } = inputs;

  // Multiplicadores base
  const modeloMult = PREMISAS.modeloMultiplicador[modeloAtual] || 1.0;
  const equipeMult = PREMISAS.equipeMultiplicador[equipe] || 1.0;

  // Cálculo do potencial de monetização da audiência
  const potencialConversao = tamanhoAudiencia * PREMISAS.taxaConversaoAudiencia.media;
  const ticketEcossistema = ticketMedio * PREMISAS.aumentoTicketEcossistema.medio;

  // Breakdown por tipo de produto no ecossistema
  const potencialProdutoEntrada = potencialConversao * (ticketMedio * 0.3) * 0.7; // 70% compram entrada
  const potencialRecorrencia = potencialConversao * 0.4 * (ticketMedio * 0.5) * 12 / 12; // 40% viram recorrentes
  const potencialHighTicket = potencialConversao * 0.1 * (ticketMedio * 3); // 10% compram HT
  const potencialComunidade = potencialConversao * 0.2 * (ticketMedio * 0.8) * 6 / 12; // 20% comunidade 6 meses

  // Potencial total do ecossistema
  const potencialBase =
    potencialProdutoEntrada +
    potencialRecorrencia +
    potencialHighTicket +
    potencialComunidade;

  // Aplicar multiplicadores
  const potencialAjustado = potencialBase * modeloMult * equipeMult;

  // Aumentar pelo LTV (clientes existentes comprando mais)
  const potencialComLTV = potencialAjustado * PREMISAS.ltvMultiplicador;

  // Potencial mensal final
  const potencialMensal = Math.round(potencialComLTV);
  const potencialAnual = potencialMensal * 12;

  // Gap
  const gapAtual = Math.max(0, potencialMensal - faturamentoAtual);
  const gapPercentual = faturamentoAtual > 0
    ? Math.round((gapAtual / faturamentoAtual) * 100)
    : 100;

  // Eficiência
  const horasMensais = horasTrabalhadas * 4;
  const faturamentoPorHoraAtual = horasMensais > 0
    ? Math.round(faturamentoAtual / horasMensais)
    : 0;

  const horasEcossistema = Math.round(horasMensais * PREMISAS.eficienciaEcossistema);
  const faturamentoPorHoraPotencial = horasEcossistema > 0
    ? Math.round(potencialMensal / horasEcossistema)
    : 0;

  const aumentoEficiencia = faturamentoPorHoraAtual > 0
    ? Math.round(((faturamentoPorHoraPotencial - faturamentoPorHoraAtual) / faturamentoPorHoraAtual) * 100)
    : 0;

  // Determinar nível do gap e narrativa
  const nivelGap = determinarNivelGap(gapAtual);
  const narrative = gerarNarrativa(nivelGap, gapAtual, faturamentoAtual);

  return {
    potencialEcossistema: potencialMensal,
    potencialMensal,
    potencialAnual,
    gapAtual,
    gapPercentual,
    faturamentoPorHoraAtual,
    faturamentoPorHoraPotencial,
    aumentoEficiencia,
    potencialProdutoEntrada: Math.round(potencialProdutoEntrada),
    potencialRecorrencia: Math.round(potencialRecorrencia),
    potencialHighTicket: Math.round(potencialHighTicket),
    potencialComunidade: Math.round(potencialComunidade),
    nivelGap,
    narrative,
  };
}

function determinarNivelGap(gap: number): 'baixo' | 'medio' | 'alto' | 'muito_alto' {
  if (gap < PREMISAS.faixasGap.baixo) return 'baixo';
  if (gap < PREMISAS.faixasGap.medio) return 'medio';
  if (gap < PREMISAS.faixasGap.alto) return 'alto';
  return 'muito_alto';
}

function gerarNarrativa(
  nivel: 'baixo' | 'medio' | 'alto' | 'muito_alto',
  gap: number,
  faturamentoAtual: number
): { headline: string; mensagem: string; ctaTexto: string } {
  const gapFormatado = formatarMoeda(gap);

  const narrativas = {
    baixo: {
      headline: 'Seu modelo atual está bem posicionado',
      mensagem: `Você está deixando cerca de ${gapFormatado} na mesa por mês. Embora seu modelo atual funcione, um ecossistema estruturado pode otimizar ainda mais seus resultados com menos esforço.`,
      ctaTexto: 'Descobrir como otimizar',
    },
    medio: {
      headline: 'Há dinheiro significativo sendo deixado na mesa',
      mensagem: `Você está deixando aproximadamente ${gapFormatado} por mês que poderiam ser capturados com um modelo de ecossistema. Isso representa uma oportunidade real de crescimento sem aumentar sua carga de trabalho.`,
      ctaTexto: 'Quero capturar esse potencial',
    },
    alto: {
      headline: 'O potencial inexplorado do seu negócio é enorme',
      mensagem: `Você está deixando cerca de ${gapFormatado} na mesa mensalmente. Seu negócio tem uma base sólida que poderia gerar muito mais valor com a estrutura certa de ecossistema.`,
      ctaTexto: 'Quero estruturar meu ecossistema',
    },
    muito_alto: {
      headline: 'Você está sentado em uma mina de ouro',
      mensagem: `Você está deixando mais de ${gapFormatado} por mês. Sua audiência e posicionamento têm um potencial massivo que está sendo subaproveitado. É hora de estruturar isso de forma estratégica.`,
      ctaTexto: 'Quero destravar esse potencial agora',
    },
  };

  return narrativas[nivel];
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
