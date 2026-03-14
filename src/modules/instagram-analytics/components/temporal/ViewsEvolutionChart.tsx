import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { AccountDailyInsights } from '../../types';
import { formatNumber } from '../../lib/metrics';

interface ViewsEvolutionChartProps {
  insights: AccountDailyInsights[];
}

export function ViewsEvolutionChart({ insights }: ViewsEvolutionChartProps) {
  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Views ao Longo do Tempo</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Sem dados de evolucao disponíveis.</p>
        </CardContent>
      </Card>
    );
  }

  const data = insights.map(i => ({
    date: new Date(i.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    views: i.views,
    reach: i.reach,
  }));

  return (
    <Card>
      <CardHeader><CardTitle>Views e Alcance</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" stroke="#888" fontSize={11} />
            <YAxis stroke="#888" fontSize={11} tickFormatter={formatNumber} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              formatter={(value: number, name: string) => [formatNumber(value), name === 'views' ? 'Views' : 'Alcance']}
            />
            <Line type="monotone" dataKey="views" stroke="#E1306C" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="reach" stroke="#833AB4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
