import { useState } from 'react';
import { X, AlertTriangle, MapPin } from 'lucide-react';
import { useCreateTouchpoint, useDeleteTouchpoint, useEvaluateTouchpoint } from '../hooks';
import { Button } from '@/design-system/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system/primitives/card';
import { Badge } from '@/design-system/primitives/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/design-system/lib/utils';
import { ScoreGauge } from './ScoreGauge';
import { TouchpointEvaluationDialog } from './TouchpointEvaluationDialog';
import { AddTouchpointForm } from './AddTouchpointForm';
import type { JourneyProjectStageWithTouchpoints, JourneyTouchpoint, TouchpointType } from '../types';

const TOUCHPOINT_TYPE_OPTIONS: { value: TouchpointType; label: string }[] = [
  { value: 'page', label: 'Pagina' },
  { value: 'email', label: 'E-mail' },
  { value: 'event', label: 'Evento' },
  { value: 'content', label: 'Conteudo' },
  { value: 'automation', label: 'Automacao' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Ligacao' },
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
  const [selectedTouchpoint, setSelectedTouchpoint] = useState<JourneyTouchpoint | null>(null);

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100';
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    if (score >= 4) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const handleAddTouchpoint = async (data: { name: string; description: string; type: TouchpointType }) => {
    await createTouchpoint.mutateAsync({
      projectId,
      stage_id: stage.id,
      name: data.name,
      description: data.description || null,
      type: data.type,
      position: stage.touchpoints?.length || 0,
    });
    toast({ title: 'Touchpoint adicionado' });
  };

  const handleDeleteTouchpoint = async (touchpointId: string) => {
    await deleteTouchpoint.mutateAsync({ touchpointId, projectId });
    toast({ title: 'Touchpoint removido' });
  };

  const handleSaveEvaluation = async (data: { score: number; notes?: string; is_critical: boolean }) => {
    if (!selectedTouchpoint) return;
    await evaluateTouchpoint.mutateAsync({
      id: selectedTouchpoint.id,
      projectId,
      score: data.score,
      notes: data.notes,
      is_critical: data.is_critical,
    });
    setSelectedTouchpoint(null);
    toast({ title: 'Avaliacao salva' });
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
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar etapa">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {stage.description && (
            <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {stage.touchpoints?.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">Nenhum touchpoint mapeado</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                Adicione os pontos de contato que o cliente tem nesta etapa da jornada
              </p>
            </div>
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
                    <Button variant="outline" size="sm" onClick={() => setSelectedTouchpoint(touchpoint)}>
                      Avaliar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTouchpoint(touchpoint.id)}
                      aria-label={`Remover touchpoint ${touchpoint.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <AddTouchpointForm
            onAdd={handleAddTouchpoint}
            isAdding={createTouchpoint.isPending}
          />
        </CardContent>
      </Card>

      <TouchpointEvaluationDialog
        touchpoint={selectedTouchpoint}
        onClose={() => setSelectedTouchpoint(null)}
        onSave={handleSaveEvaluation}
        isSaving={evaluateTouchpoint.isPending}
      />
    </>
  );
}
