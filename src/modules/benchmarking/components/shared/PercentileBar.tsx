/**
 * PercentileBar - Visual bar showing percentile position
 */

import { cn } from '@/design-system/lib/utils';

interface PercentileBarProps {
  percentile: number | null;
  label: string;
  color?: string;
}

export function PercentileBar({ percentile, label, color = 'bg-kosmos-orange' }: PercentileBarProps) {
  const value = percentile ?? 0;

  const getPositionLabel = (p: number) => {
    if (p >= 90) return 'Excelente';
    if (p >= 75) return 'Muito Bom';
    if (p >= 50) return 'Bom';
    if (p >= 25) return 'Regular';
    return 'Abaixo da Média';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-kosmos-white">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-kosmos-white">
            Top {100 - value}%
          </span>
          <span className="text-xs text-kosmos-gray-400">
            ({getPositionLabel(value)})
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-kosmos-gray-800 rounded-full overflow-hidden">
        {/* Market average indicator at 50% */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-kosmos-gray-500 z-10"
          style={{ left: '50%' }}
        />

        {/* User position */}
        <div
          className={cn('absolute top-0 left-0 h-full rounded-full transition-all', color)}
          style={{ width: `${value}%` }}
        />

        {/* Position marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-kosmos-orange shadow-lg z-20"
          style={{ left: `calc(${value}% - 8px)` }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-xs text-kosmos-gray-500">
        <span>0%</span>
        <span>Média</span>
        <span>100%</span>
      </div>
    </div>
  );
}
