/**
 * Automatic qualitative analysis generation for benchmarks (US-4.5)
 * Template-based text generation based on scores and market data.
 */

import type { MarketBenchmarks, IndividualPercentile, PillarStats } from './benchmarkTypes';
import type { AuditResult } from './auditQuestions';

/** Market data that has been validated to contain pillar stats */
type MarketWithData = MarketBenchmarks & {
  causa: PillarStats;
  cultura: PillarStats;
  economia: PillarStats;
  total: PillarStats;
};

interface PillarAnalysis {
  name: string;
  nameLabel: string;
  score: number;
  marketAvg: number;
  percentile: number;
  p90: number;
}

function getPillarAnalyses(
  result: AuditResult,
  market: MarketWithData,
  percentiles: IndividualPercentile,
): PillarAnalysis[] {
  return [
    {
      name: 'causa',
      nameLabel: 'Causa',
      score: result.scoreCausa,
      marketAvg: market.causa.avg,
      percentile: percentiles.percentile_causa,
      p90: market.causa.p90,
    },
    {
      name: 'cultura',
      nameLabel: 'Cultura',
      score: result.scoreCultura,
      marketAvg: market.cultura.avg,
      percentile: percentiles.percentile_cultura,
      p90: market.cultura.p90,
    },
    {
      name: 'economia',
      nameLabel: 'Economia',
      score: result.scoreEconomia,
      marketAvg: market.economia.avg,
      percentile: percentiles.percentile_economia,
      p90: market.economia.p90,
    },
  ];
}

function getClassificationLabel(classification: AuditResult['classification']): string {
  const labels = {
    inquilino: 'Inquilino do Algoritmo',
    gerente: 'Gerente de Audiência',
    arquiteto: 'Arquiteto de Comunidade',
    dono: 'Dono de Ecossistema',
  };
  return labels[classification];
}

/**
 * Generates a 3-5 sentence qualitative analysis paragraph
 */
export function generateQualitativeAnalysis(
  result: AuditResult,
  market: MarketWithData,
  percentiles: IndividualPercentile,
): string {
  const pillars = getPillarAnalyses(result, market, percentiles);
  const classLabel = getClassificationLabel(result.classification);
  const totalPercentile = percentiles.percentile_total;

  // Find strongest and weakest pillars
  const sorted = [...pillars].sort((a, b) => b.percentile - a.percentile);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  // Opening: classification + market position
  const opening = `Sua comunidade est\u00e1 classificada como ${classLabel}, posicionada no percentil ${totalPercentile} do mercado.`;

  // Highlight: strongest pillar
  let highlight: string;
  if (strongest.percentile >= 75) {
    highlight = `Seu pilar ${strongest.nameLabel} \u00e9 destaque (${strongest.score.toFixed(1)}), colocando voc\u00ea \u00e0 frente de ${strongest.percentile}% das comunidades analisadas.`;
  } else {
    highlight = `Seu pilar mais forte \u00e9 ${strongest.nameLabel} (${strongest.score.toFixed(1)}), posicionado no percentil ${strongest.percentile}.`;
  }

  // Opportunity: weakest pillar
  let opportunity: string;
  if (weakest.score < weakest.marketAvg) {
    const gap = weakest.marketAvg - weakest.score;
    opportunity = `O maior potencial de crescimento est\u00e1 em ${weakest.nameLabel} (${weakest.score.toFixed(1)}), onde comunidades similares alcan\u00e7am em m\u00e9dia ${weakest.marketAvg.toFixed(1)} \u2014 um gap de ${gap.toFixed(1)} pontos.`;
  } else {
    opportunity = `Mesmo seu pilar mais baixo, ${weakest.nameLabel} (${weakest.score.toFixed(1)}), est\u00e1 acima da m\u00e9dia de mercado (${weakest.marketAvg.toFixed(1)}).`;
  }

  // Closing: financial impact projection
  let closing: string;
  if (result.lucroOculto > 50000) {
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(result.lucroOculto);
    closing = `Fechar esses gaps pode destravar at\u00e9 ${formatted}/ano em receita n\u00e3o capturada.`;
  } else if (totalPercentile >= 75) {
    closing = `Voc\u00ea est\u00e1 entre as comunidades mais bem posicionadas do ecossistema \u2014 foque em manter e ampliar suas vantagens.`;
  } else {
    closing = `Com ajustes estrat\u00e9gicos nos pilares abaixo da m\u00e9dia, seu posicionamento pode avan\u00e7ar significativamente.`;
  }

  return `${opening} ${highlight} ${opportunity} ${closing}`;
}
