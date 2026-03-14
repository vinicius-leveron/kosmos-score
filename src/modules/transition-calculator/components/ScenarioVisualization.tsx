// Visualizacao Dramatica: Cenario Lancamentos vs Ecossistema
// Mostra comparacao lado a lado com impacto emocional

import { cn } from '@/design-system/lib/utils';
import {
  Clock,
  Heart,
  Shield,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Zap,
  Coffee,
} from 'lucide-react';
import type { ScenarioComparison } from '../lib/calculateTransition';

interface ScenarioVisualizationProps {
  comparison: ScenarioComparison;
  className?: string;
}

interface ImpactTranslation {
  metric: string;
  lancamento: string;
  ecossistema: string;
  icon: React.ReactNode;
  impactLabel?: string;
}

/**
 * Traduz metricas brutas para impacto na vida real
 */
function translateToLifeImpact(comparison: ScenarioComparison): ImpactTranslation[] {
  const { lancamento, ecossistema, diferencas } = comparison;

  // Horas economizadas traduzidas
  const horasEconomizadas = diferencas.horas;
  const semanasRecuperadas = Math.floor(horasEconomizadas / 40);
  const diasDeFerias = Math.floor(horasEconomizadas / 8);

  return [
    {
      metric: 'Tempo de trabalho',
      lancamento: `${lancamento.nonFinancial.horasAnuais}h/ano`,
      ecossistema: `${ecossistema.nonFinancial.horasAnuais}h/ano`,
      icon: <Clock className="w-5 h-5" />,
      impactLabel:
        horasEconomizadas > 0
          ? `${semanasRecuperadas} semanas de volta`
          : undefined,
    },
    {
      metric: 'Desgaste projetado',
      lancamento: `${lancamento.nonFinancial.desgasteProjetado}%`,
      ecossistema: `${ecossistema.nonFinancial.desgasteProjetado}%`,
      icon: <Heart className="w-5 h-5" />,
      impactLabel:
        diferencas.desgaste > 30
          ? 'Burnout evitado'
          : undefined,
    },
    {
      metric: 'Sustentabilidade',
      lancamento: `${lancamento.nonFinancial.sustentabilidade}%`,
      ecossistema: `${ecossistema.nonFinancial.sustentabilidade}%`,
      icon: <Shield className="w-5 h-5" />,
      impactLabel:
        ecossistema.nonFinancial.sustentabilidade >= 70
          ? 'Negocio solido'
          : undefined,
    },
    {
      metric: 'Dependencia de voce',
      lancamento: `${lancamento.nonFinancial.dependencia}%`,
      ecossistema: `${ecossistema.nonFinancial.dependencia}%`,
      icon: <Users className="w-5 h-5" />,
      impactLabel:
        ecossistema.nonFinancial.dependencia < 50
          ? 'Liberdade conquistada'
          : undefined,
    },
  ];
}

/**
 * Componente principal de visualizacao de cenarios
 */
export function ScenarioVisualization({
  comparison,
  className,
}: ScenarioVisualizationProps) {
  const { lancamento, ecossistema } = comparison;
  const impacts = translateToLifeImpact(comparison);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Visual */}
      <div className="grid grid-cols-2 gap-4">
        {/* Cenario A: Lancamentos (Stress) */}
        <div className="text-center">
          <div
            className={cn(
              'w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center',
              lancamento.nonFinancial.riscoDesgaste === 'critico'
                ? 'bg-red-500/20'
                : lancamento.nonFinancial.riscoDesgaste === 'alto'
                  ? 'bg-orange-500/20'
                  : 'bg-yellow-500/20'
            )}
          >
            {lancamento.nonFinancial.riscoDesgaste === 'critico' ? (
              <AlertTriangle className="w-8 h-8 text-red-500" />
            ) : (
              <Coffee className="w-8 h-8 text-orange-500" />
            )}
          </div>
          <h3 className="text-kosmos-gray-light font-medium text-sm mb-1">
            Continuar Lancando
          </h3>
          <p className="text-kosmos-gray text-xs">
            {lancamento.nonFinancial.riscoDesgaste === 'critico'
              ? 'Risco critico'
              : lancamento.nonFinancial.riscoDesgaste === 'alto'
                ? 'Risco elevado'
                : 'Desgaste moderado'}
          </p>
        </div>

        {/* Cenario B: Ecossistema (Calma) */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 mx-auto mb-3 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-kosmos-orange font-medium text-sm mb-1">
            Construir Ecossistema
          </h3>
          <p className="text-kosmos-gray text-xs">
            {ecossistema.nonFinancial.sustentabilidade >= 70
              ? 'Alta sustentabilidade'
              : 'Equilibrio gradual'}
          </p>
        </div>
      </div>

      {/* Comparacao de Metricas */}
      <div className="space-y-3">
        {impacts.map((impact, index) => (
          <div
            key={impact.metric}
            className="bg-kosmos-black/50 rounded-lg p-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-kosmos-gray">{impact.icon}</div>
              <span className="text-kosmos-white text-sm font-medium flex-1">
                {impact.metric}
              </span>
              {impact.impactLabel && (
                <span className="text-emerald-400 text-xs font-medium px-2 py-1 bg-emerald-500/10 rounded">
                  {impact.impactLabel}
                </span>
              )}
            </div>

            {/* Visual Bar Comparison */}
            <div className="grid grid-cols-2 gap-3">
              {/* Lancamento */}
              <div className="space-y-1">
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      lancamento.nonFinancial.riscoDesgaste === 'critico'
                        ? 'bg-red-500'
                        : lancamento.nonFinancial.riscoDesgaste === 'alto'
                          ? 'bg-orange-500'
                          : 'bg-yellow-500'
                    )}
                    style={{ width: '100%' }}
                  />
                </div>
                <p className="text-kosmos-gray text-xs text-center">
                  {impact.lancamento}
                </p>
              </div>

              {/* Ecossistema */}
              <div className="space-y-1">
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width:
                        impact.metric === 'Dependencia de voce'
                          ? `${ecossistema.nonFinancial.dependencia}%`
                          : impact.metric === 'Desgaste projetado'
                            ? `${ecossistema.nonFinancial.desgasteProjetado}%`
                            : '100%',
                    }}
                  />
                </div>
                <p className="text-kosmos-orange text-xs text-center font-medium">
                  {impact.ecossistema}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Componente compacto para Hero section
 */
