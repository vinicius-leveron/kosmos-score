import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';
import { formatCurrency, formatNumber, calculateIncrementalCost } from '../../lib/metrics';

interface ROISummaryCardProps {
  reels: ReelWithInsights[];
}

export function ROISummaryCard({ reels }: ROISummaryCardProps) {
  const boosted = reels.filter(r => r.ad_insights);
  if (boosted.length === 0) return null;

  const totalSpend = boosted.reduce((s, r) => s + (r.ad_insights?.spend || 0), 0);
  const totalPaidReach = boosted.reduce((s, r) => s + (r.ad_insights?.reach || 0), 0);
  const totalPaidViews = boosted.reduce((s, r) => s + (r.ad_insights?.thru_plays || 0), 0);
  const totalClicks = boosted.reduce((s, r) => s + (r.ad_insights?.clicks || 0), 0);

  const avgCPM = totalPaidReach > 0 ? (totalSpend / totalPaidReach) * 1000 : null;
  const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : null;
  const costPerView = totalPaidViews > 0 ? totalSpend / totalPaidViews : null;

  const metrics = [
    { label: 'Total Investido', value: formatCurrency(totalSpend) },
    { label: 'Alcance Pago', value: formatNumber(totalPaidReach) },
    { label: 'ThruPlays', value: formatNumber(totalPaidViews) },
    { label: 'Cliques', value: formatNumber(totalClicks) },
    { label: 'CPM medio', value: formatCurrency(avgCPM) },
    { label: 'CPC medio', value: formatCurrency(avgCPC) },
    { label: 'Custo por View', value: formatCurrency(costPerView) },
    { label: 'Reels Impulsionados', value: boosted.length.toString() },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Resumo de Investimento</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {metrics.map(m => (
            <div key={m.label}>
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-lg font-bold">{m.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
