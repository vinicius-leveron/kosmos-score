import { DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueDataPoint {
  month: string;
  revenue: number;
  deals: number;
}

interface RevenueTimelineChartProps {
  data: RevenueDataPoint[];
  totalRevenue: number;
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)}K`;
  }
  return `R$ ${value.toFixed(0)}`;
}

export function RevenueTimelineChart({ data, totalRevenue }: RevenueTimelineChartProps) {
  return (
    <div className="card-structural p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-green-500 rounded-r" />
        <DollarSign className="h-5 w-5 text-green-400" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Receita por Periodo
        </h3>
        <span className="ml-auto text-sm text-kosmos-gray">
          {formatCurrency(totalRevenue)} total
        </span>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(0, 0%, 20%)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(0, 0%, 20%)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 8%)',
                border: '1px solid hsl(0, 0%, 15%)',
                borderRadius: '8px',
                color: 'white',
                fontFamily: 'Space Grotesk',
              }}
              formatter={(value: number, _name, props) => {
                const deals = props.payload?.deals;
                return [
                  <div key="content" className="space-y-1">
                    <div className="font-bold text-green-400">{formatCurrency(value)}</div>
                    {deals !== undefined && (
                      <div className="text-kosmos-gray text-sm">{deals} deals fechados</div>
                    )}
                  </div>,
                  '',
                ];
              }}
              labelFormatter={(label) => label}
            />
            <Bar
              dataKey="revenue"
              fill="#22C55E"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
