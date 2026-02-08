/**
 * ProgressBar - Progress indicator for form runtime
 */

import { Progress } from '@/design-system/primitives/progress';
import { cn } from '@/design-system/lib/utils';

interface ProgressBarProps {
  /** Current question index (0-based) */
  currentIndex: number;
  /** Total number of questions */
  totalQuestions: number;
  /** Optional form name/title to display */
  formName?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Displays progress through the form with KOSMOS branding
 */
export function ProgressBar({
  currentIndex,
  totalQuestions,
  formName,
  className,
}: ProgressBarProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className={cn('animate-fade-in', className)}>
      <div className="flex items-center justify-between mb-4">
        {/* KOSMOS Brand */}
        <div className="inline-flex items-center gap-2">
          <div className="w-4 h-px bg-kosmos-orange" />
          <span className="text-kosmos-orange font-display font-semibold tracking-[0.2em] text-xs">
            {formName || 'KOSMOS'}
          </span>
        </div>

        {/* Question Counter */}
        <div className="flex items-center gap-2">
          <span className="text-kosmos-gray text-sm font-display">
            {String(currentIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-kosmos-gray/50">/</span>
          <span className="text-kosmos-gray/50 text-sm">
            {String(totalQuestions).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress
        value={progress}
        className="h-1 bg-kosmos-black-light"
        aria-label={`Progresso: ${currentIndex + 1} de ${totalQuestions} perguntas`}
      />
    </div>
  );
}
