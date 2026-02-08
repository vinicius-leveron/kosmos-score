import { ChevronRight } from 'lucide-react';
import { cn } from '@/design-system/lib/utils';
import type { JourneyProjectStageWithTouchpoints } from '../types';

interface JourneyMapProps {
  stages: JourneyProjectStageWithTouchpoints[];
  onStageClick: (stageId: string) => void;
  selectedStageId: string | null;
}

export function JourneyMap({ stages, onStageClick, selectedStageId }: JourneyMapProps) {
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'border-gray-300 bg-gray-50';
    if (score >= 8) return 'border-green-500 bg-green-50';
    if (score >= 6) return 'border-yellow-500 bg-yellow-50';
    if (score >= 4) return 'border-orange-500 bg-orange-50';
    return 'border-red-500 bg-red-50';
  };

  const getScoreTextColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-stretch gap-2 min-w-max">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center">
            <button
              onClick={() => onStageClick(stage.id)}
              className={cn(
                'relative flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all min-w-[140px]',
                getScoreColor(stage.score),
                selectedStageId === stage.id && 'ring-2 ring-primary ring-offset-2',
                'hover:shadow-md cursor-pointer'
              )}
            >
              {/* Stage color indicator */}
              <div
                className="absolute top-2 right-2 w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color || '#6366f1' }}
              />

              {/* Stage name */}
              <span className="font-medium text-sm text-center mb-1">
                {stage.display_name}
              </span>

              {/* Score */}
              <span className={cn('text-2xl font-bold', getScoreTextColor(stage.score))}>
                {stage.score !== null ? stage.score.toFixed(1) : '—'}
              </span>

              {/* Touchpoints count */}
              <span className="text-xs text-muted-foreground mt-1">
                {stage.touchpoints?.length || 0} touchpoints
              </span>
            </button>

            {/* Arrow */}
            {index < stages.length - 1 && (
              <ChevronRight className="h-6 w-6 text-muted-foreground mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
