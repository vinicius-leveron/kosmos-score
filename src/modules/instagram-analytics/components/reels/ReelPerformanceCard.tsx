import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import type { ReelWithInsights } from '../../types';
import { formatNumber, formatPercentage, formatCurrency, formatDuration, formatWatchTime } from '../../lib/metrics';
import { QUADRANT_COLORS, QUADRANT_LABELS } from '../../lib/constants';

interface ReelPerformanceCardProps {
  reel: ReelWithInsights;
}

export function ReelPerformanceCard({ reel }: ReelPerformanceCardProps) {
  const { insights, ad_insights, derived, hook_quadrant } = reel;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex gap-3">
          {reel.thumbnail_url && (
            <img src={reel.thumbnail_url} alt="" className="w-16 h-28 object-cover rounded" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-2">{reel.caption || 'Sem legenda'}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="outline" className="text-xs">
                {new Date(reel.timestamp).toLocaleDateString('pt-BR')}
              </Badge>
              {reel.duration_seconds && (
                <Badge variant="outline" className="text-xs">{formatDuration(reel.duration_seconds)}</Badge>
              )}
              {reel.is_boosted && <Badge className="text-xs bg-blue-600">Impulsionado</Badge>}
              {hook_quadrant && (
                <Badge style={{ backgroundColor: QUADRANT_COLORS[hook_quadrant] }} className="text-xs text-white">
                  {QUADRANT_LABELS[hook_quadrant]}
                </Badge>
              )}
            </div>
          </div>
          {reel.permalink && (
            <a href={reel.permalink} target="_blank" rel="noopener noreferrer" aria-label="Ver no Instagram">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Organic Column */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Organico</h4>
            <div className="space-y-1.5 text-sm">
              <MetricRow label="Views" value={formatNumber(insights?.views || 0)} />
              <MetricRow label="Alcance" value={formatNumber(insights?.reach || 0)} />
              <MetricRow label="Curtidas" value={formatNumber(insights?.likes || 0)} />
              <MetricRow label="Comentarios" value={formatNumber(insights?.comments || 0)} />
              <MetricRow label="Compartilhamentos" value={formatNumber(insights?.shares || 0)} />
              <MetricRow label="Salvos" value={formatNumber(insights?.saves || 0)} />
              <MetricRow label="Reposts" value={formatNumber(insights?.reposts || 0)} />
            </div>
          </div>

          {/* Paid Column */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Pago</h4>
            {ad_insights ? (
              <div className="space-y-1.5 text-sm">
                <MetricRow label="Impressoes" value={formatNumber(ad_insights.impressions)} />
                <MetricRow label="Alcance" value={formatNumber(ad_insights.reach)} />
                <MetricRow label="ThruPlays" value={formatNumber(ad_insights.thru_plays)} />
                <MetricRow label="Cliques" value={formatNumber(ad_insights.clicks)} />
                <MetricRow label="CPM" value={formatCurrency(ad_insights.cpm)} />
                <MetricRow label="CPC" value={formatCurrency(ad_insights.cpc)} />
                <MetricRow label="Investimento" value={formatCurrency(ad_insights.spend)} />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Nao impulsionado</p>
            )}
          </div>
        </div>

        {/* Derived Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t text-center">
          <div>
            <p className="text-xs text-muted-foreground">Engajamento</p>
            <p className="font-bold text-sm">{formatPercentage(derived.engagement_rate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Retencao</p>
            <p className="font-bold text-sm">{formatPercentage(derived.retention_pct)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Watch Time</p>
            <p className="font-bold text-sm">{formatWatchTime(insights?.avg_watch_time_ms ?? null)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
