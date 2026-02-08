import { cn } from '@/design-system/lib/utils';
import type { ScoreBreakdown } from '../../types';

interface ScoreDisplayProps {
  scoreBreakdown: ScoreBreakdown;
  className?: string;
}

interface PillarBarProps {
  label: string;
  value: number | undefined;
  color: string;
}

function PillarBar({ label, value, color }: PillarBarProps) {
  const percentage = value ?? 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{percentage.toFixed(0)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

export function ScoreDisplay({ scoreBreakdown, className }: ScoreDisplayProps) {
  const hasPillars =
    scoreBreakdown.causa !== undefined ||
    scoreBreakdown.cultura !== undefined ||
    scoreBreakdown.economia !== undefined;

  if (!hasPillars) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h4 className="text-sm font-medium">Score por Pilar</h4>

      <div className="space-y-3">
        <PillarBar
          label="Causa"
          value={scoreBreakdown.causa}
          color="#f97316"
        />
        <PillarBar
          label="Cultura"
          value={scoreBreakdown.cultura}
          color="#8b5cf6"
        />
        <PillarBar
          label="Economia"
          value={scoreBreakdown.economia}
          color="#10b981"
        />
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        {scoreBreakdown.base_value !== undefined && (
          <div className="text-sm">
            <span className="text-muted-foreground">Valor da Base:</span>
            <span className="ml-2 font-medium">
              R$ {scoreBreakdown.base_value.toLocaleString('pt-BR')}
            </span>
          </div>
        )}
        {scoreBreakdown.lucro_oculto !== undefined && (
          <div className="text-sm">
            <span className="text-muted-foreground">Lucro Oculto:</span>
            <span className="ml-2 font-medium text-green-500">
              R$ {scoreBreakdown.lucro_oculto.toLocaleString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      {scoreBreakdown.is_beginner && (
        <div className="text-sm text-muted-foreground italic">
          * Perfil iniciante
        </div>
      )}
    </div>
  );
}
