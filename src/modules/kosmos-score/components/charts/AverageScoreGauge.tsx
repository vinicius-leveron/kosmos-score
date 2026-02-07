import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { Gauge } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { getScoreColor, getScoreLabel } from '@/modules/kosmos-score/lib/chartConfig';

interface AverageScoreGaugeProps {
  score: number;
}

export function AverageScoreGauge({ score }: AverageScoreGaugeProps) {
  const roundedScore = Math.round(score);
  const scoreColor = getScoreColor(roundedScore);
  const scoreLabel = getScoreLabel(roundedScore);

  const data = [
    {
      name: 'Score',
      value: roundedScore,
      fill: scoreColor,
    },
  ];

  return (
    <ChartCard title="Score Médio Geral" icon={Gauge}>
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            barSize={16}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'hsl(0, 0%, 12%)' }}
              dataKey="value"
              cornerRadius={8}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Score display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className="font-display text-5xl font-bold"
            style={{ color: scoreColor }}
          >
            {roundedScore}
          </div>
          <div className="text-kosmos-gray text-sm">/100</div>
        </div>
      </div>

      {/* Classification badge */}
      <div className="flex justify-center mt-4">
        <div
          className="px-4 py-2 rounded-full font-display font-medium text-sm"
          style={{
            backgroundColor: `${scoreColor}20`,
            color: scoreColor,
            border: `1px solid ${scoreColor}40`,
          }}
        >
          {scoreLabel}
        </div>
      </div>

      {/* Score scale */}
      <div className="flex justify-between mt-4 px-4 text-xs text-kosmos-gray">
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </ChartCard>
  );
}
