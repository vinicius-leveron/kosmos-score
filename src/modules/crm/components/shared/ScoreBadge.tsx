import { cn } from '@/design-system/lib/utils';

interface ScoreBadgeProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'bg-gray-500/20 text-gray-400';
  if (score >= 80) return 'bg-green-500/20 text-green-400';
  if (score >= 60) return 'bg-yellow-500/20 text-yellow-400';
  if (score >= 40) return 'bg-orange-500/20 text-orange-400';
  return 'bg-red-500/20 text-red-400';
}

function getScoreLabel(score: number | null): string {
  if (score === null) return '?';
  return score.toFixed(0);
}

export function ScoreBadge({ score, size = 'md', className }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 min-w-[32px]',
    md: 'text-sm px-2 py-1 min-w-[40px]',
    lg: 'text-base px-3 py-1.5 min-w-[48px]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium tabular-nums',
        getScoreColor(score),
        sizeClasses[size],
        className
      )}
    >
      {getScoreLabel(score)}
    </span>
  );
}
