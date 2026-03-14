import type { ReelWithInsights } from '../../types';
import { KPICards } from './KPICards';
import { RecentReelsGrid } from './RecentReelsGrid';

interface OverviewTabProps {
  reels: ReelWithInsights[];
  isLoading: boolean;
}

export function OverviewTab({ reels, isLoading }: OverviewTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-kosmos-gray/10 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-60 bg-kosmos-gray/10 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <KPICards reels={reels} />
      <div>
        <h3 className="text-lg font-semibold mb-3">Reels Recentes</h3>
        <RecentReelsGrid reels={reels} limit={6} />
      </div>
    </div>
  );
}
