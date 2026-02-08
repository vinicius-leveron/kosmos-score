/**
 * ScoreDisplay - Circular score visualization for form runtime
 */

import type { FormClassification } from '../../types/form.types';

interface ScoreDisplayProps {
  /** Numeric score (0-100) */
  score: number;
  /** Optional classification with color */
  classification?: FormClassification | null;
  /** Label to show below score */
  label?: string;
}

/**
 * Get score color based on value or classification
 */
function getScoreColor(score: number, classification?: FormClassification | null): string {
  if (classification?.color) return classification.color;
  if (score >= 80) return '#22C55E'; // Green
  if (score >= 60) return '#EAB308'; // Yellow
  if (score >= 40) return '#F97316'; // Orange
  return '#EF4444'; // Red
}

/**
 * Circular score display with animated progress ring
 */
export function ScoreDisplay({
  score,
  classification,
  label = 'Sua Pontuacao',
}: ScoreDisplayProps) {
  const scoreColor = getScoreColor(score, classification);

  return (
    <div className="text-center mb-8">
      <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
        {/* Circular progress background */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-kosmos-black-light"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={scoreColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 283} 283`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display text-4xl font-bold"
            style={{ color: scoreColor }}
          >
            {Math.round(score)}
          </span>
        </div>
      </div>
      <p className="text-kosmos-gray text-sm">{label}</p>
    </div>
  );
}

interface ClassificationBadgeProps {
  classification: FormClassification;
  fallbackColor?: string;
}

/**
 * Classification badge display
 */
export function ClassificationBadge({
  classification,
  fallbackColor,
}: ClassificationBadgeProps) {
  const color = classification.color || fallbackColor || '#F97316';

  return (
    <div className="text-center mb-6">
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
        style={{
          borderColor: color,
          backgroundColor: `${color}20`,
        }}
      >
        {classification.emoji && (
          <span className="text-xl">{classification.emoji}</span>
        )}
        <span className="font-display font-semibold" style={{ color }}>
          {classification.name}
        </span>
      </div>
    </div>
  );
}
