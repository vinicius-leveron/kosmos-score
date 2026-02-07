import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Target } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { CHART_COLORS, PILLAR_CONFIG } from '@/modules/kosmos-score/lib/chartConfig';
import type { PillarAverages } from '@/modules/kosmos-score/hooks/useChartData';

interface PillarRadarChartProps {
  data: PillarAverages;
}

export function PillarRadarChart({ data }: PillarRadarChartProps) {
  const chartData = [
    {
      pillar: PILLAR_CONFIG.causa.label,
      score: Math.round(data.causa),
      fullMark: 100,
    },
    {
      pillar: PILLAR_CONFIG.cultura.label,
      score: Math.round(data.cultura),
      fullMark: 100,
    },
    {
      pillar: PILLAR_CONFIG.economia.label,
      score: Math.round(data.economia),
      fullMark: 100,
    },
  ];

  return (
    <ChartCard title="Média por Pilar" icon={Target}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid
              stroke={CHART_COLORS.gridLine}
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="pillar"
              tick={{ fill: CHART_COLORS.labelText, fontSize: 12, fontFamily: 'Space Grotesk' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: CHART_COLORS.labelText, fontSize: 10 }}
              tickCount={5}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke={CHART_COLORS.primary}
              fill={CHART_COLORS.primary}
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 8%)',
                border: '1px solid hsl(0, 0%, 15%)',
                borderRadius: '8px',
                color: 'white',
                fontFamily: 'Space Grotesk',
              }}
              formatter={(value: number) => [`${value}/100`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="font-display text-lg font-bold" style={{ color: PILLAR_CONFIG.causa.color }}>
            {Math.round(data.causa)}
          </div>
          <div className="text-xs text-kosmos-gray">Causa</div>
        </div>
        <div className="text-center">
          <div className="font-display text-lg font-bold" style={{ color: PILLAR_CONFIG.cultura.color }}>
            {Math.round(data.cultura)}
          </div>
          <div className="text-xs text-kosmos-gray">Cultura</div>
        </div>
        <div className="text-center">
          <div className="font-display text-lg font-bold" style={{ color: PILLAR_CONFIG.economia.color }}>
            {Math.round(data.economia)}
          </div>
          <div className="text-xs text-kosmos-gray">Economia</div>
        </div>
      </div>
    </ChartCard>
  );
}
