/**
 * ScoreBreakdownCard - Visual breakdown of stakeholder contribution score
 *
 * Displays the score composition:
 * - Meetings (25%)
 * - Mentoring (30%)
 * - Referrals (20%)
 * - Decisions (15%)
 * - Investments (10%)
 *
 * Also shows:
 * - Temporal decay factor
 * - Score trend (if history available)
 */

import { useMemo } from 'react';
import {
  Calendar,
  GraduationCap,
  Users,
  Vote,
  Wallet,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  RefreshCw,
} from 'lucide-react';

import { cn } from '@/design-system/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Progress } from '@/design-system/primitives/progress';
import { Button } from '@/design-system/primitives/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/design-system/primitives/tooltip';

import type { ScoreBreakdown, ScoreTrend } from '../types/stakeholder.types';

// ============================================================================
// TYPES
// ============================================================================

interface ScoreBreakdownCardProps {
  /** The total contribution score (0-100) */
  score: number;
  /** Detailed breakdown from database calculation */
  breakdown: ScoreBreakdown;
  /** Score trend direction */
  trend?: ScoreTrend;
  /** Loading state */
  isLoading?: boolean;
  /** Callback to recalculate score */
  onRecalculate?: () => void;
  /** Is recalculation in progress */
  isRecalculating?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface ScoreComponentProps {
  label: string;
  icon: React.ReactNode;
  score: number;
  weight: number;
  weightedScore: number;
  count?: number;
  periodDays?: number | null;
  tooltip?: string;
}

// ============================================================================
// SCORE COMPONENT
// ============================================================================

function ScoreComponent({
  label,
  icon,
  score,
  weight,
  weightedScore,
  count,
  periodDays,
  tooltip,
}: ScoreComponentProps) {
  const content = (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-medium">{label}</span>
          {count !== undefined && (
            <span className="text-xs text-muted-foreground">({count})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{(weight * 100).toFixed(0)}%</span>
          <span className="text-sm font-semibold w-12 text-right">
            {weightedScore.toFixed(1)}
          </span>
        </div>
      </div>
      <Progress value={score} className="h-1.5" />
      {periodDays && (
        <p className="text-xs text-muted-foreground">Ultimos {periodDays} dias</p>
      )}
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{content}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// ============================================================================
// TREND INDICATOR
// ============================================================================

function TrendIndicator({ trend }: { trend: ScoreTrend }) {
  const config = {
    up: {
      icon: TrendingUp,
      color: 'text-green-500',
      label: 'Em alta',
    },
    down: {
      icon: TrendingDown,
      color: 'text-red-500',
      label: 'Em queda',
    },
    neutral: {
      icon: Minus,
      color: 'text-muted-foreground',
      label: 'Estavel',
    },
  };

  const { icon: Icon, color, label } = config[trend];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1', color)}>
            <Icon className="h-4 w-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ScoreBreakdownCard({
  score,
  breakdown,
  trend,
  isLoading,
  onRecalculate,
  isRecalculating,
  className,
}: ScoreBreakdownCardProps) {
  const components = useMemo(() => {
    const { meetings, mentoring, referrals, decisions, investments } = breakdown;

    return [
      {
        key: 'mentoring',
        label: 'Mentorias',
        icon: <GraduationCap className="h-4 w-4" />,
        data: mentoring,
        tooltip: mentoring?.avg_impact
          ? `Impacto medio: ${mentoring.avg_impact.toFixed(1)}/5`
          : undefined,
      },
      {
        key: 'meetings',
        label: 'Reunioes',
        icon: <Calendar className="h-4 w-4" />,
        data: meetings,
        tooltip: '4 reunioes em 90 dias = pontuacao maxima',
      },
      {
        key: 'referrals',
        label: 'Indicacoes',
        icon: <Users className="h-4 w-4" />,
        data: referrals,
        tooltip: '5 indicacoes = pontuacao maxima',
      },
      {
        key: 'decisions',
        label: 'Decisoes',
        icon: <Vote className="h-4 w-4" />,
        data: decisions,
        tooltip: 'Participacao em decisoes estrategicas',
      },
      {
        key: 'investments',
        label: 'Investimento',
        icon: <Wallet className="h-4 w-4" />,
        data: investments,
        tooltip: investments?.amount
          ? `R$ ${investments.amount.toLocaleString('pt-BR')}`
          : undefined,
      },
    ];
  }, [breakdown]);

  const decayInfo = breakdown.decay;
  const hasDecay = decayInfo && decayInfo.factor < 1;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Breakdown do Score
            {trend && <TrendIndicator trend={trend} />}
          </CardTitle>
          {onRecalculate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRecalculate}
              disabled={isRecalculating}
              aria-label="Recalcular score"
            >
              <RefreshCw
                className={cn('h-4 w-4', isRecalculating && 'animate-spin')}
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total Score */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <span className="text-sm text-muted-foreground">Score Total</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">
              {score.toFixed(0)}
            </span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Score Components */}
        <div className="space-y-4">
          {components.map(({ key, label, icon, data, tooltip }) => (
            <ScoreComponent
              key={key}
              label={label}
              icon={icon}
              score={data?.score || 0}
              weight={data?.weight || 0}
              weightedScore={data?.weighted_score || 0}
              count={data?.count}
              periodDays={data?.period_days}
              tooltip={tooltip}
            />
          ))}
        </div>

        {/* Decay Warning */}
        {hasDecay && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-amber-500">
                Decaimento temporal aplicado
              </p>
              <p className="text-xs text-muted-foreground">
                Sem interacoes ha {decayInfo.days_since_interaction} dias.
                Score reduzido em {((1 - decayInfo.factor) * 100).toFixed(0)}%.
              </p>
            </div>
          </div>
        )}

        {/* Last Calculation */}
        {breakdown.calculated_at && (
          <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            Calculado em{' '}
            {new Date(breakdown.calculated_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
