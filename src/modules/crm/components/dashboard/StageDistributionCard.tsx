import { Layers } from 'lucide-react';
import type { StageCount } from '../../hooks/useCrmDashboard';

interface StageDistributionCardProps {
  stages: StageCount[];
  onStageClick?: (stage: StageCount) => void;
}

export function StageDistributionCard({ stages, onStageClick }: StageDistributionCardProps) {
  const totalContacts = stages.reduce((sum, s) => sum + s.count, 0);

  if (stages.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Layers className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="font-semibold">Por Estágio</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum estágio configurado
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <Layers className="h-5 w-5 text-purple-500" />
        </div>
        <h3 className="font-semibold">Por Estágio</h3>
      </div>
      <div className="space-y-3">
        {stages.map((stage) => {
          const percentage = totalContacts > 0
            ? Math.round((stage.count / totalContacts) * 100)
            : 0;

          return (
            <button
              key={stage.id}
              onClick={() => onStageClick?.(stage)}
              className="w-full text-left hover:bg-muted/50 p-2 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-medium">{stage.displayName}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {stage.count}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: stage.color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
