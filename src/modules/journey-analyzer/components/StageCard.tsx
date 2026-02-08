import { useState } from 'react';
import { Plus, X, AlertTriangle, Loader2 } from 'lucide-react';
import { useCreateTouchpoint, useDeleteTouchpoint, useEvaluateTouchpoint } from '../hooks';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Input } from '@/design-system/primitives/input';
import { Textarea } from '@/design-system/primitives/textarea';
import { Label } from '@/design-system/primitives/label';
import { Badge } from '@/design-system/primitives/badge';
import { Slider } from '@/design-system/primitives/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/design-system/primitives/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/primitives/dialog';
import { Checkbox } from '@/design-system/primitives/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/design-system/lib/utils';
import { ScoreGauge } from './ScoreGauge';
import type { JourneyProjectStageWithTouchpoints, JourneyTouchpoint, TouchpointType, TOUCHPOINT_TYPES } from '../types';

const TOUCHPOINT_TYPE_OPTIONS: { value: TouchpointType; label: string }[] = [
  { value: 'page', label: 'Página' },
  { value: 'email', label: 'E-mail' },
  { value: 'event', label: 'Evento' },
  { value: 'content', label: 'Conteúdo' },
  { value: 'automation', label: 'Automação' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Ligação' },
  { value: 'other', label: 'Outro' },
];

interface StageCardProps {
  stage: JourneyProjectStageWithTouchpoints;
  projectId: string;
  onClose: () => void;
}

export function StageCard({ stage, projectId, onClose }: StageCardProps) {
  const createTouchpoint = useCreateTouchpoint();
  const deleteTouchpoint = useDeleteTouchpoint();
  const evaluateTouchpoint = useEvaluateTouchpoint();
  const { toast } = useToast();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTouchpoint, setNewTouchpoint] = useState({ name: '', description: '', type: 'other' as TouchpointType });
  const [selectedTouchpoint, setSelectedTouchpoint] = useState<JourneyTouchpoint | null>(null);
  const [evaluationData, setEvaluationData] = useState({ score: 5, notes: '', is_critical: false });

  const handleAddTouchpoint = async () => {
    if (!newTouchpoint.name.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' });
      return;
    }

    await createTouchpoint.mutateAsync({
      projectId,
      stage_id: stage.id,
      name: newTouchpoint.name.trim(),
      description: newTouchpoint.description.trim() || null,
      type: newTouchpoint.type,
      position: stage.touchpoints?.length || 0,
    });

    setNewTouchpoint({ name: '', description: '', type: 'other' });
    setShowAddForm(false);
    toast({ title: 'Touchpoint adicionado' });
  };

  const handleDeleteTouchpoint = async (touchpointId: string) => {
    await deleteTouchpoint.mutateAsync({ touchpointId, projectId });
    toast({ title: 'Touchpoint removido' });
  };

  const handleOpenEvaluation = (touchpoint: JourneyTouchpoint) => {
    setSelectedTouchpoint(touchpoint);
    setEvaluationData({
      score: touchpoint.score ?? 5,
      notes: touchpoint.notes ?? '',
      is_critical: touchpoint.is_critical ?? false,
    });
  };

  const handleSaveEvaluation = async () => {
    if (!selectedTouchpoint) return;

    await evaluateTouchpoint.mutateAsync({
      id: selectedTouchpoint.id,
      projectId,
      score: evaluationData.score,
      notes: evaluationData.notes || undefined,
      is_critical: evaluationData.is_critical,
    });

    setSelectedTouchpoint(null);
    toast({ title: 'Avaliação salva' });
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100';
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    if (score >= 4) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: stage.color || '#6366f1' }}
              />
              <CardTitle className="text-lg">{stage.display_name}</CardTitle>
              <ScoreGauge score={stage.score} size="sm" showLabel={false} />
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {stage.description && (
            <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Touchpoints list */}
          {stage.touchpoints?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum touchpoint mapeado nesta etapa
            </p>
          ) : (
            <div className="space-y-2">
              {stage.touchpoints?.map((touchpoint) => (
                <div
                  key={touchpoint.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    getScoreColor(touchpoint.score)
                  )}
                >
                  <div className="flex items-center gap-3">
                    {touchpoint.is_critical && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{touchpoint.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {TOUCHPOINT_TYPE_OPTIONS.find((t) => t.value === touchpoint.type)?.label || touchpoint.type}
                        </Badge>
                      </div>
                      {touchpoint.description && (
                        <p className="text-sm text-muted-foreground">{touchpoint.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScoreGauge score={touchpoint.score} size="sm" showLabel={false} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEvaluation(touchpoint)}
                    >
                      Avaliar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTouchpoint(touchpoint.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add touchpoint form */}
          {showAddForm ? (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label>Nome do Touchpoint</Label>
                <Input
                  placeholder="Ex: Landing page de captação"
                  value={newTouchpoint.name}
                  onChange={(e) => setNewTouchpoint((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newTouchpoint.type}
                  onValueChange={(value) => setNewTouchpoint((prev) => ({ ...prev, type: value as TouchpointType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOUCHPOINT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descreva este touchpoint..."
                  value={newTouchpoint.description}
                  onChange={(e) => setNewTouchpoint((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddTouchpoint} disabled={createTouchpoint.isPending}>
                  {createTouchpoint.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Adicionar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Touchpoint
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Evaluation Dialog */}
      <Dialog open={!!selectedTouchpoint} onOpenChange={() => setSelectedTouchpoint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar: {selectedTouchpoint?.name}</DialogTitle>
            <DialogDescription>
              Dê uma nota de 0 a 10 para este touchpoint
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Nota</Label>
                <span className="text-2xl font-bold">{evaluationData.score.toFixed(1)}</span>
              </div>
              <Slider
                value={[evaluationData.score]}
                onValueChange={([value]) => setEvaluationData((prev) => ({ ...prev, score: value }))}
                min={0}
                max={10}
                step={0.5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Crítico</span>
                <span>Excelente</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Adicione observações sobre este touchpoint..."
                value={evaluationData.notes}
                onChange={(e) => setEvaluationData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_critical"
                checked={evaluationData.is_critical}
                onCheckedChange={(checked) =>
                  setEvaluationData((prev) => ({ ...prev, is_critical: checked as boolean }))
                }
              />
              <Label htmlFor="is_critical" className="text-sm font-normal cursor-pointer">
                Marcar como gargalo crítico
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTouchpoint(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEvaluation} disabled={evaluateTouchpoint.isPending}>
              {evaluateTouchpoint.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar Avaliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
