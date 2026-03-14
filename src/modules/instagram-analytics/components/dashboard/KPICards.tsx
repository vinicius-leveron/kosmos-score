import { Eye, Users, Heart, Share2, Bookmark, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/design-system/primitives/card';
import type { ReelWithInsights } from '../../types';
import { formatNumber, formatPercentage } from '../../lib/metrics';

interface KPICardsProps {
  reels: ReelWithInsights[];
}

interface KPI {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function KPICards({ reels }: KPICardsProps) {
  const totalViews = reels.reduce((sum, r) => sum + (r.insights?.views || 0), 0);
  const totalReach = reels.reduce((sum, r) => sum + (r.insights?.reach || 0), 0);
  const totalLikes = reels.reduce((sum, r) => sum + (r.insights?.likes || 0), 0);
  const totalComments = reels.reduce((sum, r) => sum + (r.insights?.comments || 0), 0);
  const totalShares = reels.reduce((sum, r) => sum + (r.insights?.shares || 0), 0);
  const totalSaves = reels.reduce((sum, r) => sum + (r.insights?.saves || 0), 0);

  const avgEngagement = reels.length > 0
    ? reels.reduce((sum, r) => sum + r.derived.engagement_rate, 0) / reels.length
    : 0;

  const avgRetention = reels.filter(r => r.derived.retention_pct != null);
  const avgRetentionValue = avgRetention.length > 0
    ? avgRetention.reduce((sum, r) => sum + (r.derived.retention_pct || 0), 0) / avgRetention.length
    : null;

  const kpis: KPI[] = [
    { label: 'Views', value: formatNumber(totalViews), icon: Eye, color: 'text-blue-400' },
    { label: 'Alcance', value: formatNumber(totalReach), icon: Users, color: 'text-green-400' },
    { label: 'Curtidas', value: formatNumber(totalLikes), icon: Heart, color: 'text-red-400' },
    { label: 'Comentarios', value: formatNumber(totalComments), icon: MessageCircle, color: 'text-yellow-400' },
    { label: 'Compartilhamentos', value: formatNumber(totalShares), icon: Share2, color: 'text-purple-400' },
    { label: 'Salvos', value: formatNumber(totalSaves), icon: Bookmark, color: 'text-orange-400' },
    { label: 'Engajamento medio', value: formatPercentage(avgEngagement), icon: Heart, color: 'text-pink-400' },
    { label: 'Retencao media', value: formatPercentage(avgRetentionValue), icon: Eye, color: 'text-cyan-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="text-xl font-bold">{kpi.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
