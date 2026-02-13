import { useState, useEffect } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/design-system/primitives/sheet';
import { Kanban, Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrganization } from '@/core/auth';
import { PipelineBoard } from '../components/pipeline/PipelineBoard';
import { PipelineSelector } from '../components/pipeline/PipelineSelector';
import { PipelineForm } from '../components/pipeline/PipelineForm';
import { usePipelines, useDefaultPipeline } from '../hooks/usePipelines';
import { usePipelineBoard } from '../hooks/usePipelineBoard';
import type { Pipeline } from '../types';

export function PipelinePage() {
  const { organizationId } = useOrganization();
  const { data: pipelines, isLoading: pipelinesLoading, refetch: refetchPipelines } = usePipelines(organizationId);
  const { data: defaultPipeline } = useDefaultPipeline(organizationId);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [isCreatePipelineOpen, setIsCreatePipelineOpen] = useState(false);

  // Use default pipeline when loaded
  useEffect(() => {
    if (!selectedPipeline && defaultPipeline) {
      setSelectedPipeline(defaultPipeline);
    }
  }, [defaultPipeline, selectedPipeline]);

  const { data: boardData } = usePipelineBoard(selectedPipeline?.id, organizationId);

  const handleSelectPipeline = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
  };

  const handleCreateSuccess = () => {
    setIsCreatePipelineOpen(false);
    refetchPipelines();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header fixo - não faz scroll */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Kanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Pipeline de Vendas</h1>
              <p className="text-sm text-muted-foreground">
                {boardData?.totalContacts ?? 0} contatos na jornada
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <PipelineSelector
              pipelines={pipelines || []}
              selectedPipeline={selectedPipeline}
              onSelect={handleSelectPipeline}
              isLoading={pipelinesLoading}
            />
            <Button
              size="sm"
              onClick={() => setIsCreatePipelineOpen(true)}
              disabled={!organizationId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Pipeline
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/crm/contacts">
                <Users className="h-4 w-4 mr-2" />
                Ver Lista
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Board com scroll horizontal apenas nas colunas */}
      <div className="flex-1 min-h-0">
        <PipelineBoard pipelineId={selectedPipeline?.id} />
      </div>

      {/* Sheet para criar novo pipeline */}
      <Sheet open={isCreatePipelineOpen} onOpenChange={setIsCreatePipelineOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Criar Novo Pipeline</SheetTitle>
            <SheetDescription>
              Configure um novo pipeline para organizar seus contatos
            </SheetDescription>
          </SheetHeader>
          {organizationId && (
            <PipelineForm
              organizationId={organizationId}
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreatePipelineOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
