import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { CHART_COLORS, SCORE_RANGES } from '@/modules/kosmos-score/lib/chartConfig';
import type { ScoreDistributionItem } from '@/modules/kosmos-score/hooks/useChartData';

interface ScoreDistributionBarChartProps {
  data: ScoreDistributionItem[];
}

export function ScoreDistributionBarChart({ data }: ScoreDistributionBarChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    label: SCORE_RANGES[index]?.label || item.range,
    color: SCORE_RANGES[index]?.color || CHART_COLORS.primary,
  }));

  return (
    <ChartCard title="Distribuição de Scores" icon={BarChart3}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: CHART_COLORS.labelText, fontSize: 12 }}
              axisLine={{ stroke: CHART_COLORS.gridLine }}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: CHART_COLORS.labelText, fontSize: 12, fontFamily: 'Space Grotesk' }}
              axisLine={{ stroke: CHART_COLORS.gridLine }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 8%)',
                border: '1px solid hsl(0, 0%, 15%)',
                borderRadius: '8px',
                color: 'white',
                fontFamily: 'Space Grotesk',
              }}
              formatter={(value: number, name: string, props: { payload: { percentage: number } }) => [
                `${value} leads (${props.payload.percentage.toFixed(1)}%)`,
                '',
              ]}
              labelFormatter={(label) => `Score ${label}`}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4">
        {chartData.map((item) => (
          <div key={item.range} className="text-center p-2 rounded bg-kosmos-black-light">
            <div className="font-display text-lg font-bold text-kosmos-white">{item.count}</div>
            <div className="text-xs text-kosmos-gray">{item.range}</div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
