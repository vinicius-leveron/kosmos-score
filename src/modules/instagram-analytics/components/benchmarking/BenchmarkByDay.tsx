import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';
import { DAYS_OF_WEEK } from '../../lib/constants';
import { formatPercentage } from '../../lib/metrics';

interface BenchmarkByDayProps {
  reels: ReelWithInsights[];
}

export function BenchmarkByDay({ reels }: BenchmarkByDayProps) {
  // Group by day of week and hour
  const dayStats = DAYS_OF_WEEK.map((day, dayIndex) => {
    const dayReels = reels.filter(r => new Date(r.timestamp).getDay() === dayIndex);
    const avgEngagement = dayReels.length > 0
      ? dayReels.reduce((s, r) => s + r.derived.engagement_rate, 0) / dayReels.length
      : 0;
    const avgViews = dayReels.length > 0
      ? dayReels.reduce((s, r) => s + (r.insights?.views || 0), 0) / dayReels.length
      : 0;

    return { day, count: dayReels.length, avgEngagement, avgViews };
  });

  const maxEngagement = Math.max(...dayStats.map(d => d.avgEngagement), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Dia da Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {dayStats.map(stat => (
            <div key={stat.day} className="flex items-center gap-3 text-sm">
              <span className="w-20 text-muted-foreground">{stat.day}</span>
              <div className="flex-1 h-6 bg-kosmos-gray/10 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#833AB4] to-[#E1306C] rounded"
                  style={{ width: `${(stat.avgEngagement / maxEngagement) * 100}%` }}
                />
              </div>
              <span className="w-16 text-right font-medium">{formatPercentage(stat.avgEngagement)}</span>
              <span className="w-16 text-right text-muted-foreground text-xs">{stat.count} reels</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
