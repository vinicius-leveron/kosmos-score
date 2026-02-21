import { Button } from '@/design-system/primitives/button';
import {
  TrendingUp,
  ArrowRight,
  Share2,
  Users,
  Calendar,
  Clock,
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import { TransitionInputs, TransitionOutputs, formatarMoeda } from '../lib/calculateTransition';

interface ResultScreenProps {
  inputs: TransitionInputs;
  outputs: TransitionOutputs;
  onShare: () => void;
  onCTA: () => void;
}

function getRiskColor(risk: 'baixo' | 'moderado' | 'alto' | 'critico'): string {
  const colors = {
    baixo: 'text-green-500',
    moderado: 'text-yellow-500',
    alto: 'text-orange-500',
    critico: 'text-red-500',
  };
  return colors[risk];
}

function getRiskBgColor(risk: 'baixo' | 'moderado' | 'alto' | 'critico'): string {
  const colors = {
    baixo: 'bg-green-500/10 border-green-500/20',
    moderado: 'bg-yellow-500/10 border-yellow-500/20',
    alto: 'bg-orange-500/10 border-orange-500/20',
    critico: 'bg-red-500/10 border-red-500/20',
  };
  return colors[risk];
}

export function ResultScreen({ outputs, onShare, onCTA }: ResultScreenProps) {
  const { isEmbed } = useEmbed();
  const { scenarioComparison, narrative } = outputs;
  const { lancamento, ecossistema, diferencas } = scenarioComparison;

  // Chart data for timeline
  const maxValue = Math.max(
    ...outputs.projecao12Meses.map((p) => Math.max(p.acumuladoRecorrencia, p.acumuladoLancamento))
  );

  return (
    <div className={cn(
      "bg-kosmos-black blueprint-grid flex flex-col items-center px-4 relative overflow-hidden",
      isEmbed ? "min-h-0 py-6" : "min-h-screen py-8"
    )}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      <div className="w-full max-w-3xl animate-fade-in relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-kosmos-orange/10 border border-kosmos-orange/20 rounded-full mb-4">
            <TrendingUp className="w-4 h-4 text-kosmos-orange" />
            <span className="text-kosmos-orange text-sm font-medium">
              Simulacao Completa
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-kosmos-white mb-2">
            {narrative.headline}
          </h1>
        </div>

        {/* Side-by-Side Scenario Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Cenário A: Lançamentos */}
          <div className="card-structural p-5 border-kosmos-gray/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-kosmos-gray/50" />
              <h3 className="font-medium text-kosmos-gray-light text-sm uppercase tracking-wide">
                {lancamento.label}
              </h3>
            </div>

            {/* Financial */}
            <div className="space-y-3 mb-4 pb-4 border-b border-border">
              <div>
                <p className="text-2xl font-bold text-kosmos-white">
                  {formatarMoeda(lancamento.financial.lucroAnual)}
                </p>
                <p className="text-xs text-kosmos-gray">Lucro anual projetado</p>
              </div>
              <div className="text-sm text-kosmos-gray">
                Faturamento: {formatarMoeda(lancamento.financial.faturamentoAnual)}
              </div>
            </div>

            {/* Non-Financial */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-kosmos-gray" />
                  <span className="text-sm text-kosmos-gray">Horas/ano</span>
                </div>
                <span className="text-sm font-medium text-kosmos-white">
                  {lancamento.nonFinancial.horasAnuais}h
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-kosmos-gray" />
                  <span className="text-sm text-kosmos-gray">Desgaste</span>
                </div>
                <span className={cn("text-sm font-medium", getRiskColor(lancamento.nonFinancial.riscoDesgaste))}>
                  {lancamento.nonFinancial.desgasteProjetado}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-kosmos-gray" />
                  <span className="text-sm text-kosmos-gray">Sustentabilidade</span>
                </div>
                <span className="text-sm font-medium text-kosmos-white">
                  {lancamento.nonFinancial.sustentabilidade}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-kosmos-gray" />
                  <span className="text-sm text-kosmos-gray">Dependencia</span>
                </div>
                <span className="text-sm font-medium text-kosmos-white">
                  {lancamento.nonFinancial.dependencia}%
                </span>
              </div>
            </div>

            {/* Risk Badge */}
            <div className={cn("mt-4 p-2 rounded-lg border text-center", getRiskBgColor(lancamento.nonFinancial.riscoDesgaste))}>
              <p className={cn("text-xs font-medium", getRiskColor(lancamento.nonFinancial.riscoDesgaste))}>
                Risco de esgotamento: {lancamento.nonFinancial.riscoDesgaste}
              </p>
            </div>
          </div>

          {/* Cenário B: Ecossistema */}
          <div className="card-structural p-5 border-kosmos-orange/30 bg-gradient-to-br from-kosmos-orange/5 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-kosmos-orange" />
              <h3 className="font-medium text-kosmos-orange text-sm uppercase tracking-wide">
                {ecossistema.label}
              </h3>
            </div>

            {/* Financial */}
            <div className="space-y-3 mb-4 pb-4 border-b border-kosmos-orange/20">
              <div>
                <p className="text-2xl font-bold text-kosmos-orange">
                  {formatarMoeda(ecossistema.financial.lucroAnual)}
                </p>
                <p className="text-xs text-kosmos-gray">Lucro anual projetado</p>
              </div>
              <div className="text-sm text-kosmos-gray">
                MRR projetado: {formatarMoeda(ecossistema.financial.mrrProjetado)}/mes
              </div>
            </div>

            {/* Non-Financial */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-kosmos-orange" />
                  <span className="text-sm text-kosmos-gray">Horas/ano</span>
                </div>
                <span className="text-sm font-medium text-kosmos-orange">
                  {ecossistema.nonFinancial.horasAnuais}h
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-kosmos-orange" />
                  <span className="text-sm text-kosmos-gray">Desgaste</span>
                </div>
                <span className={cn("text-sm font-medium", getRiskColor(ecossistema.nonFinancial.riscoDesgaste))}>
                  {ecossistema.nonFinancial.desgasteProjetado}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-kosmos-orange" />
                  <span className="text-sm text-kosmos-gray">Sustentabilidade</span>
                </div>
                <span className="text-sm font-medium text-kosmos-orange">
                  {ecossistema.nonFinancial.sustentabilidade}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-kosmos-orange" />
                  <span className="text-sm text-kosmos-gray">Dependencia</span>
                </div>
                <span className="text-sm font-medium text-kosmos-orange">
                  {ecossistema.nonFinancial.dependencia}%
                </span>
              </div>
            </div>

            {/* Risk Badge */}
            <div className={cn("mt-4 p-2 rounded-lg border text-center", getRiskBgColor(ecossistema.nonFinancial.riscoDesgaste))}>
              <p className={cn("text-xs font-medium", getRiskColor(ecossistema.nonFinancial.riscoDesgaste))}>
                Risco de esgotamento: {ecossistema.nonFinancial.riscoDesgaste}
              </p>
            </div>
          </div>
        </div>

        {/* Differences Summary */}
        <div className="card-structural p-4 mb-6">
          <h3 className="font-medium text-kosmos-white mb-3 text-sm">O que muda com o ecossistema:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-kosmos-black rounded-lg">
              <p className={cn("text-lg font-bold", diferencas.lucro >= 0 ? "text-green-500" : "text-red-500")}>
                {diferencas.lucro >= 0 ? '+' : ''}{formatarMoeda(diferencas.lucro)}
              </p>
              <p className="text-xs text-kosmos-gray">Lucro/ano</p>
            </div>
            <div className="text-center p-3 bg-kosmos-black rounded-lg">
              <p className="text-lg font-bold text-green-500">
                -{diferencas.horas}h
              </p>
              <p className="text-xs text-kosmos-gray">Horas/ano</p>
            </div>
            <div className="text-center p-3 bg-kosmos-black rounded-lg">
              <p className="text-lg font-bold text-green-500">
                +{diferencas.sustentabilidade}pts
              </p>
              <p className="text-xs text-kosmos-gray">Sustentabilidade</p>
            </div>
            <div className="text-center p-3 bg-kosmos-black rounded-lg">
              <p className="text-lg font-bold text-green-500">
                -{diferencas.desgaste}%
              </p>
              <p className="text-xs text-kosmos-gray">Desgaste</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card-structural p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-kosmos-orange/10 flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-kosmos-orange" />
            </div>
            <p className="text-2xl font-bold text-kosmos-white">
              {outputs.assinantesNecessarios.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-kosmos-gray">Assinantes para breakeven</p>
          </div>

          <div className="card-structural p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-kosmos-orange/10 flex items-center justify-center mx-auto mb-2">
              <Calendar className="w-5 h-5 text-kosmos-orange" />
            </div>
            <p className="text-2xl font-bold text-kosmos-white">
              {outputs.mesesParaBreakeven}
            </p>
            <p className="text-xs text-kosmos-gray">Meses para breakeven</p>
          </div>

          <div className="card-structural p-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-kosmos-orange/10 flex items-center justify-center mx-auto mb-2">
              {lancamento.nonFinancial.riscoDesgaste === 'critico' ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-kosmos-orange" />
              )}
            </div>
            <p className={cn(
              "text-2xl font-bold",
              lancamento.nonFinancial.riscoDesgaste === 'critico' ? "text-red-500" : "text-kosmos-white"
            )}>
              {lancamento.nonFinancial.riscoDesgaste === 'critico' ? 'Alerta' : 'Viavel'}
            </p>
            <p className="text-xs text-kosmos-gray">Status da transicao</p>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="card-structural p-6 mb-6">
          <h3 className="font-medium text-kosmos-white mb-4">Projecao de 12 Meses</h3>

          <div className="space-y-2">
            {/* Legend */}
            <div className="flex justify-end gap-4 text-xs mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-kosmos-orange" />
                <span className="text-kosmos-gray">Ecossistema</span>
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
                        className="flex-1 bg-kosmos-orange/80 rounded-t transition-all duration-300"
                        style={{ height: `${recHeight}%` }}
                        title={`Ecossistema: ${formatarMoeda(p.acumuladoRecorrencia)}`}
                      />
                      <div
                        className="flex-1 bg-kosmos-gray/30 rounded-t transition-all duration-300"
                        style={{ height: `${lanHeight}%` }}
                        title={`Lancamentos: ${formatarMoeda(p.acumuladoLancamento)}`}
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
            <div className="mt-4 p-3 bg-kosmos-orange/10 border border-kosmos-orange/20 rounded-lg text-center">
              <p className="text-kosmos-orange text-sm">
                Breakeven no mes {outputs.mesesParaBreakeven}:{' '}
                <span className="font-medium">
                  {formatarMoeda(outputs.projecao12Meses[outputs.mesesParaBreakeven - 1]?.acumuladoRecorrencia || 0)}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Narrative */}
        <div className="card-structural p-6 mb-6 border-l-4 border-l-kosmos-orange">
          <p className="text-kosmos-gray-light leading-relaxed mb-3">
            {narrative.mensagem}
          </p>
          <p className="text-kosmos-orange text-sm">
            {narrative.recomendacao}
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={onCTA}
            size="lg"
            className="w-full h-14 text-base font-display font-semibold bg-kosmos-orange hover:bg-kosmos-orange-glow glow-orange-subtle hover:glow-orange text-white"
          >
            Quero Construir Meu Ecossistema
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            onClick={onShare}
            variant="outline"
            size="lg"
            className="w-full h-12"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar Simulacao
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

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />
    </div>
  );
}
