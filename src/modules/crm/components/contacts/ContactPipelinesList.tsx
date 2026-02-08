import { useState } from 'react';
import { Button } from '@/design-system/primitives/button';
import { Badge } from '@/design-system/primitives/badge';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/design-system/primitives/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import { Plus, X, ArrowRight } from 'lucide-react';
import { useContactPipelines, useAvailablePipelinesForContact } from '../../hooks/useContactPipelines';
import { useAddContactToPipeline, useRemoveContactFromPipeline } from '../../hooks/usePipelineBoard';
import { usePipelineStages } from '../../hooks/usePipelineStages';
import type { Pipeline } from '../../types';

interface ContactPipelinesListProps {
  contactOrgId: string;
}

export function ContactPipelinesList({ contactOrgId }: ContactPipelinesListProps) {
  const { data: positions, isLoading } = useContactPipelines(contactOrgId);
  const { data: availablePipelines } = useAvailablePipelinesForContact(contactOrgId);
  const addToPipeline = useAddContactToPipeline();
  const removeFromPipeline = useRemoveContactFromPipeline();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');

  const handleAddToPipeline = () => {
    if (!selectedPipeline || !selectedStage) return;

    addToPipeline.mutate(
      { contactOrgId, pipelineId: selectedPipeline, stageId: selectedStage },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          setSelectedPipeline('');
          setSelectedStage('');
        },
      }
    );
  };

  const handleRemoveFromPipeline = (pipelineId: string) => {
    removeFromPipeline.mutate({ contactOrgId, pipelineId });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Pipelines</label>
        {availablePipelines && availablePipelines.length > 0 && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar a Pipeline</DialogTitle>
                <DialogDescription>
                  Selecione um pipeline e o estágio inicial para este contato.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pipeline</label>
                  <Select value={selectedPipeline} onValueChange={(value) => {
                    setSelectedPipeline(value);
                    setSelectedStage('');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um pipeline" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePipelines.map((pipeline) => (
                        <SelectItem key={pipeline.id} value={pipeline.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: pipeline.color }}
                            />
                            {pipeline.display_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPipeline && (
                  <StageSelector
                    pipelineId={selectedPipeline}
                    value={selectedStage}
                    onValueChange={setSelectedStage}
                  />
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddToPipeline}
                  disabled={!selectedPipeline || !selectedStage || addToPipeline.isPending}
                >
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {positions && positions.length > 0 ? (
        <div className="space-y-2">
          {positions.map((position) => (
            <div
              key={position.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg group"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: position.pipeline.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {position.pipeline.display_name}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: position.stage.color,
                      color: position.stage.color,
                    }}
                  >
                    {position.stage.display_name}
                  </Badge>
                  <span className="mx-1">-</span>
                  <span>desde {formatDate(position.entered_stage_at)}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveFromPipeline(position.pipeline_id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Este contato não está em nenhum pipeline.
        </p>
      )}
    </div>
  );
}

interface StageSelectorProps {
  pipelineId: string;
  value: string;
  onValueChange: (value: string) => void;
}

function StageSelector({ pipelineId, value, onValueChange }: StageSelectorProps) {
  const { data: stages, isLoading } = usePipelineStages(pipelineId);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Estágio Inicial</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um estágio" />
        </SelectTrigger>
        <SelectContent>
          {stages?.map((stage) => (
            <SelectItem key={stage.id} value={stage.id}>
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                {stage.display_name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
