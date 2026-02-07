import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { CHART_COLORS } from '@/modules/kosmos-score/lib/chartConfig';
import type { LeadTypeData } from '@/modules/kosmos-score/hooks/useChartData';

interface LeadTypePieChartProps {
  data: LeadTypeData;
}

export function LeadTypePieChart({ data }: LeadTypePieChartProps) {
  const chartData = [
    { name: 'Iniciantes', value: data.beginners, color: CHART_COLORS.beginner },
    { name: 'Experientes', value: data.experienced, color: CHART_COLORS.experienced },
  ];

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartCard title="Tipo de Lead" icon={Users}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 8%)',
                border: '1px solid hsl(0, 0%, 15%)',
                borderRadius: '8px',
                color: 'white',
                fontFamily: 'Space Grotesk',
              }}
              formatter={(value: number) => [`${value} leads`, '']}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-kosmos-gray-light text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-8 mt-2">
        <div className="text-center">
          <div className="font-display text-2xl font-bold text-kosmos-orange">{data.beginners}</div>
          <div className="text-xs text-kosmos-gray">Iniciantes</div>
        </div>
        <div className="text-center">
          <div className="font-display text-2xl font-bold text-purple-500">{data.experienced}</div>
          <div className="text-xs text-kosmos-gray">Experientes</div>
        </div>
      </div>
    </ChartCard>
  );
}
