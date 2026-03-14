import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import type { ReelWithInsights } from '../../types';
import { formatNumber, formatPercentage, formatDuration } from '../../lib/metrics';

interface RecentReelsGridProps {
  reels: ReelWithInsights[];
  limit?: number;
}

export function RecentReelsGrid({ reels, limit = 6 }: RecentReelsGridProps) {
  const displayed = reels.slice(0, limit);

  if (displayed.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum Reel encontrado no periodo selecionado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayed.map((reel) => (
        <Card key={reel.id} className="overflow-hidden">
          <div className="aspect-[9/16] max-h-[200px] bg-kosmos-gray/20 relative">
            {reel.thumbnail_url ? (
              <img src={reel.thumbnail_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Sem thumbnail
              </div>
            )}
            {reel.is_boosted && (
              <Badge className="absolute top-2 right-2 bg-blue-600">Impulsionado</Badge>
            )}
            {reel.duration_seconds && (
              <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-1.5 py-0.5 rounded">
                {formatDuration(reel.duration_seconds)}
              </span>
            )}
          </div>
          <CardContent className="p-3">
            <p className="text-sm line-clamp-2 mb-2">{reel.caption || 'Sem legenda'}</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-bold">{formatNumber(reel.insights?.views || 0)}</p>
                <p className="text-muted-foreground">Views</p>
              </div>
              <div>
                <p className="font-bold">{formatPercentage(reel.derived.engagement_rate)}</p>
                <p className="text-muted-foreground">Eng.</p>
              </div>
              <div>
                <p className="font-bold">{formatPercentage(reel.derived.retention_pct)}</p>
                <p className="text-muted-foreground">Ret.</p>
              </div>
            </div>
            {reel.permalink && (
              <a
                href={reel.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2"
              >
                <ExternalLink className="h-3 w-3" /> Ver no Instagram
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
