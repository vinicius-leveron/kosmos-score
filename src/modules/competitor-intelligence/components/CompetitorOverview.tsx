/**
 * CompetitorOverview - Header card with competitor profile summary
 */

import { Globe, Instagram, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/design-system/primitives/avatar';
import { Badge } from '@/design-system/primitives/badge';
import { PLATFORM_CONFIG } from '../lib/channelConfig';
import type { CompetitorDetail } from '../lib/competitorTypes';

interface CompetitorOverviewProps {
  competitor: CompetitorDetail;
}

export function CompetitorOverview({ competitor }: CompetitorOverviewProps) {
  const initials = (competitor.display_name ?? competitor.instagram_handle)
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={competitor.avatar_url ?? undefined}
            alt={competitor.display_name ?? competitor.instagram_handle}
          />
          <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-pink-500 to-purple-600 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">
            {competitor.display_name ?? `@${competitor.instagram_handle}`}
          </h2>

          <a
            href={`https://instagram.com/${competitor.instagram_handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-0.5"
          >
            <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
            @{competitor.instagram_handle}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>

          {competitor.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {competitor.bio}
            </p>
          )}

          {competitor.website_url && (
            <a
              href={competitor.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 mt-1"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              {competitor.website_url.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>

      {/* Channel badges */}
      {competitor.channels.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {competitor.channels.map((channel) => {
            const config = PLATFORM_CONFIG[channel.platform];
            return (
              <Badge
                key={channel.id}
                variant="outline"
                className={config?.bgColor}
              >
                {config?.label ?? channel.platform}
              </Badge>
            );
          })}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <KpiMini label="Canais" value={competitor.total_channels} />
        <KpiMini label="Produtos" value={competitor.total_products} />
        <KpiMini
          label="Eng. médio"
          value={getAvgEngagement(competitor)}
          suffix="%"
        />
        <KpiMini
          label="Posts/sem"
          value={getAvgPostsPerWeek(competitor)}
        />
      </div>
    </div>
  );
}

function KpiMini({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="text-center p-3 rounded-md bg-muted/30">
      <p className="text-xl font-bold">
        {typeof value === 'number' ? value.toFixed(value % 1 ? 1 : 0) : value}
        {suffix}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function getAvgEngagement(competitor: CompetitorDetail): number {
  const rates = competitor.channels
    .map((c) => c.engagement_rate)
    .filter((r): r is number => r != null);
  if (rates.length === 0) return 0;
  return rates.reduce((sum, r) => sum + r, 0) / rates.length;
}

function getAvgPostsPerWeek(competitor: CompetitorDetail): number {
  const posts = competitor.channels
    .map((c) => c.posts_per_week)
    .filter((p): p is number => p != null);
  if (posts.length === 0) return 0;
  return posts.reduce((sum, p) => sum + p, 0);
}
