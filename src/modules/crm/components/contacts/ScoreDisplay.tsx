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
  causa: '#FF4500',
  cultura: '#A855F7',
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

function ScoreRadar({ causa, cultura, economia }: { causa: number; cultura: number; economia: number }) {
  const chartData = [
    { pillar: 'Causa', score: Math.round(causa), fullMark: 100 },
    { pillar: 'Cultura', score: Math.round(cultura), fullMark: 100 },
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
  const causa = scoreBreakdown.causa ?? 0;
  const cultura = scoreBreakdown.cultura ?? 0;
  const economia = scoreBreakdown.economia ?? 0;

  const hasPillars =
    scoreBreakdown.causa !== undefined ||
    scoreBreakdown.cultura !== undefined ||
    scoreBreakdown.economia !== undefined;

  if (!hasPillars) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h4 className="text-sm font-medium">Score por Pilar</h4>

      {showRadar && (causa > 0 || cultura > 0 || economia > 0) && (
        <ScoreRadar causa={causa} cultura={cultura} economia={economia} />
      )}

      <div className="space-y-3">
        <PillarBar
          label="Causa"
          value={scoreBreakdown.causa}
          color={PILLAR_COLORS.causa}
        />
        <PillarBar
          label="Cultura"
          value={scoreBreakdown.cultura}
          color={PILLAR_COLORS.cultura}
        />
        <PillarBar
          label="Economia"
          value={scoreBreakdown.economia}
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
        {scoreBreakdown.lucro_oculto !== undefined && (
          <div className="text-sm">
            <span className="text-muted-foreground">Lucro Oculto:</span>
            <span className="ml-2 font-medium text-green-500">
              R$ {scoreBreakdown.lucro_oculto.toLocaleString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      {scoreBreakdown.is_beginner && (
        <div className="text-sm text-muted-foreground italic">
          * Perfil iniciante
        </div>
      )}
    </div>
  );
}
