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
import { Users } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { CHART_COLORS, getScoreColor } from '@/modules/kosmos-score/lib/chartConfig';
import type { TopBaseItem } from '@/modules/kosmos-score/hooks/useChartData';

interface BaseSizeRankingChartProps {
  data: TopBaseItem[];
}

export function BaseSizeRankingChart({ data }: BaseSizeRankingChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    rank: index + 1,
    displayEmail: item.email.length > 20 ? `${item.email.slice(0, 17)}...` : item.email,
    formattedSize: formatBaseSize(item.baseSize),
  }));

  function formatBaseSize(size: number): string {
    if (size >= 1000000) {
      return `${(size / 1000000).toFixed(1)}M`;
    }
    if (size >= 1000) {
      return `${(size / 1000).toFixed(1)}K`;
    }
    return String(size);
  }

  if (data.length === 0) {
    return (
      <ChartCard title="Top 10 - Maior Base" icon={Users}>
        <div className="h-64 flex items-center justify-center">
          <p className="text-kosmos-gray text-sm">
            Nenhum lead experiente ainda
          </p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Top 10 - Maior Base" icon={Users}>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: CHART_COLORS.labelText, fontSize: 10 }}
              axisLine={{ stroke: CHART_COLORS.gridLine }}
              tickFormatter={(value) => formatBaseSize(value)}
            />
            <YAxis
              type="category"
              dataKey="displayEmail"
              tick={{ fill: CHART_COLORS.labelText, fontSize: 10, fontFamily: 'Inter' }}
              axisLine={{ stroke: CHART_COLORS.gridLine }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 8%)',
                border: '1px solid hsl(0, 0%, 15%)',
                borderRadius: '8px',
                color: 'white',
                fontFamily: 'Space Grotesk',
              }}
              formatter={(value: number, name: string, props: { payload: TopBaseItem }) => [
                `${formatBaseSize(value)} leads | Score: ${props.payload.score}`,
                '',
              ]}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="baseSize" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-kosmos-gray">
          <span>Cor da barra = Score do lead</span>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded" style={{ background: CHART_COLORS.danger }} />
            <span>0-25</span>
            <span className="inline-block w-3 h-3 rounded" style={{ background: CHART_COLORS.warning }} />
            <span>26-50</span>
            <span className="inline-block w-3 h-3 rounded" style={{ background: CHART_COLORS.moderate }} />
            <span>51-75</span>
            <span className="inline-block w-3 h-3 rounded" style={{ background: CHART_COLORS.success }} />
            <span>76-100</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
