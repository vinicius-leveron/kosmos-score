import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/design-system/primitives/sheet';
import { Button } from '@/design-system/primitives/button';
import { Input } from '@/design-system/primitives/input';
import { Skeleton } from '@/design-system/primitives/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/design-system/primitives/alert-dialog';
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  Check,
} from 'lucide-react';
import { useOrganization } from '@/core/auth';
import {
  usePipelineStages,
  useCreatePipelineStage,
  useUpdatePipelineStage,
  useDeletePipelineStage,
  useReorderPipelineStages,
} from '../../hooks/usePipelineStages';
import { useToast } from '@/design-system/primitives/use-toast';
import type { PipelineStage } from '../../types';

interface StageManagerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string | undefined;
  pipelineName?: string;
}

const defaultColors = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

export function StageManagerSheet({
  open,
  onOpenChange,
  pipelineId,
  pipelineName,
}: StageManagerSheetProps) {
  const { organizationId } = useOrganization();
  const { toast } = useToast();

  const { data: stages, isLoading } = usePipelineStages(pipelineId);
  const createStage = useCreatePipelineStage();
  const updateStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();
  const reorderStages = useReorderPipelineStages();

  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<{ name: string; color: string }>({
    name: '',
    color: '',
  });
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState(defaultColors[0]);
  const [deletingStage, setDeletingStage] = useState<PipelineStage | null>(null);

  const handleStartEdit = (stage: PipelineStage) => {
    setEditingStageId(stage.id);
    setEditingValues({
      name: stage.display_name || stage.name,
      color: stage.color,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingStageId || !editingValues.name.trim()) return;

    try {
      await updateStage.mutateAsync({
        stageId: editingStageId,
        data: {
          display_name: editingValues.name.trim(),
          color: editingValues.color,
        },
      });
      setEditingStageId(null);
      toast({ title: 'Estagio atualizado' });
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' });
    }
  };

  const handleCancelEdit = () => {
    setEditingStageId(null);
  };

  const handleAddStage = async () => {
    if (!pipelineId || !organizationId || !newStageName.trim()) return;

    try {
      await createStage.mutateAsync({
        pipelineId,
        organizationId,
        data: {
          name: newStageName.trim().toLowerCase().replace(/\s+/g, '_'),
          display_name: newStageName.trim(),
          color: newStageColor,
        },
      });
      setNewStageName('');
      const nextColorIndex = (stages?.length || 0) % defaultColors.length;
      setNewStageColor(defaultColors[nextColorIndex]);
      toast({ title: 'Estagio criado' });
    } catch {
      toast({ title: 'Erro ao criar estagio', variant: 'destructive' });
    }
  };

  const handleDeleteStage = async () => {
    if (!deletingStage) return;

    try {
      await deleteStage.mutateAsync({ stageId: deletingStage.id });
      setDeletingStage(null);
      toast({ title: 'Estagio removido' });
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
  };

  const handleMoveUp = async (index: number) => {
    if (!pipelineId || !stages || index === 0) return;

    const newOrder = [...stages];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    const stageIds = newOrder.map((s) => s.id);

    try {
      await reorderStages.mutateAsync({ pipelineId, stageIds });
    } catch {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
    }
  };

  const handleMoveDown = async (index: number) => {
    if (!pipelineId || !stages || index === stages.length - 1) return;

    const newOrder = [...stages];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    const stageIds = newOrder.map((s) => s.id);

    try {
      await reorderStages.mutateAsync({ pipelineId, stageIds });
    } catch {
      toast({ title: 'Erro ao reordenar', variant: 'destructive' });
    }
  };

  const isAnyLoading =
    createStage.isPending ||
    updateStage.isPending ||
    deleteStage.isPending ||
    reorderStages.isPending;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Gerenciar Estagios</SheetTitle>
            <SheetDescription>
              {pipelineName
                ? `Edite os estagios do pipeline "${pipelineName}"`
                : 'Edite os estagios do pipeline'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Lista de Estágios */}
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : !stages || stages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum estagio cadastrado
              </p>
            ) : (
              <div className="space-y-2">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                    {editingStageId === stage.id ? (
                      // Edit mode
                      <>
                        <Input
                          type="color"
                          value={editingValues.color}
                          onChange={(e) =>
                            setEditingValues({ ...editingValues, color: e.target.value })
                          }
                          className="w-10 h-8 p-1 flex-shrink-0"
                        />
                        <Input
                          value={editingValues.name}
                          onChange={(e) =>
                            setEditingValues({ ...editingValues, name: e.target.value })
                          }
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          disabled={isAnyLoading}
                        >
                          {updateStage.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    ) : (
                      // View mode
                      <>
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: stage.color }}
                        />
                        <span
                          className="flex-1 text-sm cursor-pointer hover:text-primary"
                          onClick={() => handleStartEdit(stage)}
                        >
                          {stage.display_name || stage.name}
                        </span>

                        {/* Reorder buttons */}
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleMoveUp(index)}
                            disabled={index === 0 || isAnyLoading}
                            className="h-7 w-7"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleMoveDown(index)}
                            disabled={index === stages.length - 1 || isAnyLoading}
                            className="h-7 w-7"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletingStage(stage)}
                          disabled={isAnyLoading}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Adicionar novo estágio */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Adicionar Estagio</p>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={newStageColor}
                  onChange={(e) => setNewStageColor(e.target.value)}
                  className="w-12 h-9 p-1 flex-shrink-0"
                />
                <Input
                  placeholder="Nome do estagio"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newStageName.trim()) handleAddStage();
                  }}
                />
                <Button
                  onClick={handleAddStage}
                  disabled={!newStageName.trim() || isAnyLoading}
                  size="icon"
                >
                  {createStage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingStage} onOpenChange={() => setDeletingStage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover estagio?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o estagio "
              {deletingStage?.display_name || deletingStage?.name}"? Esta acao nao pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
