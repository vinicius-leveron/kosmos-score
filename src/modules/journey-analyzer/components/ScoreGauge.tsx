import { cn } from '@/design-system/lib/utils';

interface ScoreGaugeProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreGauge({ score, size = 'md', showLabel = true }: ScoreGaugeProps) {
  if (score === null) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-full bg-gray-100 text-gray-400',
        size === 'sm' && 'h-8 w-8 text-xs',
        size === 'md' && 'h-12 w-12 text-sm',
        size === 'lg' && 'h-16 w-16 text-base',
      )}>
        —
      </div>
    );
  }

  const getScoreColor = (s: number) => {
    if (s >= 8) return 'bg-green-500 text-white';
    if (s >= 6) return 'bg-yellow-500 text-white';
    if (s >= 4) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 8) return 'Excelente';
    if (s >= 6) return 'Bom';
    if (s >= 4) return 'Regular';
    return 'Crítico';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'flex items-center justify-center rounded-full font-semibold',
        getScoreColor(score),
        size === 'sm' && 'h-8 w-8 text-xs',
        size === 'md' && 'h-12 w-12 text-sm',
        size === 'lg' && 'h-16 w-16 text-lg',
      )}>
        {score.toFixed(1)}
      </div>
      {showLabel && size !== 'sm' && (
        <span className={cn(
          'text-muted-foreground',
          size === 'md' && 'text-xs',
          size === 'lg' && 'text-sm',
        )}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

interface ScoreBarProps {
  score: number | null;
  label?: string;
}

export function ScoreBar({ score, label }: ScoreBarProps) {
  const percentage = score !== null ? (score / 10) * 100 : 0;

  const getBarColor = (s: number | null) => {
    if (s === null) return 'bg-gray-200';
    if (s >= 8) return 'bg-green-500';
    if (s >= 6) return 'bg-yellow-500';
    if (s >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{score !== null ? score.toFixed(1) : '—'}</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className={cn('h-full rounded-full transition-all', getBarColor(score))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
