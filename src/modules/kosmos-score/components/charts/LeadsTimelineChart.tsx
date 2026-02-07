import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { ChartCard } from './ChartCard';
import { CHART_COLORS } from '@/modules/kosmos-score/lib/chartConfig';
import type { TimelineDataItem } from '@/modules/kosmos-score/hooks/useChartData';

interface LeadsTimelineChartProps {
  data: TimelineDataItem[];
}

export function LeadsTimelineChart({ data }: LeadsTimelineChartProps) {
  // Take last 30 days for display
  const displayData = data.slice(-30);

  const totalLeads = displayData.reduce((sum, item) => sum + item.count, 0);
  const avgPerDay = displayData.length > 0 ? totalLeads / displayData.length : 0;

  return (
    <ChartCard title="Leads por Dia" icon={TrendingUp}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: CHART_COLORS.labelText, fontSize: 10 }}
              axisLine={{ stroke: CHART_COLORS.gridLine }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: CHART_COLORS.labelText, fontSize: 10 }}
              axisLine={{ stroke: CHART_COLORS.gridLine }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 8%)',
                border: '1px solid hsl(0, 0%, 15%)',
                borderRadius: '8px',
                color: 'white',
                fontFamily: 'Space Grotesk',
              }}
              formatter={(value: number) => [`${value} leads`, '']}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLeads)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-8 mt-4">
        <div className="text-center">
          <div className="font-display text-2xl font-bold text-kosmos-orange">{totalLeads}</div>
          <div className="text-xs text-kosmos-gray">Total no Período</div>
        </div>
        <div className="text-center">
          <div className="font-display text-2xl font-bold text-kosmos-white">
            {avgPerDay.toFixed(1)}
          </div>
          <div className="text-xs text-kosmos-gray">Média/Dia</div>
        </div>
      </div>
    </ChartCard>
  );
}
