import { useState } from 'react';
import { Input } from '@/design-system/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/primitives/select';
import type { ReelWithInsights } from '../../types';
import { ReelPerformanceCard } from './ReelPerformanceCard';

interface ReelsListProps {
  reels: ReelWithInsights[];
  isLoading: boolean;
}

type SortBy = 'date' | 'views' | 'engagement' | 'retention';

export function ReelsList({ reels, isLoading }: ReelsListProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-kosmos-gray/10 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const filtered = reels.filter(r =>
    !search || r.caption?.toLowerCase().includes(search.toLowerCase()),
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'views': return (b.insights?.views || 0) - (a.insights?.views || 0);
      case 'engagement': return b.derived.engagement_rate - a.derived.engagement_rate;
      case 'retention': return (b.derived.retention_pct || 0) - (a.derived.retention_pct || 0);
      default: return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Buscar por legenda..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <SelectTrigger className="w-[180px]" aria-label="Ordenar por">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Mais recentes</SelectItem>
            <SelectItem value="views">Mais views</SelectItem>
            <SelectItem value="engagement">Maior engajamento</SelectItem>
            <SelectItem value="retention">Maior retencao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum Reel encontrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map(reel => (
            <ReelPerformanceCard key={reel.id} reel={reel} />
          ))}
        </div>
      )}
    </div>
  );
}
