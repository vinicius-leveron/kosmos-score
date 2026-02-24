import { GitBranch } from 'lucide-react';
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
import { formatCurrency } from './RevenueTimelineChart';

interface PipelineStage {
  name: string;
  displayName: string;
  count: number;
  value: number;
  color: string;
}

interface PipelineFunnelChartProps {
  stages: PipelineStage[];
  totalDeals: number;
}

export function PipelineFunnelChart({ stages, totalDeals }: PipelineFunnelChartProps) {
  const chartData = stages.map((stage) => ({
    name: stage.displayName,
    count: stage.count,
    value: stage.value,
    color: stage.color,
  }));

  return (
    <div className="card-structural p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-blue-500 rounded-r" />
        <GitBranch className="h-5 w-5 text-blue-400" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Pipeline por Stage
        </h3>
        <span className="ml-auto text-sm text-kosmos-gray">
          {totalDeals} deals
        </span>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
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
              dataKey="name"
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
                const stageValue = props.payload?.value;
                return [
                  <div key="content" className="space-y-1">
                    <div className="font-bold">{value} deals</div>
                    {stageValue !== undefined && (
                      <div className="text-blue-400 text-sm">{formatCurrency(stageValue)} em pipeline</div>
                    )}
                  </div>,
                  '',
                ];
              }}
              labelFormatter={(label) => label}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
        {stages.slice(0, 5).map((stage) => (
          <div key={stage.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: stage.color }} />
            <span className="text-kosmos-gray">{stage.displayName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
