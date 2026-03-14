import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';

interface ViewsDistributionProps {
  reels: ReelWithInsights[];
}

export function ViewsDistribution({ reels }: ViewsDistributionProps) {
  const views = reels.map(r => r.insights?.views || 0).filter(v => v > 0);
  if (views.length === 0) return null;

  const maxViews = Math.max(...views);
  const bucketCount = Math.min(10, Math.ceil(Math.sqrt(views.length)));
  const bucketSize = Math.ceil(maxViews / bucketCount);

  const buckets: { range: string; count: number; isTopDecile: boolean }[] = [];
  const p90 = views.sort((a, b) => a - b)[Math.floor(views.length * 0.9)] || 0;

  for (let i = 0; i < bucketCount; i++) {
    const min = i * bucketSize;
    const max = (i + 1) * bucketSize;
    const count = views.filter(v => v >= min && v < max).length;
    const midpoint = (min + max) / 2;
    buckets.push({
      range: max < 1000 ? `${min}-${max}` : `${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K`,
      count,
      isTopDecile: midpoint >= p90,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuicao de Views</CardTitle>
        <p className="text-xs text-muted-foreground">Histograma — barras verdes = top 10% (outliers)</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={buckets} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="range" stroke="#888" fontSize={10} />
            <YAxis stroke="#888" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number) => [value, 'Reels']}
            />
            <Bar dataKey="count" name="Reels">
              {buckets.map((bucket, i) => (
                <Cell key={i} fill={bucket.isTopDecile ? '#22c55e' : '#E1306C'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