export function ScenarioHero({
  comparison,
  className,
}: ScenarioVisualizationProps) {
  const { lancamento, ecossistema, diferencas } = comparison;

  const horasEconomizadas = diferencas.horas;
  const semanasRecuperadas = Math.floor(horasEconomizadas / 40);

  return (
    <div className={cn('grid grid-cols-2 gap-6', className)}>
      {/* Cenario A */}
      <div
        className={cn(
          'rounded-2xl p-6 text-center border',
          lancamento.nonFinancial.riscoDesgaste === 'critico'
            ? 'bg-red-500/5 border-red-500/20'
            : 'bg-orange-500/5 border-orange-500/20'
        )}
      >
        <div className="mb-4">
          {lancamento.nonFinancial.riscoDesgaste === 'critico' ? (
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          ) : (
            <TrendingDown className="w-12 h-12 text-orange-500 mx-auto" />
          )}
        </div>

        <h3 className="text-kosmos-gray-light font-display font-semibold mb-2">
          Voce Hoje
        </h3>

        <div className="space-y-2">
          <p className="text-3xl font-bold text-kosmos-white">
            {lancamento.nonFinancial.horasAnuais}h
          </p>
          <p className="text-kosmos-gray text-sm">de trabalho por ano</p>

          <div
            className={cn(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2',
              lancamento.nonFinancial.riscoDesgaste === 'critico'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-orange-500/20 text-orange-400'
            )}
          >
            <Heart className="w-3 h-3" />
            {lancamento.nonFinancial.desgasteProjetado}% desgaste
          </div>
        </div>
      </div>

      {/* Cenario B */}
      <div className="rounded-2xl p-6 text-center bg-gradient-to-br from-emerald-500/10 to-kosmos-orange/10 border border-emerald-500/20">
        <div className="mb-4">
          <TrendingUp className="w-12 h-12 text-emerald-500 mx-auto" />
        </div>

        <h3 className="text-kosmos-orange font-display font-semibold mb-2">
          Voce em 12 Meses
        </h3>

        <div className="space-y-2">
          <p className="text-3xl font-bold text-emerald-400">
            {ecossistema.nonFinancial.horasAnuais}h
          </p>
          <p className="text-kosmos-gray text-sm">de trabalho por ano</p>

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 mt-2">
            <Zap className="w-3 h-3" />
            +{semanasRecuperadas} semanas livres
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Timeline com milestones da transicao
 */
interface TimelineProps {
  mesesParaBreakeven: number;
  className?: string;
}

export function TransitionTimeline({ mesesParaBreakeven, className }: TimelineProps) {
  const milestones = [
    {
      month: 1,
      label: 'Inicio',
      description: 'Primeiros assinantes',
      active: true,
    },
    {
      month: Math.min(3, mesesParaBreakeven),
      label: 'Mes 3',
      description: 'Comunidade formada',
      active: mesesParaBreakeven >= 3,
    },
    {
      month: mesesParaBreakeven,
      label: `Mes ${mesesParaBreakeven}`,
      description: 'Breakeven',
      highlight: true,
      active: true,
    },
    {
      month: 12,
      label: 'Mes 12',
      description: 'Ecossistema maduro',
      active: mesesParaBreakeven <= 12,
    },
  ].filter(
    (m, i, arr) =>
      i === 0 ||
      i === arr.length - 1 ||
      m.highlight ||
      (m.month !== arr[i - 1]?.month && m.month !== arr[i + 1]?.month)
  );

  return (
    <div className={cn('relative', className)}>
      {/* Line */}
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
      <div
        className="absolute top-4 left-0 h-0.5 bg-kosmos-orange transition-all duration-500"
        style={{
          width: `${Math.min(100, (mesesParaBreakeven / 12) * 100)}%`,
        }}
      />

      {/* Milestones */}
      <div className="relative flex justify-between">
        {milestones.map((milestone, index) => (
          <div
            key={index}
            className={cn(
              'flex flex-col items-center',
              milestone.highlight && 'z-10'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center',
                milestone.highlight
                  ? 'bg-kosmos-orange text-white'
                  : milestone.active
                    ? 'bg-kosmos-orange/20 text-kosmos-orange'
                    : 'bg-border text-kosmos-gray'
              )}
            >
              {milestone.highlight ? (
                <Zap className="w-4 h-4" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            <p
              className={cn(
                'text-xs font-medium mt-2',
                milestone.highlight ? 'text-kosmos-orange' : 'text-kosmos-gray'
              )}
            >
              {milestone.label}
            </p>
            <p className="text-[10px] text-kosmos-gray/60 text-center max-w-16">
              {milestone.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
