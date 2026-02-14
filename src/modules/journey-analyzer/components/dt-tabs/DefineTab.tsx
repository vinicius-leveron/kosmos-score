import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { JourneyMap } from '../JourneyMap';
import { StageCard } from '../StageCard';
import { PainPointsList } from '../define/PainPointsList';
import { ProblemStatementBuilder } from '../define/ProblemStatementBuilder';
import { usePersonas, useProblemStatements } from '../../hooks';
import type { JourneyProjectWithStages } from '../../types';

interface DefineTabProps {
  project: JourneyProjectWithStages;
}

export function DefineTab({ project }: DefineTabProps) {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const { data: personas } = usePersonas(project.id);
  const { data: problemStatements } = useProblemStatements(project.id);

  const selectedStage = project.stages?.find((s) => s.id === selectedStageId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mapa da Jornada</CardTitle>
        </CardHeader>
        <CardContent>
          <JourneyMap
            stages={project.stages || []}
            onStageClick={setSelectedStageId}
            selectedStageId={selectedStageId}
          />
        </CardContent>
      </Card>

      {selectedStage && (
        <StageCard
          stage={selectedStage}
          projectId={project.id}
          onClose={() => setSelectedStageId(null)}
        />
      )}

      <PainPointsList stages={project.stages || []} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Declaracoes do Problema (HMW)</CardTitle>
        </CardHeader>
        <CardContent>
          <ProblemStatementBuilder
            projectId={project.id}
            problemStatements={problemStatements || []}
            personas={personas || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
