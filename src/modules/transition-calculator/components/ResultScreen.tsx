import { Button } from '@/design-system/primitives/button';
import {
  ArrowRight,
  Share2,
  Users,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import { useEmbed } from '../contexts/EmbedContext';
import {
  TransitionInputs,
  TransitionOutputs,
  formatarMoeda,
  generateProfileNarrative,
  generateTransitionInsights,
} from '../lib/calculateTransition';
import {
  ScenarioHero,
  ScenarioVisualization,
  TransitionTimeline,
} from './ScenarioVisualization';

interface ResultScreenProps {
  inputs: TransitionInputs;
  outputs: TransitionOutputs;
  onShare: () => void;
  onCTA: () => void;
}

export function ResultScreen({ outputs, onShare, onCTA }: ResultScreenProps) {
  const { isEmbed } = useEmbed();
  const { scenarioComparison, narrative } = outputs;
  const { lancamento, ecossistema, diferencas } = scenarioComparison;

  // Gerar narrativa personalizada baseada no perfil
  const profileNarrative = generateProfileNarrative(
    lancamento.nonFinancial.riscoDesgaste,
    outputs.mesesParaBreakeven,
    diferencas
  );

  // Gerar insights
  const insights = generateTransitionInsights(
    scenarioComparison,
    outputs.mesesParaBreakeven
  );

  // Calcular metricas de impacto
  const horasRecuperadas = diferencas.horas;
  const semanasRecuperadas = Math.floor(horasRecuperadas / 40);

  return (
    <div
      className={cn(
        'bg-kosmos-black blueprint-grid flex flex-col items-center px-4 relative overflow-hidden',
        isEmbed ? 'min-h-0 py-6' : 'min-h-screen py-8'
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kosmos-orange/30 to-transparent" />

      <div className="w-full max-w-3xl space-y-8 relative z-10">
        {/* ============================================ */}
        {/* HERO SECTION */}
        {/* ============================================ */}
        <div className="text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-kosmos-orange/10 border border-kosmos-orange/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-kosmos-orange" />
            <span className="text-kosmos-orange text-sm font-medium">
              Simulacao Completa
            </span>
          </div>

          {/* Headline Emocional */}
          <h1 className="font-display text-2xl md:text-3xl font-bold text-kosmos-white mb-4 leading-tight">
            {profileNarrative.headline}
          </h1>

          {/* Story */}
          <p className="text-kosmos-gray-light text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {profileNarrative.story}
          </p>

          {/* Urgency (se houver) */}
          {profileNarrative.urgency && (
            <p className="text-orange-400 text-sm mt-4 max-w-lg mx-auto">
              {profileNarrative.urgency}
            </p>
          )}
        </div>

        {/* ============================================ */}
        {/* COMPARACAO VISUAL DRAMATICA */}
        {/* ============================================ */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <ScenarioHero comparison={scenarioComparison} />
        </div>

        {/* ============================================ */}
        {/* TIMELINE DE TRANSICAO */}
        {/* ============================================ */}
        <div
          className="card-structural p-6 animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          <h3 className="text-kosmos-white font-display font-semibold text-lg mb-6 text-center">
            Sua Jornada de Transicao
          </h3>

          <TransitionTimeline
            mesesParaBreakeven={outputs.mesesParaBreakeven}
            className="mb-6"
          />

          {/* Breakeven Highlight */}
          <div className="text-center p-4 bg-kosmos-orange/10 border border-kosmos-orange/20 rounded-lg">
            <p className="text-kosmos-orange text-lg font-semibold">
              Breakeven no mes {outputs.mesesParaBreakeven}
            </p>
            <p className="text-kosmos-gray text-sm mt-1">
              {outputs.assinantesNecessarios.toLocaleString('pt-BR')} assinantes
              necessarios
            </p>
          </div>
        </div>

        {/* ============================================ */}
        {/* INSIGHTS RAPIDOS */}
        {/* ============================================ */}
        {insights.length > 0 && (
          <div
            className="space-y-3 animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            <h3 className="text-kosmos-white font-display font-semibold text-base mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-kosmos-orange" />
              O Que Isso Significa Para Voce
            </h3>

            {insights.map((insight, index) => (
              <div
                key={index}
                className="card-structural p-4 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-kosmos-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-kosmos-orange text-xs font-bold">
                    {index + 1}
                  </span>
                </div>
                <p className="text-kosmos-gray-light text-sm">{insight}</p>
              </div>
            ))}
          </div>
        )}

        {/* ============================================ */}
        {/* DETALHAMENTO DE METRICAS */}
        {/* ============================================ */}
        <div
          className="card-structural p-6 animate-fade-in"
          style={{ animationDelay: '500ms' }}
        >
          <h3 className="text-kosmos-white font-display font-semibold text-base mb-4">
            Comparacao Detalhada
          </h3>

          <ScenarioVisualization comparison={scenarioComparison} />
        </div>

        {/* ============================================ */}
        {/* METRICAS CHAVE */}
        {/* ============================================ */}
        <div
          className="grid grid-cols-3 gap-4 animate-fade-in"
          style={{ animationDelay: '600ms' }}
        >
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
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              +{semanasRecuperadas}
            </p>
            <p className="text-xs text-kosmos-gray">Semanas livres/ano</p>
          </div>
        </div>

        {/* ============================================ */}
        {/* FINANCEIRO RESUMIDO */}
        {/* ============================================ */}
        <div
          className="card-structural p-6 animate-fade-in"
          style={{ animationDelay: '700ms' }}
        >
          <h3 className="text-kosmos-white font-display font-semibold text-base mb-4">
            Projecao Financeira (12 meses)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Lancamentos */}
            <div className="bg-kosmos-black/50 rounded-lg p-4">
              <p className="text-kosmos-gray text-xs mb-2">Lancamentos</p>
              <p className="text-xl font-bold text-kosmos-white mb-1">
                {formatarMoeda(lancamento.financial.lucroAnual)}
              </p>
              <p className="text-kosmos-gray text-xs">
                Faturamento: {formatarMoeda(lancamento.financial.faturamentoAnual)}
              </p>
            </div>

            {/* Ecossistema */}
            <div className="bg-kosmos-orange/5 border border-kosmos-orange/20 rounded-lg p-4">
              <p className="text-kosmos-orange text-xs mb-2">Ecossistema</p>
              <p className="text-xl font-bold text-kosmos-orange mb-1">
                {formatarMoeda(ecossistema.financial.lucroAnual)}
              </p>
              <p className="text-kosmos-gray text-xs">
                MRR projetado: {formatarMoeda(ecossistema.financial.mrrProjetado)}/mes
              </p>
            </div>
          </div>

          {/* Diferenca */}
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
            <p className="text-emerald-400 text-sm font-medium">
              {diferencas.lucro >= 0 ? '+' : ''}
              {formatarMoeda(diferencas.lucro)} de lucro com ecossistema
              {diferencas.lucroPercent > 0 && (
                <span className="text-emerald-300 ml-2">
                  (+{diferencas.lucroPercent}%)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* ============================================ */}
        {/* ESTRATEGIA */}
        {/* ============================================ */}
        <div
          className="card-structural p-6 border-l-4 border-l-kosmos-orange animate-fade-in"
          style={{ animationDelay: '800ms' }}
        >
          <h3 className="text-kosmos-orange font-display font-semibold text-base mb-3">
            Sua Estrategia
          </h3>
          <p className="text-kosmos-gray-light leading-relaxed">
            {profileNarrative.strategy}
          </p>
          <p className="text-kosmos-gray text-sm mt-4 italic">
            {profileNarrative.emotion}
          </p>
        </div>

        {/* ============================================ */}
        {/* CTAs */}
        {/* ============================================ */}
        <div
          className="space-y-3 animate-fade-in"
          style={{ animationDelay: '900ms' }}
        >
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
            className="w-full h-12 border-border hover:border-kosmos-orange/50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar Simulacao
          </Button>
        </div>

        {/* Footer */}
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
