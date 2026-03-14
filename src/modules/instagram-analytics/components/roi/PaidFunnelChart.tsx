import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';
import { formatNumber } from '../../lib/metrics';

interface PaidFunnelChartProps {
  reels: ReelWithInsights[];
}

export function PaidFunnelChart({ reels }: PaidFunnelChartProps) {
  const boosted = reels.filter(r => r.ad_insights);
  if (boosted.length === 0) return null;

  // Aggregate funnel
  const totals = boosted.reduce(
    (acc, r) => {
      const ad = r.ad_insights!;
      acc.impressions += ad.impressions;
      acc.thruPlays += ad.thru_plays;
      acc.p25 += ad.video_p25;
      acc.p50 += ad.video_p50;
      acc.p75 += ad.video_p75;
      acc.p95 += ad.video_p95;
      return acc;
    },
    { impressions: 0, thruPlays: 0, p25: 0, p50: 0, p75: 0, p95: 0 },
  );

  const funnelData = [
    { stage: 'Impressoes', value: totals.impressions },
    { stage: 'ThruPlays', value: totals.thruPlays },
    { stage: '25%', value: totals.p25 },
    { stage: '50%', value: totals.p50 },
    { stage: '75%', value: totals.p75 },
    { stage: '95%', value: totals.p95 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil Pago</CardTitle>
        <p className="text-xs text-muted-foreground">Impressoes → ThruPlays → 25% → 50% → 75% → 95% assistido</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={funnelData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="stage" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={11} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number) => [formatNumber(value), 'Total']}
            />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
