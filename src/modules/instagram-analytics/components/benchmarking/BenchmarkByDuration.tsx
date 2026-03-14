import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';
import { DURATION_BUCKETS } from '../../lib/constants';
import { formatPercentage } from '../../lib/metrics';

interface BenchmarkByDurationProps {
  reels: ReelWithInsights[];
}

export function BenchmarkByDuration({ reels }: BenchmarkByDurationProps) {
  const data = DURATION_BUCKETS.map(bucket => {
    const bucketReels = reels.filter(r => {
      const d = r.duration_seconds || 0;
      return d >= bucket.min && d < bucket.max;
    });

    const avgEngagement = bucketReels.length > 0
      ? bucketReels.reduce((s, r) => s + r.derived.engagement_rate, 0) / bucketReels.length
      : 0;
    const avgRetention = bucketReels.filter(r => r.derived.retention_pct != null);
    const avgRetentionValue = avgRetention.length > 0
      ? avgRetention.reduce((s, r) => s + (r.derived.retention_pct || 0), 0) / avgRetention.length
      : 0;

    return {
      label: bucket.label,
      count: bucketReels.length,
      engagement: avgEngagement,
      retention: avgRetentionValue,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Duracao</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="label" stroke="#888" fontSize={12} />
            <YAxis stroke="#888" fontSize={11} tickFormatter={v => `${v.toFixed(0)}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number, name: string) => [
                formatPercentage(value),
                name === 'engagement' ? 'Engajamento' : 'Retencao',
              ]}
            />
            <Bar dataKey="engagement" name="Engajamento" fill="#E1306C" />
            <Bar dataKey="retention" name="Retencao" fill="#833AB4" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 justify-center mt-2 text-xs text-muted-foreground">
          {data.map(d => (
            <span key={d.label}>{d.label}: {d.count} reels</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
