import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/design-system/primitives/dropdown-menu';
import { Skeleton } from '@/design-system/primitives/skeleton';
import type { Pipeline } from '../../types';

interface PipelineSelectorProps {
  pipelines: Pipeline[];
  selectedPipeline: Pipeline | null | undefined;
  onSelect: (pipeline: Pipeline) => void;
  onCreateNew?: () => void;
  isLoading?: boolean;
}

export function PipelineSelector({
  pipelines,
  selectedPipeline,
  onSelect,
  onCreateNew,
  isLoading,
}: PipelineSelectorProps) {
  if (isLoading) {
    return <Skeleton className="h-10 w-48" />;
  }

  if (pipelines.length === 0) {
    return (
      <Button variant="outline" onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Criar Pipeline
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[180px] justify-between">
          <div className="flex items-center gap-2">
            {selectedPipeline && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedPipeline.color }}
              />
            )}
            <span>{selectedPipeline?.display_name || 'Selecionar Pipeline'}</span>
          </div>
          <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {pipelines.map((pipeline) => (
          <DropdownMenuItem
            key={pipeline.id}
            onClick={() => onSelect(pipeline)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: pipeline.color }}
              />
              <span>{pipeline.display_name}</span>
              {pipeline.is_default && (
                <span className="ml-auto text-xs text-muted-foreground">
                  Padrão
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        {onCreateNew && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCreateNew} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Novo Pipeline
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
