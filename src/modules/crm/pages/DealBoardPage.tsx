import { useState, useCallback } from 'react';
import { Button } from '@/design-system/primitives/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/design-system/primitives/sheet';
import { Target, Plus, DollarSign, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrganization } from '@/core/auth';
import { usePipelines } from '../hooks/usePipelines';
import { useDealBoard, useMoveDealStage } from '../hooks/useDeals';
import { DealBoardColumn, DealForm, DealDetail } from '../components/deals';
import { PipelineSelector } from '../components/pipeline/PipelineSelector';
import { PipelineForm } from '../components/pipeline/PipelineForm';
import { StageManagerSheet } from '../components/deals/StageManagerSheet';

export function DealBoardPage() {
  const { organizationId } = useOrganization();

  const { data: pipelines } = usePipelines(organizationId || undefined);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');

  // Use first pipeline as default
  const activePipelineId = selectedPipelineId || pipelines?.[0]?.id || '';

  const { data: boardData, isLoading } = useDealBoard(activePipelineId, organizationId || undefined);
  const moveDealStage = useMoveDealStage();

  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreatePipelineOpen, setIsCreatePipelineOpen] = useState(false);
  const [isManageStagesOpen, setIsManageStagesOpen] = useState(false);

  const handleDrop = useCallback(
    (dealId: string, stageId: string) => {
      // Find current stage of the deal
      const currentDeal = boardData?.columns
        .flatMap((col) => col.deals)
        .find((d) => d.id === dealId);

      if (currentDeal && currentDeal.stage_id !== stageId) {
        moveDealStage.mutate({
          dealId,
          stageId,
        });
      }
    },
    [boardData, moveDealStage]
  );

  const handleDealClick = (dealId: string) => {
    setSelectedDealId(dealId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedDealId(null), 300);
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(value);

  const currentPipeline = pipelines?.find((p) => p.id === activePipelineId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b shrink-0">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Deals</h1>
                <p className="text-muted-foreground">
                  Gerencie seu pipeline de vendas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/admin/crm/companies">
                  <Building2 className="h-4 w-4 mr-2" />
                  Empresas
                </Link>
              </Button>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Deal
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Selector + Stats */}
      <div className="border-b shrink-0">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <PipelineSelector
                pipelines={pipelines || []}
                selectedPipeline={currentPipeline}
                onSelect={(p) => setSelectedPipelineId(p.id)}
                onCreateNew={() => setIsCreatePipelineOpen(true)}
                onManageStages={() => setIsManageStagesOpen(true)}
              />

              {currentPipeline?.description && (
                <span className="text-sm text-muted-foreground">
                  {currentPipeline.description}
                </span>
              )}
            </div>

            {boardData && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {boardData.total_deals} deals abertos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">
                    {formatCurrency(boardData.total_value)} em pipeline
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="max-w-full px-6 py-6">
            <div className="flex gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-72 h-96 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : !boardData || boardData.columns.length === 0 ? (
          <div className="max-w-full px-6 py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum estágio configurado</h3>
            <p className="text-muted-foreground mb-4">
              Configure os estágios do pipeline para começar
            </p>
          </div>
        ) : (
          <div className="h-full overflow-x-auto">
            <div className="max-w-full px-6 py-6 h-full">
              <div className="flex gap-4 min-w-max h-full">
                {boardData.columns.map((column) => (
                  <DealBoardColumn
                    key={column.id}
                    column={column}
                    onDealClick={handleDealClick}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deal Detail Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes do Deal</SheetTitle>
          </SheetHeader>
          {selectedDealId && (
            <DealDetail
              dealId={selectedDealId}
              onClose={handleCloseDetail}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Create Deal Sheet */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Novo Deal</SheetTitle>
            <SheetDescription>
              Adicione uma nova oportunidade de negócio
            </SheetDescription>
          </SheetHeader>
          <DealForm
            organizationId={organizationId}
            defaultPipelineId={activePipelineId}
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Create Pipeline Sheet */}
      <Sheet open={isCreatePipelineOpen} onOpenChange={setIsCreatePipelineOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Novo Pipeline</SheetTitle>
            <SheetDescription>
              Crie um novo pipeline para organizar seus deals
            </SheetDescription>
          </SheetHeader>
          {organizationId && (
            <PipelineForm
              organizationId={organizationId}
              onSuccess={() => setIsCreatePipelineOpen(false)}
              onCancel={() => setIsCreatePipelineOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Stage Manager Sheet */}
      <StageManagerSheet
        open={isManageStagesOpen}
        onOpenChange={setIsManageStagesOpen}
        pipelineId={activePipelineId}
        pipelineName={currentPipeline?.display_name || currentPipeline?.name}
      />
    </div>
  );
}
