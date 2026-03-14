import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';
import { formatNumber, formatPercentage } from '../../lib/metrics';

interface BoostedComparisonProps {
  reels: ReelWithInsights[];
}

interface ComparisonRow {
  label: string;
  boosted: string;
  organic: string;
}

export function BoostedComparison({ reels }: BoostedComparisonProps) {
  const boosted = reels.filter(r => r.is_boosted);
  const organic = reels.filter(r => !r.is_boosted);

  if (boosted.length === 0 || organic.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Impulsionado vs Organico</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Necessario ter Reels impulsionados e nao-impulsionados para comparar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const avg = (items: ReelWithInsights[], fn: (r: ReelWithInsights) => number) =>
    items.length > 0 ? items.reduce((s, r) => s + fn(r), 0) / items.length : 0;

  const rows: ComparisonRow[] = [
    {
      label: 'Qtd Reels',
      boosted: boosted.length.toString(),
      organic: organic.length.toString(),
    },
    {
      label: 'Media Views',
      boosted: formatNumber(avg(boosted, r => r.insights?.views || 0)),
      organic: formatNumber(avg(organic, r => r.insights?.views || 0)),
    },
    {
      label: 'Media Alcance',
      boosted: formatNumber(avg(boosted, r => r.insights?.reach || 0)),
      organic: formatNumber(avg(organic, r => r.insights?.reach || 0)),
    },
    {
      label: 'Engajamento Medio',
      boosted: formatPercentage(avg(boosted, r => r.derived.engagement_rate)),
      organic: formatPercentage(avg(organic, r => r.derived.engagement_rate)),
    },
    {
      label: 'Retencao Media',
      boosted: formatPercentage(avg(boosted.filter(r => r.derived.retention_pct != null), r => r.derived.retention_pct || 0)),
      organic: formatPercentage(avg(organic.filter(r => r.derived.retention_pct != null), r => r.derived.retention_pct || 0)),
    },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Impulsionado vs Organico</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-3 text-xs font-medium text-muted-foreground border-b pb-2">
            <span>Metrica</span>
            <span className="text-center text-blue-400">Impulsionado</span>
            <span className="text-center">Organico</span>
          </div>
          {rows.map(row => (
            <div key={row.label} className="grid grid-cols-3 text-sm py-1">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="text-center font-medium">{row.boosted}</span>
              <span className="text-center font-medium">{row.organic}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
