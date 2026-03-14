import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';
import { formatPercentage } from '../../lib/metrics';

interface RetentionScatterPlotProps {
  reels: ReelWithInsights[];
}

export function RetentionScatterPlot({ reels }: RetentionScatterPlotProps) {
  const dataPoints = reels
    .filter(r => r.duration_seconds != null && r.derived.retention_pct != null)
    .map(r => ({
      duration: r.duration_seconds!,
      retention: r.derived.retention_pct!,
      caption: r.caption?.slice(0, 50) || 'Sem legenda',
      views: r.insights?.views || 0,
    }));

  if (dataPoints.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Duracao vs Retencao</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Dados insuficientes para analise de retencao.</p>
        </CardContent>
      </Card>
    );
  }

  const avgRetention = dataPoints.reduce((s, d) => s + d.retention, 0) / dataPoints.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Duracao vs Retencao</CardTitle>
        <p className="text-xs text-muted-foreground">Cada ponto = 1 Reel. Identifique a duracao ideal para seus videos.</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              type="number"
              dataKey="duration"
              name="Duracao (s)"
              unit="s"
              stroke="#888"
              fontSize={12}
            />
            <YAxis
              type="number"
              dataKey="retention"
              name="Retencao"
              unit="%"
              stroke="#888"
              fontSize={12}
            />
            <ReferenceLine y={avgRetention} stroke="#E1306C" strokeDasharray="5 5" label={{ value: `Media: ${formatPercentage(avgRetention)}`, fill: '#E1306C', fontSize: 11 }} />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded p-2 text-xs">
                    <p className="font-medium">{data.caption}</p>
                    <p>Duracao: {data.duration}s</p>
                    <p>Retencao: {formatPercentage(data.retention)}</p>
                    <p>Views: {data.views.toLocaleString()}</p>
                  </div>
                );
              }}
            />
            <Scatter data={dataPoints} fill="#E1306C" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
