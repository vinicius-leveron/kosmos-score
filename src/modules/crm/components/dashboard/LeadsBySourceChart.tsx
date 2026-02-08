import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Globe } from 'lucide-react';
import type { SourceCount } from '../../hooks/useCrmDashboard';

interface LeadsBySourceChartProps {
  data: SourceCount[];
  onSourceClick?: (source: SourceCount) => void;
}

export function LeadsBySourceChart({ data, onSourceClick }: LeadsBySourceChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Globe className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="font-semibold">Leads por Origem</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum lead cadastrado ainda
        </p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.label,
    value: item.count,
    color: item.color,
    source: item.source,
    percentage: item.percentage,
  }));

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
        className="text-sm font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Globe className="h-5 w-5 text-blue-500" />
        </div>
        <h3 className="font-semibold">Leads por Origem</h3>
      </div>
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
              onClick={(entry) => {
                const source = data.find((d) => d.label === entry.name);
                if (source && onSourceClick) {
                  onSourceClick(source);
                }
              }}
              style={{ cursor: onSourceClick ? 'pointer' : 'default' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                `${value} leads (${chartData.find((d) => d.name === name)?.percentage}%)`,
                name,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-muted-foreground text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
