import { useState } from 'react';
import { ArrowLeft, Loader2, Settings, Plus } from 'lucide-react';
import { useJourneyProject, useUpdateProject } from '../hooks';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { ScoreGauge, ScoreBar } from './ScoreGauge';
import { StageCard } from './StageCard';
import { JourneyMap } from './JourneyMap';
import type { JourneyProjectWithStages } from '../types';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetail({ projectId, onBack }: ProjectDetailProps) {
  const { data: project, isLoading } = useJourneyProject(projectId);
  const updateProject = useUpdateProject();
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projeto não encontrado</p>
        <Button variant="link" onClick={onBack}>
          Voltar
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (status: JourneyProjectWithStages['status']) => {
    await updateProject.mutateAsync({ id: project.id, status });
  };

  const getStatusLabel = (status: JourneyProjectWithStages['status']) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  const selectedStage = project.stages?.find((s) => s.id === selectedStageId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">
              Cliente: {project.client_name}
              {project.client_email && ` (${project.client_email})`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
            {getStatusLabel(project.status)}
          </Badge>
          {project.status === 'draft' && (
            <Button variant="outline" size="sm" onClick={() => handleStatusChange('in_progress')}>
              Iniciar Análise
            </Button>
          )}
          {project.status === 'in_progress' && (
            <Button size="sm" onClick={() => handleStatusChange('completed')}>
              Concluir
            </Button>
          )}
        </div>
      </div>

      {/* Score Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Score Geral</p>
              <ScoreGauge score={project.overall_score} size="lg" />
            </div>
            <div className="flex-1 space-y-3">
              {project.stages?.map((stage) => (
                <ScoreBar
                  key={stage.id}
                  score={stage.score}
                  label={stage.display_name}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journey Map */}
      <JourneyMap
        stages={project.stages || []}
        onStageClick={setSelectedStageId}
        selectedStageId={selectedStageId}
      />

      {/* Stage Detail */}
      {selectedStage ? (
        <StageCard
          stage={selectedStage}
          projectId={project.id}
          onClose={() => setSelectedStageId(null)}
        />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-2">
              Clique em uma etapa acima para ver os touchpoints
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
