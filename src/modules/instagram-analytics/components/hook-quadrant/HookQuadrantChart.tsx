import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';
import { QUADRANT_COLORS, SKIP_RATE_THRESHOLD, COMPLETION_RATE_THRESHOLD } from '../../lib/constants';
import { formatPercentage } from '../../lib/metrics';
import { QuadrantLegend } from './QuadrantLegend';

interface HookQuadrantChartProps {
  reels: ReelWithInsights[];
}

export function HookQuadrantChart({ reels }: HookQuadrantChartProps) {
  const dataPoints = reels
    .filter(r => r.insights?.skip_rate != null && r.derived.completion_rate != null)
    .map(r => ({
      skip_rate: r.insights!.skip_rate!,
      completion_rate: r.derived.completion_rate!,
      quadrant: r.hook_quadrant!,
      caption: r.caption?.slice(0, 50) || 'Sem legenda',
      views: r.insights?.views || 0,
    }));

  if (dataPoints.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Quadrante de Hook</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Dados de skip rate insuficientes. Esta metrica pode retornar null se o Reel nao tem views suficientes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quadrante de Hook</CardTitle>
        <p className="text-xs text-muted-foreground">
          Cruza skip rate (gancho) com completion rate (conteudo) para diagnosticar problemas.
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              type="number"
              dataKey="skip_rate"
              name="Skip Rate"
              unit="%"
              domain={[0, 100]}
              stroke="#888"
              fontSize={12}
              label={{ value: 'Skip Rate (%)', position: 'insideBottom', offset: -5, fill: '#888', fontSize: 11 }}
            />
            <YAxis
              type="number"
              dataKey="completion_rate"
              name="Completion Rate"
              unit="%"
              domain={[0, 100]}
              stroke="#888"
              fontSize={12}
              label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 11 }}
            />
            <ReferenceLine x={SKIP_RATE_THRESHOLD} stroke="#666" strokeDasharray="5 5" />
            <ReferenceLine y={COMPLETION_RATE_THRESHOLD} stroke="#666" strokeDasharray="5 5" />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded p-2 text-xs">
                    <p className="font-medium">{data.caption}</p>
                    <p>Skip Rate: {formatPercentage(data.skip_rate)}</p>
                    <p>Completion: {formatPercentage(data.completion_rate)}</p>
                    <p>Views: {data.views.toLocaleString()}</p>
                  </div>
                );
              }}
            />
            <Scatter data={dataPoints} fillOpacity={0.8}>
              {dataPoints.map((point, i) => (
                <Cell key={i} fill={QUADRANT_COLORS[point.quadrant]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <QuadrantLegend />
      </CardContent>
    </Card>
  );
}
