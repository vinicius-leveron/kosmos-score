/**
 * PillarComparisonChart - Radar chart comparing client vs market vs top10
 */

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { BenchmarkWithRelations } from '../../types';

interface PillarComparisonChartProps {
  benchmark: BenchmarkWithRelations;
}

export function PillarComparisonChart({ benchmark }: PillarComparisonChartProps) {
  const data = [
    {
      pilar: 'Causa',
      cliente: benchmark.score_causa || 0,
      mercado: benchmark.market_avg_causa || 0,
      top10: benchmark.top10_causa || 0,
    },
    {
      pilar: 'Cultura',
      cliente: benchmark.score_cultura || 0,
      mercado: benchmark.market_avg_cultura || 0,
      top10: benchmark.top10_cultura || 0,
    },
    {
      pilar: 'Economia',
      cliente: benchmark.score_economia || 0,
      mercado: benchmark.market_avg_economia || 0,
      top10: benchmark.top10_economia || 0,
    },
  ];

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis
            dataKey="pilar"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6B7280', fontSize: 10 }}
          />
          <Radar
            name="Seu Score"
            dataKey="cliente"
            stroke="#F97316"
            fill="#F97316"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Média do Mercado"
            dataKey="mercado"
            stroke="#6B7280"
            fill="#6B7280"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Radar
            name="Top 10%"
            dataKey="top10"
            stroke="#22C55E"
            fill="#22C55E"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="3 3"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
