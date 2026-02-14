import { Loader2 } from 'lucide-react';
import { ScoreBar } from '../ScoreGauge';
import { useJourneyProject } from '../../hooks';

interface ScoreComparisonProps {
  projectId: string;
}

export function ScoreComparison({ projectId }: ScoreComparisonProps) {
  const { data: project, isLoading } = useJourneyProject(projectId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project || !project.stages?.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhuma etapa disponivel para comparacao
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Os scores sao atualizados automaticamente conforme touchpoints sao avaliados
      </p>
      <div className="space-y-3">
        {project.stages.map((stage) => (
          <ScoreBar key={stage.id} score={stage.score} label={stage.display_name} />
        ))}
      </div>
      {project.overall_score !== null && (
        <div className="pt-3 border-t">
          <ScoreBar score={project.overall_score} label="Score Geral" />
        </div>
      )}
    </div>
  );
}
