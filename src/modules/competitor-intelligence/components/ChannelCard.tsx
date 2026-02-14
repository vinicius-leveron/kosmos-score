/**
 * ChannelCard - Displays metrics for a single channel
 */

import { ExternalLink, Users, FileText, TrendingUp, Heart, MessageSquare, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { PLATFORM_CONFIG, CONTENT_TYPE_LABELS, CONTENT_FORMAT_LABELS, POSTING_FREQUENCY_LABELS } from '../lib/channelConfig';
import type { CompetitorChannel, ContentType, ContentFormat, PostingFrequency } from '../lib/competitorTypes';

interface ChannelCardProps {
  channel: CompetitorChannel;
}

export function ChannelCard({ channel }: ChannelCardProps) {
  const config = PLATFORM_CONFIG[channel.platform];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: config?.color ?? '#888' }}
              aria-hidden="true"
            />
            {config?.label ?? channel.platform}
          </CardTitle>
          <a
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
            aria-label={`Abrir ${config?.label ?? channel.platform} em nova aba`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        {channel.handle && (
          <p className="text-xs text-muted-foreground">@{channel.handle}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Primary metrics */}
        <div className="grid grid-cols-2 gap-2">
          <MetricItem
            icon={<Users className="h-3.5 w-3.5" aria-hidden="true" />}
            label="Seguidores"
            value={channel.followers != null ? formatNumber(channel.followers) : '--'}
          />
          <MetricItem
            icon={<FileText className="h-3.5 w-3.5" aria-hidden="true" />}
            label="Posts"
            value={channel.total_posts != null ? formatNumber(channel.total_posts) : '--'}
          />
          <MetricItem
            icon={<TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />}
            label="Engajamento"
            value={channel.engagement_rate != null ? `${channel.engagement_rate}%` : '--'}
          />
          <MetricItem
            icon={<Heart className="h-3.5 w-3.5" aria-hidden="true" />}
            label="Likes médio"
            value={channel.avg_likes != null ? formatNumber(channel.avg_likes) : '--'}
          />
        </div>

        {/* Content strategy tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {channel.primary_content_type && (
            <Badge variant="secondary" className="text-xs">
              {CONTENT_TYPE_LABELS[channel.primary_content_type as ContentType] ?? channel.primary_content_type}
            </Badge>
          )}
          {channel.primary_format && (
            <Badge variant="secondary" className="text-xs">
              {CONTENT_FORMAT_LABELS[channel.primary_format as ContentFormat] ?? channel.primary_format}
            </Badge>
          )}
          {channel.posting_frequency && (
            <Badge variant="secondary" className="text-xs">
              {POSTING_FREQUENCY_LABELS[channel.posting_frequency as PostingFrequency] ?? channel.posting_frequency}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
