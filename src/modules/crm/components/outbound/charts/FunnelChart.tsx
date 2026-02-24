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
import { GitBranch } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import {
  OUTBOUND_COLORS,
  CADENCE_STATUS_LABELS,
  type CadenceStatus,
} from '../../../types/outbound';

interface FunnelChartProps {
  data: {
    status: CadenceStatus;
    count: number;
    avgDays: number | null;
  }[];
  className?: string;
}

// Order das etapas do funil
const FUNNEL_ORDER: CadenceStatus[] = [
  'new',
  'ready',
  'in_sequence',
  'paused',
  'replied',
  'nurture',
  'bounced',
  'unsubscribed',
];

export function FunnelChart({ data, className }: FunnelChartProps) {
  // Sort data by funnel order
  const sortedData = FUNNEL_ORDER.map((status) => {
    const item = data.find((d) => d.status === status);
    return {
      status,
      label: CADENCE_STATUS_LABELS[status],
      count: item?.count || 0,
      avgDays: item?.avgDays,
      color: OUTBOUND_COLORS[status],
    };
  }).filter((item) => item.count > 0 || FUNNEL_ORDER.slice(0, 5).includes(item.status));

  const totalLeads = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={cn('card-structural p-6', className)}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
        <GitBranch className="h-5 w-5 text-kosmos-orange" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Funil de Cadência
        </h3>
        <span className="ml-auto text-sm text-kosmos-gray">
          {totalLeads.toLocaleString('pt-BR')} leads
        </span>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(0, 0%, 20%)"
              horizontal={true}
              vertical={false}
            />
            <XAxis
              type="number"
              tick={{ fill: 'hsl(0, 0%, 60%)', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(0, 0%, 20%)' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: 'hsl(0, 0%, 80%)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
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
              formatter={(value: number, _name, props) => {
                const avgDays = props.payload?.avgDays;
                const percentage = totalLeads > 0 ? ((value / totalLeads) * 100).toFixed(1) : '0';
                return [
                  <div key="content" className="space-y-1">
                    <div className="font-bold">{value.toLocaleString('pt-BR')} leads</div>
                    <div className="text-kosmos-gray">{percentage}% do total</div>
                    {avgDays !== null && (
                      <div className="text-kosmos-gray text-xs">
                        Média: {avgDays.toFixed(1)} dias no stage
                      </div>
                    )}
                  </div>,
                  '',
                ];
              }}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
        {sortedData.slice(0, 5).map((item) => (
          <div key={item.status} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }} />
            <span className="text-kosmos-gray">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
