import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/design-system/primitives/button';
import { Label } from '@/design-system/primitives/label';
import { Textarea } from '@/design-system/primitives/textarea';
import { Slider } from '@/design-system/primitives/slider';
import { Checkbox } from '@/design-system/primitives/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/primitives/dialog';
import type { JourneyTouchpoint } from '../types';

interface TouchpointEvaluationDialogProps {
  touchpoint: JourneyTouchpoint | null;
  onClose: () => void;
  onSave: (data: { score: number; notes?: string; is_critical: boolean }) => void;
  isSaving: boolean;
}

export function TouchpointEvaluationDialog({
  touchpoint,
  onClose,
  onSave,
  isSaving,
}: TouchpointEvaluationDialogProps) {
  return (
    <Dialog open={!!touchpoint} onOpenChange={() => onClose()}>
      <DialogContent>
        {touchpoint && (
          <EvaluationForm
            key={touchpoint.id}
            touchpoint={touchpoint}
            onClose={onClose}
            onSave={onSave}
            isSaving={isSaving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface EvaluationFormProps {
  touchpoint: JourneyTouchpoint;
  onClose: () => void;
  onSave: (data: { score: number; notes?: string; is_critical: boolean }) => void;
  isSaving: boolean;
}

function EvaluationForm({ touchpoint, onClose, onSave, isSaving }: EvaluationFormProps) {
  const [score, setScore] = useState(touchpoint.score ?? 5);
  const [notes, setNotes] = useState(touchpoint.notes ?? '');
  const [isCritical, setIsCritical] = useState(touchpoint.is_critical ?? false);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Avaliar: {touchpoint.name}</DialogTitle>
        <DialogDescription>
          De uma nota de 0 a 10 para este touchpoint
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Nota</Label>
            <span className="text-2xl font-bold">{score.toFixed(1)}</span>
          </div>
          <Slider
            value={[score]}
            onValueChange={([value]) => setScore(value)}
            min={0}
            max={10}
            step={0.5}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Critico</span>
            <span>Excelente</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Observacoes</Label>
          <Textarea
            placeholder="Adicione observacoes sobre este touchpoint..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_critical"
            checked={isCritical}
            onCheckedChange={(checked) => setIsCritical(checked as boolean)}
          />
          <Label htmlFor="is_critical" className="text-sm font-normal cursor-pointer">
            Marcar como gargalo critico
          </Label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={() => onSave({ score, notes: notes || undefined, is_critical: isCritical })}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Salvar Avaliacao
        </Button>
      </DialogFooter>
    </>
  );
}
