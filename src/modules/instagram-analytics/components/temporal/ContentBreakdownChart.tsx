import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { AccountDailyInsights } from '../../types';
import { formatNumber } from '../../lib/metrics';

interface ContentBreakdownChartProps {
  insights: AccountDailyInsights[];
}

export function ContentBreakdownChart({ insights }: ContentBreakdownChartProps) {
  const data = insights
    .filter(i => i.views_by_media_type && Object.keys(i.views_by_media_type).length > 0)
    .map(i => ({
      date: new Date(i.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      reels: i.views_by_media_type.reels || 0,
      feed: i.views_by_media_type.feed || 0,
      stories: i.views_by_media_type.stories || 0,
    }));

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader><CardTitle>Views por Tipo de Conteudo</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" fontSize={11} />
            <YAxis stroke="#888" fontSize={11} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number, name: string) => [formatNumber(value), name]}
            />
            <Legend />
            <Bar dataKey="reels" name="Reels" stackId="a" fill="#E1306C" />
            <Bar dataKey="feed" name="Feed" stackId="a" fill="#833AB4" />
            <Bar dataKey="stories" name="Stories" stackId="a" fill="#F77737" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
