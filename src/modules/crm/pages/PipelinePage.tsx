import { useState, useEffect } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Kanban, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrganization } from '@/core/auth';
import { PipelineBoard } from '../components/pipeline/PipelineBoard';
import { PipelineSelector } from '../components/pipeline/PipelineSelector';
import { usePipelines, useDefaultPipeline } from '../hooks/usePipelines';
import { usePipelineBoard } from '../hooks/usePipelineBoard';
import type { Pipeline } from '../types';

export function PipelinePage() {
  const { organizationId } = useOrganization();
  const { data: pipelines, isLoading: pipelinesLoading } = usePipelines(organizationId);
  const { data: defaultPipeline } = useDefaultPipeline(organizationId);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);

  // Use default pipeline when loaded
  useEffect(() => {
    if (!selectedPipeline && defaultPipeline) {
      setSelectedPipeline(defaultPipeline);
    }
  }, [defaultPipeline, selectedPipeline]);

  const { data: boardData } = usePipelineBoard(selectedPipeline?.id);

  const handleSelectPipeline = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Kanban className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pipeline</h1>
                <p className="text-muted-foreground">
                  {boardData?.totalContacts ?? 0} contatos na jornada
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PipelineSelector
                pipelines={pipelines || []}
                selectedPipeline={selectedPipeline}
                onSelect={handleSelectPipeline}
                isLoading={pipelinesLoading}
              />
              <Button variant="outline" asChild>
                <Link to="/admin/crm/contacts">
                  <Users className="h-4 w-4 mr-2" />
                  Lista
                </Link>
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Contato
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      <PipelineBoard pipelineId={selectedPipeline?.id} />
    </div>
  );
}
