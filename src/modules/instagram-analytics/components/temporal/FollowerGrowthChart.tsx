import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { AccountDailyInsights } from '../../types';
import { formatNumber } from '../../lib/metrics';

interface FollowerGrowthChartProps {
  insights: AccountDailyInsights[];
}

export function FollowerGrowthChart({ insights }: FollowerGrowthChartProps) {
  if (insights.length === 0) return null;

  const data = insights.map(i => ({
    date: new Date(i.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    followers: i.follower_count,
  }));

  return (
    <Card>
      <CardHeader><CardTitle>Crescimento de Seguidores</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" fontSize={11} />
            <YAxis stroke="#888" fontSize={11} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number) => [formatNumber(value), 'Seguidores']}
            />
            <Line type="monotone" dataKey="followers" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
