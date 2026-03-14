import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';
import { formatNumber } from '../../lib/metrics';

interface OrganicVsPaidChartProps {
  reels: ReelWithInsights[];
}

export function OrganicVsPaidChart({ reels }: OrganicVsPaidChartProps) {
  const boostedReels = reels.filter(r => r.is_boosted && r.ad_insights);

  if (boostedReels.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Views: Organico vs Pago</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Nenhum Reel impulsionado encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  const data = boostedReels.slice(0, 15).map(r => ({
    caption: r.caption?.slice(0, 25) || 'Sem legenda',
    organic_views: r.insights?.views || 0,
    paid_views: r.ad_insights?.thru_plays || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Views: Organico vs Pago</CardTitle>
        <p className="text-xs text-muted-foreground">Reels impulsionados — views organicas vs ThruPlays pagos</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="caption" stroke="#888" fontSize={10} angle={-30} textAnchor="end" height={60} />
            <YAxis stroke="#888" fontSize={11} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number, name: string) => [
                formatNumber(value),
                name === 'organic_views' ? 'Organico' : 'Pago',
              ]}
            />
            <Legend />
            <Bar dataKey="organic_views" name="Organico" stackId="a" fill="#22c55e" />
            <Bar dataKey="paid_views" name="Pago" stackId="a" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
