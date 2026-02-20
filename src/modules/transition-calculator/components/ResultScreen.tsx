import { Button } from '@/design-system/primitives/button';
import { TrendingUp, ArrowRight, Share2, Users, Calendar, DollarSign } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { TransitionInputs, TransitionOutputs, formatarMoeda } from '../lib/calculateTransition';

interface ResultScreenProps {
  inputs: TransitionInputs;
  outputs: TransitionOutputs;
  onShare: () => void;
  onCTA: () => void;
}

export function ResultScreen({ inputs, outputs, onShare, onCTA }: ResultScreenProps) {
  const { isEmbed } = useEmbed();

  // Chart data for timeline
  const maxValue = Math.max(
    ...outputs.projecao12Meses.map((p) => Math.max(p.acumuladoRecorrencia, p.acumuladoLancamento))
  );

  return (
    <div className={cn(
      "bg-kosmos-black blueprint-grid flex flex-col items-center px-4 relative overflow-hidden",
      isEmbed ? "min-h-0 py-6" : "min-h-screen py-8"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="w-full max-w-2xl animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            <span className="text-cyan-500 text-sm font-medium">
              Projecao Completa
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-kosmos-white mb-2">
            {outputs.narrative.headline}
          </h1>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card-structural p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-kosmos-white">
              {outputs.assinantesNecessarios.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-kosmos-gray">Assinantes para breakeven</p>
          </div>

          <div className="card-structural p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-kosmos-white">
              {outputs.mesesParaBreakeven}
            </p>
            <p className="text-xs text-kosmos-gray">Meses para breakeven</p>
          </div>

          <div className="card-structural p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-5 h-5 text-cyan-500" />
            </div>
            <p className="text-2xl font-bold text-kosmos-white">
              {formatarMoeda(outputs.ltv)}
            </p>
            <p className="text-xs text-kosmos-gray">LTV por assinante</p>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="card-structural p-6 mb-6">
          <h3 className="font-medium text-kosmos-white mb-4">Projecao de 12 Meses</h3>

          <div className="space-y-2">
            {/* Legend */}
            <div className="flex justify-end gap-4 text-xs mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-cyan-500" />
                <span className="text-kosmos-gray">Recorrencia</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-kosmos-gray/50" />
                <span className="text-kosmos-gray">Lancamentos</span>
              </div>
            </div>

            {/* Chart */}
            <div className="relative h-40 flex items-end gap-1">
              {outputs.projecao12Meses.map((p, i) => {
                const recHeight = (p.acumuladoRecorrencia / maxValue) * 100;
                const lanHeight = (p.acumuladoLancamento / maxValue) * 100;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex-1 w-full flex items-end gap-0.5">
                      <div
                        className="flex-1 bg-cyan-500/80 rounded-t transition-all duration-300"
                        style={{ height: `${recHeight}%` }}
                        title={`Rec: ${formatarMoeda(p.acumuladoRecorrencia)}`}
                      />
                      <div
                        className="flex-1 bg-kosmos-gray/30 rounded-t transition-all duration-300"
                        style={{ height: `${lanHeight}%` }}
                        title={`Lan: ${formatarMoeda(p.acumuladoLancamento)}`}
                      />
                    </div>
                    <span className="text-[10px] text-kosmos-gray">M{p.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakeven marker */}
          {outputs.mesesParaBreakeven <= 12 && (
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-center">
              <p className="text-cyan-400 text-sm">
                Breakeven no mes {outputs.mesesParaBreakeven}:{' '}
                <span className="font-medium">
                  {formatarMoeda(outputs.projecao12Meses[outputs.mesesParaBreakeven - 1]?.acumuladoRecorrencia || 0)}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Comparison Table */}
        <div className="card-structural p-6 mb-6">
          <h3 className="font-medium text-kosmos-white mb-4">Comparativo Anual</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-kosmos-black rounded-lg">
              <p className="text-xs text-kosmos-gray uppercase mb-2">Lancamentos</p>
              <p className="text-lg font-bold text-kosmos-white">
                {formatarMoeda(outputs.faturamentoAnualLancamento)}
              </p>
              <p className="text-sm text-kosmos-gray">
                Lucro: {formatarMoeda(outputs.lucroAnualLancamento)}
              </p>
            </div>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <p className="text-xs text-cyan-400 uppercase mb-2">Recorrencia</p>
              <p className="text-lg font-bold text-cyan-500">
                {formatarMoeda(outputs.faturamentoAnualRecorrencia)}
              </p>
              <p className="text-sm text-cyan-400/70">
                Lucro: {formatarMoeda(outputs.lucroAnualRecorrencia)}
              </p>
            </div>
          </div>
        </div>

        {/* Narrative */}
        <div className="card-structural p-6 mb-6 border-l-4 border-l-cyan-500">
          <p className="text-kosmos-gray-light leading-relaxed mb-3">
            {outputs.narrative.mensagem}
          </p>
          <p className="text-cyan-400 text-sm">
            {outputs.narrative.recomendacao}
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={onCTA}
            size="lg"
            className="w-full h-14 text-base font-display font-semibold bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Quero Ajuda na Transicao
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            onClick={onShare}
            variant="outline"
            size="lg"
            className="w-full h-12"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar Resultado
          </Button>
        </div>

        {!isEmbed && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-kosmos-gray/40 text-xs">
              <div className="w-4 h-px bg-kosmos-gray/20" />
              <span>Powered by KOSMOS</span>
              <div className="w-4 h-px bg-kosmos-gray/20" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
    </div>
  );
}
