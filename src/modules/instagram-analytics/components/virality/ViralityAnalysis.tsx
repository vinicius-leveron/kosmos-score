import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';
import { formatPercentage } from '../../lib/metrics';

interface ViralityAnalysisProps {
  reels: ReelWithInsights[];
}

export function ViralityAnalysis({ reels }: ViralityAnalysisProps) {
  const data = reels
    .filter(r => r.derived.virality_rate > 0)
    .sort((a, b) => b.derived.virality_rate - a.derived.virality_rate)
    .slice(0, 20)
    .map(r => ({
      caption: r.caption?.slice(0, 30) || 'Sem legenda',
      virality: r.derived.virality_rate,
      repost: r.derived.repost_rate,
    }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Taxa de Viralidade</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Sem dados de compartilhamento disponíveis.</p>
        </CardContent>
      </Card>
    );
  }

  const avg = data.reduce((s, d) => s + d.virality, 0) / data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taxa de Viralidade por Reel</CardTitle>
        <p className="text-xs text-muted-foreground">Shares / Alcance — Top 20 Reels</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis type="number" stroke="#888" fontSize={11} tickFormatter={v => `${v.toFixed(1)}%`} />
            <YAxis type="category" dataKey="caption" stroke="#888" fontSize={10} width={90} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number, name: string) => [formatPercentage(value), name === 'virality' ? 'Viralidade' : 'Repost']}
            />
            <Bar dataKey="virality" name="Viralidade" fill="#E1306C">
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.virality > avg ? '#22c55e' : '#E1306C'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
