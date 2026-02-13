import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { cn } from '@/design-system/lib/utils';
import type { ScoreBreakdown } from '../../types';

interface ScoreDisplayProps {
  scoreBreakdown: ScoreBreakdown;
  className?: string;
  showRadar?: boolean;
}

const PILLAR_COLORS = {
  movimento: '#FF4500',
  estrutura: '#A855F7',
  economia: '#3B82F6',
};

interface PillarBarProps {
  label: string;
  value: number | undefined;
  color: string;
}

function PillarBar({ label, value, color }: PillarBarProps) {
  const percentage = value ?? 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{percentage.toFixed(0)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function ScoreRadar({ movimento, estrutura, economia }: { movimento: number; estrutura: number; economia: number }) {
  const chartData = [
    { pillar: 'Movimento', score: Math.round(movimento), fullMark: 100 },
    { pillar: 'Estrutura', score: Math.round(estrutura), fullMark: 100 },
    { pillar: 'Economia', score: Math.round(economia), fullMark: 100 },
  ];

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="pillar"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#FF4500"
            fill="#FF4500"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value}/100`, 'Score']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreDisplay({ scoreBreakdown, className, showRadar = true }: ScoreDisplayProps) {
  // V2 names with V1 fallback
  const movimento = scoreBreakdown.movimento ?? scoreBreakdown.causa ?? 0;
  const estrutura = scoreBreakdown.estrutura ?? scoreBreakdown.cultura ?? 0;
  const economia = scoreBreakdown.economia ?? 0;

  const hasPillars =
    scoreBreakdown.movimento !== undefined ||
    scoreBreakdown.estrutura !== undefined ||
    scoreBreakdown.causa !== undefined ||
    scoreBreakdown.cultura !== undefined ||
    scoreBreakdown.economia !== undefined;

  if (!hasPillars) {
    return null;
  }

  const lucroDisplay = scoreBreakdown.lucro_oculto_display
    ?? (scoreBreakdown.lucro_oculto !== undefined
      ? `R$ ${scoreBreakdown.lucro_oculto.toLocaleString('pt-BR')}`
      : null);

  return (
    <div className={cn('space-y-4', className)}>
      <h4 className="text-sm font-medium">Score por Pilar</h4>

      {showRadar && (movimento > 0 || estrutura > 0 || economia > 0) && (
        <ScoreRadar movimento={movimento} estrutura={estrutura} economia={economia} />
      )}

      <div className="space-y-3">
        <PillarBar
          label="Movimento"
          value={movimento}
          color={PILLAR_COLORS.movimento}
        />
        <PillarBar
          label="Estrutura"
          value={estrutura}
          color={PILLAR_COLORS.estrutura}
        />
        <PillarBar
          label="Economia"
          value={economia}
          color={PILLAR_COLORS.economia}
        />
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        {scoreBreakdown.base_value !== undefined && (
          <div className="text-sm">
            <span className="text-muted-foreground">Valor da Base:</span>
            <span className="ml-2 font-medium">
              R$ {scoreBreakdown.base_value.toLocaleString('pt-BR')}
            </span>
          </div>
        )}
        {lucroDisplay && (
          <div className="text-sm">
            <span className="text-muted-foreground">Lucro Oculto:</span>
            <span className="ml-2 font-medium text-green-500">
              {lucroDisplay}
            </span>
          </div>
        )}
      </div>

      {scoreBreakdown.result_profile && (
        <div className="text-sm">
          <span className="text-muted-foreground">Perfil:</span>
          <span className="ml-2 font-medium capitalize">
            {scoreBreakdown.result_profile.replace(/_/g, ' ')}
          </span>
        </div>
      )}

      {scoreBreakdown.is_beginner && (
        <div className="text-sm text-muted-foreground italic">
          * Perfil iniciante
        </div>
      )}
    </div>
  );
}
