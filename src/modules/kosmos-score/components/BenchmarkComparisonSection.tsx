/**
 * BenchmarkComparisonSection - "Como voc\u00ea se compara" section for ResultScreen
 * Displays market comparison data for the lead's audit result (US-3.1, US-6.1)
 */

import { cn } from '@/design-system/lib/utils';
import type { MarketBenchmarks, IndividualPercentile, PillarStats } from '../lib/benchmarkTypes';
import type { AuditResult } from '../lib/auditQuestions';
import { generateQualitativeAnalysis } from '../lib/benchmarkInsights';
import { PILLAR_CONFIG } from '../lib/chartConfig';

/** This component only renders when market has pillar data (validated by parent) */
type MarketWithData = MarketBenchmarks & {
  causa: PillarStats;
  cultura: PillarStats;
  economia: PillarStats;
  total: PillarStats;
};

interface BenchmarkComparisonSectionProps {
  result: AuditResult;
  market: MarketWithData;
  percentiles: IndividualPercentile;
}

function PercentileSummaryBar({ percentile, totalCount }: { percentile: number; totalCount: number }) {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <span className="font-display text-3xl md:text-4xl font-bold text-kosmos-orange">
          {percentile}%
        </span>
        <p className="text-kosmos-gray-light text-sm mt-1">
          das comunidades analisadas ficaram atr\u00e1s de voc\u00ea
        </p>
      </div>

      {/* Percentile bar */}
      <div
        className="relative h-3 bg-kosmos-black-light rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percentile}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Seu percentil: ${percentile}% das comunidades ficaram atr\u00e1s de voc\u00ea`}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-kosmos-orange/80 to-kosmos-orange transition-all duration-1000"
          style={{ width: `${percentile}%` }}
        />
        {/* Position marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 border-kosmos-orange shadow-lg z-10"
          style={{ left: `calc(${percentile}% - 7px)` }}
        />
      </div>

      <p className="text-kosmos-gray text-xs text-center">
        Baseado em {totalCount} comunidades analisadas
      </p>
    </div>
  );
}

interface PillarMiniBarProps {
  label: string;
  score: number;
  marketAvg: number;
  color: string;
}

function PillarMiniBar({ label, score, marketAvg, color }: PillarMiniBarProps) {
  const diff = score - marketAvg;
  const isAbove = diff >= 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-kosmos-gray-light font-medium">{label}</span>
        <span className={cn(
          'font-semibold inline-flex items-center gap-0.5',
          isAbove ? 'text-green-400' : 'text-red-400',
        )}>
          {isAbove ? '\u25B2' : '\u25BC'}{' '}
          {isAbove ? '+' : ''}{Math.round(diff)}
          <span className="sr-only">
            {isAbove ? 'acima' : 'abaixo'} da m\u00e9dia do mercado
          </span>
        </span>
      </div>
      <div
        className="relative h-3 bg-kosmos-black-light rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(score)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: sua pontua\u00e7\u00e3o ${Math.round(score)}, m\u00e9dia do mercado ${Math.round(marketAvg)}`}
      >
        {/* User score */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(score, 100)}%`, backgroundColor: color }}
        />
        {/* Market average marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white/80 z-10"
          style={{ left: `${Math.min(marketAvg, 100)}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-[11px] text-kosmos-gray">
        <span>Voc\u00ea: {Math.round(score)}</span>
        <span>M\u00e9dia: {Math.round(marketAvg)}</span>
      </div>
    </div>
  );
}

export function BenchmarkComparisonSection({ result, market, percentiles }: BenchmarkComparisonSectionProps) {
  const qualitativeAnalysis = generateQualitativeAnalysis(result, market, percentiles);

  return (
    <section aria-labelledby="benchmark-heading" className="card-structural animate-fade-in" style={{ animationDelay: '150ms' }}>
      <div className="p-6 md:p-8">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-5 bg-kosmos-orange rounded-r" aria-hidden="true" />
          <h3 id="benchmark-heading" className="font-display text-sm font-semibold text-kosmos-white tracking-wider">
            COMO VOC\u00ca SE COMPARA
          </h3>
        </div>

        {/* Percentile summary */}
        <div className="mb-8">
          <PercentileSummaryBar
            percentile={percentiles.percentile_total}
            totalCount={market.total_count}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-kosmos-gray mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-2 rounded-full bg-kosmos-orange" aria-hidden="true" />
            <span>Sua pontua\u00e7\u00e3o</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-3 bg-white/80" aria-hidden="true" />
            <span>M\u00e9dia do mercado</span>
          </div>
        </div>

        {/* Pillar comparison bars */}
        <div className="space-y-4 mb-6">
          <PillarMiniBar
            label={PILLAR_CONFIG.causa.fullLabel}
            score={result.scoreCausa}
            marketAvg={market.causa.avg}
            color={PILLAR_CONFIG.causa.color}
          />
          <PillarMiniBar
            label={PILLAR_CONFIG.cultura.fullLabel}
            score={result.scoreCultura}
            marketAvg={market.cultura.avg}
            color={PILLAR_CONFIG.cultura.color}
          />
          <PillarMiniBar
            label={PILLAR_CONFIG.economia.fullLabel}
            score={result.scoreEconomia}
            marketAvg={market.economia.avg}
            color={PILLAR_CONFIG.economia.color}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/30 my-6" />

        {/* Qualitative analysis */}
        <div className="space-y-2">
          <h4 className="text-xs font-display text-kosmos-gray uppercase tracking-wider">
            Resumo do seu posicionamento
          </h4>
          <p className="text-sm text-kosmos-gray-light leading-relaxed">
            {qualitativeAnalysis}
          </p>
        </div>

        {/* Reliability notice */}
        {!market.is_reliable && (
          <div className="flex items-start gap-2 mt-4 p-3 bg-kosmos-black-light/50 rounded-md border border-border/20">
            <p className="text-xs text-kosmos-gray leading-relaxed">
              Benchmark baseado em {market.total_count} respostas.
              A precis\u00e3o aumenta conforme mais criadores completam o diagn\u00f3stico.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
