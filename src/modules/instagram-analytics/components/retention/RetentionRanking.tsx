import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';
import { formatPercentage, formatNumber, formatDuration } from '../../lib/metrics';

interface RetentionRankingProps {
  reels: ReelWithInsights[];
}

export function RetentionRanking({ reels }: RetentionRankingProps) {
  const ranked = reels
    .filter(r => r.derived.retention_pct != null)
    .sort((a, b) => (b.derived.retention_pct || 0) - (a.derived.retention_pct || 0));

  if (ranked.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking por Retencao</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {ranked.slice(0, 10).map((reel, i) => (
            <div key={reel.id} className="flex items-center gap-3 text-sm">
              <span className="w-6 text-center font-bold text-muted-foreground">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate">{reel.caption || 'Sem legenda'}</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(reel.insights?.views || 0)} views · {formatDuration(reel.duration_seconds)}
                </p>
              </div>
              <span className="font-bold text-green-400">{formatPercentage(reel.derived.retention_pct)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
